import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAccountStatus } from '@/lib/stripe';

/**
 * GET /api/stripe/connect/complete
 * Handles the redirect after Stripe Connect onboarding completion
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Verify authentication
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Verify creator role
    if (session.user.role !== 'CREATOR') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        stripeAccountId: true,
      },
    });

    if (!user || !user.stripeAccountId) {
      return NextResponse.redirect(
        new URL('/dashboard/creator/payout-setup?error=no_account', request.url)
      );
    }

    // Verify Stripe account setup
    const accountStatus = await getAccountStatus(user.stripeAccountId);

    // Update user with Stripe account status
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        stripeOnboarded: accountStatus.onboarded,
        stripeDetailsSubmitted: accountStatus.detailsSubmitted,
        stripeChargesEnabled: accountStatus.chargesEnabled,
        stripePayoutsEnabled: accountStatus.payoutsEnabled,
      },
    });

    // Redirect to payout setup page with success message
    if (accountStatus.onboarded) {
      return NextResponse.redirect(
        new URL('/dashboard/creator/payout-setup?success=true', request.url)
      );
    } else if (accountStatus.detailsSubmitted) {
      // Details submitted but still pending verification
      return NextResponse.redirect(
        new URL('/dashboard/creator/payout-setup?status=pending', request.url)
      );
    } else {
      // Onboarding incomplete
      return NextResponse.redirect(
        new URL('/dashboard/creator/payout-setup?error=incomplete', request.url)
      );
    }
  } catch (error) {
    console.error('Error completing Stripe Connect setup:', error);
    return NextResponse.redirect(
      new URL('/dashboard/creator/payout-setup?error=verification_failed', request.url)
    );
  }
}
