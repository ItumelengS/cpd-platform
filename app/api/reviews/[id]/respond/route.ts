import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import DOMPurify from 'isomorphic-dompurify';

// POST: Creator responds to a review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reviewId = params.id;
    const body = await request.json();
    const { comment } = body;

    // Validate comment
    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      );
    }

    if (comment.length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be 1000 characters or less' },
        { status: 400 }
      );
    }

    // Find the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            creatorId: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Verify user is the course creator
    if (review.course.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the course creator can respond to reviews' },
        { status: 403 }
      );
    }

    // Check if response already exists
    const existingResponse = await prisma.reviewResponse.findFirst({
      where: { reviewId },
    });

    if (existingResponse) {
      return NextResponse.json(
        { error: 'You have already responded to this review' },
        { status: 400 }
      );
    }

    // Sanitize comment
    const sanitizedComment = DOMPurify.sanitize(comment);

    // Create the response
    const response = await prisma.reviewResponse.create({
      data: {
        reviewId,
        creatorId: session.user.id,
        comment: sanitizedComment,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Send notification to review author
    if (review.userId !== session.user.id) {
      await createNotification(review.userId, 'REVIEW_RESPONSE', {
        creatorName: session.user.name || 'The creator',
        courseTitle: review.course.title,
        courseSlug: review.course.slug,
      });
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating review response:', error);
    return NextResponse.json(
      { error: 'Failed to create review response' },
      { status: 500 }
    );
  }
}
