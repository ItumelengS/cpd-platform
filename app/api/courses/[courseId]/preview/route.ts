import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    // Get the course with its first section for preview
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
          orderBy: {
            order: 'asc',
          },
          take: 1, // Only get the first section as preview
        },
      },
    });

    if (!course || !course.published) {
      return NextResponse.json(
        { error: 'Course not found or not published' },
        { status: 404 }
      );
    }

    const previewSection = course.sections[0] || null;

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
      previewSection: previewSection,
      hasPreview: !!previewSection,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch course preview' },
      { status: 500 }
    );
  }
}
