'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ExportRequest {
  id: string;
  status: string;
  downloadUrl: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export default function DataExportPage() {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<ExportRequest[]>([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/user/export-data');
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleExportRequest = async () => {
    if (!confirm('Request a data export? You will receive an email with a download link when ready.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/export-data', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request data export');
      }

      alert('Data export requested successfully. You will receive an email with a download link shortly.');
      fetchRequests();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Download Your Data</h1>
          <p className="text-gray-600 mt-2">
            Exercise your right to access your personal data under GDPR
          </p>
          <Link href="/dashboard/settings" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            Back to Settings
          </Link>
        </div>

        {/* Information */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">What data will be included?</h3>
          <p className="text-gray-700 mb-3">
            Your data export will include all information associated with your account:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            <li>Profile information (name, email, bio, etc.)</li>
            <li>Course enrollments and progress</li>
            <li>Certificates earned</li>
            <li>Reviews and ratings</li>
            <li>Creator data (if applicable): courses, publications, earnings, payouts</li>
          </ul>
          <p className="text-sm text-gray-600 mt-3">
            The data will be provided in JSON format. Download links expire after 7 days.
          </p>
        </div>

        {/* Export Button */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Request Data Export</h2>
          <p className="text-gray-600 mb-6">
            Click the button below to request a download of all your data. You will receive an email with a
            secure download link when your export is ready (usually within a few minutes).
          </p>
          <button
            onClick={handleExportRequest}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {loading ? 'Requesting...' : 'Request Data Export'}
          </button>
        </div>

        {/* Export History */}
        {requests.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Export History</h2>
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(request.status)}`}>
                          {request.status.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          Requested: {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {request.expiresAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Expires: {new Date(request.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {request.status === 'completed' && request.downloadUrl && (
                      <a
                        href={request.downloadUrl}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        Download
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal Notice */}
        <div className="mt-8 bg-gray-50 border border-gray-200 p-6 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Your Privacy Rights</h3>
          <p className="text-xs text-gray-600">
            Under GDPR and other data protection laws, you have the right to access, correct, and delete your
            personal data. For more information, see our{' '}
            <Link href="/legal/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            . If you have questions, contact us at privacy@cpdplatform.com
          </p>
        </div>
      </div>
    </div>
  );
}
