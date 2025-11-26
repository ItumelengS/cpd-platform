"use client"

import { useState } from "react"
import Link from "next/link"

interface Certificate {
  id: string
  issuedAt: Date
  course: {
    title: string
    cpdHours: number
    category: {
      name: string
      icon: string | null
    }
  }
}

interface CourseInProgress {
  id: string
  title: string
  slug: string
  cpdHours: number
  progressPercentage: number
  enrolledAt: Date
  category: {
    name: string
    icon: string | null
  }
}

interface RecommendedCourse {
  id: string
  title: string
  slug: string
  cpdHours: number
  price: number
  category: {
    name: string
    icon: string | null
  }
  creator: {
    name: string
  }
}

interface CPDTrackerDashboardProps {
  totalHours: number
  clinicalHours: number
  ethicsHours: number
  annualTarget: number
  minClinicalTarget: number
  minEthicsTarget: number
  profession: string
  hoursByCategory: Record<string, number>
  certificates: Certificate[]
  expiringCertificates: Certificate[]
  expiredCertificates: Certificate[]
  coursesInProgress: CourseInProgress[]
  recommendedCourses: RecommendedCourse[]
  currentYear: number
  isExempt: boolean
  exemptReason: string | null
}

export default function CPDTrackerDashboard({
  totalHours,
  clinicalHours,
  ethicsHours,
  annualTarget,
  minClinicalTarget,
  minEthicsTarget,
  profession,
  hoursByCategory,
  certificates,
  expiringCertificates,
  expiredCertificates,
  coursesInProgress,
  recommendedCourses,
  currentYear,
  isExempt,
  exemptReason,
}: CPDTrackerDashboardProps) {
  const [showAllCertificates, setShowAllCertificates] = useState(false)

  const progressPercentage = Math.min(Math.round((totalHours / annualTarget) * 100), 100)
  const remainingHours = Math.max(annualTarget - totalHours, 0)

  // Calculate clinical and ethics progress
  const clinicalProgressPercentage = Math.min(Math.round((clinicalHours / minClinicalTarget) * 100), 100)
  const ethicsProgressPercentage = Math.min(Math.round((ethicsHours / minEthicsTarget) * 100), 100)

  const remainingClinicalHours = Math.max(minClinicalTarget - clinicalHours, 0)
  const remainingEthicsHours = Math.max(minEthicsTarget - ethicsHours, 0)

  const categoryColors: Record<string, string> = {
    "Medical Imaging": "bg-blue-500",
    "Radiology": "bg-purple-500",
    "Clinical Practice": "bg-green-500",
    "Patient Safety": "bg-red-500",
    "Technology": "bg-indigo-500",
    "Research": "bg-yellow-500",
  }

  const exportCPDReport = () => {
    // Create CSV content
    const csvContent = [
      ['CPD Report', `Year: ${currentYear}`],
      [],
      ['Summary'],
      ['Total CPD Hours Earned', totalHours],
      ['Annual Target', annualTarget],
      ['Remaining Hours', remainingHours],
      ['Progress', `${progressPercentage}%`],
      [],
      ['Hours by Category'],
      ['Category', 'Hours'],
      ...Object.entries(hoursByCategory).map(([category, hours]) => [category, hours]),
      [],
      ['Certificates Earned'],
      ['Date', 'Course', 'Category', 'CPD Hours'],
      ...certificates.map((cert) => [
        new Date(cert.issuedAt).toLocaleDateString(),
        cert.course.title,
        cert.course.category.name,
        cert.course.cpdHours,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cpd-report-${currentYear}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CPD Tracker</h1>
          <p className="text-gray-600 mt-1">
            {profession} - Track your {currentYear} CPD requirements (HPCSA Dec 2024 Guidelines)
          </p>
        </div>
        <button
          onClick={exportCPDReport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Report
        </button>
      </div>

      {/* Exemption Notice */}
      {isExempt && exemptReason && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800">
                CPD Exemption: {exemptReason}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                You are currently exempt from CPD requirements as per HPCSA guidelines.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CEU Expiry Warnings */}
      {!isExempt && expiringCertificates.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                {expiringCertificates.length} CEU{expiringCertificates.length !== 1 ? 's' : ''} expiring within 30 days
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                CEUs are valid for 12 months from completion date (HPCSA Dec 2024). Complete more courses to maintain your hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isExempt && expiredCertificates.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">
                {expiredCertificates.length} CEU{expiredCertificates.length !== 1 ? 's have' : ' has'} expired
              </p>
              <p className="text-xs text-red-700 mt-1">
                These CEUs are no longer valid and don't count toward your annual requirement. Complete new courses to replace them.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Hours */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total CEUs</h3>
            <span className="text-3xl">📊</span>
          </div>
          <div className="text-4xl font-bold text-gray-900">{totalHours}</div>
          <p className="text-sm text-gray-500 mt-1">of {annualTarget} required</p>
        </div>

        {/* Clinical CEUs */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Clinical CEUs</h3>
            <span className="text-3xl">🏥</span>
          </div>
          <div className="text-4xl font-bold text-blue-600">{clinicalHours}</div>
          <p className="text-sm text-gray-500 mt-1">
            of {minClinicalTarget} required{" "}
            {clinicalHours >= minClinicalTarget ? "✓" : `(${remainingClinicalHours} needed)`}
          </p>
        </div>

        {/* Ethics CEUs */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Ethics/HR/Law CEUs</h3>
            <span className="text-3xl">⚖️</span>
          </div>
          <div className="text-4xl font-bold text-purple-600">{ethicsHours}</div>
          <p className="text-sm text-gray-500 mt-1">
            of {minEthicsTarget} required{" "}
            {ethicsHours >= minEthicsTarget ? "✓" : `(${remainingEthicsHours} needed)`}
          </p>
        </div>

        {/* Remaining */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Remaining CEUs</h3>
            <span className="text-3xl">{remainingHours === 0 ? "✅" : "⏱️"}</span>
          </div>
          <div className="text-4xl font-bold text-gray-900">{remainingHours}</div>
          <p className="text-sm text-gray-500 mt-1">
            {remainingHours === 0 ? "Target achieved!" : "To reach your goal"}
          </p>
        </div>
      </div>

      {/* Clinical vs Ethics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clinical Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Clinical CEUs Progress</h3>
            <span className="text-2xl font-bold text-blue-600">{clinicalProgressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                clinicalProgressPercentage >= 100 ? "bg-green-500" : "bg-blue-600"
              }`}
              style={{ width: `${clinicalProgressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {clinicalProgressPercentage >= 100
              ? "Clinical CEU requirement met!"
              : `${remainingClinicalHours} clinical CEUs remaining`}
          </p>
        </div>

        {/* Ethics Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ethics/HR/Law CEUs Progress</h3>
            <span className="text-2xl font-bold text-purple-600">{ethicsProgressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                ethicsProgressPercentage >= 100 ? "bg-green-500" : "bg-purple-600"
              }`}
              style={{ width: `${ethicsProgressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {ethicsProgressPercentage >= 100
              ? "Ethics CEU requirement met!"
              : `${remainingEthicsHours} ethics CEUs remaining`}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Annual Progress</h3>
          <span className="text-2xl font-bold text-blue-600">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              progressPercentage >= 100 ? "bg-green-500" : "bg-blue-600"
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {progressPercentage >= 100
            ? "Congratulations! You've met your annual CPD requirement!"
            : `${remainingHours} hours remaining to meet your annual requirement`}
        </p>
      </div>

      {/* Hours by Category */}
      {Object.keys(hoursByCategory).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Hours by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(hoursByCategory).map(([category, hours]) => (
              <div key={category} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className={`w-12 h-12 ${categoryColors[category] || "bg-gray-500"} rounded-lg flex items-center justify-center text-white text-xl font-bold`}>
                  {hours}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{category}</div>
                  <div className="text-sm text-gray-600">{hours} hour{hours !== 1 ? 's' : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courses in Progress */}
      {coursesInProgress.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Courses in Progress</h3>
          <div className="space-y-4">
            {coursesInProgress.map((course) => (
              <Link
                key={course.id}
                href={`/learn/${course.slug}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{course.category.icon || "📚"}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{course.title}</h4>
                      <p className="text-sm text-gray-600">{course.category.name} • {course.cpdHours} CPD Hours</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-blue-600">{course.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-blue-600 rounded-full transition-all"
                    style={{ width: `${course.progressPercentage}%` }}
                  ></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Certificates Earned */}
      {certificates.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Certificates Earned ({certificates.length})</h3>
            {certificates.length > 5 && (
              <button
                onClick={() => setShowAllCertificates(!showAllCertificates)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showAllCertificates ? "Show Less" : "Show All"}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {(showAllCertificates ? certificates : certificates.slice(0, 5)).map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cert.course.category.icon || "🎓"}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{cert.course.title}</h4>
                    <p className="text-sm text-gray-600">{cert.course.category.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">{cert.course.cpdHours} hrs</div>
                  <div className="text-sm text-gray-500">
                    {new Date(cert.issuedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Courses */}
      {remainingHours > 0 && recommendedCourses.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Recommended Courses to Complete Your CPD
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedCourses.slice(0, 6).map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{course.category.icon || "📚"}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">{course.title}</h4>
                    <p className="text-sm text-gray-600">{course.creator.name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600 font-medium">{course.cpdHours} CPD Hours</span>
                  <span className="text-sm font-bold text-gray-900">
                    {course.price === 0 ? "Free" : `R${course.price}`}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {certificates.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your CPD Journey</h3>
          <p className="text-gray-600 mb-6">
            You haven't earned any CPD certificates yet. Browse our courses to get started!
          </p>
          <Link
            href="/courses"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  )
}
