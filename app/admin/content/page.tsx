import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ContentList from './ContentList'

export const metadata = {
  title: 'Content Moderation - Admin',
  description: 'Review and approve pending content submissions',
}

async function getPendingContent() {
  // Fetch pending courses (not draft, not published)
  const pendingCourses = await prisma.course.findMany({
    where: {
      isDraft: false,
      published: false,
      rejectedAt: null,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      submittedAt: 'desc',
    },
  })

  // Fetch pending publications
  const pendingPublications = await prisma.publication.findMany({
    where: {
      published: false,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Fetch all published content for "All Content" tab
  const allCourses = await prisma.course.findMany({
    where: {
      isDraft: false,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const allPublications = await prisma.publication.findMany({
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Fetch all categories for filtering
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return {
    pendingCourses,
    pendingPublications,
    allCourses,
    allPublications,
    categories,
  }
}

export default async function ContentModerationPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const data = await getPendingContent()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
          <p className="mt-2 text-gray-600">
            Review and approve pending courses and publications
          </p>
        </div>

        <ContentList
          pendingCourses={data.pendingCourses}
          pendingPublications={data.pendingPublications}
          allCourses={data.allCourses}
          allPublications={data.allPublications}
          categories={data.categories}
        />
      </div>
    </div>
  )
}
