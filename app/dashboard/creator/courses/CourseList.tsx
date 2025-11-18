'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  isDraft: boolean;
  published: boolean;
  submittedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  _count: {
    sections: number;
  };
}

interface CourseListProps {
  drafts: Course[];
  underReview: Course[];
  published: Course[];
  rejected: Course[];
}

export default function CourseList({
  drafts,
  underReview,
  published,
  rejected,
}: CourseListProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'drafts' | 'review' | 'published' | 'rejected'>('drafts');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    setDeletingId(courseId);
    try {
      const response = await fetch(`/api/creator/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete course');
      }

      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete course');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (courseId: string) => {
    if (!confirm('Are you sure you want to submit this course for review?')) {
      return;
    }

    setSubmittingId(courseId);
    try {
      const response = await fetch('/api/creator/courses/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit course');
      }

      router.refresh();
    } catch (error) {
      console.error('Submit error:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit course');
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusBadge = (course: Course) => {
    if (course.isDraft) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">Draft</span>;
    }
    if (course.rejectedAt) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-200 text-red-800">Rejected</span>;
    }
    if (course.published) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800">Published</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-200 text-yellow-800">Under Review</span>;
  };

  const renderCourseCard = (course: Course) => (
    <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            {getStatusBadge(course)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Sections:</span>
          <span className="ml-2 font-medium">{course._count.sections}</span>
        </div>
        <div>
          <span className="text-gray-500">Views:</span>
          <span className="ml-2 font-medium">0</span>
        </div>
        <div>
          <span className="text-gray-500">Created:</span>
          <span className="ml-2 font-medium">
            {new Date(course.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {course.rejectedAt && course.rejectionReason && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
          <p className="text-sm text-red-700">{course.rejectionReason}</p>
        </div>
      )}

      <div className="flex gap-2">
        {course.isDraft && (
          <>
            <Link
              href={`/dashboard/creator/courses/${course.id}/edit`}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </Link>
            <button
              onClick={() => handleSubmit(course.id)}
              disabled={submittingId === course.id}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {submittingId === course.id ? 'Submitting...' : 'Submit for Review'}
            </button>
            <button
              onClick={() => handleDelete(course.id)}
              disabled={deletingId === course.id}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {deletingId === course.id ? 'Deleting...' : 'Delete'}
            </button>
          </>
        )}

        {course.rejectedAt && (
          <>
            <Link
              href={`/dashboard/creator/courses/${course.id}/edit`}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(course.id)}
              disabled={deletingId === course.id}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {deletingId === course.id ? 'Deleting...' : 'Delete'}
            </button>
          </>
        )}

        {!course.isDraft && !course.rejectedAt && (
          <Link
            href={`/courses/${course.slug}`}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            View
          </Link>
        )}
      </div>
    </div>
  );

  const tabs = [
    { key: 'drafts' as const, label: 'Drafts', count: drafts.length },
    { key: 'review' as const, label: 'Under Review', count: underReview.length },
    { key: 'published' as const, label: 'Published', count: published.length },
    { key: 'rejected' as const, label: 'Rejected', count: rejected.length },
  ];

  const currentCourses = {
    drafts,
    review: underReview,
    published,
    rejected,
  }[activeTab];

  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Course Grid */}
      {currentCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentCourses.map(renderCourseCard)}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'drafts' && "You don't have any draft courses yet."}
            {activeTab === 'review' && "You don't have any courses under review."}
            {activeTab === 'published' && "You don't have any published courses yet."}
            {activeTab === 'rejected' && "You don't have any rejected courses."}
          </p>
          {activeTab === 'drafts' && (
            <div className="mt-6">
              <Link
                href="/dashboard/creator/courses/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create New Course
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
