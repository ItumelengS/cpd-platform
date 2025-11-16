'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RevenueCalculatorForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentDate = new Date();
  const [formData, setFormData] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    totalRevenue: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/revenue/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: Number(formData.month),
          year: Number(formData.year),
          totalRevenue: parseFloat(formData.totalRevenue),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate revenue');
      }

      setSuccess(
        `Successfully calculated revenue for ${getMonthName(formData.month)} ${formData.year}. ` +
        `Distributed to ${data.breakdown.creatorsCount} creators.`
      );

      // Reset form
      setFormData({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        totalRevenue: '',
      });

      // Refresh the page to show updated revenue history
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthName = (month: number | string) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[Number(month) - 1];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        {/* Month Selector */}
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
            Month
          </label>
          <select
            id="month"
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {getMonthName(month)}
              </option>
            ))}
          </select>
        </div>

        {/* Year Input */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <input
            type="number"
            id="year"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
            min="2020"
            max="2099"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Total Revenue Input */}
        <div>
          <label htmlFor="totalRevenue" className="block text-sm font-medium text-gray-700 mb-1">
            Total Revenue ($)
          </label>
          <input
            type="number"
            id="totalRevenue"
            value={formData.totalRevenue}
            onChange={(e) => setFormData({ ...formData, totalRevenue: e.target.value })}
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {isLoading ? 'Calculating...' : 'Calculate & Distribute'}
      </button>

      <div className="text-sm text-gray-600 mt-2">
        <p className="font-medium mb-1">Revenue Distribution:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Platform receives 30% of total revenue</li>
          <li>Creators receive 70% based on their view share</li>
          <li>Minimum payout threshold: $50</li>
        </ul>
      </div>
    </form>
  );
}
