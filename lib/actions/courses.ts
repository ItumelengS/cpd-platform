"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getAllCourses() {
  try {
    const courses = await prisma.course.findMany({
      where: { published: true },
      include: {
        category: true,
        _count: {
          select: {
            sections: true,
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return { courses, error: null }
  } catch (error) {
    console.error("Error fetching courses:", error)
    return { courses: null, error: "Failed to fetch courses" }
  }
}

export async function getCourseBySlug(slug: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        sections: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
      },
    })

    if (!course) {
      return { course: null, error: "Course not found" }
    }

    return { course, error: null }
  } catch (error) {
    console.error("Error fetching course:", error)
    return { course: null, error: "Failed to fetch course" }
  }
}

export async function enrollInCourse(courseId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to enroll" }
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    })

    if (existingEnrollment) {
      return { success: false, error: "Already enrolled in this course" }
    }

    // Create enrollment
    await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/courses")

    return { success: true, error: null }
  } catch (error) {
    console.error("Error enrolling in course:", error)
    return { success: false, error: "Failed to enroll in course" }
  }
}

export async function checkEnrollment(courseId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { enrolled: false, error: null }
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    })

    return { enrolled: !!enrollment, error: null }
  } catch (error) {
    console.error("Error checking enrollment:", error)
    return { enrolled: false, error: "Failed to check enrollment" }
  }
}
