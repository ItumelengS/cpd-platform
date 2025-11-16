import { prisma } from '@/lib/prisma';
import { sendEmail, checkEmailPreference, getUserEmail } from '@/lib/email';
import { renderToStaticMarkup } from 'react-dom/server';
import NewFollowerEmail from '@/emails/NewFollowerEmail';
import CoursePublishedEmail from '@/emails/CoursePublishedEmail';
import CourseRejectedEmail from '@/emails/CourseRejectedEmail';
import NewReviewEmail from '@/emails/NewReviewEmail';

export type NotificationType =
  | 'NEW_FOLLOWER'
  | 'NEW_COURSE'
  | 'COURSE_APPROVED'
  | 'COURSE_REJECTED'
  | 'COURSE_PUBLISHED'
  | 'NEW_REVIEW'
  | 'REVIEW_RESPONSE'
  | 'REVIEW_REPORTED';

interface NotificationData {
  followerName?: string;
  followerId?: string;
  followerAvatar?: string;
  courseTitle?: string;
  courseSlug?: string;
  reason?: string;
  reviewerName?: string;
  rating?: number;
  comment?: string;
  creatorName?: string;
  [key: string]: any;
}

interface NotificationContent {
  title: string;
  message: string;
  link?: string;
}

function formatNotification(
  type: NotificationType,
  data: NotificationData
): NotificationContent {
  switch (type) {
    case 'NEW_FOLLOWER':
      return {
        title: 'New Follower',
        message: `${data.followerName} started following you`,
        link: data.followerId ? `/creator/profile/${data.followerId}` : undefined,
      };
    case 'NEW_COURSE':
      return {
        title: 'New Course Published',
        message: `${data.followerName} published a new course: ${data.courseTitle}`,
        link: data.courseSlug ? `/courses/${data.courseSlug}` : undefined,
      };
    case 'COURSE_APPROVED':
      return {
        title: 'Course Approved',
        message: `Your course "${data.courseTitle}" has been approved and is now live!`,
        link: data.courseSlug ? `/courses/${data.courseSlug}` : undefined,
      };
    case 'COURSE_REJECTED':
      return {
        title: 'Course Rejected',
        message: `Your course "${data.courseTitle}" was not approved. Reason: ${data.reason || 'No reason provided'}`,
        link: data.courseSlug ? `/creator/dashboard/courses` : undefined,
      };
    case 'COURSE_PUBLISHED':
      return {
        title: 'Course Published',
        message: `${data.followerName} published a new course: ${data.courseTitle}`,
        link: data.courseSlug ? `/courses/${data.courseSlug}` : undefined,
      };
    case 'NEW_REVIEW':
      return {
        title: 'New Review',
        message: `${data.reviewerName || 'Someone'} left a ${data.rating}-star review on "${data.courseTitle}"`,
        link: data.courseSlug ? `/courses/${data.courseSlug}#reviews` : undefined,
      };
    case 'REVIEW_RESPONSE':
      return {
        title: 'Creator Response',
        message: `${data.creatorName} responded to your review on "${data.courseTitle}"`,
        link: data.courseSlug ? `/courses/${data.courseSlug}#reviews` : undefined,
      };
    case 'REVIEW_REPORTED':
      return {
        title: 'Review Reported',
        message: `${data.reporterName} reported a review by ${data.reviewerName} on "${data.courseTitle}". Reason: ${data.reason}`,
        link: `/admin/reviews`,
      };
    default:
      return {
        title: 'Notification',
        message: 'You have a new notification',
      };
  }
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  data: NotificationData = {}
) {
  try {
    const { title, message, link } = formatNotification(type, data);

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        read: false,
        data: data as any,
      },
    });

    // Send email notification if user has enabled it
    await sendEmailNotification(userId, type, data);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

async function sendEmailNotification(
  userId: string,
  type: NotificationType,
  data: NotificationData
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    // Map notification types to email preference keys
    const preferenceMap: Record<NotificationType, string> = {
      NEW_FOLLOWER: 'newFollowers',
      COURSE_APPROVED: 'courseApproved',
      COURSE_REJECTED: 'courseRejected',
      NEW_REVIEW: 'reviews',
      NEW_COURSE: 'weeklySummary',
      COURSE_PUBLISHED: 'courseApproved',
      REVIEW_RESPONSE: 'reviews',
      REVIEW_REPORTED: 'reviews',
    };

    const preferenceKey = preferenceMap[type];
    if (!preferenceKey) {
      return; // No email for this type
    }

    // Check if user wants this type of email
    const shouldSendEmail = await checkEmailPreference(userId, preferenceKey as any);
    if (!shouldSendEmail) {
      return;
    }

    // Get user email
    const userEmail = await getUserEmail(userId);
    if (!userEmail) {
      return;
    }

    // Get user info for email personalization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const userName = user?.name || 'there';

    let emailHtml = '';
    let subject = '';

    // Generate email based on type
    switch (type) {
      case 'NEW_FOLLOWER':
        subject = `${data.followerName} started following you`;
        emailHtml = renderToStaticMarkup(
          NewFollowerEmail({
            followerName: data.followerName || 'Someone',
            followerAvatar: data.followerAvatar,
            creatorName: userName,
            followerProfileUrl: data.followerId
              ? `${baseUrl}/creator/profile/${data.followerId}`
              : baseUrl,
          })
        );
        break;

      case 'COURSE_APPROVED':
      case 'COURSE_PUBLISHED':
        subject = `Your course "${data.courseTitle}" is now live!`;
        emailHtml = renderToStaticMarkup(
          CoursePublishedEmail({
            courseName: data.courseTitle || 'Your Course',
            courseSlug: data.courseSlug || '',
            creatorName: userName,
          })
        );
        break;

      case 'COURSE_REJECTED':
        subject = `Update on your course submission: "${data.courseTitle}"`;
        emailHtml = renderToStaticMarkup(
          CourseRejectedEmail({
            courseName: data.courseTitle || 'Your Course',
            rejectionReason: data.reason || 'No reason provided',
            creatorName: userName,
          })
        );
        break;

      case 'NEW_REVIEW':
        subject = `New ${data.rating}-star review on "${data.courseTitle}"`;
        emailHtml = renderToStaticMarkup(
          NewReviewEmail({
            reviewerName: data.reviewerName || 'A user',
            rating: data.rating || 5,
            comment: data.comment,
            courseName: data.courseTitle || 'Your Course',
            courseSlug: data.courseSlug || '',
            reviewUrl: data.courseSlug
              ? `${baseUrl}/courses/${data.courseSlug}#reviews`
              : baseUrl,
          })
        );
        break;

      default:
        return; // No email template for this type
    }

    if (emailHtml && subject) {
      await sendEmail({
        to: userEmail,
        subject,
        html: emailHtml,
      });
    }
  } catch (error) {
    // Don't throw - email sending is non-critical
    console.error('Error sending email notification:', error);
  }
}

export async function markNotificationsAsRead(notificationIds: string[]) {
  try {
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
      },
      data: {
        read: true,
      },
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
}

export async function clearAllNotifications(userId: string) {
  try {
    await prisma.notification.deleteMany({
      where: {
        userId,
      },
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    throw error;
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}
