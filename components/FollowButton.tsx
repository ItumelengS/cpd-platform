'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FollowButtonProps {
  creatorId: string;
  initialFollowing: boolean;
  initialFollowerCount: number;
}

export default function FollowButton({
  creatorId,
  initialFollowing,
  initialFollowerCount,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggleFollow = async () => {
    setIsLoading(true);

    // Optimistic UI update
    const previousFollowing = isFollowing;
    const previousCount = followerCount;

    setIsFollowing(!isFollowing);
    setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));

    try {
      const response = await fetch('/api/social/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creatorId }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle follow');
      }

      const data = await response.json();

      // Update with actual server data
      setIsFollowing(data.following);
      setFollowerCount(data.followerCount);

      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error('Error toggling follow:', error);

      // Rollback on error
      setIsFollowing(previousFollowing);
      setFollowerCount(previousCount);

      alert('Failed to update follow status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggleFollow}
        disabled={isLoading}
        className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isFollowing
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {isFollowing ? 'Unfollowing...' : 'Following...'}
          </span>
        ) : isFollowing ? (
          'Following ✓'
        ) : (
          'Follow'
        )}
      </button>

      <div className="text-gray-600">
        <span className="font-semibold text-gray-900">{followerCount}</span>{' '}
        {followerCount === 1 ? 'Follower' : 'Followers'}
      </div>
    </div>
  );
}
