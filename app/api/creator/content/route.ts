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

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const sort = searchParams.get('sort') || 'newest'

    // Fetch courses
    let courseWhere: any = { creatorId: session.user.id }
    if (filter === 'drafts') courseWhere.isDraft = true
    if (filter === 'review') {
      courseWhere.isDraft = false
      courseWhere.published = false
      courseWhere.rejectedAt = null
    }
    if (filter === 'published') courseWhere.published = true
    if (filter === 'rejected') courseWhere.rejectedAt = { not: null }

    // Fetch publications
    let publicationWhere: any = { creatorId: session.user.id }
    if (filter === 'drafts') {
      publicationWhere.published = false
      publicationWhere.submittedAt = null
    }
    if (filter === 'review') {
      publicationWhere.published = false
      publicationWhere.submittedAt = { not: null }
      publicationWhere.rejectedAt = null
    }
    if (filter === 'published') publicationWhere.published = true
    if (filter === 'rejected') publicationWhere.rejectedAt = { not: null }

    // Fetch courses if filter allows
    const courses =
      filter === 'all' || filter === 'courses' || filter === 'drafts' || filter === 'review' || filter === 'published' || filter === 'rejected'
        ? await prisma.course.findMany({
            where: courseWhere,
            select: {
              id: true,
              title: true,
              thumbnail: true,
              totalViews: true,
              isDraft: true,
              published: true,
              rejectedAt: true,
              createdAt: true,
              updatedAt: true,
            },
          })
        : []

    // Fetch publications if filter allows
    const publications =
      filter === 'all' || filter === 'publications' || filter === 'drafts' || filter === 'review' || filter === 'published' || filter === 'rejected'
        ? await prisma.publication.findMany({
            where: publicationWhere,
            select: {
              id: true,
              title: true,
              thumbnail: true,
              totalViews: true,
              published: true,
              submittedAt: true,
              rejectedAt: true,
              createdAt: true,
              updatedAt: true,
            },
          })
        : []

    // Transform and combine content
    const content = [
      ...courses.map((course) => ({
        id: course.id,
        title: course.title,
        type: 'course' as const,
        status: course.rejectedAt
          ? ('rejected' as const)
          : course.published
          ? ('published' as const)
          : course.isDraft
          ? ('draft' as const)
          : ('review' as const),
        thumbnail: course.thumbnail,
        views: course.totalViews,
        earnings: 0, // Calculate if needed
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      })),
      ...publications.map((pub) => ({
        id: pub.id,
        title: pub.title,
        type: 'publication' as const,
        status: pub.rejectedAt
          ? ('rejected' as const)
          : pub.published
          ? ('published' as const)
          : pub.submittedAt
          ? ('review' as const)
          : ('draft' as const),
        thumbnail: pub.thumbnail,
        views: pub.totalViews,
        earnings: 0, // Calculate if needed
        createdAt: pub.createdAt,
        updatedAt: pub.updatedAt,
      })),
    ]

    // Sort content
    content.sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime()
        case 'views':
          return b.views - a.views
        case 'earnings':
          return b.earnings - a.earnings
        case 'newest':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime()
      }
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
