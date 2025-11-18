import { prisma } from '@/lib/prisma';
import { sendEmail, checkEmailPreference } from '@/lib/email';
import { render } from '@react-email/render';
import WeeklySummaryEmail from '@/emails/WeeklySummaryEmail';

/**
 * Send weekly summary emails to all creators
 * This function should be called by a cron job every Monday
 *
 * For Vercel Cron:
 * Create a file at: app/api/cron/weekly-summary/route.ts
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/weekly-summary",
 *     "schedule": "0 9 * * 1"
 *   }]
 * }
 *
 * For external scheduler (like GitHub Actions, AWS EventBridge):
 * Make a POST request to: /api/cron/weekly-summary
 * With authorization header matching CRON_SECRET env var
 */
export async function sendWeeklySummaryEmails() {
  try {
    console.log('Starting weekly summary email job...');

    // Calculate date range for last week
    const today = new Date();
    const lastWeekEnd = new Date(today);
    lastWeekEnd.setDate(today.getDate() - 1); // Yesterday
    lastWeekEnd.setHours(23, 59, 59, 999);

    const lastWeekStart = new Date(lastWeekEnd);
    lastWeekStart.setDate(lastWeekEnd.getDate() - 6); // 7 days ago
    lastWeekStart.setHours(0, 0, 0, 0);

    console.log(`Calculating stats from ${lastWeekStart.toISOString()} to ${lastWeekEnd.toISOString()}`);

    // Get all creators
    const creators = await prisma.user.findMany({
      where: {
        OR: [
          { isCreator: true },
          { role: 'CREATOR' },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(`Found ${creators.length} creators`);

    let emailsSent = 0;
    let emailsSkipped = 0;
    let emailsFailed = 0;

    for (const creator of creators) {
      try {
        // Check if creator wants weekly summary emails
        const shouldSend = await checkEmailPreference(creator.id, 'weeklySummary');
        if (!shouldSend) {
          emailsSkipped++;
          continue;
        }

        if (!creator.email) {
          emailsSkipped++;
          continue;
        }

        // Get views for this creator in the last week
        const views = await prisma.view.count({
          where: {
            creatorId: creator.id,
            createdAt: {
              gte: lastWeekStart,
              lte: lastWeekEnd,
            },
          },
        });

        // Get new followers in the last week
        const newFollowers = await prisma.follow.count({
          where: {
            followingId: creator.id,
            createdAt: {
              gte: lastWeekStart,
              lte: lastWeekEnd,
            },
          },
        });

        // Calculate earnings for this week (approximate based on views)
        // Note: Actual earnings are calculated monthly, this is an estimate
        const avgRevenuePerView = 0.01; // Estimated $0.01 per view
        const platformShare = 0.7; // Creator gets 70%
        const estimatedEarnings = views * avgRevenuePerView * platformShare;

        // Get top performing course this week
        const topCourseViews = await prisma.view.groupBy({
          by: ['courseId'],
          where: {
            creatorId: creator.id,
            courseId: { not: null },
            createdAt: {
              gte: lastWeekStart,
              lte: lastWeekEnd,
            },
          },
          _count: {
            id: true,
          },
          orderBy: {
            _count: {
              id: 'desc',
            },
          },
          take: 1,
        });

        let topCourse = undefined;
        if (topCourseViews.length > 0 && topCourseViews[0].courseId) {
          const course = await prisma.course.findUnique({
            where: { id: topCourseViews[0].courseId },
            select: {
              title: true,
              slug: true,
            },
          });

          if (course) {
            topCourse = {
              name: course.title,
              views: topCourseViews[0]._count.id,
              slug: course.slug,
            };
          }
        }

        // Send email
        const emailHtml = await render(
          WeeklySummaryEmail({
            creatorName: creator.name || 'there',
            weekStats: {
              views,
              followers: newFollowers,
              earnings: estimatedEarnings,
              topCourse,
            },
          })
        );

        const result = await sendEmail({
          to: creator.email,
          subject: 'Your week at a glance on CPD Platform',
          html: emailHtml,
        });

        if (result.success) {
          emailsSent++;
          console.log(`Sent weekly summary to ${creator.email}`);
        } else {
          emailsFailed++;
          console.error(`Failed to send weekly summary to ${creator.email}:`, result.error);
        }
      } catch (error) {
        emailsFailed++;
        console.error(`Error processing weekly summary for creator ${creator.id}:`, error);
      }
    }

    const summary = {
      totalCreators: creators.length,
      emailsSent,
      emailsSkipped,
      emailsFailed,
      dateRange: {
        start: lastWeekStart.toISOString(),
        end: lastWeekEnd.toISOString(),
      },
    };

    console.log('Weekly summary job completed:', summary);
    return summary;
  } catch (error) {
    console.error('Error in weekly summary job:', error);
    throw error;
  }
}

/**
 * Test function to send a weekly summary to a specific creator
 * Useful for testing the email template
 */
export async function sendTestWeeklySummary(creatorId: string) {
  const creator = await prisma.user.findUnique({
    where: { id: creatorId },
    select: { email: true, name: true },
  });

  if (!creator?.email) {
    throw new Error('Creator not found or has no email');
  }

  const emailHtml = await render(
    WeeklySummaryEmail({
      creatorName: creator.name || 'there',
      weekStats: {
        views: 127,
        followers: 5,
        earnings: 8.89,
        topCourse: {
          name: 'Introduction to Cardiology',
          views: 45,
          slug: 'intro-cardiology',
        },
      },
    })
  );

  return await sendEmail({
    to: creator.email,
    subject: '[TEST] Your week at a glance on CPD Platform',
    html: emailHtml,
  });
}
