import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

const verifySchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

const verifyLimiter = rateLimit(RateLimitPresets.auth);
const resendLimiter = rateLimit(RateLimitPresets.emailVerification);

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await verifyLimiter(request);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many verification attempts. Please try again later.' },
      {
        status: 429,
        headers: rateLimitResult.headers,
      }
    );
  }
  try {
    const body = await request.json();
    const validation = verifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    const { token } = validation.data;

    // Find user with valid verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Mark email as verified and clear verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return NextResponse.json(
      {
        message: 'Email verified successfully! You can now log in.',
      },
      {
        headers: rateLimitResult.headers,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}

// Resend verification email
export async function GET(request: NextRequest) {
  // Apply rate limiting for resend
  const rateLimitResult = await resendLimiter(request);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many resend attempts. Please try again later.' },
      {
        status: 429,
        headers: rateLimitResult.headers,
      }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json(
        {
          message: 'If an account exists with that email, a verification link has been sent.',
        },
        {
          headers: rateLimitResult.headers,
        }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // Send verification email
    const { sendEmail } = await import('@/lib/email');
    const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: email,
      subject: 'Verify Your RadSciCPD Email',
      html: `
        <h2>Welcome to RadSciCPD!</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>Thanks for signing up! Please verify your email address to get started.</p>
        <p><a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Verify Email Address</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <br/>
        <p>Best regards,<br/>The RadSciCPD Team</p>
      `,
    });

    return NextResponse.json(
      {
        message: 'If an account exists with that email, a verification link has been sent.',
      },
      {
        headers: rateLimitResult.headers,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
