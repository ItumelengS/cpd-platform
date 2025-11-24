import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import CPDTrackerDashboard from "./CPDTrackerDashboard"

export const metadata = {
  title: "CPD Tracker",
  description: "Track your annual CPD hours and requirements",
}

export default async function CPDTrackerPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Get current year
  const currentYear = new Date().getFullYear()
  const yearStart = new Date(currentYear, 0, 1)
  const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59)

  // Get user's certificates for current year
  const certificates = await prisma.certificate.findMany({
    where: {
      userId: session.user.id,
      issuedAt: {
        gte: yearStart,
        lte: yearEnd,
      },
    },
    include: {
      course: {
        select: {
          title: true,
          cpdHours: true,
          category: {
            select: {
              name: true,
              icon: true,
            },
          },
        },
      },
    },
    orderBy: {
      issuedAt: 'desc',
    },
  })

  // Calculate total CPD hours
  const totalHours = certificates.reduce((sum, cert) => sum + cert.course.cpdHours, 0)

  // Group hours by category
  const hoursByCategory: Record<string, number> = {}
  certificates.forEach((cert) => {
    const category = cert.course.category.name
    hoursByCategory[category] = (hoursByCategory[category] || 0) + cert.course.cpdHours
  })

  // Get user's subscription to check annual CPD hours target
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: 'ACTIVE',
    },
    include: {
      plan: true,
    },
  })

  // Determine annual target based on subscription or professional standards
  const annualTarget = subscription?.plan?.cpdPointsPerYear || 20 // Default 20 hours

  // Get courses in progress (not yet completed)
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: session.user.id,
      completedAt: null,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          cpdHours: true,
          category: {
            select: {
              name: true,
              icon: true,
            },
          },
        },
      },
    },
    take: 5,
    orderBy: {
      enrolledAt: 'desc',
    },
  })

  // Calculate overall progress percentage for in-progress courses
  const coursesInProgress = enrollments.map((enrollment) => {
    // TODO: Query progress separately to calculate actual progress percentage
    const progressPercentage = 0

    return {
      ...enrollment.course,
      progressPercentage,
      enrolledAt: enrollment.enrolledAt,
    }
  })

  // Get recommended courses to complete CPD hours
  const recommendedCoursesRaw = await prisma.course.findMany({
    where: {
      published: true,
      creatorId: { not: null },
      enrollments: {
        none: {
          userId: session.user.id,
        },
      },
    },
    include: {
      category: {
        select: {
          name: true,
          icon: true,
        },
      },
      creator: {
        select: {
          name: true,
        },
      },
    },
    take: 6,
    orderBy: {
      totalViews: 'desc',
    },
  })

  // Map to ensure type compatibility
  const recommendedCourses = recommendedCoursesRaw
    .filter((course) => course.creator?.name)
    .map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      cpdHours: course.cpdHours,
      price: course.price,
      category: course.category,
      creator: {
        name: course.creator!.name!,
      },
    }))

  return (
    <CPDTrackerDashboard
      totalHours={totalHours}
      annualTarget={annualTarget}
      hoursByCategory={hoursByCategory}
      certificates={certificates}
      coursesInProgress={coursesInProgress}
      recommendedCourses={recommendedCourses}
      currentYear={currentYear}
    />
  )
}
