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
    const { contentId, contentType, reason } = body

    if (!contentId || !contentType || !reason) {
      return NextResponse.json(
        { error: 'Content ID, content type, and reason are required' },
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
      // Update course: rejectedAt = now, rejectionReason = reason, published = false
      const course = await prisma.course.update({
        where: { id: contentId },
        data: {
          rejectedAt: new Date(),
          rejectionReason: reason,
          published: false,
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

      // Send notification to creator with rejection reason
      if (course.creator) {
        try {
          await createNotification(course.creator.id, 'COURSE_REJECTED', {
            courseTitle: course.title,
            courseSlug: course.slug,
            reason: reason,
          })
        } catch (error) {
          console.error('Error creating notification:', error)
          // Don't fail the rejection if notification creation fails
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Course rejected successfully',
        course,
      })
    } else {
      // Update publication: published = false, add rejection reason
      // Note: The Publication model doesn't have rejectionReason or rejectedAt fields in the schema
      // We'll need to add these fields to handle rejection properly
      // For now, we'll just set published to false
      const publication = await prisma.publication.update({
        where: { id: contentId },
        data: {
          published: false,
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

      // Send notification to creator with rejection reason
      try {
        await createNotification(publication.creator.id, 'COURSE_REJECTED', {
          courseTitle: publication.title,
          courseSlug: publication.id, // Publications don't have slugs
          reason: reason,
        })
      } catch (error) {
        console.error('Error creating notification:', error)
        // Don't fail the rejection if notification creation fails
      }

      return NextResponse.json({
        success: true,
        message: 'Publication rejected successfully',
        publication,
        note: 'Rejection reason sent to creator but not stored in database (schema limitation)',
      })
    }
  } catch (error) {
    console.error('Error rejecting content:', error)
    return NextResponse.json(
      { error: 'Failed to reject content' },
      { status: 500 }
    )
  }
}
