"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import QuizQuestion from "@/components/QuizQuestion"

type Question = {
  id: string
  questionText: string
  context: string | null
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  // SECURITY: correctAnswer is NOT included here
}

type SectionContentProps = {
  section: {
    id: string
    title: string
    content: string
    minTimeSeconds: number
  }
  questions: Question[]
  nextSectionId?: string
  courseSlug: string
  isCompleted: boolean
}

export default function SectionContent({
  section,
  questions,
  nextSectionId,
  courseSlug,
  isCompleted: initialCompleted,
}: SectionContentProps) {
  const router = useRouter()
  const [startTime] = useState(Date.now())
  const [timeSpent, setTimeSpent] = useState(0)
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [canProceed, setCanProceed] = useState(initialCompleted)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update time spent every second
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setTimeSpent(elapsed)

      // Check if minimum time requirement is met
      if (elapsed >= section.minTimeSeconds && !canProceed) {
        setCanProceed(true)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, section.minTimeSeconds, canProceed])

  const handleComplete = async () => {
    if (timeSpent < section.minTimeSeconds) {
      const remaining = section.minTimeSeconds - timeSpent
      setError(`Please spend at least ${remaining} more seconds reviewing this content.`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: section.id,
          timeSpent,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to update progress")
        setLoading(false)
        return
      }

      setIsCompleted(true)

      // Redirect to next section or dashboard
      if (nextSectionId) {
        router.push(`/learn/${courseSlug}/${nextSectionId}`)
      } else {
        router.push("/dashboard")
      }
      router.refresh()
    } catch (err) {
      setError("Network error. Please try again.")
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const remainingTime = Math.max(0, section.minTimeSeconds - timeSpent)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Content */}
      <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">{section.title}</h2>
        <div className="prose prose-blue max-w-none">
          <div className="text-gray-700 whitespace-pre-wrap">{section.content}</div>
        </div>
      </div>

      {/* Quiz Questions */}
      {questions.length > 0 && (
        <div className="space-y-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-900">Knowledge Check</h3>
          {questions.map((question) => (
            <QuizQuestion
              key={question.id}
              questionId={question.id}
              questionText={question.questionText}
              context={question.context}
              optionA={question.optionA}
              optionB={question.optionB}
              optionC={question.optionC}
              optionD={question.optionD}
            />
          ))}
        </div>
      )}

      {/* Timer & Navigation */}
      <div className="bg-white rounded-lg p-6 shadow-sm sticky bottom-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Time Spent</div>
            <div className="text-2xl font-bold text-gray-900">{formatTime(timeSpent)}</div>
            {!canProceed && (
              <div className="text-sm text-orange-600 mt-1">
                Minimum time remaining: {formatTime(remainingTime)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isCompleted ? (
              <div className="text-green-600 font-semibold flex items-center gap-2">
                <span>✓</span>
                <span>Section Completed</span>
              </div>
            ) : null}

            {nextSectionId ? (
              <button
                onClick={handleComplete}
                disabled={!canProceed || loading || isCompleted}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
              >
                {loading ? "Saving..." : isCompleted ? "Next Section →" : "Complete & Continue →"}
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed || loading || isCompleted}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition"
              >
                {loading ? "Saving..." : "Complete Section ✓"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
