'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface Creator {
  id: string;
  name: string;
  avatar: string | null;
  specialty: string | null;
  bio: string | null;
  country: string | null;
  followers: number;
  courses: number;
  totalViews: number;
}

interface CreatorDirectoryProps {
  initialSpecialty: string;
  initialCountry: string;
  initialSort: string;
  initialSearch: string;
  initialPage: number;
}

export default function CreatorDirectory({
  initialSpecialty,
  initialCountry,
  initialSort,
  initialSearch,
  initialPage,
}: CreatorDirectoryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [country, setCountry] = useState(initialCountry);
  const [sort, setSort] = useState(initialSort);
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);

  const [creators, setCreators] = useState<Creator[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  const updateURL = useCallback((params: Record<string, string>) => {
    const current = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    router.push(`/creators?${current.toString()}`);
  }, [router, searchParams]);

  const fetchCreators = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        sort,
      });

      if (specialty) params.set('specialty', specialty);
      if (country) params.set('country', country);
      if (search) params.set('search', search);

      const response = await fetch(`/api/creators/directory?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch creators');
      }

      const data = await response.json();
      setCreators(data.creators);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load creators. Please try again.');
      console.error('Fetch creators error:', err);
    } finally {
      setLoading(false);
    }
  }, [specialty, country, sort, search, page]);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  const handleFilterChange = (filterName: string, value: string) => {
    setPage(1);

    switch (filterName) {
      case 'specialty':
        setSpecialty(value);
        updateURL({ specialty: value, page: '1' });
        break;
      case 'country':
        setCountry(value);
        updateURL({ country: value, page: '1' });
        break;
      case 'sort':
        setSort(value);
        updateURL({ sort: value, page: '1' });
        break;
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    updateURL({ search: value, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURL({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFollow = async (creatorId: string) => {
    try {
      const isFollowing = followingStates[creatorId];

      const response = await fetch(`/api/creators/${creatorId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error(data.error || 'Failed to update follow status');
      }

      setFollowingStates(prev => ({
        ...prev,
        [creatorId]: !isFollowing,
      }));

      // Update follower count in UI
      setCreators(prev =>
        prev.map(creator =>
          creator.id === creatorId
            ? { ...creator, followers: creator.followers + (isFollowing ? -1 : 1) }
            : creator
        )
      );
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const totalPages = Math.ceil(total / 18);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Creators
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name or bio..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Specialty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialty
            </label>
            <select
              value={specialty}
              onChange={(e) => handleFilterChange('specialty', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Specialties</option>
              <option value="Medical">Medical</option>
              <option value="Legal">Legal</option>
              <option value="Engineering">Engineering</option>
              <option value="Accounting">Accounting</option>
              <option value="Architecture">Architecture</option>
              <option value="Teaching">Teaching</option>
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Countries</option>
              <option value="South Africa">South Africa</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${total} creator${total !== 1 ? 's' : ''} found`}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="followers">Most Followers</option>
              <option value="courses">Most Courses</option>
              <option value="newest">Newest</option>
              <option value="name">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Creators Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-100 rounded w-24"></div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : creators.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                isFollowing={followingStates[creator.id] || false}
                onFollow={() => handleFollow(creator.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 border rounded-lg ${
                        page === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No creators found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filters to find more creators.
          </p>
        </div>
      )}
    </div>
  );
}

interface CreatorCardProps {
  creator: Creator;
  isFollowing: boolean;
  onFollow: () => void;
}

function CreatorCard({ creator, isFollowing, onFollow }: CreatorCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-6">
      <div className="flex items-start gap-4 mb-4">
        <a href={`/creators/${creator.id}`} className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {creator.avatar ? (
            <Image
              src={creator.avatar}
              alt={creator.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-xl font-bold">
              {creator.name.charAt(0)}
            </div>
          )}
        </a>
        <div className="flex-1 min-w-0">
          <a href={`/creators/${creator.id}`} className="block">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors truncate">
              {creator.name}
            </h3>
          </a>
          {creator.specialty && (
            <p className="text-sm text-blue-600 mb-2">{creator.specialty}</p>
          )}
        </div>
      </div>

      {creator.bio && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {creator.bio}
        </p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {creator.followers.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {creator.courses}
        </span>
      </div>

      <button
        onClick={onFollow}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          isFollowing
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}
