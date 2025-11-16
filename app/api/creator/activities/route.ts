import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
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

    // Get page from query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const perPage = 20
    const skip = (page - 1) * perPage

    // Get recent follows
    const follows = await prisma.follow.findMany({
      where: { followingId: session.user.id },
      take: perPage,
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        follower: {
          select: { name: true, specialty: true },
        },
      },
    })

    // Get recent course publishes
    const courses = await prisma.course.findMany({
      where: {
        creatorId: session.user.id,
        published: true,
        publishedAt: { not: null },
      },
      take: perPage,
      skip,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        publishedAt: true,
      },
    })

    // Get recent publication publishes
    const publications = await prisma.publication.findMany({
      where: {
        creatorId: session.user.id,
        published: true,
      },
      take: perPage,
      skip,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    })

    // Get recent earnings
    const earnings = await prisma.creatorEarning.findMany({
      where: {
        creatorId: session.user.id,
      },
      take: perPage,
      skip,
      orderBy: { createdAt: 'desc' },
      select: {
        netEarnings: true,
        createdAt: true,
        revenue: {
          select: {
            month: true,
            year: true,
          },
        },
      },
    })

    // Get recent course rejections
    const rejectedCourses = await prisma.course.findMany({
      where: {
        creatorId: session.user.id,
        rejectedAt: { not: null },
      },
      take: perPage,
      skip,
      orderBy: { rejectedAt: 'desc' },
      select: {
        id: true,
        title: true,
        rejectedAt: true,
        rejectionReason: true,
      },
    })

    // Get recent publication rejections
    const rejectedPublications = await prisma.publication.findMany({
      where: {
        creatorId: session.user.id,
        rejectedAt: { not: null },
      },
      take: perPage,
      skip,
      orderBy: { rejectedAt: 'desc' },
      select: {
        id: true,
        title: true,
        rejectedAt: true,
        rejectionReason: true,
      },
    })

    // Combine and format all activities
    const activities = [
      ...follows.map((follow) => ({
        type: 'follower' as const,
        message: `${follow.follower.name || 'Someone'}${
          follow.follower.specialty ? ` (${follow.follower.specialty})` : ''
        } started following you`,
        timestamp: follow.createdAt.toISOString(),
        link: `/dashboard/creator/followers`,
      })),
      ...courses.map((course) => ({
        type: 'course' as const,
        message: `Your course "${course.title}" was published`,
        timestamp: course.publishedAt!.toISOString(),
        link: `/courses/${course.id}`,
      })),
      ...publications.map((pub) => ({
        type: 'publication' as const,
        message: `Your publication "${pub.title}" was published`,
        timestamp: pub.createdAt.toISOString(),
        link: `/publications/${pub.id}`,
      })),
      ...earnings.map((earning) => ({
        type: 'earnings' as const,
        message: `You earned $${earning.netEarnings.toFixed(2)} for ${
          earning.revenue.month
        }/${earning.revenue.year}`,
        timestamp: earning.createdAt.toISOString(),
        link: `/dashboard/creator/earnings`,
      })),
      ...rejectedCourses.map((course) => ({
        type: 'course' as const,
        message: `Your course "${course.title}" was rejected`,
        timestamp: course.rejectedAt!.toISOString(),
        link: `/dashboard/creator/courses/${course.id}/edit`,
      })),
      ...rejectedPublications.map((pub) => ({
        type: 'publication' as const,
        message: `Your publication "${pub.title}" was rejected`,
        timestamp: pub.rejectedAt!.toISOString(),
        link: `/dashboard/creator/publications/${pub.id}/edit`,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, perPage)

    return NextResponse.json({
      activities,
      page,
      hasMore: activities.length === perPage,
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}
