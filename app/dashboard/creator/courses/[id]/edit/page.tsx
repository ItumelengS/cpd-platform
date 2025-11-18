import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import EditCourseForm from './EditCourseForm';

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Fetch course with sections and questions
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      sections: {
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!course) {
    redirect('/dashboard/creator/courses');
  }

  // Verify creator owns the course
  if (course.creatorId !== session.user.id) {
    redirect('/dashboard/creator/courses');
  }

  // Check if course can be edited
  const canEdit = course.isDraft || course.rejectedAt !== null;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Course</h1>

      {!canEdit ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Cannot Edit Course
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This course {course.published ? 'is published' : 'is under review'} and cannot be edited.
                  {course.published && ' If you need to make changes, please contact support.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EditCourseForm course={course as any} />
      )}
    </div>
  );
}
