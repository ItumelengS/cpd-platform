import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createPayout } from '@/lib/stripe';
import { PayoutStatus } from '@prisma/client';
import { sendEmail, checkEmailPreference } from '@/lib/email';
import { render } from '@react-email/render';
import PayoutCompletedEmail from '@/emails/PayoutCompletedEmail';

interface PayoutResult {
  creatorId: string;
  creatorName: string;
  amount: number;
  success: boolean;
  error?: string;
  payoutId?: string;
  stripeTransferId?: string;
}

/**
 * POST /api/admin/payouts/process
 * Processes payouts for all creators with earnings >= R900 for a given revenue period
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Verify admin authentication
    if (!session?.user?.email || session.user.email !== 'admin@example.com') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { revenueId } = body;

    if (!revenueId) {
      return NextResponse.json(
        { error: 'revenueId is required' },
        { status: 400 }
      );
    }

    // Verify revenue exists
    const revenue = await prisma.revenue.findUnique({
      where: { id: revenueId },
    });

    if (!revenue) {
      return NextResponse.json(
        { error: 'Revenue period not found' },
        { status: 404 }
      );
    }

    // Get all unpaid creator earnings >= R900 for this revenue period
    const eligibleEarnings = await prisma.creatorEarning.findMany({
      where: {
        revenueId: revenueId,
        paid: false,
        netEarnings: {
          gte: 900,
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            stripeAccountId: true,
            stripeOnboarded: true,
            stripePayoutsEnabled: true,
          },
        },
        revenue: {
          select: {
            month: true,
            year: true,
          },
        },
      },
    });

    if (eligibleEarnings.length === 0) {
      return NextResponse.json({
        message: 'No eligible creators for payout',
        totalProcessed: 0,
        successful: 0,
        failed: 0,
        totalAmount: 0,
        results: [],
      });
    }

    const results: PayoutResult[] = [];
    let successfulCount = 0;
    let failedCount = 0;
    let totalAmount = 0;

    // Process each creator's payout
    for (const earning of eligibleEarnings) {
      const creator = earning.creator;
      const amount = earning.netEarnings;

      // Calculate Stripe transfer fee (0.5%, capped at R90)
      const stripeFee = Math.min(amount * 0.005, 90);
      const netAmount = amount - stripeFee;

      try {
        // Validate creator's Stripe account
        if (!creator.stripeAccountId) {
          throw new Error('Creator has no Stripe account');
        }

        if (!creator.stripeOnboarded) {
          throw new Error('Creator has not completed Stripe onboarding');
        }

        if (!creator.stripePayoutsEnabled) {
          throw new Error('Creator payouts are not enabled');
        }

        // Create payout record in database
        const payout = await prisma.payout.create({
          data: {
            creatorId: creator.id,
            amount: netAmount,
            currency: 'zar',
            status: PayoutStatus.PROCESSING,
          },
        });

        // Create Stripe transfer
        const transfer = await createPayout(
          creator.stripeAccountId,
          netAmount,
          `Payout for ${earning.revenue.month}/${earning.revenue.year} - CPD Platform`
        );

        // Update payout with Stripe transfer ID
        await prisma.payout.update({
          where: { id: payout.id },
          data: {
            stripeTransferId: transfer.id,
            status: PayoutStatus.COMPLETED,
            completedAt: new Date(),
          },
        });

        // Mark creator earning as paid
        await prisma.creatorEarning.update({
          where: { id: earning.id },
          data: {
            paid: true,
            paidAt: new Date(),
            payoutId: payout.id,
          },
        });

        // Send payout completion email
        try {
          const shouldSendEmail = await checkEmailPreference(creator.id, 'payouts');
          if (shouldSendEmail && creator.email) {
            const emailHtml = await render(
              PayoutCompletedEmail({
                amount: netAmount,
                stripePayoutId: transfer.id,
                creatorName: creator.name || 'there',
                date: new Date().toLocaleDateString(),
              })
            );

            await sendEmail({
              to: creator.email,
              subject: `Payment sent: R${netAmount.toFixed(2)} on its way!`,
              html: emailHtml,
            });
          }
        } catch (emailError) {
          console.error(`Failed to send payout email to creator ${creator.id}:`, emailError);
          // Don't fail the payout if email fails
        }

        results.push({
          creatorId: creator.id,
          creatorName: creator.name || creator.email,
          amount: netAmount,
          success: true,
          payoutId: payout.id,
          stripeTransferId: transfer.id,
        });

        successfulCount++;
        totalAmount += netAmount;
      } catch (error) {
        // Create failed payout record
        try {
          const payout = await prisma.payout.create({
            data: {
              creatorId: creator.id,
              amount: netAmount,
              currency: 'zar',
              status: PayoutStatus.FAILED,
              failureReason: error instanceof Error ? error.message : 'Unknown error',
              failedAt: new Date(),
            },
          });

          results.push({
            creatorId: creator.id,
            creatorName: creator.name || creator.email,
            amount: netAmount,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            payoutId: payout.id,
          });
        } catch (dbError) {
          results.push({
            creatorId: creator.id,
            creatorName: creator.name || creator.email,
            amount: netAmount,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }

        failedCount++;
        console.error(`Failed to process payout for creator ${creator.id}:`, error);
      }
    }

    return NextResponse.json({
      message: 'Payout processing completed',
      totalProcessed: eligibleEarnings.length,
      successful: successfulCount,
      failed: failedCount,
      totalAmount,
      results,
    });
  } catch (error) {
    console.error('Error processing payouts:', error);
    return NextResponse.json(
      { error: 'Failed to process payouts' },
      { status: 500 }
    );
  }
}
