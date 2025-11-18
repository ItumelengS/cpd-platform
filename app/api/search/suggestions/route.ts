import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Search courses and creators in parallel for fast response
    const [courses, creators] = await Promise.all([
      prisma.course.findMany({
        where: {
          published: true,
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          slug: true,
          title: true,
        },
        orderBy: {
          totalViews: 'desc',
        },
        take: 3,
      }),
      prisma.user.findMany({
        where: {
          isCreator: true,
          creatorStatus: 'APPROVED',
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 2,
      }),
    ]);

    const suggestions = [
      ...courses.map(course => ({
        id: course.slug,
        title: course.title,
        type: 'course' as const,
      })),
      ...creators.map(creator => ({
        id: creator.id,
        title: creator.name,
        type: 'creator' as const,
      })),
    ].slice(0, 5);

    return NextResponse.json(
      { suggestions },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
