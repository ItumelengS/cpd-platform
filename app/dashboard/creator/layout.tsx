import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CreatorLayout from './CreatorLayout'

export const metadata = {
  title: 'Creator Dashboard',
  description: 'Manage your content and track your performance',
}

async function getCreatorStats(userId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get total views
  const totalViews = await prisma.view.count({
    where: { creatorId: userId },
  })

  // Get total followers
  const totalFollowers = await prisma.follow.count({
    where: { followingId: userId },
  })

  // Get monthly earnings
  const monthlyEarnings = await prisma.creatorEarning.aggregate({
    where: {
      creatorId: userId,
      createdAt: {
        gte: startOfMonth,
      },
    },
    _sum: {
      netEarnings: true,
    },
  })

  // Get content published count
  const [publishedCourses, publishedPublications] = await Promise.all([
    prisma.course.count({
      where: {
        creatorId: userId,
        published: true,
      },
    }),
    prisma.publication.count({
      where: {
        creatorId: userId,
        published: true,
      },
    }),
  ])

  return {
    totalViews,
    totalFollowers,
    monthlyEarnings: monthlyEarnings._sum.netEarnings || 0,
    contentPublished: publishedCourses + publishedPublications,
  }
}

export default async function DashboardCreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      isCreator: true,
      creatorStatus: true,
      name: true,
      avatar: true,
    },
  })

  // Check if user is an approved creator
  if (!user?.isCreator || user.creatorStatus !== 'APPROVED') {
    redirect('/dashboard')
  }

  // Get creator stats
  const stats = await getCreatorStats(session.user.id)

  return (
    <CreatorLayout
      user={{
        name: user.name || 'Creator',
        avatar: user.avatar || undefined,
      }}
      stats={stats}
    >
      {children}
    </CreatorLayout>
  )
}
