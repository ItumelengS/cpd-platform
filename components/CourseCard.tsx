'use client';

import Link from "next/link"
import Image from "next/image"
import { Course, Category } from "@prisma/client"

type CourseWithCategory = Course & {
  category: Category
  _count?: {
    sections: number
    enrollments: number
  }
}

export default function CourseCard({ course }: { course: CourseWithCategory }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="block bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="text-6xl">{course.category.icon || "📚"}</div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category Badge */}
        <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          {course.category.name}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Meta Information */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{course.cpdHours} CPD Hours</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📊</span>
            <span>{course.difficulty}</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            {course.price === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              <span>R{course.price}</span>
            )}
          </div>
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            View Course
          </div>
        </div>
      </div>
    </Link>
  )
}
