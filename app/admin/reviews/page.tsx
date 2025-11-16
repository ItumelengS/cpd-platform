import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StarRating from '@/components/StarRating';
import { formatDistanceToNow } from 'date-fns';
import { Flag, Eye, EyeOff, Trash2, CheckCircle } from 'lucide-react';
import AdminReviewActions from './AdminReviewActions';

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: { reported?: string; hidden?: string; page?: string };
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const page = parseInt(searchParams.page || '1');
  const limit = 50;

  // Build filters
  const where: any = {};

  if (searchParams.reported === 'true') {
    where.reported = true;
  }

  if (searchParams.hidden === 'true') {
    where.hidden = true;
  } else if (searchParams.hidden === 'false') {
    where.hidden = false;
  }

  // Fetch reviews
  const [reviews, totalCount] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        responses: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);

  // Get statistics
  const stats = await prisma.review.groupBy({
    by: ['reported', 'hidden'],
    _count: true,
  });

  const reportedCount = stats
    .filter((s) => s.reported)
    .reduce((sum, s) => sum + s._count, 0);
  const hiddenCount = stats
    .filter((s) => s.hidden)
    .reduce((sum, s) => sum + s._count, 0);
  const totalReviews = await prisma.review.count();

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Review Moderation</h1>
          <p className="text-gray-600 mt-2">
            Manage and moderate course reviews
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{totalReviews}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Reported Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{reportedCount}</p>
              </div>
              <Flag className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hidden Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{hiddenCount}</p>
              </div>
              <EyeOff className="w-10 h-10 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  if (e.target.value) {
                    url.searchParams.set('reported', e.target.value);
                  } else {
                    url.searchParams.delete('reported');
                  }
                  url.searchParams.delete('page');
                  window.location.href = url.toString();
                }}
                defaultValue={searchParams.reported || ''}
              >
                <option value="">All Reviews</option>
                <option value="true">Reported Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibility
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  if (e.target.value) {
                    url.searchParams.set('hidden', e.target.value);
                  } else {
                    url.searchParams.delete('hidden');
                  }
                  url.searchParams.delete('page');
                  window.location.href = url.toString();
                }}
                defaultValue={searchParams.hidden || ''}
              >
                <option value="">All</option>
                <option value="false">Visible</option>
                <option value="true">Hidden</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Flag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reviews found
            </h3>
            <p className="text-gray-600">
              {searchParams.reported || searchParams.hidden
                ? 'Try adjusting your filters'
                : 'No reviews to moderate'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className={`bg-white rounded-lg shadow-sm p-6 ${
                    review.reported ? 'border-2 border-red-200' : ''
                  } ${review.hidden ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {review.user.name || 'Anonymous'}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({review.user.email})
                        </span>
                        {review.reported && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                            Reported
                          </span>
                        )}
                        {review.hidden && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/courses/${review.course.slug}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {review.course.title}
                      </Link>
                      <div className="flex items-center gap-4 mt-2">
                        <StarRating rating={review.rating} readonly size="sm" />
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(review.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {review.title}
                    </h4>
                  )}

                  {review.comment && (
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                      {review.comment}
                    </p>
                  )}

                  <div className="text-sm text-gray-600 mb-4">
                    {review.helpful} people found this helpful
                  </div>

                  {review.responses && review.responses.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">
                        Creator Response
                      </h5>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {review.responses[0].comment}
                      </p>
                    </div>
                  )}

                  <AdminReviewActions
                    reviewId={review.id}
                    courseId={review.course.id}
                    isHidden={review.hidden}
                    isReported={review.reported}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Link
                  href={`?${new URLSearchParams({
                    ...searchParams,
                    page: Math.max(1, page - 1).toString(),
                  })}`}
                  className={`px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors ${
                    page === 1 ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  Previous
                </Link>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <Link
                  href={`?${new URLSearchParams({
                    ...searchParams,
                    page: Math.min(totalPages, page + 1).toString(),
                  })}`}
                  className={`px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors ${
                    page === totalPages ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  Next
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
