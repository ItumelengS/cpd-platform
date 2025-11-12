import { getAllCourses } from "@/lib/actions/courses"
import CourseCard from "@/components/CourseCard"
import Link from "next/link"

export default async function CoursesPage() {
  const { courses, error } = await getAllCourses()

  if (error || !courses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load courses</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to homepage
          </Link>
        </div>
      </div>
    )
  }

  // Group courses by category
  const categories = Array.from(new Set(courses.map((c) => c.category.name)))

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
              <Link href="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Browse Our Courses
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Discover evidence-based CPD courses designed specifically for radiation sciences professionals
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-3 mb-8">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
            All Courses
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100 border border-gray-300"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No courses available yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals advancing their careers with RadSciCPD
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  )
}
