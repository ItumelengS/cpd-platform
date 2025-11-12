import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import Certificate from "@/components/Certificate"

export default async function CertificateViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch certificate
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      course: true,
      user: true,
    },
  })

  if (!certificate || certificate.userId !== session.user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Certificate not found</p>
          <Link href="/dashboard/certificates" className="text-blue-600 hover:underline">
            Back to certificates
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/certificates"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Certificates
        </Link>

        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium print:hidden"
        >
          🖨️ Print Certificate
        </button>
      </div>

      <Certificate certificate={certificate} />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 print:hidden">
        <h3 className="font-semibold text-gray-900 mb-2">Share Your Achievement</h3>
        <p className="text-gray-700 text-sm mb-4">
          Share your certificate on LinkedIn, add it to your CV, or submit it to your professional body.
        </p>
        <div className="flex gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
            Share on LinkedIn
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm font-medium">
            Download PDF
          </button>
        </div>
      </div>
    </div>
  )
}
