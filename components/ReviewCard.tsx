'use client';

import { useState } from 'react';
import StarRating from './StarRating';
import { ThumbsUp, Flag, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ReviewUser {
  id: string;
  name: string | null;
  avatar: string | null;
}

interface ReviewResponse {
  id: string;
  comment: string;
  createdAt: Date | string;
  creator: ReviewUser;
}

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    helpful: number;
    createdAt: Date | string;
    user: ReviewUser;
    responses?: ReviewResponse[];
  };
  currentUserId?: string;
  isCreator?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onRespond?: () => void;
}

export default function ReviewCard({
  review,
  currentUserId,
  isCreator,
  onEdit,
  onDelete,
  onRespond,
}: ReviewCardProps) {
  const router = useRouter();
  const [helpful, setHelpful] = useState(review.helpful);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [loading, setLoading] = useState(false);

  const isOwnReview = currentUserId === review.user.id;
  const createdAt =
    typeof review.createdAt === 'string'
      ? new Date(review.createdAt)
      : review.createdAt;

  const handleMarkHelpful = async () => {
    if (hasMarkedHelpful) return;

    try {
      const response = await fetch(`/api/reviews/${review.id}/helpful`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setHelpful(data.helpful);
        setHasMarkedHelpful(true);
        // Store in localStorage to prevent duplicates
        localStorage.setItem(`helpful-${review.id}`, 'true');
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert('Please provide a reason for reporting');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/${review.id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reportReason }),
      });

      if (response.ok) {
        alert('Review reported successfully');
        setShowReportDialog(false);
        setReportReason('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to report review');
      }
    } catch (error) {
      console.error('Error reporting review:', error);
      alert('Failed to report review');
    } finally {
      setLoading(false);
    }
  };

  // Check localStorage on mount
  useState(() => {
    const marked = localStorage.getItem(`helpful-${review.id}`);
    if (marked) {
      setHasMarkedHelpful(true);
    }
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            {review.user.avatar ? (
              <Image
                src={review.user.avatar}
                alt={review.user.name || 'User'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                {(review.user.name || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              {review.user.name || 'Anonymous'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={review.rating} readonly size="sm" />
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(createdAt, { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwnReview && onEdit && (
            <button
              onClick={onEdit}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit review"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {isOwnReview && onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {!isOwnReview && currentUserId && (
            <button
              onClick={() => setShowReportDialog(true)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Report review"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {review.title && (
        <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>
      )}

      {review.comment && (
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.comment}</p>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleMarkHelpful}
          disabled={hasMarkedHelpful}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            hasMarkedHelpful
              ? 'bg-blue-50 text-blue-600 cursor-default'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Helpful ({helpful})</span>
        </button>
      </div>

      {review.responses && review.responses.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          {review.responses.map((response) => {
            const responseCreatedAt =
              typeof response.createdAt === 'string'
                ? new Date(response.createdAt)
                : response.createdAt;

            return (
              <div key={response.id} className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {response.creator.avatar ? (
                      <Image
                        src={response.creator.avatar}
                        alt={response.creator.name || 'Creator'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-medium">
                        {(response.creator.name || 'C')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-gray-900">
                        {response.creator.name || 'Creator'}
                      </h5>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        Creator
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(responseCreatedAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {response.comment}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {isCreator && !review.responses?.length && onRespond && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onRespond}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Respond to this review
          </button>
        </div>
      )}

      {showReportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Report Review
            </h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please explain why you're reporting this review..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {reportReason.length}/500 characters
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReport}
                disabled={loading || !reportReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Reporting...' : 'Report'}
              </button>
              <button
                onClick={() => {
                  setShowReportDialog(false);
                  setReportReason('');
                }}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
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
