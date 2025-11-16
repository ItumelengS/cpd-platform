import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is approved creator
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { creatorStatus: true },
    });

    if (user?.creatorStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved creators can upload publications' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      category,
      pdfUrl,
      doi,
      journal,
      publishedDate,
      keywords,
    } = body;

    // Validate required fields
    if (!title || !description || !category || !pdfUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, category, and PDF are required' },
        { status: 400 }
      );
    }

    // Parse keywords string to array
    const keywordsArray = keywords
      ? keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : [];

    // Create publication
    const publication = await prisma.publication.create({
      data: {
        title,
        description,
        category,
        pdfUrl,
        doi: doi || null,
        journal: journal || null,
        publishedDate: publishedDate ? new Date(publishedDate) : null,
        keywords: keywordsArray,
        creatorId: session.user.id,
        published: false, // Auto-submit for review, not published yet
      },
    });

    return NextResponse.json({
      publicationId: publication.id,
      message: 'Publication submitted for review successfully',
      publication: {
        id: publication.id,
        title: publication.title,
        createdAt: publication.createdAt,
      },
    });
  } catch (error) {
    console.error('Create publication error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create publication' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is approved creator
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { creatorStatus: true },
    });

    if (user?.creatorStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved creators can access this resource' },
        { status: 403 }
      );
    }

    // Get filter from query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {
      creatorId: session.user.id,
    };

    if (status === 'review') {
      where.published = false;
      where.rejectedAt = null;
    } else if (status === 'published') {
      where.published = true;
    } else if (status === 'rejected') {
      where.rejectedAt = { not: null };
    }

    // Fetch publications
    const publications = await prisma.publication.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(publications);
  } catch (error) {
    console.error('Fetch publications error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch publications' },
      { status: 500 }
    );
  }
}
