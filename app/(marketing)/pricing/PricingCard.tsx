'use client';

import { useState } from 'react';
import Link from 'next/link';
import SubscribeButton from '@/components/SubscribeButton';

interface PricingPlan {
  id: string;
  name: string;
  tier: string;
  monthlyPrice: number;
  yearlyPrice: number;
  cpdPointsPerYear: number;
  description: string | null;
  features: string[];
}

export default function PricingCard({ plan }: { plan: PricingPlan }) {
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const isPopular = plan.tier === 'PROFESSIONAL';
  const monthlySavings = ((plan.monthlyPrice * 12 - plan.yearlyPrice) / plan.monthlyPrice / 12 * 100).toFixed(0);

  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-8 border-2 relative ${
        isPopular
          ? 'border-blue-600 transform scale-105'
          : 'border-gray-200'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            ⭐ BEST VALUE - Full CPD!
          </span>
        </div>
      )}

      {plan.tier === 'BASIC' && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Affordable
          </span>
        </div>
      )}

      {plan.tier === 'PREMIUM' && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Premium Features
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {plan.name}
        </h3>

        {/* Billing Period Toggle */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={() => setBillingPeriod('MONTHLY')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              billingPeriod === 'MONTHLY'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('YEARLY')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              billingPeriod === 'YEARLY'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Yearly
          </button>
        </div>

        <div className="text-4xl font-bold text-blue-600 mb-2">
          R{billingPeriod === 'YEARLY' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
        </div>
        <p className="text-gray-600">per month</p>
        {billingPeriod === 'YEARLY' && (
          <p className="text-sm text-green-600 font-semibold mt-2">
            Billed R{plan.yearlyPrice}/year (save {monthlySavings}%)
          </p>
        )}
        {billingPeriod === 'MONTHLY' && (
          <p className="text-sm text-gray-500 mt-2">
            Billed monthly at R{plan.monthlyPrice}
          </p>
        )}
        <div className="mt-4 inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
          {plan.cpdPointsPerYear} CPD points/year
        </div>
      </div>

      <p className="text-gray-600 text-sm text-center mb-6">
        {plan.description}
      </p>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-start gap-3">
            <span className="text-green-600 mt-1 flex-shrink-0">
              ✓
            </span>
            <span className="text-gray-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <SubscribeButton
        planId={plan.id}
        planName={plan.name}
        billingPeriod={billingPeriod}
        isPopular={isPopular}
      />

      {isPopular && (
        <p className="text-center text-sm text-gray-500 mt-3">
          Covers your full annual CPD requirement!
        </p>
      )}
    </div>
  );
}
