import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';
import crypto from 'crypto';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const limiter = rateLimit(RateLimitPresets.passwordReset);

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await limiter(request);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many password reset attempts. Please try again later.' },
      {
        status: 429,
        headers: rateLimitResult.headers,
      }
    );
  }
  try {
    const body = await request.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json(
        {
          message: 'If an account exists with that email, you will receive a password reset link.',
        },
        {
          headers: rateLimitResult.headers,
        }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: 'Reset Your RadSciCPD Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>You requested to reset your password for your RadSciCPD account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <br/>
        <p>Best regards,<br/>The RadSciCPD Team</p>
      `,
    });

    return NextResponse.json(
      {
        message: 'If an account exists with that email, you will receive a password reset link.',
      },
      {
        headers: rateLimitResult.headers,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
