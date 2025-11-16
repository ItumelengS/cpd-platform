import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        bio: true,
        specialty: true,
        socialLinks: true,
        stripeOnboarded: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return user settings
    // Note: Notification and privacy preferences would need to be added to the schema
    // For now, we'll return defaults
    return NextResponse.json({
      name: user.name,
      bio: user.bio,
      specialty: user.specialty,
      socialLinks: user.socialLinks || {},
      stripeOnboarded: user.stripeOnboarded,
      notifications: {
        newFollower: true,
        newView: false,
        earnings: true,
        courseApproved: true,
        courseRejected: true,
        weeklyReport: true,
      },
      privacy: {
        showEmail: false,
        showActivity: true,
        includeInDirectory: true,
      },
      minThreshold: 50,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { profile, notifications, privacy, payout } = body

    // Update user profile
    const updateData: any = {}

    if (profile) {
      if (profile.name) updateData.name = profile.name
      if (profile.bio !== undefined) updateData.bio = profile.bio
      if (profile.specialty !== undefined) updateData.specialty = profile.specialty

      // Update social links
      if (profile.twitter !== undefined || profile.linkedin !== undefined || profile.website !== undefined) {
        updateData.socialLinks = {
          twitter: profile.twitter || null,
          linkedin: profile.linkedin || null,
          website: profile.website || null,
        }
      }
    }

    // Note: Notification and privacy preferences would need dedicated tables or JSON fields
    // For now, we'll just update the profile fields

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
