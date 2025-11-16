'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';

interface SearchResult {
  id: string;
  type: 'course' | 'creator' | 'publication';
  title: string;
  description: string;
  image?: string;
  slug?: string;
  category?: string;
  difficulty?: string;
  cpdHours?: number;
  price?: number;
  rating?: number;
  totalRatings?: number;
  creatorName?: string;
  creatorAvatar?: string;
  specialty?: string;
  followers?: number;
  courses?: number;
  publishedAt?: string;
}

interface SearchResultsProps {
  initialQuery: string;
  initialType: string;
  initialCategory: string;
  initialDifficulty: string;
  initialMinHours: string;
  initialMaxHours: string;
  initialRating: string;
  initialSort: string;
  initialPage: number;
}

export default function SearchResults({
  initialQuery,
  initialType,
  initialCategory,
  initialDifficulty,
  initialMinHours,
  initialMaxHours,
  initialRating,
  initialSort,
  initialPage,
}: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [category, setCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [minHours, setMinHours] = useState(initialMinHours);
  const [maxHours, setMaxHours] = useState(initialMaxHours);
  const [rating, setRating] = useState(initialRating);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateURL = useCallback((params: Record<string, string>) => {
    const current = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    router.push(`/search?${current.toString()}`);
  }, [router, searchParams]);

  const fetchResults = useCallback(async () => {
    if (!query) {
      setResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        q: query,
        type,
        page: page.toString(),
        sort,
      });

      if (category) params.set('category', category);
      if (difficulty) params.set('difficulty', difficulty);
      if (minHours) params.set('minHours', minHours);
      if (maxHours) params.set('maxHours', maxHours);
      if (rating) params.set('rating', rating);

      const response = await fetch(`/api/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to fetch search results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, type, category, difficulty, minHours, maxHours, rating, sort, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
    updateURL({ q: newQuery, page: '1' });
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setPage(1);
    updateURL({ type: newType, page: '1' });
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setPage(1);

    switch (filterName) {
      case 'category':
        setCategory(value);
        updateURL({ category: value, page: '1' });
        break;
      case 'difficulty':
        setDifficulty(value);
        updateURL({ difficulty: value, page: '1' });
        break;
      case 'minHours':
        setMinHours(value);
        updateURL({ minHours: value, page: '1' });
        break;
      case 'maxHours':
        setMaxHours(value);
        updateURL({ maxHours: value, page: '1' });
        break;
      case 'rating':
        setRating(value);
        updateURL({ rating: value, page: '1' });
        break;
    }
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
    updateURL({ sort: newSort, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURL({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setCategory('');
    setDifficulty('');
    setMinHours('');
    setMaxHours('');
    setRating('');
    setPage(1);
    updateURL({
      category: '',
      difficulty: '',
      minHours: '',
      maxHours: '',
      rating: '',
      page: '1'
    });
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search courses, creators, publications..."
          defaultValue={query}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        {['all', 'courses', 'creators', 'publications'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTypeChange(tab)}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              type === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {type === tab && total > 0 && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                {total}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              {(category || difficulty || minHours || maxHours || rating) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Category Filter */}
              {type !== 'creators' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
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
              )}

              {/* Difficulty Filter */}
              {type === 'all' || type === 'courses' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              ) : null}

              {/* CPD Hours Range */}
              {type === 'all' || type === 'courses' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPD Hours
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minHours}
                      onChange={(e) => handleFilterChange('minHours', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxHours}
                      onChange={(e) => handleFilterChange('maxHours', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>
              ) : null}

              {/* Rating Filter */}
              {type === 'all' || type === 'courses' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                    <option value="3">3+ Stars</option>
                  </select>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              {loading ? (
                'Searching...'
              ) : total > 0 ? (
                `${total} result${total !== 1 ? 's' : ''} found`
              ) : query ? (
                'No results found'
              ) : (
                'Enter a search query'
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price">Price</option>
              </select>

              {/* View Toggle */}
              <div className="hidden md:flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${
                    viewMode === 'grid'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-label="Grid view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 border-l border-gray-300 ${
                    viewMode === 'list'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-label="List view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Results Grid/List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {results.map((result) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    viewMode={viewMode}
                    query={query}
                    highlightMatch={highlightMatch}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
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
          ) : query ? (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              {(category || difficulty || minHours || maxHours || rating) && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface ResultCardProps {
  result: SearchResult;
  viewMode: 'grid' | 'list';
  query: string;
  highlightMatch: (text: string, query: string) => React.ReactNode;
}

function ResultCard({ result, viewMode, query, highlightMatch }: ResultCardProps) {
  if (result.type === 'course') {
    const href = `/courses/${result.slug}`;

    if (viewMode === 'list') {
      return (
        <Link href={href} className="block bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-4">
          <div className="flex gap-4">
            {result.image && (
              <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                <Image
                  src={result.image}
                  alt={result.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {highlightMatch(result.title, query)}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {highlightMatch(result.description, query)}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                {result.creatorName && <span>{result.creatorName}</span>}
                {result.category && <span className="px-2 py-1 bg-gray-100 rounded">{result.category}</span>}
                {result.difficulty && <span>{result.difficulty}</span>}
                {result.cpdHours && <span>{result.cpdHours} CPD Hours</span>}
                {result.rating && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    {result.rating.toFixed(1)} ({result.totalRatings})
                  </span>
                )}
              </div>
            </div>
            {result.price !== undefined && (
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-gray-900">
                  {result.price === 0 ? 'Free' : `R${result.price}`}
                </div>
              </div>
            )}
          </div>
        </Link>
      );
    }

    return (
      <Link href={href} className="block bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
        {result.image && (
          <div className="relative w-full h-40 bg-gray-200">
            <Image
              src={result.image}
              alt={result.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {highlightMatch(result.title, query)}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {highlightMatch(result.description, query)}
          </p>
          {result.creatorName && (
            <p className="text-sm text-gray-500 mb-2">{result.creatorName}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              {result.category && <span className="px-2 py-1 bg-gray-100 rounded">{result.category}</span>}
              {result.cpdHours && <span>{result.cpdHours} hrs</span>}
            </div>
            {result.price !== undefined && (
              <div className="text-lg font-bold text-gray-900">
                {result.price === 0 ? 'Free' : `R${result.price}`}
              </div>
            )}
          </div>
          {result.rating && (
            <div className="flex items-center gap-1 mt-2">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <span className="text-sm font-medium">{result.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({result.totalRatings})</span>
            </div>
          )}
        </div>
      </Link>
    );
  }

  if (result.type === 'creator') {
    const href = `/creators/${result.slug}`;

    return (
      <Link href={href} className={`block bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-6 ${
        viewMode === 'list' ? 'flex items-center gap-4' : ''
      }`}>
        <div className={viewMode === 'grid' ? 'text-center' : 'flex items-center gap-4 flex-1'}>
          {result.creatorAvatar && (
            <div className={`relative ${
              viewMode === 'grid'
                ? 'w-24 h-24 mx-auto mb-4'
                : 'w-16 h-16 flex-shrink-0'
            } rounded-full overflow-hidden bg-gray-200`}>
              <Image
                src={result.creatorAvatar}
                alt={result.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className={viewMode === 'list' ? 'flex-1' : ''}>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {highlightMatch(result.title, query)}
            </h3>
            {result.specialty && (
              <p className="text-sm text-gray-600 mb-2">{result.specialty}</p>
            )}
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {highlightMatch(result.description, query)}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {result.followers !== undefined && (
                <span>{result.followers.toLocaleString()} followers</span>
              )}
              {result.courses !== undefined && (
                <span>{result.courses} courses</span>
              )}
            </div>
          </div>
        </div>
        {viewMode === 'list' && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0">
            Follow
          </button>
        )}
      </Link>
    );
  }

  if (result.type === 'publication') {
    const href = `/publications/${result.slug}`;

    return (
      <Link href={href} className="block bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-4">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {highlightMatch(result.title, query)}
            </h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-3">
              {highlightMatch(result.description, query)}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {result.creatorName && <span>{result.creatorName}</span>}
              {result.publishedAt && (
                <span>{new Date(result.publishedAt).toLocaleDateString()}</span>
              )}
              {result.category && <span className="px-2 py-1 bg-gray-100 rounded">{result.category}</span>}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return null;
}
