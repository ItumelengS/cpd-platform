import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateCourseRating, hasUserCompletedCourse } from '@/lib/reviews';
import { createNotification } from '@/lib/notifications';
import DOMPurify from 'isomorphic-dompurify';

// POST: Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, rating, title, comment } = body;

    // Validate required fields
    if (!courseId || !rating) {
      return NextResponse.json(
        { error: 'Course ID and rating are required' },
        { status: 400 }
      );
    }

    // Validate rating range (1-5)
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate comment length (max 1000 chars)
    if (comment && comment.length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be 1000 characters or less' },
        { status: 400 }
      );
    }

    // Validate title length (max 100 chars)
    if (title && title.length > 100) {
      return NextResponse.json(
        { error: 'Title must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { creator: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Verify user has completed the course
    const hasCompleted = await hasUserCompletedCourse(session.user.id, courseId);
    if (!hasCompleted) {
      return NextResponse.json(
        { error: 'You must complete the course before reviewing it' },
        { status: 403 }
      );
    }

    // Check if user has already reviewed this course
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this course' },
        { status: 400 }
      );
    }

    // Sanitize comment to prevent XSS
    const sanitizedComment = comment ? DOMPurify.sanitize(comment) : null;
    const sanitizedTitle = title ? DOMPurify.sanitize(title) : null;

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        courseId,
        rating,
        title: sanitizedTitle,
        comment: sanitizedComment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update course rating statistics
    await updateCourseRating(courseId);

    // Send notification to creator
    if (course.creatorId && course.creatorId !== session.user.id) {
      await createNotification(course.creatorId, 'NEW_REVIEW', {
        reviewerName: session.user.name || 'A user',
        courseTitle: course.title,
        courseSlug: course.slug,
        rating,
      });
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

// GET: Fetch reviews for a course
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const rating = searchParams.get('rating');
    const sortBy = searchParams.get('sortBy') || 'recent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      courseId,
      hidden: false,
    };

    // Filter by rating if specified
    if (rating && parseInt(rating) >= 1 && parseInt(rating) <= 5) {
      where.rating = parseInt(rating);
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }; // default: recent
    if (sortBy === 'helpful') {
      orderBy = { helpful: 'desc' };
    } else if (sortBy === 'highest') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'lowest') {
      orderBy = { rating: 'asc' };
    }

    // Get total count
    const totalCount = await prisma.review.count({ where });

    // Fetch reviews with pagination
    const reviews = await prisma.review.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        responses: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
