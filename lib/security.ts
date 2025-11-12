/**
 * Security utility functions for the CPD platform
 */

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Simple in-memory rate limiter
 * @param key - Unique identifier (e.g., userId:endpoint)
 * @param limit - Maximum number of requests
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limit exceeded
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) {
        rateLimitStore.delete(k)
      }
    }
  }

  if (!record || now > record.resetTime) {
    // Create new record
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return false
  }

  // Increment count
  record.count++

  if (record.count > limit) {
    return true // Rate limit exceeded
  }

  return false
}

/**
 * Detect suspicious quiz activity patterns
 * @param attempts - Array of quiz attempts
 * @returns Object with flags for different suspicious patterns
 */
export function detectSuspiciousActivity(attempts: {
  isCorrect: boolean
  timeSpent: number | null
  createdAt: Date
}[]) {
  if (attempts.length === 0) {
    return { isSuspicious: false, reasons: [] }
  }

  const reasons: string[] = []

  // Check accuracy
  const correctCount = attempts.filter((a) => a.isCorrect).length
  const accuracy = correctCount / attempts.length

  // 100% accuracy on many attempts is suspicious
  if (attempts.length >= 20 && accuracy === 1.0) {
    reasons.push("Suspiciously high accuracy (100% on 20+ attempts)")
  }

  // Check timing
  const validTimes = attempts.filter((a) => a.timeSpent !== null)
  if (validTimes.length > 0) {
    const avgTime = validTimes.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / validTimes.length

    // Less than 1 second per question on average
    if (avgTime < 1000) {
      reasons.push(`Suspiciously fast responses (avg ${(avgTime / 1000).toFixed(2)}s per question)`)
    }
  }

  // Check velocity (many attempts in short time)
  const recentAttempts = attempts.filter((a) => {
    const ageMs = Date.now() - new Date(a.createdAt).getTime()
    return ageMs < 300000 // Last 5 minutes
  })

  if (recentAttempts.length > 20) {
    reasons.push(`High velocity (${recentAttempts.length} attempts in 5 minutes)`)
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  }
}

/**
 * Sanitize user input to prevent XSS
 * (Note: React already escapes content, but this is for extra safety)
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check password strength
 * @param password - Password string
 * @returns Object with strength info
 */
export function checkPasswordStrength(password: string): {
  isStrong: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push("Password should be at least 8 characters")
  }

  if (password.length >= 12) {
    score += 1
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push("Include both uppercase and lowercase letters")
  }

  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push("Include at least one number")
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push("Include at least one special character")
  }

  return {
    isStrong: score >= 4,
    score,
    feedback,
  }
}

/**
 * Generate secure random token
 * @param length - Length of token
 * @returns Random token string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let token = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    token += chars[randomIndex]
  }
  return token
}

/**
 * Log security event (in production, send to monitoring service)
 * @param event - Event name
 * @param details - Event details
 */
export function logSecurityEvent(event: string, details: Record<string, any>) {
  const timestamp = new Date().toISOString()
  console.warn(`[SECURITY] ${timestamp} - ${event}`, details)

  // In production, send to monitoring service:
  // - Sentry
  // - DataDog
  // - CloudWatch
  // - Custom logging endpoint
}

/**
 * Validate that a user has permission to access a resource
 * @param userId - User ID
 * @param resourceUserId - Resource owner ID
 * @param userRole - User role
 * @returns true if user has access
 */
export function hasResourceAccess(
  userId: string,
  resourceUserId: string,
  userRole?: string
): boolean {
  // Admin has access to everything
  if (userRole === "ADMIN") {
    return true
  }

  // User has access to their own resources
  return userId === resourceUserId
}

/**
 * Clean rate limit cache (run periodically)
 */
export function cleanRateLimitCache() {
  const now = Date.now()
  let cleaned = 0

  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
      cleaned++
    }
  }

  if (cleaned > 0) {
    console.log(`Cleaned ${cleaned} expired rate limit entries`)
  }
}

// Clean cache every 10 minutes
if (typeof window === "undefined") {
  // Server-side only
  setInterval(cleanRateLimitCache, 600000)
}
