'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function UnsubscribePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Decode token to get userId
    try {
      const token = params.token as string;
      const decodedUserId = Buffer.from(token, 'base64').toString('utf-8');
      setUserId(decodedUserId);
      setLoading(false);
    } catch (err) {
      setError('Invalid unsubscribe link');
      setLoading(false);
    }
  }, [params.token]);

  const handleUnsubscribeAll = async () => {
    if (!userId) {
      setError('Invalid user ID');
      return;
    }

    setUnsubscribing(true);
    setError(null);

    try {
      const response = await fetch('/api/user/email-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newFollowers: false,
          courseApproved: false,
          courseRejected: false,
          earnings: false,
          payouts: false,
          reviews: false,
          weeklySummary: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error unsubscribing:', err);
      setError('Failed to unsubscribe. Please try again or contact support.');
    } finally {
      setUnsubscribing(false);
    }
  };

  const handleManagePreferences = () => {
    router.push('/dashboard/settings/notifications');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error && !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Invalid Link
            </h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Successfully Unsubscribed
            </h2>
            <p className="mt-2 text-gray-600">
              You've been unsubscribed from all email notifications. You can
              always re-enable them in your account settings.
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={handleManagePreferences}
                className="w-full px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700"
              >
                Manage Email Preferences
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Unsubscribe from Emails
          </h2>
          <p className="mt-4 text-gray-600">
            We're sorry to see you go. You can unsubscribe from all email
            notifications or manage your preferences to choose which emails you
            receive.
          </p>

          {/* Email Types List */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-sm font-medium text-gray-900 mb-3">
              Current email notifications:
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="mr-2">•</span> New followers
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span> Course approved/rejected
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span> Earnings calculated
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span> Payout completed
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span> New reviews
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span> Weekly summary
              </li>
            </ul>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleUnsubscribeAll}
              disabled={unsubscribing}
              className="w-full px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {unsubscribing ? 'Unsubscribing...' : 'Unsubscribe from All'}
            </button>

            <button
              onClick={handleManagePreferences}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Manage Email Preferences
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300"
            >
              Keep Subscribed
            </button>
          </div>

          <p className="mt-6 text-xs text-gray-500">
            Note: Important account and security notifications will still be sent
            regardless of these settings.
          </p>
        </div>
      </div>
    </div>
  );
}
