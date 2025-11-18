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

  console.log('Received webhook event:', event.type);

  try {
    // Handle different event types
    switch (event.type) {
      case 'payout.paid':
        await handlePayoutPaid(event.data.object as Stripe.Payout);
        break;

      case 'payout.failed':
        await handlePayoutFailed(event.data.object as Stripe.Payout);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
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
 * Handle transfer.created event
 */
async function handleTransferCreated(transfer: Stripe.Transfer) {
  console.log('Transfer created:', transfer.id);

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
  console.log('Transfer paid:', transfer.id);

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
  console.log('Transfer failed:', transfer.id);

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
  console.log('Transfer reversed:', transfer.id);

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
  console.log('Payout paid:', stripePayout.id);

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
  console.log('Payout failed:', stripePayout.id);

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
  console.log('Account updated:', account.id);

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
