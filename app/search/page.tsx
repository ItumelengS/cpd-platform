import { Metadata } from 'next';
import { Suspense } from 'react';
import SearchResults from './SearchResults';

export const metadata: Metadata = {
  title: 'Search | CPD Platform',
  description: 'Search for courses, creators, and publications',
};

interface SearchPageProps {
  searchParams: {
    q?: string;
    type?: string;
    category?: string;
    difficulty?: string;
    minHours?: string;
    maxHours?: string;
    rating?: string;
    sort?: string;
    page?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const type = searchParams.type || 'all';
  const category = searchParams.category || '';
  const difficulty = searchParams.difficulty || '';
  const minHours = searchParams.minHours || '';
  const maxHours = searchParams.maxHours || '';
  const rating = searchParams.rating || '';
  const sort = searchParams.sort || 'relevance';
  const page = parseInt(searchParams.page || '1', 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {query ? `Search results for "${query}"` : 'Search'}
          </h1>
          <p className="text-gray-600">
            Find courses, creators, and publications
          </p>
        </div>
      </div>

      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults
          initialQuery={query}
          initialType={type}
          initialCategory={category}
          initialDifficulty={difficulty}
          initialMinHours={minHours}
          initialMaxHours={maxHours}
          initialRating={rating}
          initialSort={sort}
          initialPage={page}
        />
      </Suspense>
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Filters Skeleton */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                  <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Skeleton */}
        <div className="flex-1">
          <div className="h-10 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="h-40 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
