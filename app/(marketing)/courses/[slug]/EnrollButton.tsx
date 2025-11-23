"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { enrollInCourse } from "@/lib/actions/courses"

export default function EnrollButton({
  courseId,
  coursePrice,
  isLoggedIn,
}: {
  courseId: string
  coursePrice: number
  isLoggedIn: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Check if Stripe is configured
  const isStripeConfigured = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('placeholder')

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    setLoading(true)
    setError("")

    // If course is paid but Stripe not configured
    if (coursePrice > 0 && !isStripeConfigured) {
      setError("Payment processing is not yet available. This course will be available for purchase when we launch!")
      setLoading(false)
      return
    }

    // If course is paid, redirect to Stripe checkout
    if (coursePrice > 0) {
      try {
        const response = await fetch(`/api/courses/${courseId}/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL returned');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start checkout');
        setLoading(false);
      }
    } else {
      // Free course - enroll directly
      const result = await enrollInCourse(courseId)

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        router.refresh()
      }
    }
  }

  const isPaidCourse = coursePrice > 0
  const canPurchase = isPaidCourse ? isStripeConfigured : true

  return (
    <div>
      {isPaidCourse && !isStripeConfigured && (
        <div className="mb-2 text-center">
          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
            Coming Soon
          </span>
        </div>
      )}
      <button
        onClick={handleEnroll}
        disabled={loading || (isPaidCourse && !canPurchase)}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
      >
        {loading
          ? (coursePrice > 0 ? "Loading..." : "Enrolling...")
          : (coursePrice > 0
              ? (isStripeConfigured ? `Purchase for R${coursePrice}` : 'Notify Me When Available')
              : "Enroll Free"
            )
        }
      </button>
      {error && (
        <p className="text-sm mt-2 text-center text-yellow-700">{error}</p>
      )}
    </div>
  )
}
