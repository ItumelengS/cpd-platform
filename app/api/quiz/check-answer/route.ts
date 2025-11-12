import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Rate limiting storage (in production, use Redis)
const attemptTracker = new Map<string, { count: number; timestamp: number }>()

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
    const { questionId, answer, timeSpent } = body

    if (!questionId || !answer || typeof timeSpent !== "number") {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }

    // Validate answer format
    if (!["A", "B", "C", "D"].includes(answer)) {
      return NextResponse.json(
        { error: "Invalid answer format" },
        { status: 400 }
      )
    }

    // 3. Rate limiting (30 submissions per hour)
    const rateLimitKey = `${session.user.id}:quiz`
    const now = Date.now()
    const userAttempts = attemptTracker.get(rateLimitKey)

    if (userAttempts) {
      // Reset counter if more than 1 hour has passed
      if (now - userAttempts.timestamp > 3600000) {
        attemptTracker.set(rateLimitKey, { count: 1, timestamp: now })
      } else if (userAttempts.count >= 30) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        )
      } else {
        userAttempts.count++
      }
    } else {
      attemptTracker.set(rateLimitKey, { count: 1, timestamp: now })
    }

    // 4. Fetch question from database (SERVER-SIDE ONLY)
    // CRITICAL: correctAnswer is fetched here and NEVER sent to client
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        correctAnswer: true,
        explanation: true,
      },
    })

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      )
    }

    // 5. Compare user answer to correct answer (SERVER-SIDE)
    const isCorrect = answer.toUpperCase() === question.correctAnswer.toUpperCase()

    // 6. Count existing attempts for this question
    const existingAttempts = await prisma.quizAttempt.count({
      where: {
        userId: session.user.id,
        questionId,
      },
    })

    // 7. Log attempt in database
    await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        questionId,
        answer: answer.toUpperCase(),
        isCorrect,
        attemptNumber: existingAttempts + 1,
        timeSpent,
      },
    })

    // 8. Check for suspicious activity
    const recentAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(now - 300000), // Last 5 minutes
        },
      },
    })

    // Flag suspicious patterns
    if (recentAttempts.length > 20) {
      const correctCount = recentAttempts.filter((a) => a.isCorrect).length
      const accuracy = correctCount / recentAttempts.length

      // >20 attempts in 5 minutes with 100% accuracy is suspicious
      if (accuracy === 1.0) {
        console.warn(`Suspicious activity detected for user ${session.user.id}`)
      }

      // Check average time per question
      const avgTime = recentAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / recentAttempts.length
      if (avgTime < 1000) { // Less than 1 second per question
        console.warn(`Suspiciously fast responses from user ${session.user.id}`)
      }
    }

    // 9. Return result (NEVER include correctAnswer)
    return NextResponse.json({
      isCorrect,
      explanation: isCorrect ? question.explanation : undefined,
    })
  } catch (error) {
    console.error("Quiz check error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
