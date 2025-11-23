import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

const limiter = rateLimit(RateLimitPresets.payment);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  // Apply rate limiting
  const rateLimitResult = await limiter(request);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many checkout requests. Please try again later.' },
      {
        status: 429,
        headers: rateLimitResult.headers,
      }
    );
  }

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseId } = await params;

    // Get the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: { select: { name: true } },
        creator: { select: { name: true } },
      },
    });

    if (!course || !course.published) {
      return NextResponse.json(
        { error: 'Course not found or not published' },
        { status: 404 }
      );
    }

    // Check if course is free
    if (course.price === 0) {
      return NextResponse.json(
        { error: 'This course is free. Please enroll directly.' },
        { status: 400 }
      );
    }

    // Check if user already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'You are already enrolled in this course' },
        { status: 400 }
      );
    }

    // Check if user has active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (subscription) {
      return NextResponse.json(
        { error: 'You have an active subscription. Access all courses from your dashboard.' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, email: true, name: true },
    });

    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email || undefined,
        name: user?.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      });

      customerId = customer.id;

      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'zar',
            product_data: {
              name: course.title,
              description: `${course.cpdHours} CPD Hours - ${course.category.name}`,
              images: course.thumbnail ? [course.thumbnail] : undefined,
              metadata: {
                courseId: course.id,
                category: course.category.name,
              },
            },
            unit_amount: Math.round(course.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        courseId: course.id,
        type: 'course_purchase',
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/learn/${course.slug}?purchase=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/courses/${course.slug}?purchase=canceled`,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
