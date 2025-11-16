'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface Creator {
  id: string;
  name: string | null;
  email: string;
  stripeOnboarded: boolean;
  stripePayoutsEnabled: boolean;
}

interface Revenue {
  id: string;
  month: number;
  year: number;
}

interface PendingEarning {
  id: string;
  netEarnings: number;
  creator: Creator;
  revenue: Revenue;
}

interface ProcessPayoutsButtonProps {
  pendingEarnings: PendingEarning[];
}

export default function ProcessPayoutsButton({ pendingEarnings }: ProcessPayoutsButtonProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Group earnings by revenue period
  const groupedByRevenue = pendingEarnings.reduce((acc, earning) => {
    const key = earning.revenue.id;
    if (!acc[key]) {
      acc[key] = {
        revenueId: earning.revenue.id,
        month: earning.revenue.month,
        year: earning.revenue.year,
        earnings: [],
      };
    }
    acc[key].earnings.push(earning);
    return acc;
  }, {} as Record<string, any>);

  const revenuePeriods = Object.values(groupedByRevenue);

  const handleProcessAll = async () => {
    if (!confirm('Are you sure you want to process all pending payouts?')) {
      return;
    }

    setProcessing(true);
    const allResults: any[] = [];

    try {
      // Process each revenue period
      for (const period of revenuePeriods) {
        const response = await fetch('/api/admin/payouts/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ revenueId: period.revenueId }),
        });

        if (response.ok) {
          const data = await response.json();
          allResults.push({
            period: `${period.month}/${period.year}`,
            ...data,
          });
        } else {
          allResults.push({
            period: `${period.month}/${period.year}`,
            error: 'Failed to process',
          });
        }
      }

      setResults({
        periods: allResults,
        totalSuccessful: allResults.reduce((sum, r) => sum + (r.successful || 0), 0),
        totalFailed: allResults.reduce((sum, r) => sum + (r.failed || 0), 0),
        totalAmount: allResults.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
      });
      setShowResults(true);

      // Refresh the page after a delay
      setTimeout(() => {
        router.refresh();
      }, 3000);
    } catch (error) {
      alert('Failed to process payouts. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (showResults && results) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payout Results</h2>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{results.totalSuccessful}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{results.totalFailed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  ${results.totalAmount.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Paid</div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
              {results.periods.map((period: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Period: {period.period}</h3>
                  {period.error ? (
                    <p className="text-red-600 text-sm">{period.error}</p>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p>Processed: {period.totalProcessed}</p>
                      <p>Successful: {period.successful}</p>
                      <p>Failed: {period.failed}</p>
                      <p>Amount: ${period.totalAmount.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowResults(false);
                  router.refresh();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleProcessAll}
      disabled={processing}
      className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {processing ? (
        <>
          <RefreshCw className="w-5 h-5 animate-spin" />
          Processing Payouts...
        </>
      ) : (
        <>
          <DollarSign className="w-5 h-5" />
          Process All Payouts
        </>
      )}
    </button>
  );
}
