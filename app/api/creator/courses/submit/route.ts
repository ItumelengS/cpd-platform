import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Fetch course with sections and questions
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: {
            sections: true,
            questions: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Verify creator owns the course
    if (course.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to submit this course' },
        { status: 403 }
      );
    }

    // Verify course is complete
    if (course._count.sections === 0) {
      return NextResponse.json(
        { error: 'Course must have at least one section' },
        { status: 400 }
      );
    }

    if (course._count.questions === 0) {
      return NextResponse.json(
        { error: 'Course must have at least one question' },
        { status: 400 }
      );
    }

    // Update course to submit for review
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        isDraft: false,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Course submitted for review successfully',
      course: {
        id: updatedCourse.id,
        title: updatedCourse.title,
        submittedAt: updatedCourse.submittedAt,
      },
    });
  } catch (error) {
    console.error('Submit course error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit course' },
      { status: 500 }
    );
  }
}
