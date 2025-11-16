import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PayoutStatus } from '@prisma/client';

/**
 * GET /api/admin/payouts
 * Lists all payouts with optional filtering
 * Query params: ?status=PENDING|PROCESSING|COMPLETED|FAILED, ?creatorId=xxx, ?page=1, ?limit=50
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Verify admin authentication
    if (!session?.user?.email || session.user.email !== 'admin@example.com') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as PayoutStatus | null;
    const creatorId = searchParams.get('creatorId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Build where clause
    const where: any = {};

    if (status && Object.values(PayoutStatus).includes(status)) {
      where.status = status;
    }

    if (creatorId) {
      where.creatorId = creatorId;
    }

    // Get total count
    const totalCount = await prisma.payout.count({ where });

    // Get paginated payouts
    const payouts = await prisma.payout.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        earnings: {
          include: {
            revenue: {
              select: {
                month: true,
                year: true,
              },
            },
          },
        },
      },
      orderBy: {
        initiatedAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      payouts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}
