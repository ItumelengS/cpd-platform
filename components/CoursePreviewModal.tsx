"use client"

import { useEffect, useState } from "react"
import LoadingSpinner from "./LoadingSpinner"

interface PreviewLesson {
  id: string
  title: string
  description: string | null
  type: string
  content: string | null
  videoUrl: string | null
  duration: number | null
  order: number
  isPreview: boolean
}

interface PreviewSection {
  id: string
  title: string
  description: string | null
  lessons: PreviewLesson[]
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
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)

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

  const currentLesson = preview?.previewSection?.lessons[currentLessonIndex]

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
          ) : preview && preview.hasPreview && currentLesson ? (
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
                  {preview.previewSection?.title || "Introduction"}
                </p>
              </div>

              {/* Lesson Navigation */}
              {preview.previewSection && preview.previewSection.lessons.length > 1 && (
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                  <button
                    onClick={() => setCurrentLessonIndex((i) => Math.max(0, i - 1))}
                    disabled={currentLessonIndex === 0}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Lesson {currentLessonIndex + 1} of {preview.previewSection.lessons.length}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentLessonIndex((i) =>
                        Math.min(preview.previewSection!.lessons.length - 1, i + 1)
                      )
                    }
                    disabled={currentLessonIndex === preview.previewSection.lessons.length - 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* Lesson Content */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{currentLesson.title}</h3>
                {currentLesson.description && (
                  <p className="text-gray-600 mb-4">{currentLesson.description}</p>
                )}

                {/* Video Content */}
                {currentLesson.type === "VIDEO" && currentLesson.videoUrl && (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <video
                      src={currentLesson.videoUrl}
                      controls
                      className="w-full h-full"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {/* Text Content */}
                {currentLesson.type === "TEXT" && currentLesson.content && (
                  <div
                    className="prose max-w-none bg-gray-50 rounded-lg p-6"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                  />
                )}

                {/* Duration */}
                {currentLesson.duration && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{Math.round(currentLesson.duration / 60)} minutes</span>
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
