import { prisma } from '@/lib/prisma';

/**
 * Helper function to update course rating statistics
 * Recalculates average rating and count after every review submission/update/delete
 */
export async function updateCourseRating(courseId: string): Promise<void> {
  try {
    // Get all non-hidden reviews for this course
    const reviews = await prisma.review.findMany({
      where: {
        courseId,
        hidden: false,
      },
      select: {
        rating: true,
      },
    });

    const ratingCount = reviews.length;

    let averageRating = 0;
    if (ratingCount > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / ratingCount;
    }

    // Update the course with new statistics
    await prisma.course.update({
      where: { id: courseId },
      data: {
        averageRating: parseFloat(averageRating.toFixed(2)),
        ratingCount,
      },
    });
  } catch (error) {
    console.error('Error updating course rating:', error);
    throw error;
  }
}

/**
 * Get rating distribution for a course
 */
export async function getRatingDistribution(courseId: string): Promise<Record<number, number>> {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        courseId,
        hidden: false,
      },
      select: {
        rating: true,
      },
    });

    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });

    return distribution;
  } catch (error) {
    console.error('Error getting rating distribution:', error);
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }
}

/**
 * Check if user has completed a course
 */
export async function hasUserCompletedCourse(
  userId: string,
  courseId: string
): Promise<boolean> {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: {
        completedAt: true,
      },
    });

    return !!enrollment?.completedAt;
  } catch (error) {
    console.error('Error checking course completion:', error);
    return false;
  }
}

/**
 * Check if user has already reviewed a course
 */
export async function hasUserReviewedCourse(
  userId: string,
  courseId: string
): Promise<boolean> {
  try {
    const review = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    return !!review;
  } catch (error) {
    console.error('Error checking existing review:', error);
    return false;
  }
}
