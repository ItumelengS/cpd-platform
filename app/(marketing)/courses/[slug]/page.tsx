import { getCourseBySlug, checkEnrollment, enrollInCourse } from "@/lib/actions/courses"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import EnrollButton from "./EnrollButton"

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

  return (
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
          </div>

          {/* Right Column - Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-lg sticky top-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {course.price === 0 ? "Free" : `$${course.price}`}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
