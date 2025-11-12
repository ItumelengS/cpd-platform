import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // 3. Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 }
      )
    }

    // 4. Get all final quiz questions for this course (sectionId is null)
    const finalQuizQuestions = await prisma.question.findMany({
      where: {
        courseId,
        sectionId: null, // Final quiz questions have no section
      },
      select: {
        id: true,
      },
    })

    if (finalQuizQuestions.length === 0) {
      return NextResponse.json(
        { error: "No final quiz questions found" },
        { status: 404 }
      )
    }

    // 5. Get user's latest attempts for these questions
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

    // 6. Calculate score
    const totalQuestions = finalQuizQuestions.length
    const correctAnswers = attempts.filter((a) => a.isCorrect).length
    const score = (correctAnswers / totalQuestions) * 100
    const passed = score >= 70

    // 7. Count attempt number
    const previousAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: session.user.id,
        questionId: {
          in: finalQuizQuestions.map((q) => q.id),
        },
      },
      distinct: ["attemptNumber"],
      select: {
        attemptNumber: true,
      },
    })

    const maxAttemptNumber = Math.max(...previousAttempts.map((a) => a.attemptNumber), 0)

    // 8. If passed, update enrollment as completed
    if (passed && !enrollment.completedAt) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          completedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      score,
      passed,
      attempts: maxAttemptNumber,
      correctAnswers,
      totalQuestions,
    })
  } catch (error) {
    console.error("Final quiz submission error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
