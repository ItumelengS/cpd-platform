'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  const handleDeleteAccount = async () => {
    if (!confirm('This action cannot be undone. Your account will be anonymized immediately and permanently deleted in 90 days. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deleteReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      alert('Your account has been scheduled for deletion. You will be logged out now.');
      router.push('/');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and privacy settings</p>
          <Link href="/dashboard/settings" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            Back to Settings
          </Link>
        </div>

        {/* Data Export Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Download Your Data</h2>
          <p className="text-gray-600 mb-4">
            Exercise your right to access your personal data under GDPR. Request a complete export of all data
            associated with your account.
          </p>
          <Link
            href="/dashboard/settings/data"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Download My Data
          </Link>
        </div>

        {/* Delete Account Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 border-2 border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-4">Delete Account</h2>
          <p className="text-gray-600 mb-4">
            Permanently delete your account and remove your personal data from our platform. This action cannot be undone.
          </p>

          {/* Warning Box */}
          <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6">
            <h3 className="text-sm font-semibold text-red-900 mb-2">Before you delete your account:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-red-700">
              <li>You will lose access to all your enrolled courses</li>
              <li>Your certificates will no longer be accessible</li>
              <li>All your progress and data will be permanently deleted</li>
              <li>If you are a creator, ensure all pending payouts are completed</li>
              <li>Your content may remain visible to users who previously purchased it</li>
              <li>This action has a 90-day grace period before permanent deletion</li>
            </ul>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium"
          >
            Delete My Account
          </button>
        </div>

        {/* Legal Notice */}
        <div className="mt-8 bg-gray-50 border border-gray-200 p-6 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Your Privacy Rights</h3>
          <p className="text-xs text-gray-600">
            Under GDPR and other data protection laws, you have the right to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-600">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your data (right to be forgotten)</li>
            <li>Restrict or object to data processing</li>
            <li>Data portability</li>
          </ul>
          <p className="text-xs text-gray-600 mt-3">
            For more information, see our{' '}
            <Link href="/legal/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            . Contact us at privacy@cpdplatform.com
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Delete Account?</h2>

            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This action will immediately anonymize your account and schedule it
                for permanent deletion in 90 days.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why are you deleting your account? (Optional)
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Help us improve by telling us why you're leaving..."
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">What happens next:</h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
                <li>Your personal information will be anonymized immediately</li>
                <li>You will be logged out and cannot log back in</li>
                <li>Your account is scheduled for permanent deletion in 90 days</li>
                <li>You can create a new account if you change your mind</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium"
              >
                {loading ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteReason('');
                }}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
