import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateCourseRating } from '@/lib/reviews';

// PATCH: Update review status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reviewId = params.id;
    const body = await request.json();
    const { hidden, reported } = body;

    // Find the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};
    if (typeof hidden === 'boolean') {
      updateData.hidden = hidden;
    }
    if (typeof reported === 'boolean') {
      updateData.reported = reported;
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
    });

    // Update course rating if visibility changed
    if (typeof hidden === 'boolean' && hidden !== review.hidden) {
      await updateCourseRating(review.courseId);
    }

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
