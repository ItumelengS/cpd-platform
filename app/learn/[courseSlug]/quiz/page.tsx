import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import FinalQuizClient from "./FinalQuizClient"

export default async function FinalQuizPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>
}) {
  const { courseSlug } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch course
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
  })

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Course not found</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Return to dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: course.id,
      },
    },
  })

  if (!enrollment) {
    redirect(`/courses/${courseSlug}`)
  }

  // Fetch final quiz questions (sectionId is null)
  const questions = await prisma.question.findMany({
    where: {
      courseId: course.id,
      sectionId: null,
    },
    orderBy: { order: "asc" },
    select: {
      id: true,
      questionText: true,
      context: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      order: true,
      // SECURITY: correctAnswer NOT selected
    },
  })

  // Get user's attempt count
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      userId: session.user.id,
      questionId: { in: questions.map((q) => q.id) },
    },
    distinct: ["attemptNumber"],
    select: { attemptNumber: true },
  })

  const attemptNumber = Math.max(...attempts.map((a) => a.attemptNumber), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                ← Back to Dashboard
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="font-semibold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-600">Final Quiz</p>
              </div>
            </div>
            <div className="text-gray-600">
              Attempt {attemptNumber + 1} of 3
            </div>
          </div>
        </div>
      </div>

      <FinalQuizClient
        courseId={course.id}
        courseSlug={courseSlug}
        courseTitle={course.title}
        questions={questions}
        attemptNumber={attemptNumber}
        maxAttempts={3}
      />
    </div>
  )
}
