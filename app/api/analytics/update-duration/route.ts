import { NextRequest, NextResponse } from 'next/server';
import { updateViewDuration } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { viewId, duration } = body;

    // Validate input
    if (!viewId || typeof duration !== 'number') {
      return NextResponse.json(
        { error: 'viewId and duration (number) are required' },
        { status: 400 }
      );
    }

    if (duration < 0) {
      return NextResponse.json(
        { error: 'duration must be a positive number' },
        { status: 400 }
      );
    }

    // Update the view duration
    await updateViewDuration(viewId, duration);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating view duration:', error);
    return NextResponse.json(
      { error: 'Failed to update view duration' },
      { status: 500 }
    );
  }
}
