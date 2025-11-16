import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
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

    // Get followers with pagination
    const [followers, totalCount] = await Promise.all([
      prisma.follow.findMany({
        where: {
          followingId: userId,
        },
        select: {
          follower: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              creatorProfile: {
                select: {
                  specialty: true,
                },
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
          followingId: userId,
        },
      }),
    ]);

    // Format the response
    const formattedFollowers = followers.map((follow) => ({
      id: follow.follower.id,
      name: follow.follower.name,
      avatar: follow.follower.image,
      specialty: follow.follower.creatorProfile?.specialty || null,
      followedAt: follow.createdAt,
    }));

    const totalPages = Math.ceil(totalCount / perPage);

    return NextResponse.json({
      followers: formattedFollowers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        perPage,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
