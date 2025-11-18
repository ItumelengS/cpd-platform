import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateMonthlyRevenue } from '@/lib/revenue';
import { sendEmail, checkEmailPreference } from '@/lib/email';
import { render } from '@react-email/render';
import EarningsCalculatedEmail from '@/emails/EarningsCalculatedEmail';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { year, month, totalRevenue } = body;

    // Validate input
    if (!year || !month || totalRevenue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: year, month, totalRevenue' },
        { status: 400 }
      );
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid month: must be between 1 and 12' },
        { status: 400 }
      );
    }

    if (totalRevenue < 0) {
      return NextResponse.json(
        { error: 'Invalid totalRevenue: must be non-negative' },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: 'Revenue already calculated for this period' },
        { status: 409 }
      );
    }

    // Calculate monthly revenue
    const calculation = await calculateMonthlyRevenue(year, month, totalRevenue);

    // Use transaction to create revenue record and creator earnings
    const result = await prisma.$transaction(async (tx) => {
      // Create Revenue record
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

      // Create CreatorEarning records (bulk create)
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

    // Calculate total earnings for response
    const totalEarnings = calculation.creatorEarnings.reduce(
      (sum, earning) => sum + earning.netEarnings,
      0
    );

    // Send earnings notification emails to creators
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    for (const earning of calculation.creatorEarnings) {
      try {
        const creator = await prisma.user.findUnique({
          where: { id: earning.creatorId },
          select: { email: true, name: true },
        });

        if (!creator?.email) continue;

        // Check if user wants earnings emails
        const shouldSend = await checkEmailPreference(earning.creatorId, 'earnings');
        if (!shouldSend) continue;

        const emailHtml = await render(
          EarningsCalculatedEmail({
            amount: earning.netEarnings,
            month,
            year,
            creatorName: creator.name || 'there',
            detailsUrl: `${baseUrl}/creator/dashboard/earnings`,
          })
        );

        await sendEmail({
          to: creator.email,
          subject: `Your earnings for ${month}/${year} are ready - $${earning.netEarnings.toFixed(2)}`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error(`Failed to send earnings email to creator ${earning.creatorId}:`, emailError);
        // Continue with other creators
      }
    }

    return NextResponse.json({
      success: true,
      revenueId: result.id,
      creatorsCount: calculation.creatorEarnings.length,
      totalEarnings,
      totalViews: calculation.totalViews,
      revenuePerView: calculation.revenuePerView,
    });
  } catch (error) {
    console.error('Error calculating revenue:', error);
    return NextResponse.json(
      { error: 'Failed to calculate revenue' },
      { status: 500 }
    );
  }
}
