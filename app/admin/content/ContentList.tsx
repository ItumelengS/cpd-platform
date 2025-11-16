'use client'

import { useState } from 'react'
import Link from 'next/link'
import ContentStatusBadge from '@/components/ContentStatusBadge'

type Creator = {
  id: string
  name: string | null
  email: string
}

type Category = {
  id: string
  name: string
}

type Course = {
  id: string
  title: string
  slug: string
  creatorId: string | null
  creator: Creator | null
  category: Category
  submittedAt: Date | null
  createdAt: Date
  published: boolean
  isDraft: boolean
  rejectedAt: Date | null
  rejectionReason: string | null
  cpdHours: number
}

type Publication = {
  id: string
  title: string
  creatorId: string
  creator: Creator
  category: Category
  createdAt: Date
  published: boolean
  doi: string | null
}

interface ContentListProps {
  pendingCourses: Course[]
  pendingPublications: Publication[]
  allCourses: Course[]
  allPublications: Publication[]
  categories: Category[]
}

type Tab = 'pending-courses' | 'pending-publications' | 'all-content'
type SortBy = 'newest' | 'oldest'

export default function ContentList({
  pendingCourses,
  pendingPublications,
  allCourses,
  allPublications,
  categories,
}: ContentListProps) {
  const [activeTab, setActiveTab] = useState<Tab>('pending-courses')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedContent, setSelectedContent] = useState<{
    id: string
    type: 'course' | 'publication'
    title: string
  } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickApprove = (
    id: string,
    type: 'course' | 'publication',
    title: string
  ) => {
    setSelectedContent({ id, type, title })
    setShowApproveModal(true)
  }

  const handleQuickReject = (
    id: string,
    type: 'course' | 'publication',
    title: string
  ) => {
    setSelectedContent({ id, type, title })
    setShowRejectModal(true)
  }

  const confirmApprove = async () => {
    if (!selectedContent) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/content/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId: selectedContent.id,
          contentType: selectedContent.type,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve content')
      }

      // Reload the page to refresh data
      window.location.reload()
    } catch (error) {
      console.error('Error approving content:', error)
      alert('Failed to approve content. Please try again.')
    } finally {
      setIsLoading(false)
      setShowApproveModal(false)
      setSelectedContent(null)
    }
  }

  const confirmReject = async () => {
    if (!selectedContent || !rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/content/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId: selectedContent.id,
          contentType: selectedContent.type,
          reason: rejectionReason,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject content')
      }

      // Reload the page to refresh data
      window.location.reload()
    } catch (error) {
      console.error('Error rejecting content:', error)
      alert('Failed to reject content. Please try again.')
    } finally {
      setIsLoading(false)
      setShowRejectModal(false)
      setSelectedContent(null)
      setRejectionReason('')
    }
  }

  const getFilteredAndSortedContent = () => {
    let content: Array<{
      id: string
      title: string
      type: 'course' | 'publication'
      creatorName: string
      categoryName: string
      submittedDate: Date
      status: 'draft' | 'review' | 'published' | 'rejected'
      rejectionReason?: string | null
    }> = []

    if (activeTab === 'pending-courses') {
      content = pendingCourses.map((course) => ({
        id: course.id,
        title: course.title,
        type: 'course' as const,
        creatorName: course.creator?.name || course.creator?.email || 'Unknown',
        categoryName: course.category.name,
        submittedDate: course.submittedAt || course.createdAt,
        status: 'review' as const,
        rejectionReason: null,
      }))
    } else if (activeTab === 'pending-publications') {
      content = pendingPublications.map((pub) => ({
        id: pub.id,
        title: pub.title,
        type: 'publication' as const,
        creatorName: pub.creator.name || pub.creator.email,
        categoryName: pub.category.name,
        submittedDate: pub.createdAt,
        status: 'review' as const,
        rejectionReason: null,
      }))
    } else {
      const allCoursesData = allCourses.map((course) => ({
        id: course.id,
        title: course.title,
        type: 'course' as const,
        creatorName: course.creator?.name || course.creator?.email || 'Unknown',
        categoryName: course.category.name,
        submittedDate: course.submittedAt || course.createdAt,
        status: course.rejectedAt
          ? ('rejected' as const)
          : course.published
          ? ('published' as const)
          : course.isDraft
          ? ('draft' as const)
          : ('review' as const),
        rejectionReason: course.rejectionReason,
      }))

      const allPublicationsData = allPublications.map((pub) => ({
        id: pub.id,
        title: pub.title,
        type: 'publication' as const,
        creatorName: pub.creator.name || pub.creator.email,
        categoryName: pub.category.name,
        submittedDate: pub.createdAt,
        status: pub.published ? ('published' as const) : ('review' as const),
        rejectionReason: null,
      }))

      content = [...allCoursesData, ...allPublicationsData]
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      content = content.filter((item) => item.categoryName === selectedCategory)
    }

    // Sort
    content.sort((a, b) => {
      const dateA = new Date(a.submittedDate).getTime()
      const dateB = new Date(b.submittedDate).getTime()
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })

    return content
  }

  const filteredContent = getFilteredAndSortedContent()

  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending-courses')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending-courses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Courses
            <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {pendingCourses.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('pending-publications')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending-publications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Publications
            <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {pendingPublications.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('all-content')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all-content'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Content
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort by
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Creator
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Submitted
              </th>
              {activeTab === 'all-content' && (
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              )}
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredContent.length === 0 ? (
              <tr>
                <td
                  colSpan={activeTab === 'all-content' ? 7 : 6}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  No content found
                </td>
              </tr>
            ) : (
              filteredContent.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.creatorName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.type === 'course' ? 'Course' : 'Publication'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.categoryName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.submittedDate).toLocaleDateString()}
                  </td>
                  {activeTab === 'all-content' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ContentStatusBadge
                        status={item.status}
                        rejectionReason={item.rejectionReason}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/content/${item.type === 'course' ? 'courses' : 'publications'}/${item.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Review
                    </Link>
                    {item.status === 'review' && (
                      <>
                        <button
                          onClick={() => handleQuickApprove(item.id, item.type, item.title)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleQuickReject(item.id, item.type, item.title)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedContent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Approval</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to approve &quot;{selectedContent.title}&quot;? This will publish the
              content and notify the creator.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowApproveModal(false)
                  setSelectedContent(null)
                }}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedContent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Content</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for rejecting &quot;{selectedContent.title}&quot;:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedContent(null)
                  setRejectionReason('')
                }}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={isLoading || !rejectionReason.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
