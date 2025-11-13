"use client"

import { Certificate as CertificateType, Course, User } from "@prisma/client"

type CertificateProps = {
  certificate: CertificateType & {
    course: Course
    user: User
  }
}

export default function Certificate({ certificate }: CertificateProps) {
  const issueDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="bg-white p-12 max-w-4xl mx-auto shadow-2xl border-8 border-double border-blue-600 relative">
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-blue-400"></div>
      <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-blue-400"></div>
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-blue-400"></div>
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-blue-400"></div>

      <div className="text-center space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-5xl font-bold text-blue-600 mb-2">RadSciCPD</h1>
          <p className="text-gray-600 text-lg">Professional Development Platform</p>
        </div>

        {/* Certificate Title */}
        <div className="py-4">
          <h2 className="text-3xl font-serif text-gray-800">Certificate of Completion</h2>
        </div>

        {/* Recipient */}
        <div className="py-4">
          <p className="text-gray-600 mb-2">This is to certify that</p>
          <p className="text-4xl font-bold text-gray-900 mb-2">{certificate.user.name}</p>
          <p className="text-gray-600">has successfully completed</p>
        </div>

        {/* Course */}
        <div className="py-4 bg-blue-50 rounded-lg px-8">
          <p className="text-2xl font-bold text-blue-900 mb-2">
            {certificate.course.title}
          </p>
          <p className="text-gray-700">
            {certificate.course.cpdHours} CPD Credit Hours • Score: {certificate.score.toFixed(0)}%
          </p>
        </div>

        {/* Date and Certificate ID */}
        <div className="py-6 grid grid-cols-2 gap-8 border-t border-b border-gray-300 my-6">
          <div>
            <p className="text-gray-600 text-sm mb-1">Date Issued</p>
            <p className="text-gray-900 font-semibold">{issueDate}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Certificate ID</p>
            <p className="text-gray-900 font-semibold font-mono text-sm">
              {certificate.certificateId}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4">
          <p className="text-gray-500 text-sm">
            This certificate verifies completion of evidence-based continuing professional development
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Verify at: www.radscicpd.com/verify/{certificate.certificateId}
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .bg-white {
            padding: 3rem;
          }
          button {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
