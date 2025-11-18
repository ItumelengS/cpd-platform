'use client'

import { useState } from 'react'
import { Download, User, MapPin, Briefcase } from 'lucide-react'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface FollowersDashboardProps {
  data: {
    totalFollowers: number
    recentFollowers: number
    followers: Array<{
      id: string
      name: string
      email: string
      avatar?: string | null
      specialty?: string | null
      country?: string | null
      followedAt: Date
    }>
    growthChart: Array<{
      date: string
      followers: number
    }>
    demographics: {
      bySpecialty: Array<{
        specialty: string
        count: number
      }>
      byCountry: Array<{
        country: string
        count: number
      }>
    }
  }
}

const COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#6366f1',
  '#f97316',
  '#14b8a6',
  '#ef4444',
  '#a855f7',
]

export default function FollowersDashboard({ data }: FollowersDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const growthPercentage =
    data.totalFollowers > 0
      ? ((data.recentFollowers / data.totalFollowers) * 100).toFixed(1)
      : '0'

  const filteredFollowers = data.followers.filter(
    (follower) =>
      follower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      follower.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Specialty', 'Country', 'Followed Date']
    const rows = data.followers.map((f) => [
      f.name,
      f.email,
      f.specialty || 'N/A',
      f.country || 'N/A',
      new Date(f.followedAt).toLocaleDateString(),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `followers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Followers</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your follower base
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Followers</p>
            <p className="text-3xl font-bold text-gray-900">
              {data.totalFollowers.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Growth (Last 30 Days)</p>
            <p className="text-3xl font-bold text-green-600">
              +{data.recentFollowers}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {growthPercentage}% increase
            </p>
          </div>
          <div className="md:col-span-1">
            {data.growthChart.length > 0 && (
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={data.growthChart}>
                  <Line
                    type="monotone"
                    dataKey="followers"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Growth Chart */}
      {data.growthChart.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Follower Growth (Last 30 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.growthChart}>
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
                dataKey="followers"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Demographics */}
      {(data.demographics.bySpecialty.length > 0 ||
        data.demographics.byCountry.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Specialty */}
          {data.demographics.bySpecialty.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Followers by Specialty
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.demographics.bySpecialty}
                    dataKey="count"
                    nameKey="specialty"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => entry.name}
                  >
                    {data.demographics.bySpecialty.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* By Country */}
          {data.demographics.byCountry.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Top Countries
              </h2>
              <div className="space-y-3">
                {data.demographics.byCountry.map((country, index) => {
                  const percentage = (
                    (country.count / data.totalFollowers) *
                    100
                  ).toFixed(1)
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {country.country}
                        </span>
                        <span className="text-sm text-gray-500">
                          {country.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Follower List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            All Followers
          </h2>
          <input
            type="text"
            placeholder="Search followers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="overflow-x-auto">
          {filteredFollowers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? 'No followers found' : 'No followers yet'}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-6 py-3 font-medium">Follower</th>
                  <th className="px-6 py-3 font-medium">Specialty</th>
                  <th className="px-6 py-3 font-medium">Country</th>
                  <th className="px-6 py-3 font-medium">Followed</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredFollowers.map((follower) => (
                  <tr key={follower.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          {follower.avatar ? (
                            <img
                              src={follower.avatar}
                              alt={follower.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {follower.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {follower.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="h-4 w-4" />
                        <span className="text-sm">
                          {follower.specialty || 'Not specified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">
                          {follower.country || 'Not specified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(follower.followedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`/profile/${follower.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        View Profile
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
