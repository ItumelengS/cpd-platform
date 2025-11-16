'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Creator {
  id: string;
  name: string;
  avatar: string | null;
  specialty: string;
  bio?: string | null;
  courseCount: number;
  latestCourse: {
    title: string;
    slug: string;
    createdAt: Date;
    thumbnail?: string | null;
  } | null;
  followedAt: Date;
}

interface FollowingListProps {
  initialCreators: Creator[];
}

export default function FollowingList({ initialCreators }: FollowingListProps) {
  const [creators, setCreators] = useState(initialCreators);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);
  const router = useRouter();

  const handleUnfollow = async (creatorId: string) => {
    if (!confirm('Are you sure you want to unfollow this creator?')) {
      return;
    }

    setUnfollowingId(creatorId);

    try {
      const response = await fetch('/api/social/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creatorId }),
      });

      if (!response.ok) {
        throw new Error('Failed to unfollow');
      }

      // Remove from local state
      setCreators((prev) => prev.filter((c) => c.id !== creatorId));

      router.refresh();
    } catch (error) {
      console.error('Error unfollowing creator:', error);
      alert('Failed to unfollow. Please try again.');
    } finally {
      setUnfollowingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {creators.map((creator) => (
        <div
          key={creator.id}
          className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Link href={`/creator/profile/${creator.id}`}>
              {creator.avatar ? (
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-semibold text-blue-600">
                    {creator.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>

            {/* Creator Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/creator/profile/${creator.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                      {creator.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600">{creator.specialty}</p>
                  {creator.bio && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {creator.bio}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>{creator.courseCount} courses</span>
                    <span>•</span>
                    <span>
                      Following since{' '}
                      {new Date(creator.followedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Unfollow Button */}
                <button
                  onClick={() => handleUnfollow(creator.id)}
                  disabled={unfollowingId === creator.id}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {unfollowingId === creator.id ? 'Unfollowing...' : 'Unfollow'}
                </button>
              </div>

              {/* Latest Course */}
              {creator.latestCourse && (
                <Link
                  href={`/courses/${creator.latestCourse.slug}`}
                  className="block mt-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {creator.latestCourse.thumbnail ? (
                      <img
                        src={creator.latestCourse.thumbnail}
                        alt={creator.latestCourse.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">📚</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">Latest Course</p>
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {creator.latestCourse.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Published{' '}
                        {new Date(creator.latestCourse.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
