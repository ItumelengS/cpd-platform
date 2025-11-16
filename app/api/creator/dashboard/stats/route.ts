import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const revalidate = 300 // Cache for 5 minutes

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a creator
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isCreator: true,
        creatorStatus: true,
      },
    })

    if (!user?.isCreator || user.creatorStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'Not a creator' }, { status: 403 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get monthly views (current and last month)
    const [currentMonthViews, lastMonthViews] = await Promise.all([
      prisma.view.count({
        where: {
          creatorId: session.user.id,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.view.count({
        where: {
          creatorId: session.user.id,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
    ])

    // Calculate views trend
    const viewsTrend =
      lastMonthViews > 0
        ? ((currentMonthViews - lastMonthViews) / lastMonthViews) * 100
        : currentMonthViews > 0
        ? 100
        : 0

    // Get new followers (current and last month)
    const [currentMonthFollowers, lastMonthFollowers] = await Promise.all([
      prisma.follow.count({
        where: {
          followingId: session.user.id,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.follow.count({
        where: {
          followingId: session.user.id,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
    ])

    // Calculate followers trend
    const followersTrend =
      lastMonthFollowers > 0
        ? ((currentMonthFollowers - lastMonthFollowers) / lastMonthFollowers) * 100
        : currentMonthFollowers > 0
        ? 100
        : 0

    // Get monthly earnings (current and last month)
    const [currentMonthEarnings, lastMonthEarnings] = await Promise.all([
      prisma.creatorEarning.aggregate({
        where: {
          creatorId: session.user.id,
          createdAt: { gte: startOfMonth },
        },
        _sum: { netEarnings: true },
      }),
      prisma.creatorEarning.aggregate({
        where: {
          creatorId: session.user.id,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { netEarnings: true },
      }),
    ])

    const currentEarnings = currentMonthEarnings._sum.netEarnings || 0
    const lastEarnings = lastMonthEarnings._sum.netEarnings || 0

    // Calculate earnings trend
    const earningsTrend =
      lastEarnings > 0
        ? ((currentEarnings - lastEarnings) / lastEarnings) * 100
        : currentEarnings > 0
        ? 100
        : 0

    // Get content counts by status
    const [draftCourses, reviewCourses, publishedCourses, rejectedCourses] =
      await Promise.all([
        prisma.course.count({
          where: {
            creatorId: session.user.id,
            isDraft: true,
          },
        }),
        prisma.course.count({
          where: {
            creatorId: session.user.id,
            isDraft: false,
            published: false,
            rejectedAt: null,
          },
        }),
        prisma.course.count({
          where: {
            creatorId: session.user.id,
            published: true,
          },
        }),
        prisma.course.count({
          where: {
            creatorId: session.user.id,
            rejectedAt: { not: null },
          },
        }),
      ])

    const [
      draftPublications,
      reviewPublications,
      publishedPublications,
      rejectedPublications,
    ] = await Promise.all([
      prisma.publication.count({
        where: {
          creatorId: session.user.id,
          published: false,
          submittedAt: null,
        },
      }),
      prisma.publication.count({
        where: {
          creatorId: session.user.id,
          published: false,
          submittedAt: { not: null },
          rejectedAt: null,
        },
      }),
      prisma.publication.count({
        where: {
          creatorId: session.user.id,
          published: true,
        },
      }),
      prisma.publication.count({
        where: {
          creatorId: session.user.id,
          rejectedAt: { not: null },
        },
      }),
    ])

    // Get recent activities (last 10)
    const [recentFollows, recentPublishedCourses, recentPublishedPublications] =
      await Promise.all([
        prisma.follow.findMany({
          where: { followingId: session.user.id },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            follower: {
              select: { name: true },
            },
          },
        }),
        prisma.course.findMany({
          where: {
            creatorId: session.user.id,
            published: true,
            publishedAt: { not: null },
          },
          take: 3,
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            publishedAt: true,
          },
        }),
        prisma.publication.findMany({
          where: {
            creatorId: session.user.id,
            published: true,
          },
          take: 2,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        }),
      ])

    // Build activities array
    const activities = [
      ...recentFollows.map((follow) => ({
        type: 'follower' as const,
        message: `${follow.follower.name || 'Someone'} started following you`,
        timestamp: follow.createdAt,
        link: `/dashboard/creator/followers`,
      })),
      ...recentPublishedCourses.map((course) => ({
        type: 'course' as const,
        message: `Your course "${course.title}" was published`,
        timestamp: course.publishedAt!,
        link: `/courses/${course.id}`,
      })),
      ...recentPublishedPublications.map((pub) => ({
        type: 'publication' as const,
        message: `Your publication "${pub.title}" was published`,
        timestamp: pub.createdAt,
        link: `/publications/${pub.id}`,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)

    return NextResponse.json({
      monthlyViews: {
        current: currentMonthViews,
        trend: viewsTrend,
      },
      newFollowers: {
        current: currentMonthFollowers,
        trend: followersTrend,
      },
      monthlyEarnings: {
        current: currentEarnings,
        trend: earningsTrend,
      },
      contentCounts: {
        drafts: draftCourses + draftPublications,
        review: reviewCourses + reviewPublications,
        published: publishedCourses + publishedPublications,
        rejected: rejectedCourses + rejectedPublications,
      },
      activities,
    })
  } catch (error) {
    console.error('Error fetching creator stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
