'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface EmailPreferences {
  newFollowers: boolean;
  courseApproved: boolean;
  courseRejected: boolean;
  earnings: boolean;
  payouts: boolean;
  reviews: boolean;
  weeklySummary: boolean;
}

export default function NotificationSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [preferences, setPreferences] = useState<EmailPreferences>({
    newFollowers: true,
    courseApproved: true,
    courseRejected: true,
    earnings: true,
    payouts: true,
    reviews: true,
    weeklySummary: true,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/email-preferences');

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();
      setPreferences(data.preferences);
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof EmailPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/email-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save preferences');
      }

      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Email Notifications
          </h1>
          <p className="mt-2 text-gray-600">
            Manage which email notifications you'd like to receive
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              Your preferences have been saved successfully!
            </p>
          </div>
        )}

        {/* Preferences Form */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 space-y-6">
            {/* New Followers */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="newFollowers"
                  type="checkbox"
                  checked={preferences.newFollowers}
                  onChange={() => handleToggle('newFollowers')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label
                  htmlFor="newFollowers"
                  className="font-medium text-gray-900"
                >
                  New Followers
                </label>
                <p className="text-sm text-gray-500">
                  Get notified when someone follows you
                </p>
              </div>
            </div>

            {/* Course Approved */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="courseApproved"
                  type="checkbox"
                  checked={preferences.courseApproved}
                  onChange={() => handleToggle('courseApproved')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label
                  htmlFor="courseApproved"
                  className="font-medium text-gray-900"
                >
                  Course Approved
                </label>
                <p className="text-sm text-gray-500">
                  Get notified when your course is approved and published
                </p>
              </div>
            </div>

            {/* Course Rejected */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="courseRejected"
                  type="checkbox"
                  checked={preferences.courseRejected}
                  onChange={() => handleToggle('courseRejected')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label
                  htmlFor="courseRejected"
                  className="font-medium text-gray-900"
                >
                  Course Rejected
                </label>
                <p className="text-sm text-gray-500">
                  Get notified when your course is rejected with feedback
                </p>
              </div>
            </div>

            {/* Earnings Calculated */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="earnings"
                  type="checkbox"
                  checked={preferences.earnings}
                  onChange={() => handleToggle('earnings')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="earnings" className="font-medium text-gray-900">
                  Earnings Calculated
                </label>
                <p className="text-sm text-gray-500">
                  Get notified when your monthly earnings are calculated
                </p>
              </div>
            </div>

            {/* Payout Completed */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="payouts"
                  type="checkbox"
                  checked={preferences.payouts}
                  onChange={() => handleToggle('payouts')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="payouts" className="font-medium text-gray-900">
                  Payout Completed
                </label>
                <p className="text-sm text-gray-500">
                  Get notified when a payout is sent to your bank account
                </p>
              </div>
            </div>

            {/* New Reviews */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="reviews"
                  type="checkbox"
                  checked={preferences.reviews}
                  onChange={() => handleToggle('reviews')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="reviews" className="font-medium text-gray-900">
                  New Reviews
                </label>
                <p className="text-sm text-gray-500">
                  Get notified when someone reviews your course
                </p>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="weeklySummary"
                  type="checkbox"
                  checked={preferences.weeklySummary}
                  onChange={() => handleToggle('weeklySummary')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3">
                <label
                  htmlFor="weeklySummary"
                  className="font-medium text-gray-900"
                >
                  Weekly Summary
                </label>
                <p className="text-sm text-gray-500">
                  Get a weekly email with your stats and performance summary
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                About Email Notifications
              </h3>
              <p className="mt-2 text-sm text-blue-700">
                You'll only receive emails for the notification types you enable.
                You can change these settings at any time. Important account and
                security notifications will always be sent regardless of these
                settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
