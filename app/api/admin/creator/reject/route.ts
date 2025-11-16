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

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { applicationId, reason } = body;

    if (!applicationId || !reason) {
      return NextResponse.json(
        { error: 'Application ID and rejection reason are required' },
        { status: 400 }
      );
    }

    const application = await prisma.creatorApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending applications can be rejected' },
        { status: 400 }
      );
    }

    // Update application status
    await prisma.creatorApplication.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: admin.id,
        rejectionReason: reason,
      },
    });

    // Update user creator status
    await prisma.user.update({
      where: { id: application.userId },
      data: {
        creatorStatus: 'REJECTED',
      },
    });

    return NextResponse.json({
      message: 'Application rejected successfully',
    });
  } catch (error) {
    console.error('Error rejecting application:', error);
    return NextResponse.json(
      { error: 'Failed to reject application' },
      { status: 500 }
    );
  }
}
