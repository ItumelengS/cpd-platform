import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CourseList from './CourseList';

export default async function CreatorCoursesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Verify user is approved creator
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { creatorStatus: true },
  });

  if (user?.creatorStatus !== 'APPROVED') {
    redirect('/dashboard/creator/apply');
  }

  // Fetch all courses for the creator
  const courses = await prisma.course.findMany({
    where: {
      creatorId: session.user.id,
    },
    include: {
      _count: {
        select: {
          sections: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Categorize courses
  const drafts = courses.filter(c => c.isDraft);
  const underReview = courses.filter(c => !c.isDraft && !c.published && !c.rejectedAt);
  const published = courses.filter(c => c.published);
  const rejected = courses.filter(c => c.rejectedAt !== null);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Link
          href="/dashboard/creator/courses/new"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Create New Course
        </Link>
      </div>

      <CourseList
        drafts={drafts}
        underReview={underReview}
        published={published}
        rejected={rejected}
      />
    </div>
  );
}
