import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { contentId, contentType } = body

    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: 'Content ID and content type are required' },
        { status: 400 }
      )
    }

    if (contentType !== 'course' && contentType !== 'publication') {
      return NextResponse.json(
        { error: 'Invalid content type. Must be "course" or "publication"' },
        { status: 400 }
      )
    }

    if (contentType === 'course') {
      // Update course: published = true, publishedAt = now, isDraft = false
      const course = await prisma.course.update({
        where: { id: contentId },
        data: {
          published: true,
          publishedAt: new Date(),
          isDraft: false,
          rejectedAt: null,
          rejectionReason: null,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Create notification for creator
      if (course.creator) {
        try {
          await createNotification(course.creator.id, 'COURSE_APPROVED', {
            courseTitle: course.title,
            courseSlug: course.slug,
          })
        } catch (error) {
          console.error('Error creating notification:', error)
          // Don't fail the approval if notification creation fails
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Course approved and published successfully',
        course,
      })
    } else {
      // Update publication: published = true
      const publication = await prisma.publication.update({
        where: { id: contentId },
        data: {
          published: true,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Create notification for creator
      try {
        await createNotification(publication.creator.id, 'COURSE_APPROVED', {
          courseTitle: publication.title,
          courseSlug: publication.id, // Publications don't have slugs
        })
      } catch (error) {
        console.error('Error creating notification:', error)
        // Don't fail the approval if notification creation fails
      }

      return NextResponse.json({
        success: true,
        message: 'Publication approved and published successfully',
        publication,
      })
    }
  } catch (error) {
    console.error('Error approving content:', error)
    return NextResponse.json(
      { error: 'Failed to approve content' },
      { status: 500 }
    )
  }
}
