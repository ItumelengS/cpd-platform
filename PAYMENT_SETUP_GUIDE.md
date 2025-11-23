# Payment Setup Guide for RadSciCPD

This guide will help you enable payment processing when your company is registered and you're ready to launch.

---

## 📋 Pre-Launch Checklist

### 1. **Business Registration** (Do This First!)

Before you can accept payments, you need:

- [ ] **Registered Company** (Pty Ltd, CC, or Sole Proprietor)
  - Get from CIPC (Companies and Intellectual Property Commission)
  - Cost: ~R175 - R500
  - Time: 2-5 business days
  - Website: https://www.cipc.co.za

- [ ] **Company Bank Account**
  - Business account in company name
  - Required for receiving payments from Stripe

- [ ] **Tax Registration**
  - [ ] SARS Tax Number
  - [ ] VAT Registration (if turnover > R1 million/year)
  - Website: https://www.sars.gov.za

- [ ] **Business Documents Ready**
  - Company registration certificate
  - Directors' ID documents
  - Proof of business address
  - Bank account details

---

## 💳 Stripe Account Setup

### Step 1: Create Stripe Account

1. Go to https://stripe.com/za
2. Click "Start now" or "Sign up"
3. Choose **South Africa** as your country
4. Provide business information:
   - Legal business name
   - Business type (Company/Sole Proprietor)
   - Company registration number
   - Business address
   - Business website (your RadSciCPD domain)

### Step 2: Complete Business Verification

Stripe will ask for:
- [ ] Company registration documents
- [ ] Directors' ID/passport
- [ ] Bank account for payouts
- [ ] Business description
- [ ] Estimated processing volume

**Verification time:** 1-3 business days

### Step 3: Get Your API Keys

Once verified:

1. Go to Stripe Dashboard → Developers → API Keys
2. Copy your keys:
   - **Test keys** (for testing - start here!)
     - Publishable key: `pk_test_...`
     - Secret key: `sk_test_...`
   - **Live keys** (for production - use later!)
     - Publishable key: `pk_live_...`
     - Secret key: `sk_live_...`

---

## 🔧 Configure Your Platform

### Step 1: Update Environment Variables

Edit your `.env` file:

```bash
# Stripe Keys (Start with TEST keys)
STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY_HERE"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY_HERE"

# Stripe Webhook Secret (we'll add this in Step 2)
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET_HERE"

# Your domain (update when deployed)
NEXT_PUBLIC_URL="https://yourdomain.com"
```

### Step 2: Set Up Stripe Webhooks

Webhooks let Stripe notify your platform about payment events.

#### Development (Testing Locally):

1. Install Stripe CLI:
   ```bash
   # On Mac
   brew install stripe/stripe-cli/stripe

   # On Linux
   wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
   tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Copy the webhook signing secret (starts with `whsec_`) and add to `.env`

#### Production (Live Site):

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "+ Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - [x] `checkout.session.completed`
   - [x] `customer.subscription.created`
   - [x] `customer.subscription.updated`
   - [x] `customer.subscription.deleted`
   - [x] `invoice.payment_succeeded`
   - [x] `invoice.payment_failed`
   - [x] `payout.paid`
   - [x] `payout.failed`
   - [x] `account.updated`

5. Click "Add endpoint"
6. Copy the signing secret and update your production `.env`

### Step 3: Configure Vercel Blob Storage

For file uploads (course thumbnails, videos, PDFs):

1. Go to https://vercel.com/dashboard
2. Navigate to Storage
3. Create a new Blob store
4. Copy the token
5. Add to `.env`:
   ```bash
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_YOUR_TOKEN_HERE"
   ```

---

## 🧪 Testing Payment Flow

### Test Mode (Safe to Test)

Stripe provides test card numbers:

**Successful Payments:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Declined Payments:**
- Card: `4000 0000 0000 0002` (declined)
- Card: `4000 0000 0000 9995` (insufficient funds)

### Test These Flows:

1. **Subscription Purchase:**
   - [ ] Go to /pricing
   - [ ] Click "Get Started" on any plan
   - [ ] Complete checkout with test card
   - [ ] Verify subscription appears in /dashboard/subscription
   - [ ] Check Stripe Dashboard for successful payment

2. **Course Purchase:**
   - [ ] Find a paid course
   - [ ] Click "Purchase for R[price]"
   - [ ] Complete checkout
   - [ ] Verify enrollment in course
   - [ ] Check Stripe Dashboard

3. **Subscription Cancellation:**
   - [ ] Go to /dashboard/subscription
   - [ ] Click "Cancel Subscription"
   - [ ] Verify cancellation in Stripe Dashboard

4. **Webhook Testing:**
   - [ ] Make a test payment
   - [ ] Check webhook logs in Stripe Dashboard
   - [ ] Verify data synced to your database

---

## 🚀 Going Live

### Pre-Launch Checklist:

- [ ] All test payments working
- [ ] Webhooks receiving events
- [ ] Email notifications sending
- [ ] Subscription management working
- [ ] Creator payouts configured
- [ ] Terms of Service updated with payment terms
- [ ] Privacy Policy updated with Stripe integration
- [ ] Refund policy defined

### Switch to Live Mode:

1. **Update Environment Variables:**
   ```bash
   # Replace test keys with live keys
   STRIPE_SECRET_KEY="sk_live_YOUR_LIVE_KEY"
   STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_LIVE_KEY"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_LIVE_KEY"
   ```

2. **Update Webhook Endpoint:**
   - In Stripe Dashboard, add production webhook endpoint
   - Use live webhook signing secret

3. **Deploy to Production:**
   ```bash
   git add .
   git commit -m "Enable live payment processing"
   git push
   ```

4. **Activate Live Mode in Stripe:**
   - Complete Stripe's activation checklist
   - Verify bank account
   - Submit required documents

---

## 💰 Pricing Configuration

Your current subscription plans (already configured in database):

| Plan | Monthly | Yearly | CPD Points |
|------|---------|--------|------------|
| Basic | R299 | R2,990 | 10/year |
| Professional | R499 | R4,990 | 30/year |
| Premium | R699 | R6,990 | 50/year |

Individual course pricing: R249 - R599

**To update prices:**
1. Update `prisma/seed.ts` subscription plans
2. Run `pnpm db:seed` to update database

---

## 🛡️ Security Checklist

Before going live:

- [ ] All API keys are in `.env` (never committed to git)
- [ ] Webhook signature verification is working
- [ ] HTTPS is enabled (required for Stripe)
- [ ] CSP headers configured
- [ ] Rate limiting enabled on payment endpoints
- [ ] Error messages don't leak sensitive info

---

## 📊 Post-Launch Monitoring

### Daily:
- [ ] Check Stripe Dashboard for failed payments
- [ ] Review webhook delivery logs
- [ ] Monitor creator payout queue

### Weekly:
- [ ] Review subscription churn rate
- [ ] Check for refund requests
- [ ] Verify revenue matches Stripe reports

### Monthly:
- [ ] Reconcile Stripe payouts with bank account
- [ ] Generate revenue reports
- [ ] Process creator payouts

---

## 🆘 Troubleshooting

### "Payment processing is not yet available"
**Cause:** Stripe keys not configured or using placeholder values

**Fix:** Update `.env` with real Stripe keys

### Webhook events not received
**Cause:** Webhook URL incorrect or secret mismatch

**Fix:**
1. Check webhook URL in Stripe Dashboard
2. Verify `STRIPE_WEBHOOK_SECRET` in `.env`
3. Check server logs for webhook errors

### Subscriptions not syncing
**Cause:** Webhook handler not processing events

**Fix:**
1. Check `/api/stripe/webhook` logs
2. Verify webhook events are enabled
3. Test with Stripe CLI: `stripe trigger checkout.session.completed`

---

## 📞 Support

**Stripe Support:**
- Email: support@stripe.com
- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs

**Platform Issues:**
- Check server logs in Vercel Dashboard
- Review webhook logs in Stripe
- Test in development mode first

---

## 🎯 Current Status

Your platform is **payment-ready** but payments are **disabled** until you:

1. ✅ Register your company
2. ✅ Set up Stripe account
3. ✅ Add API keys to environment
4. ✅ Configure webhooks
5. ✅ Test in test mode
6. ✅ Go live!

All payment code is implemented and tested. You just need to add your Stripe credentials when ready!

---

## 📅 Estimated Timeline

| Task | Duration |
|------|----------|
| Company registration | 2-5 days |
| Bank account setup | 3-7 days |
| Stripe account approval | 1-3 days |
| Testing payment flows | 1-2 days |
| Going live | 1 day |
| **Total** | **1-3 weeks** |

---

**Questions?** Review this guide step-by-step when you're ready to enable payments!
