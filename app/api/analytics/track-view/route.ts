import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { trackView } from '@/lib/analytics';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const { contentType, contentId } = body;

    // Validate input
    if (!contentType || !contentId) {
      return NextResponse.json(
        { error: 'contentType and contentId are required' },
        { status: 400 }
      );
    }

    if (contentType !== 'course' && contentType !== 'publication') {
      return NextResponse.json(
        { error: 'contentType must be "course" or "publication"' },
        { status: 400 }
      );
    }

    // Get creator ID based on content type
    let creatorId: string;

    if (contentType === 'course') {
      const course = await prisma.course.findUnique({
        where: { id: contentId },
        select: { creatorId: true },
      });

      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }

      creatorId = course.creatorId;
    } else {
      const publication = await prisma.publication.findUnique({
        where: { id: contentId },
        select: { authorId: true },
      });

      if (!publication) {
        return NextResponse.json(
          { error: 'Publication not found' },
          { status: 404 }
        );
      }

      creatorId = publication.authorId;
    }

    // Get user ID from session (optional for anonymous tracking)
    const userId = session?.user?.id;

    // Track the view
    const viewId = await trackView(
      contentType,
      contentId,
      creatorId,
      userId,
      request
    );

    return NextResponse.json({ viewId }, { status: 201 });
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}
