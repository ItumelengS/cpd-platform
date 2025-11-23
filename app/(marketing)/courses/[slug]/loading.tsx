export default function CourseDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header Skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              <div className="flex items-center gap-6 mb-6">
                <div className="h-4 bg-gray-100 rounded w-24"></div>
                <div className="h-4 bg-gray-100 rounded w-24"></div>
                <div className="h-4 bg-gray-100 rounded w-24"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              </div>
            </div>

            {/* Course Content Skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="h-5 bg-gray-200 rounded w-64 mb-2"></div>
                    <div className="ml-4 space-y-2">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-4 bg-gray-100 rounded w-full"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card Skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24 animate-pulse">
              <div className="h-48 bg-gray-200 rounded mb-6"></div>
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-12 bg-blue-200 rounded w-full mb-6"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 bg-gray-100 rounded w-32"></div>
                    <div className="h-4 bg-gray-100 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
