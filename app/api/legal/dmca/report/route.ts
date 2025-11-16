import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      reporterName,
      reporterEmail,
      reporterAddress,
      copyrightOwner,
      workDescription,
      infringingUrl,
      goodFaithStatement,
      accuracyStatement,
      signature,
    } = body;

    // Validate required fields
    if (!reporterName || !reporterEmail || !reporterAddress || !workDescription || !infringingUrl || !signature) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (!goodFaithStatement || !accuracyStatement) {
      return NextResponse.json(
        { error: 'You must agree to both required statements' },
        { status: 400 }
      );
    }

    // Validate signature matches name
    if (signature.toLowerCase().trim() !== reporterName.toLowerCase().trim()) {
      return NextResponse.json(
        { error: 'Signature must match your full legal name' },
        { status: 400 }
      );
    }

    // Extract content information from URL if possible
    let contentId = null;
    let contentType = null;

    try {
      const url = new URL(infringingUrl);
      const pathParts = url.pathname.split('/');

      if (pathParts.includes('course')) {
        contentType = 'course';
        const courseIndex = pathParts.indexOf('course');
        if (pathParts[courseIndex + 1]) {
          contentId = pathParts[courseIndex + 1];
        }
      } else if (pathParts.includes('publication')) {
        contentType = 'publication';
        const pubIndex = pathParts.indexOf('publication');
        if (pubIndex !== -1 && pathParts[pubIndex + 1]) {
          contentId = pathParts[pubIndex + 1];
        }
      }
    } catch (e) {
      // Invalid URL format, continue without content info
    }

    // Create DMCA report
    const report = await prisma.dMCAReport.create({
      data: {
        reporterName,
        reporterEmail,
        reporterAddress,
        copyrightOwner: copyrightOwner || reporterName,
        workDescription,
        infringingUrl,
        goodFaithStatement,
        accuracyStatement,
        signature,
        contentId,
        contentType,
        status: 'PENDING',
      },
    });

    // TODO: Send email to legal team
    // TODO: If contentId exists, notify the content creator

    // Send confirmation email to reporter
    try {
      // Placeholder for email sending
      console.log(`DMCA report ${report.id} submitted by ${reporterEmail}`);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      reportId: report.id,
      message: 'DMCA notice submitted successfully. We will review it within 7 business days.',
    });
  } catch (error) {
    console.error('Error submitting DMCA report:', error);
    return NextResponse.json(
      { error: 'Failed to submit DMCA report' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status ? { status: status as any } : {};

    const reports = await prisma.dMCAReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching DMCA reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DMCA reports' },
      { status: 500 }
    );
  }
}
