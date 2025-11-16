import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createConnectAccount, createAccountLink } from '@/lib/stripe';

/**
 * POST /api/stripe/connect/setup
 * Starts the Stripe Connect onboarding process for creators
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Verify authentication
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify creator role
    if (session.user.role !== 'CREATOR') {
      return NextResponse.json(
        { error: 'Only creators can set up Stripe Connect' },
        { status: 403 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        stripeAccountId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let stripeAccountId = user.stripeAccountId;

    // Create Stripe Connect account if it doesn't exist
    if (!stripeAccountId) {
      stripeAccountId = await createConnectAccount(user.id, user.email);

      // Save the Stripe account ID to the database
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeAccountId },
      });
    }

    // Generate account link for onboarding
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const refreshUrl = `${baseUrl}/api/stripe/connect/refresh`;
    const returnUrl = `${baseUrl}/api/stripe/connect/complete`;

    const accountLinkUrl = await createAccountLink(
      stripeAccountId,
      refreshUrl,
      returnUrl
    );

    return NextResponse.json({ url: accountLinkUrl });
  } catch (error) {
    console.error('Error setting up Stripe Connect:', error);
    return NextResponse.json(
      { error: 'Failed to set up Stripe Connect' },
      { status: 500 }
    );
  }
}
