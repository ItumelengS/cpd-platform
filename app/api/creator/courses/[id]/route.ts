import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch course with sections and questions
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
        questions: {
          orderBy: { createdAt: 'asc' },
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
        { error: 'You do not have permission to access this course' },
        { status: 403 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Fetch course error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch existing course
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Verify creator owns the course
    if (existingCourse.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this course' },
        { status: 403 }
      );
    }

    // Check if course can be edited (only draft or rejected)
    if (!existingCourse.isDraft && !existingCourse.rejectedAt) {
      return NextResponse.json(
        { error: 'Cannot edit a course that is published or under review' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      slug,
      category,
      description,
      difficulty,
      cpdHours,
      thumbnailUrl,
      sections,
      questions,
    } = body;

    // Validate required fields
    if (!title || !slug || !category || !description || !thumbnailUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug is unique (excluding current course)
    if (slug !== existingCourse.slug) {
      const courseWithSlug = await prisma.course.findUnique({
        where: { slug },
      });

      if (courseWithSlug) {
        return NextResponse.json(
          { error: 'A course with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update course with sections and questions in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update course
      const course = await tx.course.update({
        where: { id: params.id },
        data: {
          title,
          slug,
          category,
          description,
          difficulty: difficulty || 'BEGINNER',
          cpdHours: parseFloat(cpdHours) || 1,
          thumbnailUrl,
        },
      });

      // Delete existing sections and questions
      await tx.section.deleteMany({
        where: { courseId: params.id },
      });

      await tx.question.deleteMany({
        where: { courseId: params.id },
      });

      // Create new sections
      const createdSections = await Promise.all(
        sections.map(async (section: any) => {
          return tx.section.create({
            data: {
              courseId: course.id,
              title: section.title,
              contentType: section.contentType,
              content: section.content,
              videoUrl: section.videoUrl,
              videoThumbnailUrl: section.videoThumbnailUrl,
              pdfUrl: section.pdfUrl,
              order: section.order,
              minTimeSeconds: section.minTimeSeconds || 60,
            },
          });
        })
      );

      // Map temporary section IDs to actual section IDs
      const sectionIdMap = new Map();
      sections.forEach((section: any, index: number) => {
        sectionIdMap.set(section.id, createdSections[index].id);
      });

      // Create new questions
      await Promise.all(
        questions.map(async (question: any) => {
          return tx.question.create({
            data: {
              courseId: course.id,
              sectionId: question.sectionId ? sectionIdMap.get(question.sectionId) : null,
              questionText: question.questionText,
              context: question.context,
              optionA: question.optionA,
              optionB: question.optionB,
              optionC: question.optionC,
              optionD: question.optionD,
              correctAnswer: question.correctAnswer,
              explanation: question.explanation,
            },
          });
        })
      );

      return course;
    });

    return NextResponse.json({
      courseId: result.id,
      slug: result.slug,
      message: 'Course updated successfully',
    });
  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update course' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch course
    const course = await prisma.course.findUnique({
      where: { id: params.id },
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
        { error: 'You do not have permission to delete this course' },
        { status: 403 }
      );
    }

    // Only allow deletion of draft courses
    if (!course.isDraft) {
      return NextResponse.json(
        { error: 'Only draft courses can be deleted' },
        { status: 400 }
      );
    }

    // Delete course (sections and questions will be deleted via cascade)
    await prisma.course.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete course' },
      { status: 500 }
    );
  }
}
