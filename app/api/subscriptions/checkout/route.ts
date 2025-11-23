import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

const checkoutSchema = z.object({
  planId: z.string(),
  billingPeriod: z.enum(['MONTHLY', 'YEARLY']),
});

const limiter = rateLimit(RateLimitPresets.payment);

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { planId, billingPeriod } = validation.data;

    // Get the subscription plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.active) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'You already have an active subscription. Please cancel it first or use the upgrade flow.' },
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

    // Determine price based on billing period
    const price = billingPeriod === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
    const interval = billingPeriod === 'YEARLY' ? 'year' : 'month';

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'zar',
            product_data: {
              name: `${plan.name} Plan`,
              description: plan.description || undefined,
              metadata: {
                planId: plan.id,
                tier: plan.tier,
              },
            },
            recurring: {
              interval: interval,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        planId: plan.id,
        billingPeriod: billingPeriod,
        tier: plan.tier,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planId: plan.id,
          tier: plan.tier,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
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
