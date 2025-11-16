import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CourseReview from './CourseReview'

export const metadata = {
  title: 'Review Course - Admin',
  description: 'Review and approve course content',
}

async function getCourseForReview(courseId: string) {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      category: true,
      sections: {
        include: {
          questions: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  })

  return course
}

export default async function CourseReviewPage({ params }: { params: { id: string } }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const course = await getCourseForReview(params.id)

  if (!course) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Review Course</h1>
              <p className="mt-2 text-gray-600">
                Review all content before approving for publication
              </p>
            </div>
            <a
              href="/admin/content"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Back to Content List
            </a>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Creator:</span>{' '}
                <span className="font-medium text-gray-900">
                  {course.creator?.name || course.creator?.email || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>{' '}
                <span className="font-medium text-gray-900">{course.category.name}</span>
              </div>
              <div>
                <span className="text-gray-500">CPD Hours:</span>{' '}
                <span className="font-medium text-gray-900">{course.cpdHours}</span>
              </div>
              <div>
                <span className="text-gray-500">Difficulty:</span>{' '}
                <span className="font-medium text-gray-900">{course.difficulty}</span>
              </div>
              <div>
                <span className="text-gray-500">Submitted:</span>{' '}
                <span className="font-medium text-gray-900">
                  {course.submittedAt
                    ? new Date(course.submittedAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              {course.sourceArticle && (
                <div>
                  <span className="text-gray-500">Source:</span>{' '}
                  <span className="font-medium text-gray-900">{course.sourceArticle}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
          </div>
        </div>

        {/* Course Content Preview */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Course Content</h3>

          {course.sections.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sections added yet</p>
          ) : (
            <div className="space-y-6">
              {course.sections.map((section, index) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Section {index + 1}: {section.title}
                    </h4>
                    <div className="mt-1 text-sm text-gray-500">
                      Min. time: {Math.floor(section.minTimeSeconds / 60)} minutes
                      {section.contentType !== 'text' && (
                        <span className="ml-2">
                          Type:{' '}
                          <span className="capitalize font-medium">{section.contentType}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="prose max-w-none mb-4">
                    <div className="text-gray-700 whitespace-pre-wrap">{section.content}</div>
                  </div>

                  {section.contentType === 'video' && section.videoUrl && (
                    <div className="mb-4">
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <a
                          href={section.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Video: {section.videoUrl}
                        </a>
                      </div>
                    </div>
                  )}

                  {section.contentType === 'pdf' && section.pdfUrl && (
                    <div className="mb-4">
                      <a
                        href={section.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View PDF: {section.pdfUrl}
                      </a>
                    </div>
                  )}

                  {section.questions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="text-md font-semibold text-gray-900 mb-3">
                        Quiz Questions ({section.questions.length})
                      </h5>
                      <div className="space-y-4">
                        {section.questions.map((question, qIndex) => (
                          <div
                            key={question.id}
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <p className="font-medium text-gray-900 mb-2">
                              {qIndex + 1}. {question.questionText}
                            </p>
                            {question.context && (
                              <p className="text-sm text-gray-600 mb-3 italic">
                                Context: {question.context}
                              </p>
                            )}
                            <div className="space-y-2 text-sm">
                              <div
                                className={`p-2 rounded ${
                                  question.correctAnswer === 'A'
                                    ? 'bg-green-100 border border-green-300'
                                    : 'bg-white border border-gray-200'
                                }`}
                              >
                                <span className="font-medium">A)</span> {question.optionA}
                                {question.correctAnswer === 'A' && (
                                  <span className="ml-2 text-green-700 font-medium">
                                    Correct
                                  </span>
                                )}
                              </div>
                              <div
                                className={`p-2 rounded ${
                                  question.correctAnswer === 'B'
                                    ? 'bg-green-100 border border-green-300'
                                    : 'bg-white border border-gray-200'
                                }`}
                              >
                                <span className="font-medium">B)</span> {question.optionB}
                                {question.correctAnswer === 'B' && (
                                  <span className="ml-2 text-green-700 font-medium">
                                    Correct
                                  </span>
                                )}
                              </div>
                              <div
                                className={`p-2 rounded ${
                                  question.correctAnswer === 'C'
                                    ? 'bg-green-100 border border-green-300'
                                    : 'bg-white border border-gray-200'
                                }`}
                              >
                                <span className="font-medium">C)</span> {question.optionC}
                                {question.correctAnswer === 'C' && (
                                  <span className="ml-2 text-green-700 font-medium">
                                    Correct
                                  </span>
                                )}
                              </div>
                              <div
                                className={`p-2 rounded ${
                                  question.correctAnswer === 'D'
                                    ? 'bg-green-100 border border-green-300'
                                    : 'bg-white border border-gray-200'
                                }`}
                              >
                                <span className="font-medium">D)</span> {question.optionD}
                                {question.correctAnswer === 'D' && (
                                  <span className="ml-2 text-green-700 font-medium">
                                    Correct
                                  </span>
                                )}
                              </div>
                            </div>
                            {question.explanation && (
                              <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Explanation:</span>{' '}
                                  {question.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pass course data to client component for actions */}
        <CourseReview
          courseId={course.id}
          courseTitle={course.title}
          isPublished={course.published}
          isDraft={course.isDraft}
        />
      </div>
    </div>
  )
}
