import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.creatorStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved creators can update their profile' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bio, avatar, specialty, institution, socialLinks } = body;

    if (!bio || !avatar || !specialty || !institution) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        bio,
        avatar,
        specialty,
        institution,
        socialLinks: socialLinks || {},
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        specialty: true,
        institution: true,
        socialLinks: true,
        isCreator: true,
        creatorStatus: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating creator profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
