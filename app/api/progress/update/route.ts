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
    const { sectionId, timeSpent } = body

    if (!sectionId || typeof timeSpent !== "number") {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }

    // 3. Fetch section to check minimum time requirement (SERVER-SIDE VALIDATION)
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      select: {
        id: true,
        minTimeSeconds: true,
      },
    })

    if (!section) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      )
    }

    // 4. Validate minimum time spent (prevent rushing through content)
    if (timeSpent < section.minTimeSeconds) {
      return NextResponse.json(
        {
          error: "Minimum time requirement not met",
          requiredSeconds: section.minTimeSeconds,
          providedSeconds: timeSpent,
        },
        { status: 400 }
      )
    }

    // 5. Create or update progress record
    const progress = await prisma.progress.upsert({
      where: {
        userId_sectionId: {
          userId: session.user.id,
          sectionId,
        },
      },
      update: {
        completed: true,
        timeSpent: {
          increment: timeSpent,
        },
        completedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        sectionId,
        completed: true,
        timeSpent,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      progress,
    })
  } catch (error) {
    console.error("Progress update error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
