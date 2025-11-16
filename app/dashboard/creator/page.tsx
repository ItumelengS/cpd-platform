import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CreatorOverview from './CreatorOverview'

async function getCreatorDashboardData(userId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // Get current month stats
  const [currentMonthViews, lastMonthViews] = await Promise.all([
    prisma.view.count({
      where: {
        creatorId: userId,
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.view.count({
      where: {
        creatorId: userId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
  ])

  // Get follower stats
  const [currentMonthFollowers, lastMonthFollowers] = await Promise.all([
    prisma.follow.count({
      where: {
        followingId: userId,
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.follow.count({
      where: {
        followingId: userId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
  ])

  // Get earnings stats
  const [currentMonthEarnings, lastMonthEarnings] = await Promise.all([
    prisma.creatorEarning.aggregate({
      where: {
        creatorId: userId,
        createdAt: { gte: startOfMonth },
      },
      _sum: { netEarnings: true },
    }),
    prisma.creatorEarning.aggregate({
      where: {
        creatorId: userId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { netEarnings: true },
    }),
  ])

  // Get content in review
  const contentInReview = await Promise.all([
    prisma.course.count({
      where: {
        creatorId: userId,
        isDraft: false,
        published: false,
        rejectedAt: null,
      },
    }),
    prisma.publication.count({
      where: {
        creatorId: userId,
        published: false,
        submittedAt: { not: null },
        rejectedAt: null,
      },
    }),
  ])

  // Get recent activities (last 10)
  const [recentFollows, recentCourses, recentPublications, recentViews] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: userId },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        follower: {
          select: { name: true, specialty: true },
        },
      },
    }),
    prisma.course.findMany({
      where: {
        creatorId: userId,
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
        creatorId: userId,
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
    prisma.view.groupBy({
      by: ['createdAt'],
      where: {
        creatorId: userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // last 24 hours
        },
      },
      _count: true,
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  // Build activities array
  const activities = []

  recentFollows.forEach((follow) => {
    activities.push({
      type: 'follower' as const,
      message: `${follow.follower.name || 'Someone'} started following you`,
      timestamp: follow.createdAt,
      link: `/dashboard/creator/followers`,
    })
  })

  recentCourses.forEach((course) => {
    activities.push({
      type: 'course' as const,
      message: `Your course "${course.title}" was published`,
      timestamp: course.publishedAt!,
      link: `/courses/${course.id}`,
    })
  })

  recentPublications.forEach((pub) => {
    activities.push({
      type: 'publication' as const,
      message: `Your publication "${pub.title}" was published`,
      timestamp: pub.createdAt,
      link: `/publications/${pub.id}`,
    })
  })

  // Sort activities by timestamp
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  // Get top performing content
  const [topCourses, topPublications] = await Promise.all([
    prisma.course.findMany({
      where: {
        creatorId: userId,
        published: true,
      },
      orderBy: { totalViews: 'desc' },
      take: 3,
      include: {
        enrollments: {
          select: { id: true },
        },
        _count: {
          select: { views: true },
        },
      },
    }),
    prisma.publication.findMany({
      where: {
        creatorId: userId,
        published: true,
      },
      orderBy: { totalViews: 'desc' },
      take: 2,
      include: {
        _count: {
          select: { views: true },
        },
      },
    }),
  ])

  // Get views over last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const viewsByDay = await prisma.$queryRaw<
    Array<{ date: Date; count: bigint }>
  >`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM "View"
    WHERE creator_id = ${userId}
    AND created_at >= ${sevenDaysAgo}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `

  // Get user profile data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      bio: true,
      stripeOnboarded: true,
    },
  })

  // Calculate trends
  const viewsTrend = lastMonthViews > 0
    ? ((currentMonthViews - lastMonthViews) / lastMonthViews) * 100
    : currentMonthViews > 0 ? 100 : 0

  const followersTrend = lastMonthFollowers > 0
    ? ((currentMonthFollowers - lastMonthFollowers) / lastMonthFollowers) * 100
    : currentMonthFollowers > 0 ? 100 : 0

  const earningsTrend = (lastMonthEarnings._sum.netEarnings || 0) > 0
    ? (((currentMonthEarnings._sum.netEarnings || 0) - (lastMonthEarnings._sum.netEarnings || 0)) /
        (lastMonthEarnings._sum.netEarnings || 0)) * 100
    : (currentMonthEarnings._sum.netEarnings || 0) > 0 ? 100 : 0

  return {
    user: {
      name: user?.name || 'Creator',
      hasCompletedProfile: !!user?.bio,
      hasSetupPayout: user?.stripeOnboarded || false,
    },
    stats: {
      monthlyViews: currentMonthViews,
      viewsTrend,
      newFollowers: currentMonthFollowers,
      followersTrend,
      monthlyEarnings: currentMonthEarnings._sum.netEarnings || 0,
      earningsTrend,
      contentInReview: contentInReview[0] + contentInReview[1],
    },
    activities: activities.slice(0, 10),
    topContent: [
      ...topCourses.map((course) => ({
        id: course.id,
        title: course.title,
        type: 'course' as const,
        views: course.totalViews,
        engagement: course.enrollments.length,
        revenue: 0, // Could be calculated from enrollments if courses are paid
      })),
      ...topPublications.map((pub) => ({
        id: pub.id,
        title: pub.title,
        type: 'publication' as const,
        views: pub.totalViews,
        engagement: pub._count.views,
        revenue: 0,
      })),
    ]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5),
    viewsChart: viewsByDay.map((item) => ({
      date: item.date.toISOString().split('T')[0],
      views: Number(item.count),
    })),
  }
}

export default async function CreatorDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const dashboardData = await getCreatorDashboardData(session.user.id)

  return <CreatorOverview data={dashboardData} />
}
