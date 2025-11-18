import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { creatorId } = await req.json();

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Creator ID is required' },
        { status: 400 }
      );
    }

    // Prevent following yourself
    if (creatorId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if creator exists
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: { id: true, name: true, role: true },
    });

    if (!creator) {
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }

    // Use transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if already following
      const existingFollow = await tx.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: creatorId,
          },
        },
      });

      let following: boolean;

      if (existingFollow) {
        // Unfollow
        await tx.follow.delete({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: creatorId,
            },
          },
        });
        following = false;
      } else {
        // Follow
        await tx.follow.create({
          data: {
            followerId: session.user.id,
            followingId: creatorId,
          },
        });
        following = true;

        // Create notification for creator (outside transaction for non-critical operation)
        try {
          await createNotification(creatorId, 'NEW_FOLLOWER', {
            followerName: session.user.name || 'Someone',
            followerId: session.user.id,
          });
        } catch (error) {
          console.error('Failed to create notification:', error);
          // Don't fail the follow operation if notification fails
        }
      }

      // Get updated follower count
      const followerCount = await tx.follow.count({
        where: {
          followingId: creatorId,
        },
      });

      return { following, followerCount };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error toggling follow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
