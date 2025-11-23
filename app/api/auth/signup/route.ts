import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

const limiter = rateLimit(RateLimitPresets.auth)

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await limiter(request)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      {
        status: 429,
        headers: rateLimitResult.headers,
      }
    )
  }
  try {
    const body = await request.json()
    const { name, email, password, ageVerified, termsAccepted, privacyAccepted, marketingEmails } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!ageVerified || !termsAccepted || !privacyAccepted) {
      return NextResponse.json(
        { error: "You must accept the required consents" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    const now = new Date();

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user and consent record in a transaction
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // Password is already hashed from client
        verificationToken,
        verificationTokenExpiry,
      },
    })

    // Create consent record
    await prisma.userConsent.create({
      data: {
        userId: user.id,
        ageVerified: ageVerified,
        ageVerifiedAt: now,
        termsAccepted: termsAccepted,
        termsAcceptedAt: now,
        privacyAccepted: privacyAccepted,
        privacyAcceptedAt: now,
        marketingEmails: marketingEmails || false,
        marketingEmailsAt: marketingEmails ? now : null,
      },
    })

    // Send verification email
    try {
      const { sendEmail } = await import('@/lib/email');
      const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/verify-email?token=${verificationToken}`;

      await sendEmail({
        to: email,
        subject: 'Verify Your RadSciCPD Email',
        html: `
          <h2>Welcome to RadSciCPD!</h2>
          <p>Hi ${name},</p>
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
    } catch (emailError) {
      // Log email error but don't fail signup
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to send verification email:', emailError);
      }
    }

    return NextResponse.json(
      {
        message: "Account created successfully! Please check your email to verify your account.",
        userId: user.id,
        emailSent: true
      },
      {
        status: 201,
        headers: rateLimitResult.headers,
      }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    )
  }
}
