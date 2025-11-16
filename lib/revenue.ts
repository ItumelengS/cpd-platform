import { prisma } from '@/lib/prisma';

export interface CreatorEarning {
  creatorId: string;
  creatorName: string;
  views: number;
  viewShare: number;
  grossEarnings: number;
  platformFee: number;
  netEarnings: number;
}

export interface RevenueCalculation {
  month: number;
  year: number;
  totalRevenue: number;
  totalViews: number;
  revenuePerView: number;
  creatorEarnings: CreatorEarning[];
}

/**
 * Calculate monthly revenue distribution using Spotify-style revenue sharing
 * Creators earn based on their proportion of total views
 * Platform takes 30%, creators get 70%
 */
export async function calculateMonthlyRevenue(
  year: number,
  month: number,
  totalRevenue: number
): Promise<RevenueCalculation> {
  return await prisma.$transaction(async (tx) => {
    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // Get total views for the month
    const totalViews = await tx.view.count({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    if (totalViews === 0) {
      return {
        month,
        year,
        totalRevenue,
        totalViews: 0,
        revenuePerView: 0,
        creatorEarnings: [],
      };
    }

    // Calculate revenue per view
    const revenuePerView = totalRevenue / totalViews;

    // Group views by creator and count
    const viewsByCreator = await tx.view.groupBy({
      by: ['creatorId'],
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // Calculate earnings for each creator
    const creatorEarnings: CreatorEarning[] = [];

    for (const creatorViews of viewsByCreator) {
      // Get creator details
      const creator = await tx.user.findUnique({
        where: { id: creatorViews.creatorId },
        select: { name: true },
      });

      if (!creator) continue;

      const views = creatorViews._count.id;
      const viewShare = views / totalViews;
      const grossEarnings = totalRevenue * viewShare;
      const platformFee = grossEarnings * 0.30;
      const netEarnings = grossEarnings * 0.70;

      creatorEarnings.push({
        creatorId: creatorViews.creatorId,
        creatorName: creator.name || 'Unknown Creator',
        views,
        viewShare,
        grossEarnings,
        platformFee,
        netEarnings,
      });
    }

    return {
      month,
      year,
      totalRevenue,
      totalViews,
      revenuePerView,
      creatorEarnings,
    };
  });
}
