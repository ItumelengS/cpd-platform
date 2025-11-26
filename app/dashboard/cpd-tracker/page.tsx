import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import CPDTrackerDashboard from "./CPDTrackerDashboard"
import { getRequirements, areCEUsValid, areCEUsExpiringSoon } from "@/lib/hpcsa-requirements"

export const metadata = {
  title: "CPD Tracker",
  description: "Track your annual CPD hours and requirements",
}

export default async function CPDTrackerPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Get user info including HPCSA profession
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      profession: true,
      isInCommunityService: true,
      isRegistrar: true,
      cpdExemptUntil: true,
    },
  })

  // Check if user is exempt from CPD
  const isExempt = !!(user?.isInCommunityService || user?.isRegistrar ||
                  (user?.cpdExemptUntil && user.cpdExemptUntil > new Date()))

  // Get user's HPCSA requirements
  const requirements = getRequirements(user?.profession || null)

  // Get current year
  const currentYear = new Date().getFullYear()
  const yearStart = new Date(currentYear, 0, 1)
  const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59)

  // Get user's certificates for current year (only valid CEUs as per Dec 2024 guidelines)
  const allCertificates = await prisma.certificate.findMany({
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
          cpdContentType: true,
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

  // Filter to only valid (non-expired) CEUs
  const certificates = allCertificates.filter((cert) => areCEUsValid(cert.ceuExpiryDate))

  // Find expiring and expired CEUs
  const expiringCertificates = certificates.filter((cert) => areCEUsExpiringSoon(cert.ceuExpiryDate))
  const expiredCertificates = allCertificates.filter((cert) => !areCEUsValid(cert.ceuExpiryDate))

  // Calculate total CPD hours (clinical + ethics)
  const totalHours = certificates.reduce((sum, cert) => sum + cert.ceuHours, 0)

  // Calculate clinical CEUs
  const clinicalHours = certificates
    .filter((cert) => cert.contentType === 'CLINICAL')
    .reduce((sum, cert) => sum + cert.ceuHours, 0)

  // Calculate ethics CEUs
  const ethicsHours = certificates
    .filter((cert) => cert.contentType === 'ETHICS_HUMAN_RIGHTS_LAW')
    .reduce((sum, cert) => sum + cert.ceuHours, 0)

  // Group hours by category
  const hoursByCategory: Record<string, number> = {}
  certificates.forEach((cert) => {
    const category = cert.course.category.name
    hoursByCategory[category] = (hoursByCategory[category] || 0) + cert.ceuHours
  })

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
      clinicalHours={clinicalHours}
      ethicsHours={ethicsHours}
      annualTarget={requirements.totalCEUs}
      minClinicalTarget={requirements.minClinicalCEUs}
      minEthicsTarget={requirements.minEthicsCEUs}
      profession={requirements.profession}
      hoursByCategory={hoursByCategory}
      certificates={certificates}
      expiringCertificates={expiringCertificates}
      expiredCertificates={expiredCertificates}
      coursesInProgress={coursesInProgress}
      recommendedCourses={recommendedCourses}
      currentYear={currentYear}
      isExempt={isExempt}
      exemptReason={
        user?.isInCommunityService ? "Community Service" :
        user?.isRegistrar ? "Registrar Training" :
        user?.cpdExemptUntil ? `Exempt until ${user.cpdExemptUntil.toLocaleDateString()}` :
        null
      }
    />
  )
}
