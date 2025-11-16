'use client';

import { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReviewListProps {
  courseId: string;
  currentUserId?: string;
  isCreator?: boolean;
  canWriteReview?: boolean;
  onWriteReview?: () => void;
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  helpful: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  responses?: Array<{
    id: string;
    comment: string;
    createdAt: string;
    creator: {
      id: string;
      name: string | null;
      avatar: string | null;
    };
  }>;
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function ReviewList({
  courseId,
  currentUserId,
  isCreator,
  canWriteReview,
  onWriteReview,
}: ReviewListProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [filterRating, setFilterRating] = useState<string>('all');

  useEffect(() => {
    fetchReviews();
  }, [courseId, sortBy, filterRating, pagination.page]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        courseId,
        sortBy,
        page: pagination.page.toString(),
      });

      if (filterRating !== 'all') {
        params.append('rating', filterRating);
      }

      const response = await fetch(`/api/reviews?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchReviews();
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Reviews ({pagination.totalCount})
        </h2>
        {canWriteReview && onWriteReview && (
          <button
            onClick={onWriteReview}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
            Sort by
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="recent">Newest</option>
            <option value="helpful">Most Helpful</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="filter-rating" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by rating
          </label>
          <select
            id="filter-rating"
            value={filterRating}
            onChange={(e) => {
              setFilterRating(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-600 mb-4">
            Be the first to share your experience with this course!
          </p>
          {canWriteReview && onWriteReview && (
            <button
              onClick={onWriteReview}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={currentUserId}
                isCreator={isCreator}
                onEdit={() => {
                  // Handle edit - could open a modal or navigate to edit page
                  router.push(`/dashboard/reviews?edit=${review.id}`);
                }}
                onDelete={() => handleDelete(review.id)}
                onRespond={() => {
                  // Handle respond - could open a modal
                  router.push(`/dashboard/creator/reviews?respond=${review.id}`);
                }}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
