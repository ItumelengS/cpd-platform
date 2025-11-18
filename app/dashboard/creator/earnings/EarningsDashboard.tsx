'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
  ArrowUpDown,
  Filter,
  AlertCircle,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PayoutStatus } from '@prisma/client';

interface Earning {
  id: string;
  month: number;
  year: number;
  views: number;
  viewShare: number;
  grossEarnings: number;
  platformFee: number;
  netEarnings: number;
  paid: boolean;
  paidAt: string | null;
  calculatedAt: string | null;
  revenuePerView: number;
}

interface Summary {
  thisMonthEarnings: number;
  totalLifetimeEarnings: number;
  availableForPayout: number;
  belowThreshold: number;
  nextPayoutDate: string;
}

interface Payout {
  id: string;
  amount: number;
  status: PayoutStatus;
  stripeTransferId: string | null;
  initiatedAt: string;
  completedAt: string | null;
}

interface EarningsDashboardProps {
  earnings: Earning[];
  summary: Summary;
  stripeOnboarded: boolean;
  stripePayoutsEnabled: boolean;
  payoutHistory: Payout[];
}

type SortField = 'date' | 'views' | 'earnings';
type SortOrder = 'asc' | 'desc';

export default function EarningsDashboard({
  earnings,
  summary,
  stripeOnboarded,
  stripePayoutsEnabled,
  payoutHistory
}: EarningsDashboardProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Get unique years from earnings
  const years = useMemo(() => {
    const uniqueYears = [...new Set(earnings.map((e) => e.year))];
    return uniqueYears.sort((a, b) => b - a);
  }, [earnings]);

  // Filter earnings
  const filteredEarnings = useMemo(() => {
    return earnings.filter((earning) => {
      const yearMatch = selectedYear === 'all' || earning.year === parseInt(selectedYear);
      const statusMatch =
        selectedStatus === 'all' ||
        (selectedStatus === 'paid' && earning.paid) ||
        (selectedStatus === 'pending' && !earning.paid);
      return yearMatch && statusMatch;
    });
  }, [earnings, selectedYear, selectedStatus]);

  // Sort earnings
  const sortedEarnings = useMemo(() => {
    const sorted = [...filteredEarnings];
    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.year * 12 + a.month - (b.year * 12 + b.month);
      } else if (sortField === 'views') {
        comparison = a.views - b.views;
      } else if (sortField === 'earnings') {
        comparison = a.netEarnings - b.netEarnings;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredEarnings, sortField, sortOrder]);

  // Prepare chart data (last 6 months)
  const chartData = useMemo(() => {
    const last6Months = earnings.slice(0, 6).reverse();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return last6Months.map((earning) => ({
      name: `${monthNames[earning.month - 1]} ${earning.year}`,
      earnings: earning.netEarnings,
      views: earning.views,
    }));
  }, [earnings]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Earnings</h1>
              <p className="text-gray-600 mt-1">Track your revenue and payouts</p>
            </div>
            <Link
              href="/dashboard/creator"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stripe Setup Prompt */}
        {!stripeOnboarded && summary.availableForPayout > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 flex items-start gap-3">
            <CreditCard className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Set Up Payouts to Receive Your Earnings
              </h3>
              <p className="text-gray-700 mb-4">
                You have R{summary.availableForPayout.toFixed(2)} ready for payout, but you haven't connected a bank account yet.
                Connect your account via Stripe to start receiving monthly payouts.
              </p>
              <Link
                href="/dashboard/creator/payout-setup"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                <CreditCard className="w-4 h-4" />
                Set Up Payout Account
              </Link>
            </div>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* This Month Earnings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">This Month</h3>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              R{summary.thisMonthEarnings.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {summary.thisMonthEarnings === 0 ? 'Not calculated yet' : 'Pending'}
            </p>
          </div>

          {/* Total Lifetime Earnings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Lifetime Earnings</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              R{summary.totalLifetimeEarnings.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 mt-2">All-time total</p>
          </div>

          {/* Available for Payout */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Available Payout</h3>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              R{summary.availableForPayout.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 mt-2">Ready to withdraw</p>
            {summary.belowThreshold > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                +R{summary.belowThreshold.toFixed(2)} below threshold
              </p>
            )}
          </div>

          {/* Next Payout Date */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Next Payout</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {summary.nextPayoutDate}
            </div>
            <p className="text-sm text-gray-600 mt-2">5th of each month</p>
          </div>
        </div>

        {/* Minimum Payout Notice */}
        {summary.belowThreshold > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Earnings Below Minimum Threshold
              </h3>
              <p className="text-sm text-gray-700">
                You have R{summary.belowThreshold.toFixed(2)} in earnings below the R900 minimum payout threshold.
                These earnings will be carried over and paid out once your total unpaid earnings reach R900.
              </p>
            </div>
          </div>
        )}

        {/* Earnings Trend Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Earnings Trend (Last 6 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'earnings') {
                      return [`R${value.toFixed(2)}`, 'Earnings'];
                    }
                    return [value.toLocaleString(), 'Views'];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filter Earnings</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Year Filter */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Earnings History Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Earnings History</h2>

          {sortedEarnings.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No earnings found</p>
              <p className="text-sm text-gray-500 mt-1">
                {selectedYear !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Your earnings will appear here once revenue is calculated'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      <button
                        onClick={() => handleSort('date')}
                        className="flex items-center gap-1 hover:text-blue-600"
                      >
                        Period
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      <button
                        onClick={() => handleSort('views')}
                        className="flex items-center gap-1 hover:text-blue-600 ml-auto"
                      >
                        Views
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      View Share
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      <button
                        onClick={() => handleSort('earnings')}
                        className="flex items-center gap-1 hover:text-blue-600 ml-auto"
                      >
                        Net Earnings
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEarnings.map((earning) => (
                    <tr key={earning.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="text-gray-900 font-medium">
                          {monthNames[earning.month - 1]} {earning.year}
                        </div>
                        <div className="text-xs text-gray-500">
                          {earning.calculatedAt
                            ? `Calculated ${new Date(earning.calculatedAt).toLocaleDateString()}`
                            : 'Not calculated yet'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 font-medium">
                        {earning.views.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {(earning.viewShare * 100).toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-right text-green-600 font-semibold">
                        R{earning.netEarnings.toFixed(2)}
                        {!earning.paid && earning.netEarnings < 900 && (
                          <div className="text-xs text-amber-600 font-normal">Below R900 threshold</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {earning.paid ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Paid {earning.paidAt ? new Date(earning.paidAt).toLocaleDateString() : ''}
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
              </table>
            </div>
          )}
        </div>

        {/* Payout History */}
        {payoutHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Payout History</h2>
              {stripeOnboarded && (
                <Link
                  href="/dashboard/creator/payout-setup"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Manage Payout Settings
                </Link>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Stripe ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payoutHistory.map((payout) => (
                    <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700">
                        {new Date(payout.completedAt || payout.initiatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        R{payout.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {payout.status === PayoutStatus.COMPLETED && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                        {payout.status === PayoutStatus.PROCESSING && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Clock className="w-3 h-3" />
                            Processing
                          </span>
                        )}
                        {payout.status === PayoutStatus.PENDING && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                        {payout.status === PayoutStatus.FAILED && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {payout.stripeTransferId ? (
                          <a
                            href={`https://dashboard.stripe.com/transfers/${payout.stripeTransferId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                          >
                            <span className="font-mono">{payout.stripeTransferId.slice(0, 12)}...</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">How Earnings Work</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Revenue Sharing:</strong> You earn based on your proportion of total platform views (Spotify-style model).
            </p>
            <p>
              <strong>Creator Share:</strong> You receive 70% of the revenue generated from your views. The platform keeps 30% for operations.
            </p>
            <p>
              <strong>Minimum Payout:</strong> R900.00 - Earnings below this threshold accumulate until you reach the minimum.
            </p>
            <p>
              <strong>Payout Schedule:</strong> Payouts are processed on the 5th of each month for the previous month's earnings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
