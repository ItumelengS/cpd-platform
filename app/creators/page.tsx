import { Metadata } from 'next';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import CreatorDirectory from './CreatorDirectory';

export const metadata: Metadata = {
  title: 'Creator Directory | CPD Platform',
  description: 'Discover and follow professional educators and content creators',
};

interface CreatorPageProps {
  searchParams: {
    specialty?: string;
    country?: string;
    sort?: string;
    search?: string;
    page?: string;
  };
}

export default async function CreatorPage({ searchParams }: CreatorPageProps) {
  // Fetch featured creators (top 6 by followers)
  const featuredCreators = await prisma.user.findMany({
    where: {
      isCreator: true,
      creatorStatus: 'APPROVED',
    },
    include: {
      _count: {
        select: {
          createdCourses: true,
          followers: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 6,
  });

  const specialty = searchParams.specialty || '';
  const country = searchParams.country || '';
  const sort = searchParams.sort || 'followers';
  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Creator Directory
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Discover and follow professional educators, experts, and thought leaders
            across various industries and specializations.
          </p>
        </div>
      </div>

      {/* Featured Creators */}
      {featuredCreators.length > 0 && !search && (
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Featured Creators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCreators.map((creator) => (
                <FeaturedCreatorCard
                  key={creator.id}
                  creator={{
                    id: creator.id,
                    name: creator.name || 'Unknown Creator',
                    avatar: creator.avatar || null,
                    specialty: creator.specialty || null,
                    bio: creator.bio || null,
                    followers: creator._count.followers,
                    courses: creator._count.createdCourses,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Creator Directory */}
      <div className="container mx-auto px-4 py-12">
        <Suspense fallback={<DirectorySkeleton />}>
          <CreatorDirectory
            initialSpecialty={specialty}
            initialCountry={country}
            initialSort={sort}
            initialSearch={search}
            initialPage={page}
          />
        </Suspense>
      </div>
    </div>
  );
}

interface FeaturedCreatorCardProps {
  creator: {
    id: string;
    name: string;
    avatar: string | null;
    specialty: string | null;
    bio: string | null;
    followers: number;
    courses: number;
  };
}

function FeaturedCreatorCard({ creator }: FeaturedCreatorCardProps) {
  return (
    <a
      href={`/creators/${creator.id}`}
      className="block bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {creator.avatar ? (
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-xl font-bold">
              {creator.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {creator.name}
          </h3>
          {creator.specialty && (
            <p className="text-sm text-blue-600 mb-2">{creator.specialty}</p>
          )}
          {creator.bio && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {creator.bio}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {creator.followers.toLocaleString()} followers
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {creator.courses} courses
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

function DirectorySkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
