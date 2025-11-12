"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { enrollInCourse } from "@/lib/actions/courses"

export default function EnrollButton({
  courseId,
  isLoggedIn,
}: {
  courseId: string
  isLoggedIn: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    setLoading(true)
    setError("")

    const result = await enrollInCourse(courseId)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div>
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
      >
        {loading ? "Enrolling..." : "Enroll in Course"}
      </button>
      {error && (
        <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
