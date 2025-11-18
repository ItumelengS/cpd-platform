import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify creator role
    if (session.user.role !== 'CREATOR') {
      return NextResponse.json(
        { error: 'Forbidden: Creator access required' },
        { status: 403 }
      );
    }

    // Fetch creator earnings with revenue details
    const earnings = await prisma.creatorEarning.findMany({
      where: {
        creatorId: session.user.id,
      },
      include: {
        revenue: {
          select: {
            id: true,
            month: true,
            year: true,
            totalRevenue: true,
            totalViews: true,
            revenuePerView: true,
            calculatedAt: true,
          },
        },
      },
      orderBy: [
        { revenue: { year: 'desc' } },
        { revenue: { month: 'desc' } },
      ],
    });

    // Transform data for response
    const response = earnings.map((earning) => ({
      id: earning.id,
      month: earning.revenue.month,
      year: earning.revenue.year,
      views: earning.views,
      viewShare: earning.viewShare,
      grossEarnings: earning.grossEarnings,
      platformFee: earning.platformFee,
      netEarnings: earning.netEarnings,
      paid: earning.paid,
      paidAt: earning.paidAt,
      calculatedAt: earning.revenue.calculatedAt,
      revenuePerView: earning.revenue.revenuePerView,
    }));

    // Calculate summary statistics
    const totalLifetimeEarnings = earnings.reduce(
      (sum, earning) => sum + earning.netEarnings,
      0
    );

    const availableForPayout = earnings
      .filter((earning) => !earning.paid)
      .reduce((sum, earning) => sum + earning.netEarnings, 0);

    const totalViews = earnings.reduce((sum, earning) => sum + earning.views, 0);

    return NextResponse.json({
      earnings: response,
      summary: {
        totalLifetimeEarnings,
        availableForPayout,
        totalViews,
        earningsCount: earnings.length,
      },
    });
  } catch (error) {
    console.error('Error fetching creator earnings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}
