'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SubscribeButtonProps {
  planId: string;
  planName: string;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  isPopular?: boolean;
  className?: string;
}

export default function SubscribeButton({
  planId,
  planName,
  billingPeriod = 'MONTHLY',
  isPopular = false,
  className = '',
}: SubscribeButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Stripe is configured
  const isStripeConfigured = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('placeholder');

  const handleSubscribe = async () => {
    // Show coming soon message if Stripe not configured
    if (!isStripeConfigured) {
      setError('Payment processing is not yet available. We\'re launching soon!');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingPeriod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!isStripeConfigured && (
        <div className="mb-2 text-center">
          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
            Coming Soon
          </span>
        </div>
      )}
      <button
        onClick={handleSubscribe}
        disabled={isLoading}
        className={
          className ||
          `block w-full text-center py-3 px-6 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
            isPopular
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`
        }
      >
        {isLoading ? 'Loading...' : (isStripeConfigured ? 'Get Started' : 'Notify Me')}
      </button>
      {error && (
        <p className="text-sm mt-2 text-center text-yellow-700">{error}</p>
      )}
    </div>
  );
}
