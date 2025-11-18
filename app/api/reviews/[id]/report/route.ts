import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

// POST: Report an inappropriate review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: reviewId } = await params;
    const body = await request.json();
    const { reason } = body;

    // Validate reason
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      );
    }

    if (reason.length > 500) {
      return NextResponse.json(
        { error: 'Reason must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Find the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Update the review to mark as reported
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        reported: true,
      },
    });

    // Get all admin users to notify
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    // Send notification to all admins
    await Promise.all(
      admins.map((admin) =>
        createNotification(admin.id, 'REVIEW_REPORTED', {
          reporterName: session.user.name || 'A user',
          reviewerName: review.user.name || 'Unknown',
          courseTitle: review.course.title,
          courseSlug: review.course.slug,
          reason,
          reviewId,
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Review reported successfully',
    });
  } catch (error) {
    console.error('Error reporting review:', error);
    return NextResponse.json(
      { error: 'Failed to report review' },
      { status: 500 }
    );
  }
}
