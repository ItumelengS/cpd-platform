import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import FollowersDashboard from './FollowersDashboard'

async function getFollowersData(userId: string) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Get total followers and recent growth
  const [totalFollowers, recentFollowers] = await Promise.all([
    prisma.follow.count({
      where: { followingId: userId },
    }),
    prisma.follow.count({
      where: {
        followingId: userId,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
  ])

  // Get followers list with user details
  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          specialty: true,
          country: true,
        },
      },
    },
  })

  // Get follower growth by day (last 30 days)
  const growthByDay = await prisma.$queryRaw<
    Array<{ date: Date; count: bigint }>
  >`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM "Follow"
    WHERE following_id = ${userId}
    AND created_at >= ${thirtyDaysAgo}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `

  // Get demographics - followers by specialty
  const followersBySpecialty = await prisma.follow.groupBy({
    by: ['followerId'],
    where: { followingId: userId },
    _count: true,
  })

  const followerIds = followersBySpecialty.map((f) => f.followerId)
  const specialtyCounts = await prisma.user.groupBy({
    by: ['specialty'],
    where: {
      id: { in: followerIds },
      specialty: { not: null },
    },
    _count: true,
  })

  // Get followers by country
  const countryCounts = await prisma.user.groupBy({
    by: ['country'],
    where: {
      id: { in: followerIds },
      country: { not: null },
    },
    _count: true,
    orderBy: {
      _count: {
        country: 'desc',
      },
    },
    take: 10,
  })

  return {
    totalFollowers,
    recentFollowers,
    followers: followers.map((f) => ({
      id: f.follower.id,
      name: f.follower.name || 'Anonymous',
      email: f.follower.email,
      avatar: f.follower.avatar,
      specialty: f.follower.specialty,
      country: f.follower.country,
      followedAt: f.createdAt,
    })),
    growthChart: growthByDay.map((item) => ({
      date: item.date.toISOString().split('T')[0],
      followers: Number(item.count),
    })),
    demographics: {
      bySpecialty: specialtyCounts.map((s) => ({
        specialty: s.specialty || 'Not specified',
        count: s._count,
      })),
      byCountry: countryCounts.map((c) => ({
        country: c.country || 'Not specified',
        count: c._count,
      })),
    },
  }
}

export default async function FollowersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const followersData = await getFollowersData(session.user.id)

  return <FollowersDashboard data={followersData} />
}
