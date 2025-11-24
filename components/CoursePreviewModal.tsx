"use client"

import { useEffect, useState } from "react"
import LoadingSpinner from "./LoadingSpinner"

interface PreviewSection {
  id: string
  title: string
  content: string
  contentType: string
  videoUrl: string | null
  pdfUrl: string | null
  duration: number | null
}

interface CoursePreview {
  course: {
    id: string
    title: string
    description: string
    category: {
      name: string
      icon: string | null
    }
    creator: {
      name: string
      avatar: string | null
      specialty: string | null
    }
    cpdHours: number
    difficulty: string
    price: number
  }
  previewSection: PreviewSection | null
  hasPreview: boolean
}

interface CoursePreviewModalProps {
  courseId: string
  isOpen: boolean
  onClose: () => void
}

export default function CoursePreviewModal({
  courseId,
  isOpen,
  onClose,
}: CoursePreviewModalProps) {
  const [preview, setPreview] = useState<CoursePreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen && courseId) {
      fetchPreview()
    }
  }, [isOpen, courseId])

  const fetchPreview = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/courses/${courseId}/preview`)

      if (!response.ok) {
        throw new Error("Failed to load preview")
      }

      const data = await response.json()
      setPreview(data)

      if (!data.hasPreview) {
        setError("No preview available for this course")
      }
    } catch (err) {
      setError("Failed to load course preview")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const previewSection = preview?.previewSection

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Course Preview</h2>
            {preview && (
              <p className="text-sm text-gray-600 mt-1">{preview.course.title}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Loading preview..." />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : preview && preview.hasPreview && previewSection ? (
            <div className="space-y-6">
              {/* Section Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Free Preview</span>
                </div>
                <p className="text-sm text-blue-600">
                  {previewSection.title}
                </p>
              </div>

              {/* Section Content */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{previewSection.title}</h3>

                {/* Video Content */}
                {previewSection.contentType === "video" && previewSection.videoUrl && (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <video
                      src={previewSection.videoUrl}
                      controls
                      className="w-full h-full"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {/* Text Content */}
                {previewSection.contentType === "text" && previewSection.content && (
                  <div
                    className="prose max-w-none bg-gray-50 rounded-lg p-6"
                    dangerouslySetInnerHTML={{ __html: previewSection.content }}
                  />
                )}

                {/* PDF Content */}
                {previewSection.contentType === "pdf" && previewSection.pdfUrl && (
                  <div className="bg-gray-100 rounded-lg p-6 text-center">
                    <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-gray-700 mb-4">PDF Content Available</p>
                    <p className="text-sm text-gray-600">Enroll to access the full PDF material</p>
                  </div>
                )}

                {/* Duration */}
                {previewSection.duration && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{Math.round(previewSection.duration / 60)} minutes</span>
                  </div>
                )}
              </div>

              {/* Unlock Full Course CTA */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
                <h4 className="text-xl font-bold mb-2">Enjoying the preview?</h4>
                <p className="mb-4">
                  Enroll now to access all {preview.course.cpdHours} CPD hours of content
                  and earn your certificate.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  {preview.course.price === 0 ? "Enroll Free" : `Enroll for R${preview.course.price}`}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📚</div>
              <p className="text-gray-600">No preview available for this course</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
