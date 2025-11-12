"use client"

import { useState } from "react"

type QuizQuestionProps = {
  questionId: string
  questionText: string
  context?: string | null
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  // SECURITY: correctAnswer is NOT included in props - it stays on the server
}

export default function QuizQuestion({
  questionId,
  questionText,
  context,
  optionA,
  optionB,
  optionC,
  optionD,
}: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startTime] = useState(Date.now())

  const options = [
    { value: "A", text: optionA },
    { value: "B", text: optionB },
    { value: "C", text: optionC },
    { value: "D", text: optionD },
  ]

  const handleSubmit = async () => {
    if (!selectedAnswer) return

    setLoading(true)
    setError(null)

    const timeSpent = Date.now() - startTime

    try {
      const response = await fetch("/api/quiz/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          answer: selectedAnswer,
          timeSpent,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "An error occurred")
        setLoading(false)
        return
      }

      setIsSubmitted(true)
      setIsCorrect(data.isCorrect)
      setExplanation(data.explanation || null)
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      {/* Context (if provided) */}
      {context && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{context}</p>
        </div>
      )}

      {/* Question */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{questionText}</h3>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => !isSubmitted && setSelectedAnswer(option.value)}
            disabled={isSubmitted || loading}
            className={`w-full text-left p-4 rounded-lg border-2 transition ${
              selectedAnswer === option.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            } ${
              isSubmitted ? "cursor-not-allowed opacity-75" : "cursor-pointer"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold ${
                  selectedAnswer === option.value
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 text-gray-600"
                }`}
              >
                {option.value}
              </div>
              <span className="text-gray-700">{option.text}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Feedback */}
      {isSubmitted && isCorrect !== null && (
        <div
          className={`rounded-lg p-4 mb-4 ${
            isCorrect
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold mb-2">
            {isCorrect ? (
              <>
                <span className="text-2xl">✓</span>
                <span>Correct!</span>
              </>
            ) : (
              <>
                <span className="text-2xl">✗</span>
                <span>Incorrect</span>
              </>
            )}
          </div>
          {explanation && (
            <p className="text-sm mt-2">{explanation}</p>
          )}
        </div>
      )}

      {/* Submit Button */}
      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer || loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
        >
          {loading ? "Checking..." : "Submit Answer"}
        </button>
      )}
    </div>
  )
}
