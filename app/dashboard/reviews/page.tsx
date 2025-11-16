import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StarRating from '@/components/StarRating';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Trash2, ExternalLink } from 'lucide-react';
import DeleteReviewButton from './DeleteReviewButton';

export default async function UserReviewsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch all reviews written by the user
  const reviews = await prisma.review.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
        },
      },
      responses: {
        include: {
          creator: {
            select: {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600 mt-2">
            Manage all your course reviews
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-600 mb-6">
              Complete a course to leave your first review
            </p>
            <Link
              href="/courses"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link
                      href={`/courses/${review.course.slug}`}
                      className="text-xl font-semibold text-gray-900 hover:text-blue-600 inline-flex items-center gap-2"
                    >
                      {review.course.title}
                      <ExternalLink className="w-4 h-4" />
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

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/reviews/edit/${review.id}`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit review"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <DeleteReviewButton reviewId={review.id} courseId={review.course.id} />
                  </div>
                </div>

                {review.title && (
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {review.title}
                  </h3>
                )}

                {review.comment && (
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {review.comment}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{review.helpful} people found this helpful</span>
                  {review.reported && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                      Reported
                    </span>
                  )}
                  {review.hidden && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      Hidden
                    </span>
                  )}
                </div>

                {review.responses && review.responses.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Creator Response
                    </h4>
                    {review.responses.map((response) => (
                      <div
                        key={response.id}
                        className="bg-blue-50 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {response.creator.name}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            Creator
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(response.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {response.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
