'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SubscriptionManagerProps {
  subscription: {
    id: string;
    tier: string;
    status: string;
    billingPeriod: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    plan: {
      name: string;
      monthlyPrice: number;
      yearlyPrice: number;
      cpdPointsPerYear: number;
    };
  };
}

export default function SubscriptionManager({ subscription }: SubscriptionManagerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Active' },
      PAST_DUE: { color: 'bg-red-100 text-red-800', label: 'Past Due' },
      TRIALING: { color: 'bg-blue-100 text-blue-800', label: 'Trial' },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
    };

    const badge = badges[status as keyof typeof badges] || badges.ACTIVE;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      router.refresh();
      setShowCancelConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const monthlyPrice = subscription.billingPeriod === 'YEARLY'
    ? Math.round(subscription.plan.yearlyPrice / 12)
    : subscription.plan.monthlyPrice;

  const totalPrice = subscription.billingPeriod === 'YEARLY'
    ? subscription.plan.yearlyPrice
    : subscription.plan.monthlyPrice;

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{subscription.plan.name} Plan</h2>
              <p className="text-blue-100 mt-1">
                {subscription.plan.cpdPointsPerYear} CPD points per year
              </p>
            </div>
            {getStatusBadge(subscription.status)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">R{monthlyPrice}</span>
            <span className="text-blue-100">/ month</span>
          </div>
          {subscription.billingPeriod === 'YEARLY' && (
            <p className="text-blue-100 text-sm mt-2">
              Billed annually at R{subscription.plan.yearlyPrice}
            </p>
          )}
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* Billing Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Billing Period</p>
              <p className="text-lg font-semibold text-gray-900">
                {subscription.billingPeriod === 'YEARLY' ? 'Annual' : 'Monthly'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Billing Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-ZA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Cancellation Warning */}
          {subscription.cancelAtPeriodEnd && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-yellow-900">Subscription Ending</p>
                  <p className="text-sm text-yellow-800 mt-1">
                    Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-ZA')}.
                    You'll continue to have access until then.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            {!subscription.cancelAtPeriodEnd ? (
              <>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isLoading}
                  className="px-6 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              </>
            ) : (
              <div className="text-sm text-gray-600">
                Subscription cancelled. Access ends {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-ZA')}.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Cancel Subscription?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your {subscription.plan.name} subscription?
              You'll continue to have access until {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-ZA')},
              but you won't be charged again.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Benefits */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Benefits</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">Unlimited access to all published courses</span>
          </li>
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">Earn {subscription.plan.cpdPointsPerYear} CPD points per year</span>
          </li>
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">New courses added monthly</span>
          </li>
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">HPCSA-recognized certificates</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
