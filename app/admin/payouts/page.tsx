import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import { PayoutStatus } from '@prisma/client';
import ProcessPayoutsButton from './ProcessPayoutsButton';
import PayoutHistoryTable from './PayoutHistoryTable';

export default async function AdminPayoutsPage() {
  const session = await auth();

  // Check if user is admin
  if (!session?.user?.email || session.user.email !== 'admin@example.com') {
    redirect('/dashboard');
  }

  // Get pending payouts (unpaid earnings >= $50)
  const pendingEarnings = await prisma.creatorEarning.findMany({
    where: {
      paid: false,
      netEarnings: {
        gte: 50,
      },
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          stripeOnboarded: true,
          stripePayoutsEnabled: true,
        },
      },
      revenue: {
        select: {
          id: true,
          month: true,
          year: true,
        },
      },
    },
  });

  // Calculate pending summary
  const totalPendingAmount = pendingEarnings.reduce(
    (sum, earning) => sum + earning.netEarnings,
    0
  );
  const creatorsReadyCount = pendingEarnings.filter(
    (e) => e.creator.stripeOnboarded && e.creator.stripePayoutsEnabled
  ).length;
  const creatorsNotReadyCount = pendingEarnings.filter(
    (e) => !e.creator.stripeOnboarded || !e.creator.stripePayoutsEnabled
  ).length;

  // Get payout history
  const payoutHistory = await prisma.payout.findMany({
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      earnings: {
        include: {
          revenue: {
            select: {
              month: true,
              year: true,
            },
          },
        },
      },
    },
    orderBy: {
      initiatedAt: 'desc',
    },
    take: 50,
  });

  // Get failed payouts
  const failedPayouts = payoutHistory.filter((p) => p.status === PayoutStatus.FAILED);

  // Calculate summary stats
  const completedPayouts = payoutHistory.filter((p) => p.status === PayoutStatus.COMPLETED);
  const totalPaidOut = completedPayouts.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/admin/revenue"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Revenue
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Payout Management</h1>
          <p className="text-gray-600 mt-1">Process and manage creator payouts</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pending Amount */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Pending Payouts</h3>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${totalPendingAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {pendingEarnings.length} creator{pendingEarnings.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Ready for Payout */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Ready to Pay</h3>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{creatorsReadyCount}</div>
            <p className="text-sm text-gray-600 mt-2">Stripe accounts verified</p>
          </div>

          {/* Not Ready */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Not Ready</h3>
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{creatorsNotReadyCount}</div>
            <p className="text-sm text-gray-600 mt-2">Need to set up Stripe</p>
          </div>

          {/* Total Paid */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Paid Out</h3>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${totalPaidOut.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-sm text-gray-600 mt-2">{completedPayouts.length} payouts</p>
          </div>
        </div>

        {/* Pending Payouts Card */}
        {pendingEarnings.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Pending Payouts</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Creators with earnings ready for payout
                </p>
              </div>
              {creatorsReadyCount > 0 && (
                <ProcessPayoutsButton pendingEarnings={pendingEarnings} />
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Creator
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Period
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEarnings.map((earning) => (
                    <tr key={earning.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {earning.creator.name || 'Unknown Creator'}
                          </div>
                          <div className="text-xs text-gray-500">{earning.creator.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {earning.revenue.month}/{earning.revenue.year}
                      </td>
                      <td className="py-3 px-4 text-right text-green-600 font-semibold">
                        ${earning.netEarnings.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {earning.creator.stripeOnboarded && earning.creator.stripePayoutsEnabled ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Stripe Setup Required
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Failed Payouts Section */}
        {failedPayouts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Failed Payouts ({failedPayouts.length})
              </h2>
            </div>
            <div className="space-y-3">
              {failedPayouts.map((payout) => (
                <div
                  key={payout.id}
                  className="bg-white rounded-lg p-4 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {payout.creator.name || payout.creator.email}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      ${payout.amount.toFixed(2)} - Failed on{' '}
                      {payout.failedAt?.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-red-600 mt-1">
                      {payout.failureReason || 'Unknown error'}
                    </div>
                  </div>
                  <button
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    disabled
                  >
                    Retry
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payout History */}
        <PayoutHistoryTable initialPayouts={payoutHistory} />

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Payout Information</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Minimum Payout:</strong> $50.00 - Earnings below this threshold are carried
              over to the next payout period.
            </p>
            <p>
              <strong>Stripe Transfer Fee:</strong> 0.5% per transfer (capped at $5.00) is deducted
              from each payout.
            </p>
            <p>
              <strong>Processing Time:</strong> Payouts typically arrive in creator bank accounts
              within 2-7 business days after processing.
            </p>
            <p>
              <strong>Creator Requirements:</strong> Creators must complete Stripe Connect
              onboarding and have payouts enabled before receiving payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
