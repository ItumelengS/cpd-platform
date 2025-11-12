"use client"

import { useState } from "react"
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
  order: number
}

type FinalQuizClientProps = {
  courseId: string
  courseSlug: string
  courseTitle: string
  questions: Question[]
  attemptNumber: number
  maxAttempts: number
}

export default function FinalQuizClient({
  courseId,
  courseSlug,
  courseTitle,
  questions,
  attemptNumber,
  maxAttempts,
}: FinalQuizClientProps) {
  const router = useRouter()
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<{
    score: number
    passed: boolean
    correctAnswers: number
    totalQuestions: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmitQuiz = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/quiz/submit-final", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to submit quiz")
        setLoading(false)
        return
      }

      setResults(data)
      setShowResults(true)
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCertificate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to generate certificate")
        setLoading(false)
        return
      }

      // Redirect to certificates page
      router.push("/dashboard/certificates")
    } catch (err) {
      setError("Network error. Please try again.")
      setLoading(false)
    }
  }

  if (showResults && results) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
          {/* Results */}
          <div className={`text-6xl mb-4 ${results.passed ? "text-green-600" : "text-red-600"}`}>
            {results.passed ? "🎉" : "📝"}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {results.passed ? "Congratulations!" : "Quiz Complete"}
          </h2>

          <div className="text-5xl font-bold text-gray-900 mb-2">
            {results.score.toFixed(0)}%
          </div>

          <p className="text-gray-600 mb-6">
            You answered {results.correctAnswers} out of {results.totalQuestions} questions correctly
          </p>

          {results.passed ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <p className="text-green-800 font-semibold mb-2">✓ You passed!</p>
              <p className="text-green-700 text-sm">
                You've successfully completed this course. Generate your certificate to earn your CPD credits.
              </p>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
              <p className="text-orange-800 font-semibold mb-2">
                Score below 70% required
              </p>
              <p className="text-orange-700 text-sm">
                {attemptNumber + 1 < maxAttempts
                  ? `You have ${maxAttempts - (attemptNumber + 1)} attempt(s) remaining. Review the material and try again.`
                  : "Maximum attempts reached. Please contact support for assistance."}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {results.passed ? (
              <button
                onClick={handleGenerateCertificate}
                disabled={loading}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300 transition"
              >
                {loading ? "Generating..." : "Generate Certificate 🎓"}
              </button>
            ) : attemptNumber + 1 < maxAttempts ? (
              <button
                onClick={() => router.refresh()}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            ) : null}

            <Link
              href="/dashboard"
              className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Final Quiz Instructions</h2>
        <ul className="text-gray-700 space-y-2 text-sm">
          <li>• Answer all {questions.length} questions to complete the quiz</li>
          <li>• You need 70% or higher to pass and earn your certificate</li>
          <li>• You have {maxAttempts} attempts total</li>
          <li>• This is attempt {attemptNumber + 1} of {maxAttempts}</li>
          <li>• Take your time and review your answers before submitting</li>
        </ul>
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-8">
        {questions.map((question, index) => (
          <div key={question.id}>
            <div className="text-sm text-gray-600 mb-2 font-semibold">
              Question {index + 1} of {questions.length}
            </div>
            <QuizQuestion
              questionId={question.id}
              questionText={question.questionText}
              context={question.context}
              optionA={question.optionA}
              optionB={question.optionB}
              optionC={question.optionC}
              optionD={question.optionD}
            />
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="bg-white rounded-lg p-6 shadow-lg sticky bottom-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-gray-600">
            <p className="text-sm">Make sure you've answered all questions</p>
            <p className="text-sm font-semibold mt-1">
              Attempt {attemptNumber + 1} of {maxAttempts}
            </p>
          </div>

          <button
            onClick={handleSubmitQuiz}
            disabled={loading}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition"
          >
            {loading ? "Submitting..." : "Submit Final Quiz"}
          </button>
        </div>
      </div>
    </div>
  )
}
