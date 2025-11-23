import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import UnverifiedEmailBanner from "@/components/UnverifiedEmailBanner"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Fetch user to check email verification status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true, email: true },
  })

  const userInitials = session.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
              RadSciCPD
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-gray-700 hidden sm:inline">
                {session.user?.name}
              </span>
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {userInitials}
              </div>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <button
                  type="submit"
                  className="text-gray-700 hover:text-red-600 transition"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
              >
                <span>📊</span>
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                href="/dashboard/courses"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
              >
                <span>📚</span>
                <span className="font-medium">My Courses</span>
              </Link>
              <Link
                href="/dashboard/cpd-tracker"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
              >
                <span>📊</span>
                <span className="font-medium">CPD Tracker</span>
              </Link>
              <Link
                href="/dashboard/certificates"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
              >
                <span>🎓</span>
                <span className="font-medium">Certificates</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
              >
                <span>⚙️</span>
                <span className="font-medium">Settings</span>
              </Link>
              <Link
                href="/courses"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition border-t border-gray-200 mt-4 pt-4"
              >
                <span>🔍</span>
                <span className="font-medium">Browse Courses</span>
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Show unverified email banner */}
            {user && !user.emailVerified && (
              <UnverifiedEmailBanner email={user.email} />
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
