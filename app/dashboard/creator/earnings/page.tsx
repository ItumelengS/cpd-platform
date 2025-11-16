import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EarningsDashboard from './EarningsDashboard';

export default async function CreatorEarningsPage() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is a creator
  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'CREATOR') {
    redirect('/dashboard');
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

  // Calculate summary statistics
  const totalLifetimeEarnings = earnings.reduce(
    (sum, earning) => sum + earning.netEarnings,
    0
  );

  const availableForPayout = earnings
    .filter((earning) => !earning.paid && earning.netEarnings >= 50)
    .reduce((sum, earning) => sum + earning.netEarnings, 0);

  const belowThreshold = earnings
    .filter((earning) => !earning.paid && earning.netEarnings < 50)
    .reduce((sum, earning) => sum + earning.netEarnings, 0);

  // Get user Stripe onboarding status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      stripeOnboarded: true,
      stripePayoutsEnabled: true,
    },
  });

  // Get payout history for this creator
  const payoutHistory = await prisma.payout.findMany({
    where: {
      creatorId: session.user.id,
    },
    orderBy: {
      initiatedAt: 'desc',
    },
    take: 10,
  });

  // Get current month earnings (if calculated)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const currentMonthEarning = earnings.find(
    (e) => e.revenue.month === currentMonth && e.revenue.year === currentYear
  );

  const thisMonthEarnings = currentMonthEarning?.netEarnings || 0;

  // Calculate next payout date (5th of next month)
  const nextPayoutDate = new Date();
  nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
  nextPayoutDate.setDate(5);

  // Transform earnings data for client component
  const earningsData = earnings.map((earning) => ({
    id: earning.id,
    month: earning.revenue.month,
    year: earning.revenue.year,
    views: earning.views,
    viewShare: earning.viewShare,
    grossEarnings: earning.grossEarnings,
    platformFee: earning.platformFee,
    netEarnings: earning.netEarnings,
    paid: earning.paid,
    paidAt: earning.paidAt ? earning.paidAt.toISOString() : null,
    calculatedAt: earning.revenue.calculatedAt.toISOString(),
    revenuePerView: earning.revenue.revenuePerView,
  }));

  const summary = {
    thisMonthEarnings,
    totalLifetimeEarnings,
    availableForPayout,
    belowThreshold,
    nextPayoutDate: nextPayoutDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };

  // Transform payout history for client component
  const payoutData = payoutHistory.map((payout) => ({
    id: payout.id,
    amount: payout.amount,
    status: payout.status,
    stripeTransferId: payout.stripeTransferId,
    initiatedAt: payout.initiatedAt.toISOString(),
    completedAt: payout.completedAt?.toISOString() || null,
  }));

  return (
    <EarningsDashboard
      earnings={earningsData}
      summary={summary}
      stripeOnboarded={user?.stripeOnboarded || false}
      stripePayoutsEnabled={user?.stripePayoutsEnabled || false}
      payoutHistory={payoutData}
    />
  );
}
