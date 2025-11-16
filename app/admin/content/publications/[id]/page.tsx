import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PublicationReview from './PublicationReview'

export const metadata = {
  title: 'Review Publication - Admin',
  description: 'Review and approve publication content',
}

async function getPublicationForReview(publicationId: string) {
  const publication = await prisma.publication.findUnique({
    where: {
      id: publicationId,
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
    },
  })

  return publication
}

export default async function PublicationReviewPage({ params }: { params: { id: string } }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const publication = await getPublicationForReview(params.id)

  if (!publication) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Review Publication</h1>
              <p className="mt-2 text-gray-600">
                Review publication content before approving
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
            <h2 className="text-2xl font-bold text-gray-900">{publication.title}</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Creator:</span>{' '}
                <span className="font-medium text-gray-900">
                  {publication.creator.name || publication.creator.email}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>{' '}
                <span className="font-medium text-gray-900">{publication.category.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Submitted:</span>{' '}
                <span className="font-medium text-gray-900">
                  {new Date(publication.createdAt).toLocaleDateString()}
                </span>
              </div>
              {publication.doi && (
                <div>
                  <span className="text-gray-500">DOI:</span>{' '}
                  <a
                    href={`https://doi.org/${publication.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {publication.doi}
                  </a>
                </div>
              )}
              {publication.journal && (
                <div>
                  <span className="text-gray-500">Journal:</span>{' '}
                  <span className="font-medium text-gray-900">{publication.journal}</span>
                </div>
              )}
              {publication.publishedDate && (
                <div>
                  <span className="text-gray-500">Published Date:</span>{' '}
                  <span className="font-medium text-gray-900">
                    {new Date(publication.publishedDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{publication.description}</p>
          </div>

          {publication.keywords.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {publication.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PDF Preview */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Publication File</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">PDF Document</p>
                  <p className="text-sm text-gray-500">Click to view or download</p>
                </div>
              </div>
              <a
                href={publication.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                View PDF
              </a>
            </div>

            {/* Embedded PDF viewer */}
            <div className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden">
              <embed
                src={publication.fileUrl}
                type="application/pdf"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* DOI Validation */}
        {publication.doi && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">DOI Validation</h3>
            <p className="text-sm text-gray-600 mb-2">
              Verify the DOI is valid and matches the publication:
            </p>
            <a
              href={`https://doi.org/${publication.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              Check DOI: {publication.doi}
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        )}

        {/* Pass publication data to client component for actions */}
        <PublicationReview
          publicationId={publication.id}
          publicationTitle={publication.title}
          isPublished={publication.published}
        />
      </div>
    </div>
  )
}
