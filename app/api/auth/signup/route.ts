import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
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

    // Create user and consent record in a transaction
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // Password is already hashed from client
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

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    )
  }
}
