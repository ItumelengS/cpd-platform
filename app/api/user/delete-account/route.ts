import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { reason } = await request.json();

    // Check if user is a creator with pending payouts
    if (user.isCreator) {
      const pendingPayouts = await prisma.payout.count({
        where: {
          creatorId: user.id,
          status: { in: ['PENDING', 'PROCESSING'] },
        },
      });

      if (pendingPayouts > 0) {
        return NextResponse.json(
          {
            error: 'You have pending payouts. Please wait for all payouts to complete before deleting your account.',
            pendingPayouts,
          },
          { status: 400 }
        );
      }

      // Check for unpaid earnings
      const unpaidEarnings = await prisma.creatorEarning.count({
        where: {
          creatorId: user.id,
          paid: false,
        },
      });

      if (unpaidEarnings > 0) {
        return NextResponse.json(
          {
            error: 'You have unpaid earnings. Please request a payout before deleting your account.',
            unpaidEarnings,
          },
          { status: 400 }
        );
      }
    }

    // Check if there's already a pending deletion request
    const existingRequest = await prisma.accountDeletionRequest.findUnique({
      where: { userId: user.id },
    });

    if (existingRequest && existingRequest.status === 'pending') {
      return NextResponse.json(
        { error: 'You already have a pending account deletion request' },
        { status: 400 }
      );
    }

    // Create deletion request with 90-day grace period
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + 90);

    const deletionRequest = await prisma.accountDeletionRequest.create({
      data: {
        userId: user.id,
        reason: reason || null,
        status: 'pending',
        scheduledFor,
      },
    });

    // Soft delete: Anonymize user data but keep records for analytics
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: `Deleted User ${user.id.substring(0, 8)}`,
        email: `deleted_${user.id}@deleted.local`,
        password: null,
        bio: null,
        avatar: null,
        cvUrl: null,
        socialLinks: Prisma.JsonNull,
        specialty: null,
        institution: null,
        country: null,
        stripeAccountId: null,
        // Keep role and creator status for data integrity
      },
    });

    // TODO: Send confirmation email to original email
    console.log('Account deletion scheduled for:', user.email);

    return NextResponse.json({
      success: true,
      message: 'Your account has been anonymized and scheduled for deletion. You have 90 days to cancel this request if you change your mind.',
      scheduledFor: deletionRequest.scheduledFor,
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Cancel deletion request
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find pending deletion request
    const deletionRequest = await prisma.accountDeletionRequest.findUnique({
      where: { userId: user.id },
    });

    if (!deletionRequest || deletionRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'No pending deletion request found' },
        { status: 404 }
      );
    }

    // Cancel the deletion request
    await prisma.accountDeletionRequest.update({
      where: { id: deletionRequest.id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({
      success: true,
      message: 'Account deletion request has been cancelled',
    });
  } catch (error) {
    console.error('Error cancelling account deletion:', error);
    return NextResponse.json(
      { error: 'Failed to cancel account deletion' },
      { status: 500 }
    );
  }
}
