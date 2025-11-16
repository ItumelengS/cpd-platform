'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Trash2, CheckCircle } from 'lucide-react';
import { updateCourseRating } from '@/lib/reviews';

interface AdminReviewActionsProps {
  reviewId: string;
  courseId: string;
  isHidden: boolean;
  isReported: boolean;
}

export default function AdminReviewActions({
  reviewId,
  courseId,
  isHidden,
  isReported,
}: AdminReviewActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggleHidden = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hidden: !isHidden }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review');
    } finally {
      setLoading(false);
    }
  };

  const handleDismissReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reported: false }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to dismiss report');
      }
    } catch (error) {
      console.error('Error dismissing report:', error);
      alert('Failed to dismiss report');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this review? This action cannot be undone.'
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleHidden}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
      >
        {isHidden ? (
          <>
            <Eye className="w-4 h-4" />
            Show Review
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4" />
            Hide Review
          </>
        )}
      </button>

      {isReported && (
        <button
          onClick={handleDismissReport}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          Dismiss Report
        </button>
      )}

      <button
        onClick={handleDelete}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 disabled:opacity-50 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete Review
      </button>
    </div>
  );
}
