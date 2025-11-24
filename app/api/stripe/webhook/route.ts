import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { PayoutStatus } from '@prisma/client';
import Stripe from 'stripe';

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    // Handle different event types
    switch (event.type) {
      // Subscription events
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      // Payout events
      case 'payout.paid':
        await handlePayoutPaid(event.data.object as Stripe.Payout);
        break;

      case 'payout.failed':
        await handlePayoutFailed(event.data.object as Stripe.Payout);
        break;

      // Account events
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.mode === 'subscription' && session.subscription) {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    const billingPeriod = session.metadata?.billingPeriod as 'MONTHLY' | 'YEARLY';
    const tier = session.metadata?.tier;

    if (!userId || !planId) {
      console.error('Missing metadata in checkout session');
      return;
    }

    // The subscription will be created by the customer.subscription.created event
  } else if (session.mode === 'payment' && session.metadata?.type === 'course_purchase') {
    // Handle course purchase
    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;

    if (!userId || !courseId) {
      console.error('Missing metadata in course purchase checkout session');
      return;
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return;
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { creatorId: true, price: true },
    });

    if (!course) {
      console.error('Course not found:', courseId);
      return;
    }

    // Create enrollment
    await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        enrolledAt: new Date(),
      },
    });

    // TODO: Track creator earnings for course purchases
    // Creator earnings are currently tracked via the Revenue model
    // Individual course purchase tracking can be implemented later
  }
}

/**
 * Handle customer.subscription.created event
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const planId = subscription.metadata?.planId;
  const tier = subscription.metadata?.tier;

  if (!userId || !planId) {
    console.error('Missing metadata in subscription');
    return;
  }

  // Get subscription plan details
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    console.error('Subscription plan not found:', planId);
    return;
  }

  // Determine billing interval from subscription
  const interval = subscription.items.data[0]?.price?.recurring?.interval;
  const billingInterval = interval === 'year' ? 'YEARLY' : 'MONTHLY';

  // Get amount from subscription
  const amount = subscription.items.data[0]?.price?.unit_amount
    ? subscription.items.data[0].price.unit_amount / 100
    : 0;

  // Create subscription in database
  await prisma.subscription.create({
    data: {
      userId,
      planId,
      status: 'ACTIVE',
      billingInterval,
      amount,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAt: (subscription as any).cancel_at ? new Date((subscription as any).cancel_at * 1000) : null,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
    },
  });
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id;

  // Find existing subscription
  const existingSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
  });

  if (!existingSubscription) {
    console.error('Subscription not found for update:', stripeSubscriptionId);
    return;
  }

  // Map Stripe status to our status
  let status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAUSED';
  switch (subscription.status) {
    case 'active':
    case 'trialing':
      status = 'ACTIVE';
      break;
    case 'canceled':
      status = 'CANCELLED';
      break;
    case 'past_due':
      status = 'PAUSED'; // Map past_due to PAUSED
      break;
    case 'unpaid':
    case 'incomplete_expired':
      status = 'EXPIRED';
      break;
    default:
      status = 'ACTIVE';
  }

  // Update subscription in database
  await prisma.subscription.update({
    where: { stripeSubscriptionId },
    data: {
      status,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAt: (subscription as any).cancel_at ? new Date((subscription as any).cancel_at * 1000) : null,
      canceledAt: (subscription as any).canceled_at ? new Date((subscription as any).canceled_at * 1000) : null,
    },
  });
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id;

  // Find existing subscription
  const existingSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
  });

  if (!existingSubscription) {
    console.error('Subscription not found for deletion:', stripeSubscriptionId);
    return;
  }

  // Update subscription status to cancelled
  await prisma.subscription.update({
    where: { stripeSubscriptionId },
    data: {
      status: 'CANCELLED',
      canceledAt: new Date(),
    },
  });
}

/**
 * Handle transfer.created event
 */
async function handleTransferCreated(transfer: Stripe.Transfer) {
  // Find payout by Stripe transfer ID
  const payout = await prisma.payout.findUnique({
    where: { stripeTransferId: transfer.id },
  });

  if (payout) {
    await prisma.payout.update({
      where: { id: payout.id },
      data: {
        status: PayoutStatus.PROCESSING,
      },
    });
  }
}

/**
 * Handle transfer.paid event
 */
async function handleTransferPaid(transfer: Stripe.Transfer) {
  // Find payout by Stripe transfer ID
  const payout = await prisma.payout.findUnique({
    where: { stripeTransferId: transfer.id },
  });

  if (payout) {
    await prisma.payout.update({
      where: { id: payout.id },
      data: {
        status: PayoutStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }
}

/**
 * Handle transfer.failed event
 */
async function handleTransferFailed(transfer: Stripe.Transfer) {
  // Find payout by Stripe transfer ID
  const payout = await prisma.payout.findUnique({
    where: { stripeTransferId: transfer.id },
    include: {
      earnings: true,
    },
  });

  if (payout) {
    // Update payout status to failed
    await prisma.payout.update({
      where: { id: payout.id },
      data: {
        status: PayoutStatus.FAILED,
        failedAt: new Date(),
        failureReason: 'Transfer failed',
      },
    });

    // Mark earnings as unpaid so they can be retried
    await prisma.creatorEarning.updateMany({
      where: { payoutId: payout.id },
      data: {
        paid: false,
        paidAt: null,
        payoutId: null,
      },
    });
  }
}

/**
 * Handle transfer.reversed event
 */
async function handleTransferReversed(transfer: Stripe.Transfer) {
  // Find payout by Stripe transfer ID
  const payout = await prisma.payout.findUnique({
    where: { stripeTransferId: transfer.id },
    include: {
      earnings: true,
    },
  });

  if (payout) {
    // Update payout status to failed
    await prisma.payout.update({
      where: { id: payout.id },
      data: {
        status: PayoutStatus.FAILED,
        failedAt: new Date(),
        failureReason: 'Transfer reversed',
      },
    });

    // Mark earnings as unpaid
    await prisma.creatorEarning.updateMany({
      where: { payoutId: payout.id },
      data: {
        paid: false,
        paidAt: null,
        payoutId: null,
      },
    });
  }
}

/**
 * Handle payout.paid event (for destination account payouts)
 */
async function handlePayoutPaid(stripePayout: Stripe.Payout) {
  // Find payout by Stripe payout ID
  const payout = await prisma.payout.findUnique({
    where: { stripePayoutId: stripePayout.id },
  });

  if (payout) {
    await prisma.payout.update({
      where: { id: payout.id },
      data: {
        status: PayoutStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }
}

/**
 * Handle payout.failed event (for destination account payouts)
 */
async function handlePayoutFailed(stripePayout: Stripe.Payout) {
  // Find payout by Stripe payout ID
  const payout = await prisma.payout.findUnique({
    where: { stripePayoutId: stripePayout.id },
    include: {
      earnings: true,
    },
  });

  if (payout) {
    // Update payout status to failed
    await prisma.payout.update({
      where: { id: payout.id },
      data: {
        status: PayoutStatus.FAILED,
        failedAt: new Date(),
        failureReason: stripePayout.failure_message || 'Payout failed',
      },
    });

    // Mark earnings as unpaid so they can be retried
    await prisma.creatorEarning.updateMany({
      where: { payoutId: payout.id },
      data: {
        paid: false,
        paidAt: null,
        payoutId: null,
      },
    });
  }
}

/**
 * Handle account.updated event
 */
async function handleAccountUpdated(account: Stripe.Account) {
  // Find user by Stripe account ID
  const user = await prisma.user.findUnique({
    where: { stripeAccountId: account.id },
  });

  if (user) {
    // Update user's Stripe account status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeOnboarded: account.details_submitted && account.payouts_enabled,
        stripeDetailsSubmitted: account.details_submitted,
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
      },
    });
  }
}
