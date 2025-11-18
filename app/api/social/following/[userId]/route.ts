import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = 20;
    const skip = (page - 1) * perPage;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get following with pagination
    const [following, totalCount] = await Promise.all([
      prisma.follow.findMany({
        where: {
          followerId: userId,
        },
        select: {
          following: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              specialty: true,
              bio: true,
              createdCourses: {
                where: {
                  published: true,
                },
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  createdAt: true,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
              },
            },
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: perPage,
      }),
      prisma.follow.count({
        where: {
          followerId: userId,
        },
      }),
    ]);

    // Format the response
    const formattedFollowing = await Promise.all(
      following.map(async (follow) => {
        // Get course count for this creator
        const courseCount = await prisma.course.count({
          where: {
            creatorId: follow.following.id,
            published: true,
          },
        });

        return {
          id: follow.following.id,
          name: follow.following.name,
          avatar: follow.following.avatar,
          specialty: follow.following.specialty || null,
          bio: follow.following.bio || null,
          courseCount,
          latestCourse: follow.following.createdCourses[0]
            ? {
                title: follow.following.createdCourses[0].title,
                slug: follow.following.createdCourses[0].slug,
                createdAt: follow.following.createdCourses[0].createdAt,
              }
            : null,
          followedAt: follow.createdAt,
        };
      })
    );

    const totalPages = Math.ceil(totalCount / perPage);

    return NextResponse.json({
      following: formattedFollowing,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        perPage,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
