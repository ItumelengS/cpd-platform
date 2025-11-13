"use client"

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium print:hidden"
    >
      🖨️ Print Certificate
    </button>
  )
}

export function ShareButtons() {
  return (
    <div className="flex gap-4">
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
        Share on LinkedIn
      </button>
      <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm font-medium">
        Download PDF
      </button>
    </div>
  )
}
