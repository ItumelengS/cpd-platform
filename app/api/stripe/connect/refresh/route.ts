import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAccountLink } from '@/lib/stripe';

/**
 * GET /api/stripe/connect/refresh
 * Refreshes the Stripe Connect onboarding link if it expired
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

    // Generate new account link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const refreshUrl = `${baseUrl}/api/stripe/connect/refresh`;
    const returnUrl = `${baseUrl}/api/stripe/connect/complete`;

    const accountLinkUrl = await createAccountLink(
      user.stripeAccountId,
      refreshUrl,
      returnUrl
    );

    // Redirect to the new onboarding link
    return NextResponse.redirect(accountLinkUrl);
  } catch (error) {
    console.error('Error refreshing Stripe Connect link:', error);
    return NextResponse.redirect(
      new URL('/dashboard/creator/payout-setup?error=refresh_failed', request.url)
    );
  }
}
