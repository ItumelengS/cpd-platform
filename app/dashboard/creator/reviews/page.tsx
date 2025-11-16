import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StarRating from '@/components/StarRating';
import { formatDistanceToNow } from 'date-fns';
import { Flag, MessageSquare, TrendingUp } from 'lucide-react';
import RespondToReviewButton from './RespondToReviewButton';

export default async function CreatorReviewsPage({
  searchParams,
}: {
  searchParams: { course?: string; rating?: string; reported?: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Check if user is a creator
  if (!session.user.role || !['CREATOR', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  // Build filters
  const filters: any = {
    course: {
      creatorId: session.user.id,
    },
  };

  if (searchParams.course) {
    filters.courseId = searchParams.course;
  }

  if (searchParams.rating) {
    filters.rating = parseInt(searchParams.rating);
  }

  if (searchParams.reported === 'true') {
    filters.reported = true;
  }

  // Fetch reviews on creator's courses
  const reviews = await prisma.review.findMany({
    where: filters,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          averageRating: true,
          ratingCount: true,
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch creator's courses for filter dropdown
  const courses = await prisma.course.findMany({
    where: {
      creatorId: session.user.id,
    },
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: 'asc',
    },
  });

  // Calculate stats
  const totalReviews = reviews.length;
  const reportedCount = reviews.filter((r) => r.reported).length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/dashboard/creator"
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Creator Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Course Reviews</h1>
          <p className="text-gray-600 mt-2">
            Manage and respond to reviews on your courses
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalReviews}
                </p>
              </div>
              <MessageSquare className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-gray-900">
                    {averageRating.toFixed(1)}
                  </p>
                  <StarRating rating={averageRating} readonly size="sm" />
                </div>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Reported Reviews</p>
                <p className="text-3xl font-bold text-gray-900">
                  {reportedCount}
                </p>
              </div>
              <Flag className="w-10 h-10 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="course-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Course
              </label>
              <select
                id="course-filter"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  if (e.target.value) {
                    url.searchParams.set('course', e.target.value);
                  } else {
                    url.searchParams.delete('course');
                  }
                  window.location.href = url.toString();
                }}
                defaultValue={searchParams.course || ''}
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="rating-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Rating
              </label>
              <select
                id="rating-filter"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  if (e.target.value) {
                    url.searchParams.set('rating', e.target.value);
                  } else {
                    url.searchParams.delete('rating');
                  }
                  window.location.href = url.toString();
                }}
                defaultValue={searchParams.rating || ''}
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="reported-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="reported-filter"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  if (e.target.value) {
                    url.searchParams.set('reported', e.target.value);
                  } else {
                    url.searchParams.delete('reported');
                  }
                  window.location.href = url.toString();
                }}
                defaultValue={searchParams.reported || ''}
              >
                <option value="">All Reviews</option>
                <option value="true">Reported Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reviews found
            </h3>
            <p className="text-gray-600">
              {searchParams.course || searchParams.rating || searchParams.reported
                ? 'Try adjusting your filters'
                : 'Your courses haven\'t received any reviews yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`bg-white rounded-lg shadow-sm p-6 ${
                  review.reported ? 'border-2 border-red-200' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {review.user.name || 'Anonymous'}
                      </h3>
                      {review.reported && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                          Reported
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

                {review.responses && review.responses.length > 0 ? (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">
                      Your Response
                    </h5>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {review.responses[0].comment}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {formatDistanceToNow(new Date(review.responses[0].createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                ) : (
                  <RespondToReviewButton reviewId={review.id} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
