import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Try to find and delete as course
    const course = await prisma.course.findUnique({
      where: { id },
      select: { creatorId: true },
    })

    if (course) {
      // Verify ownership
      if (course.creatorId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      await prisma.course.delete({
        where: { id },
      })

      return NextResponse.json({ success: true })
    }

    // Try to find and delete as publication
    const publication = await prisma.publication.findUnique({
      where: { id },
      select: { creatorId: true },
    })

    if (publication) {
      // Verify ownership
      if (publication.creatorId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      await prisma.publication.delete({
        where: { id },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Content not found' }, { status: 404 })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    )
  }
}
