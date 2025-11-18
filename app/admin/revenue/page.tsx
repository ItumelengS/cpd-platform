import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ExternalLink, TrendingUp, Eye, DollarSign, Calendar, Calculator } from 'lucide-react';
import { estimateRevenue, formatRevenue } from '@/lib/adsense';
import RevenueCalculatorForm from './RevenueCalculatorForm';

export default async function AdminRevenuePage() {
  const session = await auth();

  // Check if user is admin
  if (!session?.user?.email || session.user.email !== 'admin@example.com') {
    redirect('/dashboard');
  }

  // Get view statistics
  const totalViews = await prisma.view.count();

  // Get views by content type
  const courseViews = await prisma.view.count({
    where: { courseId: { not: null } }
  });

  const publicationViews = await prisma.view.count({
    where: { publicationId: { not: null } }
  });

  // Get views grouped by day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const viewsByDay = await prisma.view.groupBy({
    by: ['createdAt'],
    _count: {
      id: true
    },
    where: {
      createdAt: {
        gte: thirtyDaysAgo
      }
    }
  });

  // Get top viewed courses
  const topCourses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      _count: {
        select: {
          views: true
        }
      }
    },
    orderBy: {
      views: {
        _count: 'desc'
      }
    },
    take: 10
  });

  // Get revenue calculation history
  const revenueHistory = await prisma.revenue.findMany({
    select: {
      id: true,
      month: true,
      year: true,
      totalRevenue: true,
      totalViews: true,
      revenuePerView: true,
      calculatedAt: true,
      _count: {
        select: {
          creatorEarnings: true
        }
      }
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' }
    ],
    take: 12
  });

  // Calculate estimated revenue (rough estimate based on views)
  // Typical AdSense RPM (revenue per 1000 views) ranges from $2-$10
  // For educational content, using $3.50 as conservative estimate
  const estimatedTotalRevenue = estimateRevenue(totalViews);
  const estimatedMonthlyRevenue = estimateRevenue(
    viewsByDay.reduce((sum, day) => sum + day._count.id, 0)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
              <p className="text-gray-600 mt-1">Track advertising revenue and platform performance</p>
            </div>
            <Link
              href="/admin"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calculate Monthly Revenue Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Calculate Monthly Revenue
              </h2>
              <p className="text-gray-700 mb-4">
                Calculate and distribute revenue to creators based on their view share.
                Platform takes 30%, creators receive 70% based on their proportion of total views.
              </p>
            </div>
          </div>

          <RevenueCalculatorForm />
        </div>

        {/* Revenue History */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue History</h2>

          {revenueHistory.length === 0 ? (
            <div className="text-center py-8">
              <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No revenue calculations yet</p>
              <p className="text-sm text-gray-500 mt-1">Use the form above to calculate your first revenue distribution</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Period
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Total Revenue
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Total Views
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Revenue/View
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Creators Paid
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {revenueHistory.map((revenue) => {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return (
                      <tr key={revenue.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="text-gray-900 font-medium">
                            {monthNames[revenue.month - 1]} {revenue.year}
                          </div>
                          <div className="text-xs text-gray-500">
                            {revenue.calculatedAt
                              ? `Calculated ${new Date(revenue.calculatedAt).toLocaleDateString()}`
                              : 'Not yet calculated'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                          ${revenue.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          {revenue.totalViews.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          ${revenue.revenuePerView.toFixed(4)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          {revenue._count.creatorEarnings}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Calculated
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/admin/revenue/${revenue.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AdSense Connection Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <ExternalLink className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connect AdSense API
              </h3>
              <p className="text-gray-700 mb-4">
                To import actual revenue data, connect the Google AdSense Management API.
                The data below shows estimated revenue based on view counts.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://adsense.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open AdSense Dashboard
                </a>
                <a
                  href="https://developers.google.com/adsense/management"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  API Documentation
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Views */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Views</h3>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {totalViews.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-2">All-time page views</p>
          </div>

          {/* Estimated Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Est. Total Revenue</h3>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatRevenue(estimatedTotalRevenue)}
            </div>
            <p className="text-sm text-gray-600 mt-2">Based on {totalViews.toLocaleString()} views</p>
          </div>

          {/* Monthly Views */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">30-Day Views</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {viewsByDay.reduce((sum, day) => sum + day._count.id, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-2">Last 30 days</p>
          </div>

          {/* Estimated Monthly Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Est. Monthly Revenue</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {formatRevenue(estimatedMonthlyRevenue)}
            </div>
            <p className="text-sm text-gray-600 mt-2">Last 30 days estimate</p>
          </div>
        </div>

        {/* Revenue by Content Type */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Views by Type */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Views by Content Type</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Course Pages</span>
                  <span className="text-gray-900 font-semibold">{courseViews.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${totalViews > 0 ? (courseViews / totalViews) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Creator Profiles</span>
                  <span className="text-gray-900 font-semibold">{publicationViews.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${totalViews > 0 ? (publicationViews / totalViews) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Estimated Revenue by Type */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Est. Revenue by Type</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Course Pages</span>
                  <span className="text-gray-900 font-semibold">
                    {formatRevenue(estimateRevenue(courseViews))}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${totalViews > 0 ? (courseViews / totalViews) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Creator Profiles</span>
                  <span className="text-gray-900 font-semibold">
                    {formatRevenue(estimateRevenue(publicationViews))}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${totalViews > 0 ? (publicationViews / totalViews) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Revenue-Generating Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Top Revenue-Generating Courses
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Course Title
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Views
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Est. Revenue
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {topCourses.map((course, index) => (
                  <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 font-medium">#{index + 1}</span>
                        <span className="text-gray-900">{course.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 font-medium">
                      {course._count.views.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600 font-semibold">
                      {formatRevenue(estimateRevenue(course._count.views))}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Course
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Implementation Notes</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>
                <strong>AdSense Approval:</strong> Typically takes 2-4 weeks after application submission
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>
                <strong>Revenue Sync:</strong> Connect AdSense Management API to import actual revenue data
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>
                <strong>Estimates:</strong> Current estimates use $3.50 RPM (revenue per 1000 views) - actual values vary
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>
                <strong>Ad Limit:</strong> Maximum 3 ad units per page per AdSense policy
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>
                <strong>Privacy Policy:</strong> Required for AdSense - available at{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">/privacy</Link>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
