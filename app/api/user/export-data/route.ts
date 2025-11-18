import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.dataExportRequest.findFirst({
      where: {
        userId: user.id,
        status: { in: ['pending', 'processing'] },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending data export request' },
        { status: 400 }
      );
    }

    // Create export request
    const exportRequest = await prisma.dataExportRequest.create({
      data: {
        userId: user.id,
        status: 'pending',
      },
    });

    // Generate the data export (this would normally be done in a background job)
    try {
      // Gather all user data
      const userData = {
        profile: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          specialty: user.specialty,
          institution: user.institution,
          country: user.country,
          isCreator: user.isCreator,
          creatorStatus: user.creatorStatus,
          bio: user.bio,
          socialLinks: user.socialLinks,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        enrollments: await prisma.enrollment.findMany({
          where: { userId: user.id },
          include: {
            course: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
        }),
        progress: await prisma.progress.findMany({
          where: { userId: user.id },
          include: {
            section: {
              select: {
                title: true,
                courseId: true,
              },
            },
          },
        }),
        certificates: await prisma.certificate.findMany({
          where: { userId: user.id },
          include: {
            course: {
              select: {
                title: true,
              },
            },
          },
        }),
        reviews: await prisma.review.findMany({
          where: { userId: user.id },
          include: {
            course: {
              select: {
                title: true,
              },
            },
          },
        }),
      };

      // If user is a creator, include creator-specific data
      if (user.isCreator) {
        const creatorData = {
          courses: await prisma.course.findMany({
            where: { creatorId: user.id },
          }),
          publications: await prisma.publication.findMany({
            where: { creatorId: user.id },
          }),
          earnings: await prisma.creatorEarning.findMany({
            where: { creatorId: user.id },
          }),
          payouts: await prisma.payout.findMany({
            where: { creatorId: user.id },
          }),
          followers: await prisma.follow.findMany({
            where: { followingId: user.id },
            include: {
              follower: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          }),
        };

        Object.assign(userData, { creatorData });
      }

      // In a real application, you would:
      // 1. Upload this JSON to temporary storage (S3, etc.)
      // 2. Generate a secure download link
      // 3. Email the link to the user
      // 4. Set expiration for 7 days

      // For now, we'll just mark as completed
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await prisma.dataExportRequest.update({
        where: { id: exportRequest.id },
        data: {
          status: 'completed',
          downloadUrl: `/api/user/download-data/${exportRequest.id}`,
          expiresAt,
          completedAt: new Date(),
        },
      });

      // TODO: Send email with download link
      console.log('Data export ready for user:', user.email);

      return NextResponse.json({
        success: true,
        message: 'Data export request created successfully. You will receive an email with a download link shortly.',
        exportId: exportRequest.id,
      });
    } catch (error) {
      // Update request status to failed
      await prisma.dataExportRequest.update({
        where: { id: exportRequest.id },
        data: { status: 'failed' },
      });

      throw error;
    }
  } catch (error) {
    console.error('Error creating data export:', error);
    return NextResponse.json(
      { error: 'Failed to create data export request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's export requests
    const requests = await prisma.dataExportRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching data export requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data export requests' },
      { status: 500 }
    );
  }
}
