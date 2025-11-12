import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import StatCard from "@/components/StatCard"
import ProgressBar from "@/components/ProgressBar"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch user data
  const [enrollments, certificates, completedEnrollments] = await Promise.all([
    prisma.enrollment.count({
      where: { userId: session.user.id },
    }),
    prisma.certificate.count({
      where: { userId: session.user.id },
    }),
    prisma.enrollment.findMany({
      where: {
        userId: session.user.id,
        completedAt: { not: null },
      },
      include: {
        course: true,
      },
    }),
  ])

  // Get enrolled courses with progress
  const enrolledCourses = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          category: true,
          sections: {
            select: { id: true },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
    take: 6,
  })

  // Calculate progress for each course
  const coursesWithProgress = await Promise.all(
    enrolledCourses.map(async (enrollment) => {
      const totalSections = enrollment.course.sections.length
      const completedSections = await prisma.progress.count({
        where: {
          userId: session.user.id,
          sectionId: { in: enrollment.course.sections.map((s) => s.id) },
          completed: true,
        },
      })

      const progress = totalSections > 0 ? (completedSections / totalSections) * 100 : 0

      return {
        ...enrollment,
        progress,
        totalSections,
        completedSections,
      }
    })
  )

  // Calculate total CPD hours earned
  const totalCpdHours = completedEnrollments.reduce(
    (sum, enrollment) => sum + enrollment.course.cpdHours,
    0
  )

  // Get in-progress courses
  const inProgressCourses = coursesWithProgress.filter(
    (c) => c.progress > 0 && c.progress < 100
  )

  // Get recent certificates
  const recentCertificates = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: {
      course: true,
    },
    orderBy: { issuedAt: "desc" },
    take: 3,
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {session.user.name}! Here's your learning progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="📚"
          value={enrollments}
          label="Enrolled Courses"
          color="blue"
        />
        <StatCard
          icon="✅"
          value={completedEnrollments.length}
          label="Completed Courses"
          color="green"
        />
        <StatCard
          icon="⏱️"
          value={totalCpdHours.toFixed(1)}
          label="CPD Hours Earned"
          color="purple"
        />
        <StatCard
          icon="🎓"
          value={certificates}
          label="Certificates Earned"
          color="yellow"
        />
      </div>

      {/* Continue Learning */}
      {inProgressCourses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Continue Learning</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {inProgressCourses.map((enrollment) => (
              <div
                key={enrollment.id}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded mb-2">
                      {enrollment.course.category.name}
                    </span>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {enrollment.course.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>{Math.round(enrollment.progress)}%</span>
                  </div>
                  <ProgressBar percentage={enrollment.progress} color="blue" />
                  <p className="text-xs text-gray-500">
                    {enrollment.completedSections} of {enrollment.totalSections} sections completed
                  </p>
                </div>

                <Link
                  href={`/learn/${enrollment.course.slug}/${enrollment.course.sections[0]?.id || ""}`}
                  className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Resume →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
          <Link href="/courses" className="text-blue-600 hover:text-blue-700 font-medium">
            Browse More →
          </Link>
        </div>

        {coursesWithProgress.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
            <Link
              href="/courses"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesWithProgress.map((enrollment) => (
              <div
                key={enrollment.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:border-blue-500 transition"
              >
                <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <div className="text-5xl">{enrollment.course.category.icon || "📚"}</div>
                </div>
                <div className="p-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded mb-2">
                    {enrollment.course.category.name}
                  </span>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {enrollment.course.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <ProgressBar percentage={enrollment.progress} color="blue" height="h-2" />
                    <p className="text-xs text-gray-500">
                      {Math.round(enrollment.progress)}% complete
                    </p>
                  </div>

                  <Link
                    href={`/learn/${enrollment.course.slug}/${enrollment.course.sections[0]?.id || ""}`}
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    {enrollment.progress > 0 ? "Continue" : "Start"} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Certificates */}
      {recentCertificates.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recent Certificates</h2>
            <Link
              href="/dashboard/certificates"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {recentCertificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <div className="text-4xl mb-4 text-center">🎓</div>
                <h3 className="font-bold text-gray-900 text-center mb-2">
                  {cert.course.title}
                </h3>
                <p className="text-sm text-gray-600 text-center mb-1">
                  Score: {cert.score.toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500 text-center">
                  Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
