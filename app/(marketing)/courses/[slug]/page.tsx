import { getCourseBySlug, checkEnrollment, enrollInCourse } from "@/lib/actions/courses"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import EnrollButton from "./EnrollButton"
import CourseDetailClient from "./CourseDetailClient"
import AdUnit from "@/components/AdUnit"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import ReviewList from "@/components/ReviewList"
import StarRating from "@/components/StarRating"
import { getRatingDistribution, hasUserCompletedCourse, hasUserReviewedCourse } from "@/lib/reviews"

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { course, error } = await getCourseBySlug(slug)
  const session = await auth()

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Course not found</p>
          <Link href="/courses" className="text-blue-600 hover:underline">
            Browse all courses
          </Link>
        </div>
      </div>
    )
  }

  // Check if user is enrolled
  const { enrolled } = session ? await checkEnrollment(course.id) : { enrolled: false }

  // Check if user can write a review
  let canWriteReview = false;
  let hasReviewed = false;
  if (session) {
    const hasCompleted = await hasUserCompletedCourse(session.user.id, course.id);
    hasReviewed = await hasUserReviewedCourse(session.user.id, course.id);
    canWriteReview = hasCompleted && !hasReviewed;
  }

  // Get rating distribution
  const ratingDistribution = await getRatingDistribution(course.id);

  // Fetch related courses (Students Also Viewed)
  const relatedCourses = await prisma.course.findMany({
    where: {
      published: true,
      id: {
        not: course.id,
      },
      OR: [
        { categoryId: course.categoryId },
        { creatorId: course.creatorId },
      ],
    },
    include: {
      creator: {
        select: {
          name: true,
          avatar: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      totalViews: 'desc',
    },
    take: 6,
  })

  return (
    <CourseDetailClient courseId={course.id}>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              RadSciCPD
            </Link>
            <div className="flex items-center gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-blue-600">
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <span className="inline-block bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
              {course.category.name}
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">{course.title}</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl">{course.description}</p>

          <div className="flex flex-wrap gap-6 text-lg">
            <div className="flex items-center gap-2">
              <span>⏱️</span>
              <span>{course.cpdHours} CPD Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📊</span>
              <span>{course.difficulty}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📚</span>
              <span>{course.sections.length} Sections</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Ad Unit Above Content */}
        <div className="mb-8">
          <AdUnit
            slot="1234567891"
            format="horizontal"
            className="max-w-5xl mx-auto"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What You'll Learn
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">
                    Evidence-based knowledge from peer-reviewed research
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">
                    Practical applications for your daily practice
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">
                    Latest developments in {course.category.name.toLowerCase()}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">
                    Skills to enhance patient care and safety
                  </span>
                </li>
              </ul>
            </div>

            {/* Course Outline */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Course Outline
              </h2>
              <div className="space-y-4">
                {course.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Article */}
            {course.sourceArticle && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Source Article</h3>
                <p className="text-gray-700 text-sm">{course.sourceArticle}</p>
              </div>
            )}

            {/* Reviews & Ratings Section */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              {/* Rating Summary */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Reviews & Ratings
                </h2>
                {course.ratingCount > 0 ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Average Rating */}
                    <div className="text-center md:text-left">
                      <div className="text-5xl font-bold text-gray-900 mb-2">
                        {course.averageRating?.toFixed(1) || '0.0'}
                      </div>
                      <StarRating rating={course.averageRating || 0} readonly size="lg" />
                      <p className="text-gray-600 mt-2">
                        Based on {course.ratingCount} {course.ratingCount === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingDistribution[star] || 0;
                        const percentage = course.ratingCount > 0
                          ? Math.round((count / course.ratingCount) * 100)
                          : 0;
                        return (
                          <div key={star} className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 w-12">
                              {star} star
                            </span>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {percentage}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No reviews yet. Be the first to review this course!</p>
                  </div>
                )}
              </div>

              {/* Review List */}
              <ReviewList
                courseId={course.id}
                currentUserId={session?.user?.id}
                isCreator={course.creatorId === session?.user?.id}
                canWriteReview={canWriteReview}
              />
            </div>
          </div>

          {/* Right Column - Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-lg sticky top-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {course.price === 0 ? "Free" : `R${course.price}`}
                </div>
                <p className="text-gray-600">Lifetime access</p>
              </div>

              {enrolled ? (
                <Link
                  href={`/learn/${course.slug}/${course.sections[0]?.id || ""}`}
                  className="block w-full bg-green-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition mb-4"
                >
                  Continue Learning →
                </Link>
              ) : (
                <EnrollButton courseId={course.id} isLoggedIn={!!session} />
              )}

              <div className="space-y-3 mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 text-gray-700">
                  <span>✓</span>
                  <span>{course.cpdHours} CPD credit hours</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <span>✓</span>
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <span>✓</span>
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <span>✓</span>
                  <span>Mobile & desktop access</span>
                </div>
              </div>

              {/* Sidebar Ad */}
              <AdUnit
                slot="1234567892"
                format="rectangle"
                className="hidden lg:block"
              />
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Related Content - Students Also Viewed */}
      {relatedCourses.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Students Also Viewed
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCourses.map((relatedCourse) => (
              <Link
                key={relatedCourse.id}
                href={`/courses/${relatedCourse.slug}`}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {relatedCourse.thumbnail ? (
                  <div className="relative w-full h-40 bg-gray-200">
                    <Image
                      src={relatedCourse.thumbnail}
                      alt={relatedCourse.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                <div className="p-4">
                  {relatedCourse.creator && (
                    <div className="flex items-center gap-2 mb-2">
                      {relatedCourse.creator.avatar ? (
                        <div className="relative w-5 h-5 rounded-full overflow-hidden">
                          <Image
                            src={relatedCourse.creator.avatar}
                            alt={relatedCourse.creator.name || 'User'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                          {relatedCourse.creator.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className="text-xs text-gray-600">{relatedCourse.creator.name}</span>
                    </div>
                  )}
                  <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                    {relatedCourse.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {relatedCourse.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded">{relatedCourse.category.name}</span>
                      <span>{relatedCourse.cpdHours} hrs</span>
                    </div>
                    <div className="text-base font-bold text-gray-900">
                      {relatedCourse.price === 0 ? 'Free' : `R${relatedCourse.price}`}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      </div>
    </CourseDetailClient>
  )
}
