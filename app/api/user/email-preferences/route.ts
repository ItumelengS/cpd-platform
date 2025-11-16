import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface EmailPreferences {
  newFollowers: boolean;
  courseApproved: boolean;
  courseRejected: boolean;
  earnings: boolean;
  payouts: boolean;
  reviews: boolean;
  weeklySummary: boolean;
}

// GET: Fetch current email preferences
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailPreferences: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Default preferences if none set
    const defaultPreferences: EmailPreferences = {
      newFollowers: true,
      courseApproved: true,
      courseRejected: true,
      earnings: true,
      payouts: true,
      reviews: true,
      weeklySummary: true,
    };

    const preferences = user.emailPreferences
      ? { ...defaultPreferences, ...(user.emailPreferences as EmailPreferences) }
      : defaultPreferences;

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email preferences' },
      { status: 500 }
    );
  }
}

// PUT: Update email preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      newFollowers,
      courseApproved,
      courseRejected,
      earnings,
      payouts,
      reviews,
      weeklySummary,
    } = body;

    // Validate that all values are booleans
    const preferences: Partial<EmailPreferences> = {};

    if (typeof newFollowers === 'boolean') preferences.newFollowers = newFollowers;
    if (typeof courseApproved === 'boolean') preferences.courseApproved = courseApproved;
    if (typeof courseRejected === 'boolean') preferences.courseRejected = courseRejected;
    if (typeof earnings === 'boolean') preferences.earnings = earnings;
    if (typeof payouts === 'boolean') preferences.payouts = payouts;
    if (typeof reviews === 'boolean') preferences.reviews = reviews;
    if (typeof weeklySummary === 'boolean') preferences.weeklySummary = weeklySummary;

    if (Object.keys(preferences).length === 0) {
      return NextResponse.json(
        { error: 'No valid preferences provided' },
        { status: 400 }
      );
    }

    // Update user email preferences
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailPreferences: preferences as any,
      },
      select: { emailPreferences: true },
    });

    return NextResponse.json({
      success: true,
      preferences: updatedUser.emailPreferences,
    });
  } catch (error) {
    console.error('Error updating email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update email preferences' },
      { status: 500 }
    );
  }
}
