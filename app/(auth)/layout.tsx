export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">RadSciCPD</h1>
          <p className="text-gray-600 mt-2">Professional CPD for Radiation Sciences</p>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
