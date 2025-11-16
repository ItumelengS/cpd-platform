import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getBankAccountInfo } from '@/lib/stripe';

/**
 * GET /api/user/stripe-status
 * Gets the current user's Stripe account status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Verify authentication
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        stripeAccountId: true,
        stripeOnboarded: true,
        stripeChargesEnabled: true,
        stripePayoutsEnabled: true,
        stripeDetailsSubmitted: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get bank account info if user has a Stripe account
    let bankInfo = null;
    if (user.stripeAccountId) {
      try {
        bankInfo = await getBankAccountInfo(user.stripeAccountId);
      } catch (error) {
        console.error('Error fetching bank account info:', error);
        // Don't fail the request if we can't get bank info
      }
    }

    return NextResponse.json({
      user,
      bankInfo,
    });
  } catch (error) {
    console.error('Error fetching user Stripe status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Stripe status' },
      { status: 500 }
    );
  }
}
