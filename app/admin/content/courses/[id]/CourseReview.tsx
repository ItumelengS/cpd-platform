'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CourseReviewProps {
  courseId: string
  courseTitle: string
  isPublished: boolean
  isDraft: boolean
}

export default function CourseReview({
  courseId,
  courseTitle,
  isPublished,
  isDraft,
}: CourseReviewProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [qualityChecks, setQualityChecks] = useState({
    accurate: false,
    noPlagiarism: false,
    grammar: false,
    quizzesValid: false,
    cpdHoursAppropriate: false,
  })

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/content/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId: courseId,
          contentType: 'course',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to approve course')
      }

      alert('Course approved successfully!')
      router.push('/admin/content')
      router.refresh()
    } catch (error) {
      console.error('Error approving course:', error)
      alert(error instanceof Error ? error.message : 'Failed to approve course')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
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
          contentId: courseId,
          contentType: 'course',
          reason: rejectionReason,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reject course')
      }

      alert('Course rejected. Creator has been notified.')
      router.push('/admin/content')
      router.refresh()
    } catch (error) {
      console.error('Error rejecting course:', error)
      alert(error instanceof Error ? error.message : 'Failed to reject course')
    } finally {
      setIsLoading(false)
      setShowRejectModal(false)
      setRejectionReason('')
    }
  }

  const allChecksCompleted = Object.values(qualityChecks).every((check) => check)

  return (
    <>
      {/* Quality Checklist */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quality Checklist</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={qualityChecks.accurate}
              onChange={(e) =>
                setQualityChecks({ ...qualityChecks, accurate: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">Content is accurate and factual</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={qualityChecks.noPlagiarism}
              onChange={(e) =>
                setQualityChecks({ ...qualityChecks, noPlagiarism: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">No plagiarism detected</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={qualityChecks.grammar}
              onChange={(e) =>
                setQualityChecks({ ...qualityChecks, grammar: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">
              Proper grammar and spelling throughout
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={qualityChecks.quizzesValid}
              onChange={(e) =>
                setQualityChecks({ ...qualityChecks, quizzesValid: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">
              Quizzes test learning objectives appropriately
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={qualityChecks.cpdHoursAppropriate}
              onChange={(e) =>
                setQualityChecks({ ...qualityChecks, cpdHoursAppropriate: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">
              CPD hours appropriate for content length
            </span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isLoading}
            className="px-6 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </button>
          <button
            onClick={handleApprove}
            disabled={isLoading || !allChecksCompleted || isPublished}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              !allChecksCompleted
                ? 'Please complete all quality checks before approving'
                : isPublished
                ? 'Course is already published'
                : ''
            }
          >
            {isLoading ? 'Processing...' : isPublished ? 'Already Published' : 'Approve & Publish'}
          </button>
        </div>
        {!allChecksCompleted && (
          <p className="text-sm text-amber-600 mt-2 text-right">
            Complete all quality checks to approve
          </p>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Course</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide detailed feedback for &quot;{courseTitle}&quot;. This will be sent to the
              creator.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={5}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              placeholder="Explain what needs to be improved..."
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isLoading || !rejectionReason.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
