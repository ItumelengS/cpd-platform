import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Download, DollarSign, Eye, Users, Calendar } from 'lucide-react';
import ExportCSVButton from './ExportCSVButton';
import ProcessPayoutsButton from './ProcessPayoutsButton';

interface RevenueDetailPageProps {
  params: {
    revenueId: string;
  };
}

export default async function RevenueDetailPage({ params }: RevenueDetailPageProps) {
  const session = await auth();

  // Check if user is admin
  if (!session?.user?.email || session.user.email !== 'admin@example.com') {
    redirect('/dashboard');
  }

  // Fetch revenue details with creator earnings
  const revenue = await prisma.revenue.findUnique({
    where: { id: params.revenueId },
    include: {
      creatorEarnings: {
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          netEarnings: 'desc',
        },
      },
    },
  });

  if (!revenue) {
    redirect('/admin/revenue');
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate summary statistics
  const totalCreatorEarnings = revenue.creatorEarnings.reduce(
    (sum, earning) => sum + earning.netEarnings,
    0
  );
  const totalPlatformFees = revenue.creatorEarnings.reduce(
    (sum, earning) => sum + earning.platformFee,
    0
  );
  const paidEarnings = revenue.creatorEarnings.filter((e) => e.paid).length;
  const pendingEarnings = revenue.creatorEarnings.filter((e) => !e.paid).length;

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
              Back to Revenue Dashboard
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {monthNames[revenue.month - 1]} {revenue.year} Revenue
              </h1>
              <p className="text-gray-600 mt-1">
                Calculated on {new Date(revenue.calculatedAt).toLocaleDateString()}
              </p>
            </div>
            <ExportCSVButton
              revenue={revenue}
              monthName={monthNames[revenue.month - 1]}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${revenue.totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-sm text-gray-600 mt-2">Platform revenue</p>
          </div>

          {/* Total Views */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Views</h3>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {revenue.totalViews.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              ${revenue.revenuePerView.toFixed(4)} per view
            </p>
          </div>

          {/* Creators Paid */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Creators</h3>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {revenue.creatorEarnings.length}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {paidEarnings} paid, {pendingEarnings} pending
            </p>
          </div>

          {/* Creator Share */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Creator Share (70%)</h3>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${totalCreatorEarnings.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Platform: ${totalPlatformFees.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Creator Earnings Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Creator Earnings</h2>
            {pendingEarnings > 0 && (
              <ProcessPayoutsButton revenueId={revenue.id} pendingCount={pendingEarnings} />
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Creator
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Views
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    View Share
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Gross Earnings
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Platform Fee (30%)
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Net Earnings (70%)
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Payout Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {revenue.creatorEarnings.map((earning) => (
                  <tr key={earning.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <Link
                          href={`/creator/${earning.creator.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {earning.creator.name || 'Unknown Creator'}
                        </Link>
                        <div className="text-xs text-gray-500">{earning.creator.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 font-medium">
                      {earning.views.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      {(earning.viewShare * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      ${earning.grossEarnings.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600">
                      -${earning.platformFee.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600 font-semibold">
                      ${earning.netEarnings.toFixed(2)}
                      {earning.netEarnings < 50 && (
                        <div className="text-xs text-gray-500 font-normal">Below $50 threshold</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {earning.paid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                          {earning.paidAt && (
                            <span className="ml-1">
                              {new Date(earning.paidAt).toLocaleDateString()}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-gray-900">Total</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {revenue.totalViews.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">100%</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    ${revenue.totalRevenue.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-red-600">
                    -${totalPlatformFees.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-green-600">
                    ${totalCreatorEarnings.toFixed(2)}
                  </td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Information Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Revenue Distribution Model</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Spotify-Style Revenue Sharing:</strong> Creators earn based on their proportion of total platform views.
            </p>
            <p>
              <strong>Formula:</strong> Creator Net Earnings = (Total Platform Revenue) × (Creator Views / Total Platform Views) × 0.70
            </p>
            <p>
              <strong>Minimum Payout:</strong> $50.00 - Earnings below this threshold are carried over to the next payout period.
            </p>
            <p>
              <strong>Platform Fee:</strong> 30% of gross revenue covers hosting, bandwidth, payment processing, and platform operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
