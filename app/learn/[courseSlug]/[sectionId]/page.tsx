import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import SectionContent from "./SectionContent"

export default async function SectionLearnPage({
  params,
}: {
  params: Promise<{ courseSlug: string; sectionId: string }>
}) {
  const { courseSlug, sectionId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch section with course and questions
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: {
      course: {
        include: {
          sections: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, order: true },
          },
        },
      },
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          questionText: true,
          context: true,
          optionA: true,
          optionB: true,
          optionC: true,
          optionD: true,
          // SECURITY: correctAnswer and explanation are NOT selected for client
          // They are only fetched server-side in the API route
        },
      },
    },
  })

  if (!section || section.course.slug !== courseSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Section not found</p>
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
        courseId: section.courseId,
      },
    },
  })

  if (!enrollment) {
    redirect(`/courses/${courseSlug}`)
  }

  // Get progress for this section
  const progress = await prisma.progress.findUnique({
    where: {
      userId_sectionId: {
        userId: session.user.id,
        sectionId: section.id,
      },
    },
  })

  // Find current section index and next section
  const currentIndex = section.course.sections.findIndex((s) => s.id === sectionId)
  const nextSection = section.course.sections[currentIndex + 1]

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
                <h1 className="font-semibold text-gray-900">{section.course.title}</h1>
                <p className="text-sm text-gray-600">
                  Section {currentIndex + 1} of {section.course.sections.length}
                </p>
              </div>
            </div>
            {progress?.completed && (
              <div className="text-green-600 font-semibold flex items-center gap-2">
                <span>✓</span>
                <span>Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <SectionContent
        section={{
          id: section.id,
          title: section.title,
          content: section.content,
          minTimeSeconds: section.minTimeSeconds,
        }}
        questions={section.questions}
        nextSectionId={nextSection?.id}
        courseSlug={courseSlug}
        isCompleted={progress?.completed || false}
      />
    </div>
  )
}
