import { NextRequest, NextResponse } from 'next/server';
import { sendWeeklySummaryEmails } from '@/lib/email-scheduler';

/**
 * Weekly Summary Email Cron Job
 *
 * This endpoint should be called by a cron service every Monday at 9 AM UTC
 *
 * For Vercel Cron Jobs:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/weekly-summary",
 *     "schedule": "0 9 * * 1"
 *   }]
 * }
 *
 * For external cron services:
 * - Make a POST request to this endpoint
 * - Include Authorization header: Bearer <CRON_SECRET>
 * - Schedule: Every Monday at 9:00 AM (cron: 0 9 * * 1)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // For Vercel Cron, the authorization header will be automatically set
    // For external cron, verify the secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting weekly summary cron job...');

    // Send weekly summary emails
    const result = await sendWeeklySummaryEmails();

    console.log('Weekly summary cron job completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Weekly summary emails sent successfully',
      ...result,
    });
  } catch (error) {
    console.error('Error in weekly summary cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for testing (should be removed in production or secured)
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    const result = await sendWeeklySummaryEmails();

    return NextResponse.json({
      success: true,
      message: 'Weekly summary emails sent (TEST)',
      ...result,
    });
  } catch (error) {
    console.error('Error in weekly summary test:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
