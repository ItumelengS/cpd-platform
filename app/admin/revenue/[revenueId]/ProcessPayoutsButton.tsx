'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface ProcessPayoutsButtonProps {
  revenueId: string;
  pendingCount: number;
}

export default function ProcessPayoutsButton({ revenueId, pendingCount }: ProcessPayoutsButtonProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleProcessPayouts = async () => {
    if (!confirm(`Are you sure you want to process payouts for ${pendingCount} creator(s)?`)) {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/admin/payouts/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ revenueId }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setShowResults(true);

        // Refresh the page after showing results
        setTimeout(() => {
          router.refresh();
        }, 3000);
      } else {
        const error = await response.json();
        alert(`Failed to process payouts: ${error.error || 'Unknown error'}`);
      }
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
                <div className="text-2xl font-bold text-gray-900">{results.successful}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{results.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  ${results.totalAmount?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-gray-600">Total Paid</div>
              </div>
            </div>

            {/* Detailed Results */}
            {results.results && results.results.length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-gray-900">Details:</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {results.results.map((result: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm ${
                        result.success ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{result.creatorName}</div>
                          <div className="text-gray-600">${result.amount.toFixed(2)}</div>
                        </div>
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                      </div>
                      {result.error && (
                        <div className="text-xs text-red-600 mt-1">{result.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
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
      onClick={handleProcessPayouts}
      disabled={processing}
      className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {processing ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <DollarSign className="w-4 h-4" />
          Process Payouts ({pendingCount})
        </>
      )}
    </button>
  );
}
