import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SubscriptionManager from './SubscriptionManager';
import Link from 'next/link';

export default async function SubscriptionPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get user's active subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: 'ACTIVE',
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get subscription history
  const subscriptionHistory = await prisma.subscription.findMany({
    where: {
      userId: session.user.id,
      status: 'CANCELLED',
    },
    include: {
      plan: true,
    },
    orderBy: {
      canceledAt: 'desc',
    },
    take: 5,
  });

  // Map subscription to component props format
  const mappedSubscription = subscription ? {
    id: subscription.id,
    tier: subscription.plan.tier,
    status: subscription.status,
    billingPeriod: subscription.billingInterval,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: !subscription.autoRenew,
    plan: {
      name: subscription.plan.name,
      monthlyPrice: subscription.plan.monthlyPrice,
      yearlyPrice: subscription.plan.yearlyPrice,
      cpdPointsPerYear: subscription.plan.cpdPointsPerYear,
    },
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your RadSciCPD subscription and billing
          </p>
        </div>

        {mappedSubscription ? (
          <SubscriptionManager subscription={mappedSubscription} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No Active Subscription
              </h2>
              <p className="text-gray-600 mb-6">
                You don't have an active subscription. Subscribe now to get unlimited access to all courses and exclusive benefits.
              </p>
              <Link
                href="/pricing"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                View Subscription Plans
              </Link>
            </div>
          </div>
        )}

        {/* Subscription History */}
        {subscriptionHistory.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Subscription History
            </h2>
            <div className="space-y-4">
              {subscriptionHistory.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{sub.plan.name}</p>
                    <p className="text-sm text-gray-600">
                      {sub.billingInterval === 'YEARLY' ? 'Annual' : 'Monthly'} Billing
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Cancelled on {sub.canceledAt?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
