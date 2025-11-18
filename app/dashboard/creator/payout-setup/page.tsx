'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  AlertCircle,
  CreditCard,
  DollarSign,
  Calendar,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  stripeAccountId: string | null;
  stripeOnboarded: boolean;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  stripeDetailsSubmitted: boolean;
}

interface BankInfo {
  bankName?: string;
  last4?: string;
  routingNumber?: string;
}

export default function PayoutSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingUp, setSettingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check for URL parameters
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');
    const statusParam = searchParams.get('status');

    if (errorParam) {
      if (errorParam === 'no_account') {
        setError('No Stripe account found. Please start the setup process.');
      } else if (errorParam === 'refresh_failed') {
        setError('Failed to refresh onboarding link. Please try again.');
      } else if (errorParam === 'incomplete') {
        setError('Stripe onboarding incomplete. Please complete all required steps.');
      } else if (errorParam === 'verification_failed') {
        setError('Failed to verify your account. Please contact support.');
      }
    }

    if (successParam === 'true') {
      setSuccess('Stripe account successfully connected! You can now receive payouts.');
    }

    if (statusParam === 'pending') {
      setSuccess('Your details have been submitted. Account verification is pending.');
    }
  }, [searchParams]);

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user/stripe-status');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setBankInfo(data.bankInfo);
        } else {
          setError('Failed to load account information');
        }
      } catch (err) {
        setError('Failed to load account information');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleConnectStripe = async () => {
    setSettingUp(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/connect/setup', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start Stripe Connect setup');
      }

      const data = await response.json();

      // Redirect to Stripe onboarding
      window.location.href = data.url;
    } catch (err) {
      setError('Failed to start Stripe Connect setup. Please try again.');
      setSettingUp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payout setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payout Setup
          </h1>
          <p className="text-gray-600">
            Connect your bank account to receive monthly creator payouts
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Stripe Connect Status
              </h2>
              <p className="text-gray-600 text-sm">
                Manage your payment account settings
              </p>
            </div>
            {user?.stripeOnboarded && user?.stripePayoutsEnabled && (
              <CheckCircle className="w-8 h-8 text-green-600" />
            )}
          </div>

          {!user?.stripeOnboarded ? (
            // Not onboarded - Show connect button
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Connect Your Bank Account
                </h3>
                <div className="space-y-3 text-sm text-gray-700 mb-4">
                  <p>To receive monthly payouts, you need to connect a bank account via Stripe Connect:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Secure and encrypted payment processing</li>
                    <li>Direct deposit to your bank account</li>
                    <li>Automatic monthly payouts on the 5th of each month</li>
                    <li>Minimum payout threshold: R900.00</li>
                  </ul>
                </div>
                <button
                  onClick={handleConnectStripe}
                  disabled={settingUp}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {settingUp ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5" />
                      Connect Stripe Account
                    </>
                  )}
                </button>
              </div>

              {/* Information boxes */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <DollarSign className="w-6 h-6 text-gray-400 mb-2" />
                  <h4 className="font-medium text-gray-900 mb-1">Minimum Payout</h4>
                  <p className="text-sm text-gray-600">
                    You'll receive payouts once your earnings reach R900.00
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Calendar className="w-6 h-6 text-gray-400 mb-2" />
                  <h4 className="font-medium text-gray-900 mb-1">Payout Schedule</h4>
                  <p className="text-sm text-gray-600">
                    Payouts are processed on the 5th of each month
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Onboarded - Show account info
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-gray-900">
                    Stripe Account Connected
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Account Status */}
                  <div className="flex justify-between items-center py-2 border-b border-green-100">
                    <span className="text-sm text-gray-600">Account Status</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.stripePayoutsEnabled ? 'Active' : 'Pending Verification'}
                    </span>
                  </div>

                  {/* Payouts Enabled */}
                  <div className="flex justify-between items-center py-2 border-b border-green-100">
                    <span className="text-sm text-gray-600">Payouts Enabled</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.stripePayoutsEnabled ? 'Yes' : 'Pending'}
                    </span>
                  </div>

                  {/* Bank Account */}
                  {bankInfo?.last4 && (
                    <div className="flex justify-between items-center py-2 border-b border-green-100">
                      <span className="text-sm text-gray-600">Bank Account</span>
                      <span className="text-sm font-medium text-gray-900">
                        {bankInfo.bankName || 'Bank'} ••••{bankInfo.last4}
                      </span>
                    </div>
                  )}

                  {/* Payout Schedule */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Payout Schedule</span>
                    <span className="text-sm font-medium text-gray-900">
                      Monthly on the 5th
                    </span>
                  </div>
                </div>
              </div>

              {/* Update Payment Details Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleConnectStripe}
                  disabled={settingUp}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {settingUp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Update Payment Details
                    </>
                  )}
                </button>
              </div>

              {/* View Earnings Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <button
                  onClick={() => router.push('/dashboard/creator/earnings')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Your Earnings →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Information Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">How Payouts Work</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Revenue Sharing:</strong> Creators earn 70% of revenue based on their proportion of total platform views.
            </p>
            <p>
              <strong>Minimum Threshold:</strong> Payouts are only processed when your balance reaches R900.00. Earnings below this threshold are carried over to the next month.
            </p>
            <p>
              <strong>Processing Time:</strong> Payouts are initiated on the 5th of each month and typically arrive in your bank account within 2-7 business days.
            </p>
            <p>
              <strong>Stripe Fees:</strong> A small transfer fee of 0.5% (capped at $5) is deducted from each payout to cover Stripe's processing costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
