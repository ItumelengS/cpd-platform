"use client"

import { useState } from "react"
import CourseCard from "@/components/CourseCard"
import AdUnit from "@/components/AdUnit"

interface CoursesClientProps {
  courses: any[]
}

export default function CoursesClient({ courses }: CoursesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Get unique categories
  const categories = Array.from(new Set(courses.map((c) => c.category.name)))

  // Filter courses based on selected category
  const filteredCourses = selectedCategory
    ? courses.filter((course) => course.category.name === selectedCategory)
    : courses

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            selectedCategory === null
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
          }`}
        >
          All Courses
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            {selectedCategory
              ? `No courses available in ${selectedCategory}`
              : "No courses available yet"}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <>
              <CourseCard key={course.id} course={course} />
              {/* Add ad unit after every 6 courses */}
              {(index + 1) % 6 === 0 && index !== filteredCourses.length - 1 && (
                <div className="md:col-span-2 lg:col-span-3" key={`ad-${index}`}>
                  <AdUnit
                    slot="1234567890"
                    format="horizontal"
                    className="my-4"
                  />
                </div>
              )}
            </>
          ))}
        </div>
      )}
    </>
  )
}
