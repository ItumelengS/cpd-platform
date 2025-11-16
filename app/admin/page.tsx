import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = {
  title: 'Admin Dashboard',
  description: 'CPD Platform administration',
}

async function getAdminStats() {
  // Get pending reviews count
  const pendingCoursesCount = await prisma.course.count({
    where: {
      isDraft: false,
      published: false,
      rejectedAt: null,
    },
  })

  const pendingPublicationsCount = await prisma.publication.count({
    where: {
      published: false,
    },
  })

  const pendingReviewsCount = pendingCoursesCount + pendingPublicationsCount

  // Get total creators count
  const totalCreatorsCount = await prisma.user.count({
    where: {
      isCreator: true,
      creatorStatus: 'APPROVED',
    },
  })

  // Get total content count
  const totalCoursesCount = await prisma.course.count({
    where: {
      published: true,
    },
  })

  const totalPublicationsCount = await prisma.publication.count({
    where: {
      published: true,
    },
  })

  const totalContentCount = totalCoursesCount + totalPublicationsCount

  // Get recent submissions (last 5)
  const recentCourses = await prisma.course.findMany({
    where: {
      isDraft: false,
    },
    take: 3,
    orderBy: {
      submittedAt: 'desc',
    },
    include: {
      creator: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  const recentPublications = await prisma.publication.findMany({
    take: 2,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      creator: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  const recentSubmissions = [
    ...recentCourses.map((course) => ({
      id: course.id,
      title: course.title,
      type: 'course' as const,
      creatorName: course.creator?.name || course.creator?.email || 'Unknown',
      submittedAt: course.submittedAt || course.createdAt,
      published: course.published,
    })),
    ...recentPublications.map((pub) => ({
      id: pub.id,
      title: pub.title,
      type: 'publication' as const,
      creatorName: pub.creator.name || pub.creator.email,
      submittedAt: pub.createdAt,
      published: pub.published,
    })),
  ]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5)

  return {
    pendingReviewsCount,
    totalCreatorsCount,
    totalContentCount,
    recentSubmissions,
  }
}

export default async function AdminDashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const stats = await getAdminStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage content, creators, and platform settings
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Pending Reviews */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Reviews
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.pendingReviewsCount}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link
                href="/admin/content"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View pending content
              </Link>
            </div>
          </div>

          {/* Total Creators */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Creators
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalCreatorsCount}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link
                href="/admin/creators"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Manage creators
              </Link>
            </div>
          </div>

          {/* Total Content */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Published Content
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalContentCount}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link
                href="/admin/content"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View all content
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentSubmissions.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-500">
                No recent submissions
              </div>
            ) : (
              stats.recentSubmissions.map((submission) => (
                <div
                  key={`${submission.type}-${submission.id}`}
                  className="px-6 py-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            submission.type === 'course'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {submission.type === 'course' ? 'Course' : 'Publication'}
                        </span>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {submission.title}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                        <span>by {submission.creatorName}</span>
                        <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                        {submission.published ? (
                          <span className="text-green-600 font-medium">Published</span>
                        ) : (
                          <span className="text-yellow-600 font-medium">Pending Review</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Link
                        href={`/admin/content/${
                          submission.type === 'course' ? 'courses' : 'publications'
                        }/${submission.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {stats.recentSubmissions.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <Link
                href="/admin/content"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View all submissions
              </Link>
            </div>
          )}
        </div>

        {/* Quick Access Links */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/content"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="px-6 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Content Moderation</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Review and approve pending content
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/creators"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="px-6 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Creator Management</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage creator applications
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="px-6 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Back to Dashboard</h3>
                  <p className="mt-1 text-sm text-gray-500">Return to main dashboard</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
