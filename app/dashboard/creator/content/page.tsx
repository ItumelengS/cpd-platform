'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Grid,
  List,
  Eye,
  DollarSign,
  Edit,
  Trash2,
  Send,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  BookOpen,
} from 'lucide-react'

type ContentItem = {
  id: string
  title: string
  type: 'course' | 'publication'
  status: 'draft' | 'review' | 'published' | 'rejected'
  thumbnail?: string
  views: number
  earnings: number
  createdAt: Date
  updatedAt: Date
}

export default function ContentManagementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState(searchParams?.get('filter') || 'all')
  const [sortBy, setSortBy] = useState('newest')
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    fetchContent()
  }, [filter, sortBy])

  const fetchContent = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/creator/content?filter=${filter}&sort=${sortBy}`
      )
      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
      }
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      const response = await fetch(`/api/creator/content/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchContent()
      }
    } catch (error) {
      console.error('Error deleting content:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedItems.length} items?`)) return

    try {
      await Promise.all(
        selectedItems.map((id) =>
          fetch(`/api/creator/content/${id}`, { method: 'DELETE' })
        )
      )
      setSelectedItems([])
      fetchContent()
    } catch (error) {
      console.error('Error deleting content:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      review: 'bg-yellow-100 text-yellow-700',
      published: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    }

    const icons = {
      draft: Clock,
      review: Clock,
      published: CheckCircle,
      rejected: XCircle,
    }

    const Icon = icons[status as keyof typeof icons]

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getTypeBadge = (type: string) => {
    const Icon = type === 'course' ? BookOpen : FileText
    const color = type === 'course' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="h-3 w-3" />
        {type === 'course' ? 'Course' : 'Publication'}
      </span>
    )
  }

  const filteredContent = content.filter((item) => {
    if (filter === 'all') return true
    if (filter === 'courses') return item.type === 'course'
    if (filter === 'publications') return item.type === 'publication'
    if (filter === 'drafts') return item.status === 'draft'
    if (filter === 'review') return item.status === 'review'
    if (filter === 'published') return item.status === 'published'
    if (filter === 'rejected') return item.status === 'rejected'
    return true
  })

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'courses', label: 'Courses' },
    { id: 'publications', label: 'Publications' },
    { id: 'drafts', label: 'Drafts' },
    { id: 'review', label: 'Under Review' },
    { id: 'published', label: 'Published' },
    { id: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Content</h1>
          <p className="text-gray-600 mt-1">
            Manage your courses and publications
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/creator/courses/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Course
          </Link>
          <Link
            href="/dashboard/creator/publications/new"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            New Publication
          </Link>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* View mode & sort */}
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="views">Most Views</option>
              <option value="earnings">Highest Earning</option>
            </select>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border-l ${
                  viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedItems.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {selectedItems.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedItems([])}
              className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Content Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No content found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-200 relative">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {item.type === 'course' ? (
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    ) : (
                      <FileText className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  {getTypeBadge(item.type)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActionMenuOpen(
                          actionMenuOpen === item.id ? null : item.id
                        )
                      }
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {actionMenuOpen === item.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setActionMenuOpen(null)}
                        />
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border z-20">
                          <Link
                            href={`/dashboard/creator/${item.type === 'course' ? 'courses' : 'publications'}/${item.id}/edit`}
                            className="block px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-3">{getStatusBadge(item.status)}</div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {item.views.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {item.earnings.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-6 py-3 font-medium">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length === filteredContent.length &&
                      filteredContent.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(filteredContent.map((i) => i.id))
                      } else {
                        setSelectedItems([])
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Views</th>
                <th className="px-6 py-3 font-medium">Earnings</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredContent.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, item.id])
                        } else {
                          setSelectedItems(
                            selectedItems.filter((id) => id !== item.id)
                          )
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.title}
                  </td>
                  <td className="px-6 py-4">{getTypeBadge(item.type)}</td>
                  <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    ${item.earnings.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/creator/${item.type === 'course' ? 'courses' : 'publications'}/${item.id}/edit`}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
