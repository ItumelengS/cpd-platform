import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

export const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_for_build');

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

interface SendEmailResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface EmailPreferences {
  newFollowers?: boolean;
  courseApproved?: boolean;
  courseRejected?: boolean;
  earnings?: boolean;
  payouts?: boolean;
  reviews?: boolean;
  weeklySummary?: boolean;
}

/**
 * Check if a user has enabled email notifications for a specific type
 */
export async function checkEmailPreference(
  userId: string,
  preferenceType: keyof EmailPreferences
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailPreferences: true },
    });

    if (!user || !user.emailPreferences) {
      return true; // Default to enabled if no preferences set
    }

    const preferences = user.emailPreferences as EmailPreferences;
    return preferences[preferenceType] !== false; // Default to true if not explicitly false
  } catch (error) {
    console.error('Error checking email preference:', error);
    return true; // Default to enabled on error
  }
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailParams): Promise<SendEmailResult> {
  try {
    const fromEmail = process.env.EMAIL_FROM || 'notifications@yourdomain.com';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user email for sending notifications
 */
export async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    return user?.email || null;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}
