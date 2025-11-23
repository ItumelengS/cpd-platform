"use client"

import { useState } from "react"
import Link from "next/link"
import EnrollButton from "@/app/(marketing)/courses/[slug]/EnrollButton"
import CoursePreviewModal from "./CoursePreviewModal"

interface EnrollmentCardProps {
  courseId: string
  courseSlug: string
  coursePrice: number
  cpdHours: number
  firstSectionId: string | undefined
  enrolled: boolean
  isLoggedIn: boolean
}

export default function EnrollmentCard({
  courseId,
  courseSlug,
  coursePrice,
  cpdHours,
  firstSectionId,
  enrolled,
  isLoggedIn,
}: EnrollmentCardProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-lg sticky top-6">
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {coursePrice === 0 ? "Free" : `R${coursePrice}`}
          </div>
          <p className="text-gray-600">Lifetime access</p>
        </div>

        {enrolled ? (
          <Link
            href={`/learn/${courseSlug}/${firstSectionId || ""}`}
            className="block w-full bg-green-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition mb-4"
          >
            Continue Learning →
          </Link>
        ) : (
          <>
            <EnrollButton
              courseId={courseId}
              coursePrice={coursePrice}
              isLoggedIn={isLoggedIn}
            />

            {/* Preview Button */}
            <button
              onClick={() => setShowPreview(true)}
              className="w-full mt-3 bg-white border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Preview Course
            </button>
          </>
        )}

        <div className="space-y-3 mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3 text-gray-700">
            <span>✓</span>
            <span>{cpdHours} CPD credit hours</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <span>✓</span>
            <span>Certificate of completion</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <span>✓</span>
            <span>Lifetime access</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <span>✓</span>
            <span>Mobile & desktop access</span>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <CoursePreviewModal
        courseId={courseId}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  )
}
