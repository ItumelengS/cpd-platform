# Email Notifications System - Task 24

This document provides a complete overview of the Email Notifications system implemented for the CPD Platform.

## Overview

The email notification system sends automated emails to users for key platform events:
- New followers
- Course published (approved)
- Course rejected
- Earnings calculated
- Payout completed
- New reviews
- Weekly performance summary

## Architecture

### Email Service Provider
- **Provider**: Resend (https://resend.com)
- **Library**: `resend` npm package
- **Templates**: React Email components

### Components

1. **lib/email.ts** - Core email sending functionality
2. **emails/** - React Email template components
3. **lib/notifications.ts** - Updated to send emails alongside in-app notifications
4. **lib/email-scheduler.ts** - Weekly summary email scheduler
5. **app/api/user/email-preferences/route.ts** - API for managing preferences
6. **app/dashboard/settings/notifications/page.tsx** - User preferences UI
7. **app/unsubscribe/[token]/page.tsx** - Unsubscribe page
8. **app/api/cron/weekly-summary/route.ts** - Cron endpoint for weekly emails

## Email Templates

All email templates are located in `/emails/` and built with @react-email/components:

### 1. NewFollowerEmail.tsx
Sent when someone follows a creator.
- Props: followerName, followerAvatar, creatorName, followerProfileUrl
- Preference key: `newFollowers`

### 2. CoursePublishedEmail.tsx
Sent when a course is approved and published.
- Props: courseName, courseSlug, creatorName
- Preference key: `courseApproved`

### 3. CourseRejectedEmail.tsx
Sent when a course is rejected with feedback.
- Props: courseName, rejectionReason, creatorName
- Preference key: `courseRejected`

### 4. EarningsCalculatedEmail.tsx
Sent when monthly earnings are calculated.
- Props: amount, month, year, creatorName, detailsUrl
- Preference key: `earnings`
- Shows payout date (5th of next month)

### 5. PayoutCompletedEmail.tsx
Sent when a payout is successfully sent.
- Props: amount, stripePayoutId, creatorName, date
- Preference key: `payouts`

### 6. NewReviewEmail.tsx
Sent when a course receives a new review.
- Props: reviewerName, rating, comment, courseName, courseSlug, reviewUrl
- Preference key: `reviews`

### 7. WeeklySummaryEmail.tsx
Weekly performance summary sent every Monday.
- Props: creatorName, weekStats (views, followers, earnings, topCourse)
- Preference key: `weeklySummary`

## Email Preferences

Users can manage their email preferences at: `/dashboard/settings/notifications`

### Available Preferences:
- `newFollowers` - New follower notifications
- `courseApproved` - Course approval notifications
- `courseRejected` - Course rejection notifications
- `earnings` - Earnings calculation notifications
- `payouts` - Payout completion notifications
- `reviews` - New review notifications
- `weeklySummary` - Weekly performance summaries

### Default Values:
All preferences default to `true` (enabled).

## Setup Instructions

### 1. Environment Variables

Add to your `.env` file:

```env
# Resend Email
RESEND_API_KEY="re_..." # Get from https://resend.com/api-keys
EMAIL_FROM="notifications@yourdomain.com"

# Application URL
NEXT_PUBLIC_URL="http://localhost:3000" # Change to your production URL

# Cron Job Secret (for securing cron endpoints)
CRON_SECRET="your_secure_random_string_here"
```

### 2. Resend Setup

1. Sign up at https://resend.com
2. Verify your domain or use their testing domain
3. Create an API key
4. Add the API key to your `.env` file

### 3. Database Migration

The `emailPreferences` field already exists in the User model with default values.
No migration needed!

### 4. Weekly Summary Cron Job

The weekly summary is configured to run every Monday at 9 AM UTC.

#### Option A: Vercel Cron (Recommended)
The `vercel.json` file is already configured:
```json
{
  "crons": [{
    "path": "/api/cron/weekly-summary",
    "schedule": "0 9 * * 1"
  }]
}
```

#### Option B: External Cron Service
Use services like:
- GitHub Actions
- AWS EventBridge
- cron-job.org

Make a POST request to:
```
POST https://yourdomain.com/api/cron/weekly-summary
Authorization: Bearer YOUR_CRON_SECRET
```

Schedule: `0 9 * * 1` (Every Monday at 9 AM)

## API Endpoints

### GET /api/user/email-preferences
Fetch current user's email preferences.

**Response:**
```json
{
  "preferences": {
    "newFollowers": true,
    "courseApproved": true,
    "courseRejected": true,
    "earnings": true,
    "payouts": true,
    "reviews": true,
    "weeklySummary": true
  }
}
```

### PUT /api/user/email-preferences
Update user's email preferences.

**Request Body:**
```json
{
  "newFollowers": false,
  "courseApproved": true,
  "courseRejected": true,
  "earnings": true,
  "payouts": true,
  "reviews": false,
  "weeklySummary": true
}
```

### POST /api/cron/weekly-summary
Trigger weekly summary emails (cron job endpoint).

**Authorization:** Bearer token with CRON_SECRET

## Email Sending Flow

### Automatic Emails

1. **New Follower**
   - Triggered by: `/api/social/follow`
   - Via: `createNotification()` in lib/notifications.ts

2. **Course Published**
   - Triggered by: `/api/admin/content/approve`
   - Via: `createNotification()` in lib/notifications.ts

3. **Course Rejected**
   - Triggered by: `/api/admin/content/reject`
   - Via: `createNotification()` in lib/notifications.ts

4. **Earnings Calculated**
   - Triggered by: `/api/admin/revenue/calculate`
   - Sent directly in the API route after creating earnings records

5. **Payout Completed**
   - Triggered by: `/api/admin/payouts/process`
   - Sent directly in the API route after successful payout

6. **New Review**
   - Triggered by: `/api/reviews` (POST)
   - Via: `createNotification()` in lib/notifications.ts

7. **Weekly Summary**
   - Triggered by: Cron job every Monday
   - Via: `/api/cron/weekly-summary` endpoint

### Email Preference Checking

Before sending any email, the system:
1. Checks if user has enabled that notification type
2. Verifies user has an email address
3. Renders the email template
4. Sends via Resend

If any step fails, the error is logged but doesn't break the main operation.

## Unsubscribe Functionality

### Unsubscribe Link
Every email includes an unsubscribe link in the footer:
```
https://yourdomain.com/unsubscribe/{base64EncodedUserId}
```

### Unsubscribe Page
- Shows list of all email notification types
- Options:
  1. Unsubscribe from all
  2. Manage preferences (redirect to settings)
  3. Keep subscribed (go back)

## Testing

### Test Individual Emails

You can test email templates by calling the notification functions:

```typescript
import { createNotification } from '@/lib/notifications';

// Test new follower email
await createNotification('userId', 'NEW_FOLLOWER', {
  followerName: 'John Doe',
  followerId: 'followerUserId',
  followerAvatar: 'https://...',
});
```

### Test Weekly Summary

In development, you can trigger the weekly summary:

```bash
# GET request (only works in development)
curl http://localhost:3000/api/cron/weekly-summary
```

Or use the test function:

```typescript
import { sendTestWeeklySummary } from '@/lib/email-scheduler';

await sendTestWeeklySummary('creatorUserId');
```

## Email Best Practices

All email templates follow these best practices:

1. **Responsive Design** - Works on all devices
2. **Inline Styles** - For maximum email client compatibility
3. **Alt Text** - All images have descriptive alt text
4. **Fallback Fonts** - System fonts as fallbacks
5. **Unsubscribe Link** - In footer of every email
6. **Plain Text Alternative** - React Email handles this automatically
7. **Professional Branding** - Consistent colors and design
8. **Clear CTAs** - Prominent call-to-action buttons
9. **Personalization** - Uses recipient's name
10. **Mobile-First** - Optimized for mobile viewing

## Troubleshooting

### Emails Not Sending

1. Check Resend API key is correct
2. Verify EMAIL_FROM is a verified domain in Resend
3. Check server logs for errors
4. Verify user email preferences are enabled
5. Ensure user has an email address

### Cron Job Not Running

1. Verify `vercel.json` is deployed
2. Check Vercel dashboard for cron job logs
3. Verify CRON_SECRET is set correctly
4. Test manually with GET request in development

### Styling Issues

1. Email clients have limited CSS support
2. Use inline styles instead of CSS classes
3. Test with email testing tools like Litmus or Email on Acid
4. Preview with React Email dev server

## React Email Development

To preview and develop email templates:

```bash
# Install React Email CLI globally
npm install -g react-email

# Start preview server
cd /path/to/cpd-platform
react-email dev
```

This opens http://localhost:3000 with live previews of all email templates.

## Security Considerations

1. **CRON_SECRET** - Protects cron endpoints from unauthorized access
2. **Email Validation** - All email addresses are validated
3. **XSS Prevention** - User input is sanitized before including in emails
4. **Rate Limiting** - Consider adding rate limits to email endpoints
5. **Unsubscribe Token** - Uses base64 encoding (consider JWT for production)

## Performance

- Email sending is non-blocking (fire and forget)
- Failed emails don't break main operations
- Batch sending for weekly summaries
- Preference checking before rendering templates

## Future Enhancements

Consider implementing:
- [ ] Email analytics (open rates, click rates)
- [ ] A/B testing for email content
- [ ] Email queue for better reliability
- [ ] More granular preferences (e.g., daily digest)
- [ ] SMS notifications for critical events
- [ ] Push notifications
- [ ] Custom email templates per user type
- [ ] Localization/internationalization

## Support

For issues or questions:
1. Check the Resend documentation: https://resend.com/docs
2. Review React Email docs: https://react.email/docs
3. Check server logs for error messages
4. Test email preferences API endpoints
5. Verify environment variables are set correctly
