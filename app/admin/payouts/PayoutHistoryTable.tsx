'use client';

import { useState } from 'react';
import { PayoutStatus } from '@prisma/client';
import { CheckCircle, Clock, XCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface Creator {
  id: string;
  name: string | null;
  email: string;
}

interface Revenue {
  month: number;
  year: number;
}

interface Earning {
  revenue: Revenue;
}

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  stripePayoutId: string | null;
  stripeTransferId: string | null;
  failureReason: string | null;
  initiatedAt: Date;
  completedAt: Date | null;
  failedAt: Date | null;
  creator: Creator;
  earnings: Earning[];
}

interface PayoutHistoryTableProps {
  initialPayouts: Payout[];
}

export default function PayoutHistoryTable({ initialPayouts }: PayoutHistoryTableProps) {
  const [filter, setFilter] = useState<PayoutStatus | 'ALL'>('ALL');

  const filteredPayouts =
    filter === 'ALL' ? initialPayouts : initialPayouts.filter((p) => p.status === filter);

  const getStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case PayoutStatus.COMPLETED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case PayoutStatus.PROCESSING:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
            Processing
          </span>
        );
      case PayoutStatus.PENDING:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3" />
            Pending
          </span>
        );
      case PayoutStatus.FAILED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      case PayoutStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getPeriod = (payout: Payout) => {
    if (payout.earnings.length > 0) {
      const revenue = payout.earnings[0].revenue;
      return `${revenue.month}/${revenue.year}`;
    }
    return '-';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Payout History</h2>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as PayoutStatus | 'ALL')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value={PayoutStatus.PENDING}>Pending</option>
            <option value={PayoutStatus.PROCESSING}>Processing</option>
            <option value={PayoutStatus.COMPLETED}>Completed</option>
            <option value={PayoutStatus.FAILED}>Failed</option>
            <option value={PayoutStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      {filteredPayouts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No payouts found</p>
        </div>
      ) : (
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Stripe ID
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayouts.map((payout) => (
                <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {payout.creator.name || 'Unknown Creator'}
                      </div>
                      <div className="text-xs text-gray-500">{payout.creator.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{getPeriod(payout)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    ${payout.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(payout.status)}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {payout.status === PayoutStatus.COMPLETED && payout.completedAt
                      ? new Date(payout.completedAt).toLocaleDateString()
                      : payout.status === PayoutStatus.FAILED && payout.failedAt
                      ? new Date(payout.failedAt).toLocaleDateString()
                      : new Date(payout.initiatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {payout.stripeTransferId ? (
                      <a
                        href={`https://dashboard.stripe.com/transfers/${payout.stripeTransferId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <span className="font-mono">{payout.stripeTransferId.slice(0, 16)}...</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                    {payout.status === PayoutStatus.FAILED && payout.failureReason && (
                      <div className="text-xs text-red-600 mt-1">{payout.failureReason}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
