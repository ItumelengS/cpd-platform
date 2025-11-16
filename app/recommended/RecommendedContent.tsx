'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface RecommendedCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  slug: string;
  category: string;
  difficulty: string;
  cpdHours: number;
  price: number;
  creatorName: string;
  creatorAvatar: string | null;
  reason: string;
}

interface RecommendationSection {
  title: string;
  courses: RecommendedCourse[];
}

export default function RecommendedContent() {
  const [sections, setSections] = useState<RecommendationSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations');

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setSections(data.sections);
    } catch (err) {
      setError('Failed to load recommendations. Please try again.');
      console.error('Recommendations error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-8 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex-shrink-0 w-80 bg-white rounded-lg border border-gray-200 p-4">
                  <div className="h-48 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-100 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
        <p className="text-gray-600 mb-6">
          Start enrolling in courses to get personalized recommendations!
        </p>
        <Link
          href="/courses"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {sections.map((section, idx) => (
        <div key={idx}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {section.title}
          </h2>

          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {section.courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface CourseCardProps {
  course: RecommendedCourse;
}

function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="flex-shrink-0 w-80 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden group"
    >
      {/* Thumbnail */}
      <div className="relative w-full h-48 bg-gray-200">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-600">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}

        {/* Reason Badge */}
        <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
          {course.reason}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {course.description}
        </p>

        {/* Creator */}
        <div className="flex items-center gap-2 mb-3">
          {course.creatorAvatar ? (
            <div className="relative w-6 h-6 rounded-full overflow-hidden">
              <Image
                src={course.creatorAvatar}
                alt={course.creatorName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
              {course.creatorName.charAt(0)}
            </div>
          )}
          <span className="text-sm text-gray-600">{course.creatorName}</span>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
            <span className="px-2 py-1 bg-gray-100 rounded">{course.category}</span>
            <span>{course.difficulty}</span>
            <span>{course.cpdHours} hrs</span>
          </div>

          <div className="text-lg font-bold text-gray-900">
            {course.price === 0 ? 'Free' : `R${course.price}`}
          </div>
        </div>
      </div>
    </Link>
  );
}
