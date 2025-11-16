/**
 * Revenue Scheduler
 *
 * This module handles automated monthly revenue calculation scheduling.
 * In production, this would be triggered by a cron job or scheduled task.
 *
 * Implementation Options:
 * 1. Vercel Cron Jobs (vercel.json configuration)
 * 2. GitHub Actions (scheduled workflow)
 * 3. External cron service (e.g., cron-job.org)
 * 4. Node.js cron library for self-hosted deployments
 *
 * Recommended: Vercel Cron Jobs for Vercel deployments
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/calculate-revenue",
 *     "schedule": "0 0 1 * *"
 *   }]
 * }
 *
 * Schedule: "0 0 1 * *" = Run at 00:00 on the 1st of every month (UTC)
 */

import { prisma } from '@/lib/prisma';
import { calculateMonthlyRevenue } from '@/lib/revenue';

/**
 * Calculate revenue for the previous month
 * This function should be called on the 1st of each month
 *
 * Example: On January 1st, 2025, this calculates December 2024 revenue
 */
export async function scheduleMonthlyCalculation() {
  console.log('[Revenue Scheduler] Starting monthly revenue calculation...');

  try {
    // Calculate previous month's date
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = previousMonth.getFullYear();
    const month = previousMonth.getMonth() + 1;

    console.log(`[Revenue Scheduler] Calculating revenue for ${month}/${year}`);

    // Check if revenue already calculated for this period
    const existingRevenue = await prisma.revenue.findUnique({
      where: {
        year_month: {
          year,
          month,
        },
      },
    });

    if (existingRevenue) {
      console.log(`[Revenue Scheduler] Revenue already calculated for ${month}/${year}`);
      return {
        success: false,
        message: 'Revenue already calculated for this period',
        existingRevenueId: existingRevenue.id,
      };
    }

    // TODO: Fetch actual revenue from AdSense API
    // For now, this would need to be manually entered or fetched from your payment processor
    // Example AdSense API integration:
    // const adsenseRevenue = await fetchAdSenseRevenue(year, month);

    // Placeholder: In production, replace with actual revenue fetch
    const totalRevenue = 0; // This should come from AdSense or manual entry

    if (totalRevenue === 0) {
      console.log(`[Revenue Scheduler] No revenue data available for ${month}/${year}`);
      return {
        success: false,
        message: 'No revenue data available. Please use manual calculation.',
      };
    }

    // Calculate monthly revenue distribution
    const calculation = await calculateMonthlyRevenue(year, month, totalRevenue);

    // Create revenue record and creator earnings
    const result = await prisma.$transaction(async (tx) => {
      const revenue = await tx.revenue.create({
        data: {
          month,
          year,
          totalRevenue,
          totalViews: calculation.totalViews,
          revenuePerView: calculation.revenuePerView,
          calculatedAt: new Date(),
        },
      });

      if (calculation.creatorEarnings.length > 0) {
        await tx.creatorEarning.createMany({
          data: calculation.creatorEarnings.map((earning) => ({
            revenueId: revenue.id,
            creatorId: earning.creatorId,
            views: earning.views,
            viewShare: earning.viewShare,
            grossEarnings: earning.grossEarnings,
            platformFee: earning.platformFee,
            netEarnings: earning.netEarnings,
            paid: false,
          })),
        });
      }

      return revenue;
    });

    console.log(
      `[Revenue Scheduler] Successfully calculated revenue for ${month}/${year}. ` +
      `Revenue ID: ${result.id}, Creators: ${calculation.creatorEarnings.length}`
    );

    return {
      success: true,
      revenueId: result.id,
      month,
      year,
      totalRevenue,
      creatorsCount: calculation.creatorEarnings.length,
    };
  } catch (error) {
    console.error('[Revenue Scheduler] Error calculating monthly revenue:', error);
    throw error;
  }
}

/**
 * Process monthly payouts
 * This function should be called on the 5th of each month
 * Processes payouts for creators who have earnings >= $50
 *
 * Note: Actual payout integration (e.g., Stripe, PayPal) would be implemented in Task 20
 */
export async function scheduleMonthlyPayouts() {
  console.log('[Revenue Scheduler] Starting monthly payout processing...');

  try {
    // Get all unpaid earnings that meet the minimum threshold
    const unpaidEarnings = await prisma.creatorEarning.findMany({
      where: {
        paid: false,
        netEarnings: {
          gte: 50, // Minimum payout threshold
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
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

    console.log(
      `[Revenue Scheduler] Found ${unpaidEarnings.length} earnings ready for payout`
    );

    if (unpaidEarnings.length === 0) {
      return {
        success: true,
        message: 'No earnings ready for payout',
        payoutsProcessed: 0,
      };
    }

    // TODO: Implement actual payout processing (Task 20)
    // For now, this is just a placeholder
    // In production, this would:
    // 1. Group earnings by creator
    // 2. Calculate total payout amount per creator
    // 3. Initiate payout via payment processor (Stripe, PayPal, etc.)
    // 4. Mark earnings as paid upon successful payout
    // 5. Send payout confirmation email to creator

    console.log('[Revenue Scheduler] Payout processing not yet implemented (Task 20)');

    return {
      success: false,
      message: 'Payout processing will be implemented in Task 20',
      earningsReady: unpaidEarnings.length,
    };
  } catch (error) {
    console.error('[Revenue Scheduler] Error processing payouts:', error);
    throw error;
  }
}

/**
 * Utility function to check if today is the 1st of the month
 * Useful for conditional scheduling
 */
export function isFirstOfMonth(): boolean {
  const today = new Date();
  return today.getDate() === 1;
}

/**
 * Utility function to check if today is the 5th of the month
 * Useful for conditional scheduling
 */
export function isFifthOfMonth(): boolean {
  const today = new Date();
  return today.getDate() === 5;
}

/**
 * Example API endpoint implementation
 * Create: app/api/cron/calculate-revenue/route.ts
 *
 * import { NextResponse } from 'next/server';
 * import { scheduleMonthlyCalculation } from '@/lib/revenue-scheduler';
 *
 * export async function GET(request: Request) {
 *   // Verify cron secret to prevent unauthorized access
 *   const authHeader = request.headers.get('authorization');
 *   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *
 *   try {
 *     const result = await scheduleMonthlyCalculation();
 *     return NextResponse.json(result);
 *   } catch (error) {
 *     return NextResponse.json(
 *       { error: 'Failed to calculate revenue' },
 *       { status: 500 }
 *     );
 *   }
 * }
 */
