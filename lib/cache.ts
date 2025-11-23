/**
 * Caching Configuration and Utilities
 *
 * This module provides centralized caching strategies for the RadSciCPD platform.
 * It uses Next.js 14 App Router caching features including:
 * - fetch() cache and revalidation
 * - unstable_cache for database queries
 * - Route segment config options
 */

import { unstable_cache } from 'next/cache';

/**
 * Cache Tags
 * Used for invalidating specific cached data
 */
export const CACHE_TAGS = {
  courses: 'courses',
  course: (id: string) => `course-${id}`,
  userCourses: (userId: string) => `user-courses-${userId}`,
  creators: 'creators',
  creator: (id: string) => `creator-${id}`,
  certificates: (userId: string) => `certificates-${userId}`,
  subscriptions: (userId: string) => `subscriptions-${userId}`,
  reviews: (courseId: string) => `reviews-${courseId}`,
  categories: 'categories',
  enrollments: (userId: string) => `enrollments-${userId}`,
} as const;

/**
 * Revalidation Times (in seconds)
 */
export const REVALIDATE = {
  /**
   * Static content that rarely changes
   * Examples: Legal pages, terms of service
   */
  STATIC: 60 * 60 * 24 * 7, // 1 week

  /**
   * Courses list and catalog
   * Updates when new courses published
   */
  COURSES: 60 * 60, // 1 hour

  /**
   * Individual course details
   * Updates when course content modified
   */
  COURSE_DETAIL: 60 * 30, // 30 minutes

  /**
   * User-specific data
   * Examples: Dashboard, enrolled courses, progress
   */
  USER_DATA: 60 * 5, // 5 minutes

  /**
   * Dynamic content
   * Examples: Reviews, comments, ratings
   */
  DYNAMIC: 60, // 1 minute

  /**
   * Real-time data (minimal caching)
   * Examples: Live enrollments, recent activity
   */
  REALTIME: 0, // No cache
} as const;

/**
 * Cached Prisma Query Wrapper
 *
 * Wraps database queries with Next.js unstable_cache
 *
 * @example
 * ```ts
 * const getCourses = cachedQuery(
 *   async () => {
 *     return prisma.course.findMany({ where: { published: true } });
 *   },
 *   ['courses-list'],
 *   {
 *     revalidate: REVALIDATE.COURSES,
 *     tags: [CACHE_TAGS.courses],
 *   }
 * );
 * ```
 */
export function cachedQuery<T>(
  queryFn: () => Promise<T>,
  keyParts: string[],
  options?: {
    revalidate?: number | false;
    tags?: string[];
  }
): () => Promise<T> {
  return unstable_cache(queryFn, keyParts, options);
}

/**
 * Helper to get cached courses list
 */
export const getCachedCourses = cachedQuery(
  async () => {
    const { prisma } = await import('@/lib/prisma');
    return prisma.course.findMany({
      where: { published: true },
      include: {
        category: true,
        creator: {
          select: {
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },
  ['courses-published'],
  {
    revalidate: REVALIDATE.COURSES,
    tags: [CACHE_TAGS.courses],
  }
);

/**
 * Helper to get cached categories
 */
export const getCachedCategories = cachedQuery(
  async () => {
    const { prisma } = await import('@/lib/prisma');
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  },
  ['categories-all'],
  {
    revalidate: REVALIDATE.STATIC,
    tags: [CACHE_TAGS.categories],
  }
);

/**
 * Get cached course by slug
 */
export function getCachedCourseBySlug(slug: string) {
  return cachedQuery(
    async () => {
      const { prisma } = await import('@/lib/prisma');
      return prisma.course.findUnique({
        where: { slug },
        include: {
          category: true,
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
              specialty: true,
            },
          },
          sections: {
            orderBy: { order: 'asc' },
            include: {
              lessons: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });
    },
    ['course', slug],
    {
      revalidate: REVALIDATE.COURSE_DETAIL,
      tags: [CACHE_TAGS.course(slug)],
    }
  )();
}

/**
 * Get cached user enrollments
 */
export function getCachedUserEnrollments(userId: string) {
  return cachedQuery(
    async () => {
      const { prisma } = await import('@/lib/prisma');
      return prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              category: true,
              creator: {
                select: {
                  name: true,
                },
              },
            },
          },
          progress: true,
        },
        orderBy: {
          enrolledAt: 'desc',
        },
      });
    },
    ['user-enrollments', userId],
    {
      revalidate: REVALIDATE.USER_DATA,
      tags: [CACHE_TAGS.enrollments(userId)],
    }
  )();
}

/**
 * Route Segment Config Presets
 *
 * Use these in your page.tsx or route.ts files:
 *
 * @example
 * ```ts
 * // app/courses/page.tsx
 * export const revalidate = ROUTE_CONFIG.COURSES.revalidate;
 * export const dynamic = ROUTE_CONFIG.COURSES.dynamic;
 * ```
 */
export const ROUTE_CONFIG = {
  /**
   * Static pages (legal, about, landing)
   */
  STATIC: {
    revalidate: REVALIDATE.STATIC,
    dynamic: 'force-static' as const,
  },

  /**
   * Course catalog and listings
   */
  COURSES: {
    revalidate: REVALIDATE.COURSES,
    dynamic: 'force-static' as const,
  },

  /**
   * Individual course pages
   */
  COURSE_DETAIL: {
    revalidate: REVALIDATE.COURSE_DETAIL,
    dynamic: 'force-static' as const,
  },

  /**
   * User dashboards and profiles
   */
  USER_PAGES: {
    revalidate: REVALIDATE.USER_DATA,
    dynamic: 'force-dynamic' as const, // Always fresh for user data
  },

  /**
   * API routes with dynamic content
   */
  API_DYNAMIC: {
    revalidate: 0,
    dynamic: 'force-dynamic' as const,
  },
} as const;

/**
 * Cache Invalidation Helpers
 *
 * Use these with Server Actions to invalidate cache when data changes
 *
 * @example
 * ```ts
 * import { revalidateTag } from 'next/cache';
 *
 * // After creating a new course
 * revalidateTag(CACHE_TAGS.courses);
 *
 * // After updating a specific course
 * revalidateTag(CACHE_TAGS.course(courseId));
 * ```
 */
