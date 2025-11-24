import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for rate limiting
// For production, consider using Redis or Upstash
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed within the window
   */
  max: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Custom identifier function (default: uses IP address)
   */
  keyGenerator?: (request: NextRequest) => string;
}

/**
 * Rate limiter middleware
 *
 * @example
 * ```ts
 * const rateLimiter = rateLimit({ max: 5, windowSeconds: 60 });
 * const result = await rateLimiter(request);
 *
 * if (!result.success) {
 *   return NextResponse.json(
 *     { error: 'Too many requests' },
 *     { status: 429, headers: result.headers }
 *   );
 * }
 * ```
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
    headers: Record<string, string>;
  }> => {
    // Generate unique key for this request
    const key = config.keyGenerator
      ? config.keyGenerator(request)
      : getClientIdentifier(request);

    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;

    // Get or create rate limit entry
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Increment request count
    store[key].count++;

    const limit = config.max;
    const remaining = Math.max(0, limit - store[key].count);
    const reset = Math.ceil(store[key].resetTime / 1000);

    // Prepare headers
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    };

    // Check if limit exceeded
    if (store[key].count > limit) {
      headers['Retry-After'] = Math.ceil((store[key].resetTime - now) / 1000).toString();

      return {
        success: false,
        limit,
        remaining: 0,
        reset,
        headers,
      };
    }

    return {
      success: true,
      limit,
      remaining,
      reset,
      headers,
    };
  };
}

/**
 * Get client identifier from request
 * Uses IP address, falling back to other identifiers
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip =
    cfConnectingIp ||
    forwarded?.split(',')[0].trim() ||
    realIp ||
    'unknown';

  return `ip:${ip}`;
}

/**
 * Get client identifier by user ID (for authenticated endpoints)
 */
export function getUserIdentifier(userId: string): string {
  return `user:${userId}`;
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  /**
   * For authentication endpoints (login, signup)
   * 5 requests per minute
   */
  auth: {
    max: 5,
    windowSeconds: 60,
  },

  /**
   * For password reset endpoints
   * 3 requests per hour
   */
  passwordReset: {
    max: 3,
    windowSeconds: 3600,
  },

  /**
   * For email verification resend
   * 3 requests per hour
   */
  emailVerification: {
    max: 3,
    windowSeconds: 3600,
  },

  /**
   * For payment/checkout endpoints
   * 10 requests per minute
   */
  payment: {
    max: 10,
    windowSeconds: 60,
  },

  /**
   * For course enrollment
   * 20 requests per minute
   */
  enrollment: {
    max: 20,
    windowSeconds: 60,
  },

  /**
   * For file uploads
   * 10 requests per minute
   */
  upload: {
    max: 10,
    windowSeconds: 60,
  },

  /**
   * For API endpoints (general)
   * 100 requests per minute
   */
  api: {
    max: 100,
    windowSeconds: 60,
  },

  /**
   * Strict rate limit for sensitive operations
   * 3 requests per 5 minutes
   */
  strict: {
    max: 3,
    windowSeconds: 300,
  },
} as const;
