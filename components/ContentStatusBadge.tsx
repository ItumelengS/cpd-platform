'use client'

interface ContentStatusBadgeProps {
  status: 'draft' | 'review' | 'published' | 'rejected'
  rejectionReason?: string | null
}

export default function ContentStatusBadge({ status, rejectionReason }: ContentStatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'published':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'draft':
        return 'Draft'
      case 'review':
        return 'Pending Review'
      case 'published':
        return 'Published'
      case 'rejected':
        return 'Rejected'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="relative inline-block group">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}
      >
        {getStatusLabel()}
      </span>
      {status === 'rejected' && rejectionReason && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-64">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg">
            <div className="font-semibold mb-1">Rejection Reason:</div>
            <div className="text-gray-200">{rejectionReason}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
