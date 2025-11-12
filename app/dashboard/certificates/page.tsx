import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import Certificate from "@/components/Certificate"

export default async function CertificatesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch all certificates for user
  const certificates = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: {
      course: true,
      user: true,
    },
    orderBy: { issuedAt: "desc" },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
        <p className="text-gray-600 mt-2">
          View and print your CPD certificates
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">🎓</div>
          <p className="text-gray-600 mb-4">You haven't earned any certificates yet.</p>
          <p className="text-gray-500 text-sm mb-6">
            Complete courses and pass the final quiz to earn your CPD certificates.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Continue Learning
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Certificates List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <Link
                key={cert.id}
                href={`/dashboard/certificates/${cert.id}`}
                className="bg-white rounded-lg p-6 shadow-sm border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4 text-center">🎓</div>
                <h3 className="font-bold text-gray-900 text-center mb-2 line-clamp-2">
                  {cert.course.title}
                </h3>
                <div className="space-y-1 text-sm text-gray-600 text-center">
                  <p>Score: {cert.score.toFixed(0)}%</p>
                  <p>{cert.course.cpdHours} CPD Hours</p>
                  <p className="text-xs text-gray-500">
                    {new Date(cert.issuedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-blue-600 text-sm font-medium hover:underline">
                    View Certificate →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-8 text-white">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">{certificates.length}</div>
                <div className="text-blue-100">Certificates Earned</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">
                  {certificates.reduce((sum, cert) => sum + cert.course.cpdHours, 0).toFixed(1)}
                </div>
                <div className="text-blue-100">Total CPD Hours</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">
                  {(certificates.reduce((sum, cert) => sum + cert.score, 0) / certificates.length).toFixed(0)}%
                </div>
                <div className="text-blue-100">Average Score</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
