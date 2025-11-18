import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is approved creator
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { creatorStatus: true },
    });

    if (user?.creatorStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved creators can create courses' },
        { status: 403 }
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
      isDraft,
    } = body;

    // Validate required fields
    if (!title || !slug || !category || !description || !thumbnailUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!sections || sections.length === 0) {
      return NextResponse.json(
        { error: 'Course must have at least one section' },
        { status: 400 }
      );
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Course must have at least one question' },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingCourse = await prisma.course.findUnique({
      where: { slug },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: 'A course with this slug already exists' },
        { status: 400 }
      );
    }

    // Create course with sections and questions in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create course
      const course = await tx.course.create({
        data: {
          title,
          slug,
          categoryId: category,
          description,
          difficulty: difficulty || 'BEGINNER',
          cpdHours: parseFloat(cpdHours) || 1,
          thumbnail: thumbnailUrl,
          creatorId: session.user.id,
          isDraft: isDraft !== false,
          published: false,
          submittedAt: isDraft ? null : new Date(),
        },
      });

      // Create sections
      const createdSections = await Promise.all(
        sections.map(async (section: any) => {
          return tx.section.create({
            data: {
              courseId: course.id,
              title: section.title,
              contentType: section.contentType,
              content: section.content,
              videoUrl: section.videoUrl,
              pdfUrl: section.pdfUrl,
              order: section.order,
              minTimeSeconds: section.minTimeSeconds || 60,
              duration: section.duration,
            },
          });
        })
      );

      // Map temporary section IDs to actual section IDs
      const sectionIdMap = new Map();
      sections.forEach((section: any, index: number) => {
        sectionIdMap.set(section.id, createdSections[index].id);
      });

      // Create questions
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
              order: question.order || 0,
            },
          });
        })
      );

      return course;
    });

    return NextResponse.json({
      courseId: result.id,
      slug: result.slug,
      message: isDraft ? 'Course saved as draft' : 'Course submitted for review',
    });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create course' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is approved creator
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { creatorStatus: true },
    });

    if (user?.creatorStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved creators can access this resource' },
        { status: 403 }
      );
    }

    // Get filter from query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {
      creatorId: session.user.id,
    };

    if (status === 'draft') {
      where.isDraft = true;
    } else if (status === 'review') {
      where.isDraft = false;
      where.published = false;
    } else if (status === 'published') {
      where.published = true;
    } else if (status === 'rejected') {
      where.rejectedAt = { not: null };
    }

    // Fetch courses
    const courses = await prisma.course.findMany({
      where,
      include: {
        _count: {
          select: {
            sections: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Fetch courses error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
