import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    // Get the course with its first section and lessons
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: {
          select: {
            name: true,
            icon: true,
          },
        },
        creator: {
          select: {
            name: true,
            avatar: true,
            specialty: true,
          },
        },
        sections: {
          where: {
            isPreview: true, // Only get sections marked as preview
          },
          include: {
            lessons: {
              where: {
                isPreview: true, // Only get lessons marked as preview
              },
              orderBy: {
                order: 'asc',
              },
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                content: true,
                videoUrl: true,
                duration: true,
                order: true,
                isPreview: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
          take: 1, // Only get the first preview section
        },
      },
    });

    if (!course || !course.published) {
      return NextResponse.json(
        { error: 'Course not found or not published' },
        { status: 404 }
      );
    }

    // If no preview sections, get the first section and first lesson
    if (course.sections.length === 0) {
      const firstSection = await prisma.section.findFirst({
        where: {
          courseId: courseId,
        },
        include: {
          lessons: {
            orderBy: {
              order: 'asc',
            },
            take: 1,
            select: {
              id: true,
              title: true,
              description: true,
              type: true,
              content: true,
              videoUrl: true,
              duration: true,
              order: true,
              isPreview: true,
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      });

      if (firstSection && firstSection.lessons.length > 0) {
        course.sections = [firstSection];
      }
    }

    // Return preview content
    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        creator: course.creator,
        cpdHours: course.cpdHours,
        difficulty: course.difficulty,
        price: course.price,
      },
      previewSection: course.sections[0] || null,
      hasPreview: course.sections.length > 0 && course.sections[0].lessons.length > 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch course preview' },
      { status: 500 }
    );
  }
}
