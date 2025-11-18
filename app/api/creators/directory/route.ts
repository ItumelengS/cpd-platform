import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CREATORS_PER_PAGE = 18;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const specialty = searchParams.get('specialty') || '';
    const country = searchParams.get('country') || '';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'followers';
    const page = parseInt(searchParams.get('page') || '1', 10);

    const skip = (page - 1) * CREATORS_PER_PAGE;

    // Build where clause
    const where: any = {
      isCreator: true,
      creatorStatus: 'APPROVED',
    };

    if (specialty) {
      where.specialty = specialty;
    }

    if (country) {
      where.country = country;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy clause
    let orderBy: any = {};

    switch (sort) {
      case 'followers':
        orderBy = { totalFollowers: 'desc' };
        break;
      case 'courses':
        orderBy = [
          { createdCourses: { _count: 'desc' } },
          { totalFollowers: 'desc' },
        ];
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      default:
        orderBy = { totalFollowers: 'desc' };
    }

    // Fetch creators
    const [creators, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          _count: {
            select: {
              createdCourses: true,
              followers: true,
            },
          },
        },
        orderBy,
        skip,
        take: CREATORS_PER_PAGE,
      }),
      prisma.user.count({ where }),
    ]);

    // Get total views for each creator
    const creatorsWithViews = await Promise.all(
      creators.map(async (creator) => {
        const viewsData = await prisma.course.aggregate({
          where: {
            creatorId: creator.id,
            published: true,
          },
          _sum: {
            totalViews: true,
          },
        });

        return {
          id: creator.id,
          name: creator.name,
          avatar: creator.avatar,
          specialty: creator.specialty,
          bio: creator.bio,
          country: creator.country,
          followers: creator._count.followers,
          courses: creator._count.createdCourses,
          totalViews: viewsData._sum.totalViews || 0,
        };
      })
    );

    return NextResponse.json({
      creators: creatorsWithViews,
      total,
      page,
      totalPages: Math.ceil(total / CREATORS_PER_PAGE),
    });
  } catch (error) {
    console.error('Creator directory error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creators' },
      { status: 500 }
    );
  }
}
