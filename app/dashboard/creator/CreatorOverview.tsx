'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  PlusCircle,
  FileText,
  CheckCircle,
  AlertCircle,
  BookOpen,
} from 'lucide-react'
import CreatorStatCard from '@/components/CreatorStatCard'
import ActivityTimeline from '@/components/ActivityTimeline'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface CreatorOverviewProps {
  data: {
    user: {
      name: string
      hasCompletedProfile: boolean
      hasSetupPayout: boolean
    }
    stats: {
      monthlyViews: number
      viewsTrend: number
      newFollowers: number
      followersTrend: number
      monthlyEarnings: number
      earningsTrend: number
      contentInReview: number
    }
    activities: Array<{
      type: 'follower' | 'course' | 'publication' | 'view' | 'earnings'
      message: string
      timestamp: Date
      link?: string
    }>
    topContent: Array<{
      id: string
      title: string
      type: 'course' | 'publication'
      views: number
      engagement: number
      revenue: number
    }>
    viewsChart: Array<{
      date: string
      views: number
    }>
  }
}

export default function CreatorOverview({ data }: CreatorOverviewProps) {
  const router = useRouter()

  const todos = [
    {
      id: 'profile',
      text: 'Complete your profile',
      completed: data.user.hasCompletedProfile,
      link: '/dashboard/creator/settings',
    },
    {
      id: 'payout',
      text: 'Set up payout method',
      completed: data.user.hasSetupPayout,
      link: '/dashboard/creator/payout-setup',
    },
    {
      id: 'content',
      text: 'Review draft content',
      completed: data.stats.contentInReview === 0,
      link: '/dashboard/creator/content?filter=drafts',
      showIf: data.stats.contentInReview > 0,
    },
  ].filter((todo) => !todo.showIf || todo.showIf === true)

  const getTrendDirection = (trend: number): 'up' | 'down' | 'neutral' => {
    if (trend > 0) return 'up'
    if (trend < 0) return 'down'
    return 'neutral'
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {data.user.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your content today
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/creator/courses/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              New Course
            </Link>
            <Link
              href="/dashboard/creator/publications/new"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-4 w-4" />
              New Publication
            </Link>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CreatorStatCard
          icon="eye"
          value={data.stats.monthlyViews}
          label="Views This Month"
          trend={data.stats.viewsTrend}
          trendDirection={getTrendDirection(data.stats.viewsTrend)}
        />
        <CreatorStatCard
          icon="users"
          value={data.stats.newFollowers}
          label="New Followers"
          trend={data.stats.followersTrend}
          trendDirection={getTrendDirection(data.stats.followersTrend)}
        />
        <CreatorStatCard
          icon="dollar"
          value={`$${data.stats.monthlyEarnings.toFixed(2)}`}
          label="Earnings This Month"
          trend={data.stats.earningsTrend}
          trendDirection={getTrendDirection(data.stats.earningsTrend)}
        />
        <CreatorStatCard
          icon="file"
          value={data.stats.contentInReview}
          label="Content in Review"
          trend={0}
          trendDirection="neutral"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Views Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Views Over Last 7 Days
            </h2>
            {data.viewsChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.viewsChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value as string)
                      return date.toLocaleDateString()
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No view data available yet
              </div>
            )}
          </div>

          {/* Top Performing Content */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Top Performing Content
            </h2>
            {data.topContent.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-gray-500">
                      <th className="pb-3 font-medium">Title</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Views</th>
                      <th className="pb-3 font-medium">Engagement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.topContent.map((content) => (
                      <tr
                        key={content.id}
                        className="text-sm hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          const path =
                            content.type === 'course'
                              ? `/courses/${content.id}`
                              : `/publications/${content.id}`
                          router.push(path)
                        }}
                      >
                        <td className="py-3 font-medium text-gray-900">
                          {content.title}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              content.type === 'course'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            <BookOpen className="h-3 w-3" />
                            {content.type === 'course' ? 'Course' : 'Publication'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-600">
                          {content.views.toLocaleString()}
                        </td>
                        <td className="py-3 text-gray-600">
                          {content.engagement.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No published content yet. Create your first course or publication!
              </div>
            )}
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* To-Do List */}
          {todos.some((todo) => !todo.completed) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Getting Started
              </h2>
              <div className="space-y-3">
                {todos.map((todo) => (
                  <Link
                    key={todo.id}
                    href={todo.link}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {todo.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          todo.completed
                            ? 'text-gray-500 line-through'
                            : 'text-gray-900'
                        }`}
                      >
                        {todo.text}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <ActivityTimeline activities={data.activities} />
          </div>
        </div>
      </div>
    </div>
  )
}
