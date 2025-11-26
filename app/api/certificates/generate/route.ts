import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateCEUExpiryDate } from "@/lib/hpcsa-requirements"

export async function POST(request: Request) {
  try {
    // 1. Verify authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 2. Parse and validate input
    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }

    // 3. Check if course is completed
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
      include: {
        course: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 }
      )
    }

    if (!enrollment.completedAt) {
      return NextResponse.json(
        { error: "Course not completed yet" },
        { status: 400 }
      )
    }

    // 4. Calculate final quiz score
    const finalQuizQuestions = await prisma.question.findMany({
      where: {
        courseId,
        sectionId: null,
      },
      select: { id: true },
    })

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId: session.user.id,
        questionId: {
          in: finalQuizQuestions.map((q) => q.id),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      distinct: ["questionId"],
    })

    const totalQuestions = finalQuizQuestions.length
    const correctAnswers = attempts.filter((a) => a.isCorrect).length
    const score = (correctAnswers / totalQuestions) * 100

    if (score < 70) {
      return NextResponse.json(
        { error: "Score below 70% required for certificate" },
        { status: 400 }
      )
    }

    // 5. Check if certificate already exists
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    })

    if (existingCertificate) {
      return NextResponse.json({
        certificate: existingCertificate,
        message: "Certificate already exists",
      })
    }

    // 6. Generate unique certificate ID
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const certificateId = `CERT-${timestamp}-${random}`

    // 7. Create certificate with HPCSA compliance fields
    const issuedAt = new Date()
    const ceuExpiryDate = calculateCEUExpiryDate(issuedAt) // 12 months as per Dec 2024 guidelines

    const certificate = await prisma.certificate.create({
      data: {
        userId: session.user.id,
        courseId,
        certificateId,
        score,
        issuedAt,
        ceuExpiryDate,
        ceuHours: enrollment.course.cpdHours,
        contentType: enrollment.course.cpdContentType,
      },
      include: {
        course: true,
        user: true,
      },
    })

    return NextResponse.json({
      certificate,
      message: "Certificate generated successfully",
    })
  } catch (error) {
    console.error("Certificate generation error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
