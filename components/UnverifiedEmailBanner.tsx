"use client"

import { useState } from "react"

interface UnverifiedEmailBannerProps {
  email: string
}

export default function UnverifiedEmailBanner({ email }: UnverifiedEmailBannerProps) {
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState("")
  const [dismissed, setDismissed] = useState(false)

  const handleResendEmail = async () => {
    setResending(true)
    setMessage("")

    try {
      const response = await fetch(`/api/auth/verify-email?email=${encodeURIComponent(email)}`, {
        method: "GET",
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Verification email sent! Please check your inbox.")
      } else {
        setMessage(data.error || "Failed to resend verification email")
      }
    } catch (error) {
      setMessage("Failed to resend verification email. Please try again.")
    } finally {
      setResending(false)
    }
  }

  if (dismissed) {
    return null
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">
            <strong className="font-medium">Email not verified.</strong> Please check your inbox
            for the verification link to access all platform features.
          </p>
          {message && (
            <p className="text-sm text-yellow-700 mt-2">{message}</p>
          )}
          <div className="mt-3 flex gap-3">
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="text-sm font-medium text-yellow-700 underline hover:text-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? "Sending..." : "Resend verification email"}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-sm font-medium text-yellow-700 hover:text-yellow-600"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
