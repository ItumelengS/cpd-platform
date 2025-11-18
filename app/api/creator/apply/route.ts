import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to apply' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { applications: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already a creator
    if (user.isCreator || user.creatorStatus !== 'NONE') {
      return NextResponse.json(
        { error: 'You are already a creator or have a pending application' },
        { status: 400 }
      );
    }

    // Check if user has an existing application
    const existingApplication = await prisma.creatorApplication.findFirst({
      where: {
        userId: user.id,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You already have a pending or approved application' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { motivation, expertise, experience, sampleContent, cvUrl } = body;

    // Validate required fields
    if (!motivation || !expertise || !experience || !cvUrl) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.creatorApplication.create({
      data: {
        userId: user.id,
        motivation,
        expertise,
        experience,
        sampleContent: sampleContent || null,
        cvUrl,
        status: 'PENDING',
      },
    });

    // Update user status to PENDING
    await prisma.user.update({
      where: { id: user.id },
      data: {
        creatorStatus: 'PENDING',
      },
    });

    // TODO: Send notification to admins (will implement in Task 24)
    // TODO: Send confirmation email to user (will implement in Task 24)

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully! We will review it within 3 business days.',
      applicationId: application.id,
    });
  } catch (error) {
    console.error('Creator application error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}
