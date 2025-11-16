'use client'

import { useRouter } from 'next/navigation'
import { UserPlus, BookOpen, Eye, DollarSign, FileText } from 'lucide-react'

interface Activity {
  type: 'follower' | 'course' | 'publication' | 'view' | 'earnings'
  message: string
  timestamp: Date
  link?: string
}

interface ActivityTimelineProps {
  activities: Activity[]
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const router = useRouter()

  const getIcon = (type: Activity['type']) => {
    const icons = {
      follower: UserPlus,
      course: BookOpen,
      publication: FileText,
      view: Eye,
      earnings: DollarSign,
    }
    return icons[type]
  }

  const getIconColor = (type: Activity['type']) => {
    const colors = {
      follower: 'bg-green-50 text-green-600',
      course: 'bg-blue-50 text-blue-600',
      publication: 'bg-purple-50 text-purple-600',
      view: 'bg-orange-50 text-orange-600',
      earnings: 'bg-yellow-50 text-yellow-600',
    }
    return colors[type]
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return new Date(date).toLocaleDateString()
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No recent activity
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = getIcon(activity.type)
        const iconColor = getIconColor(activity.type)
        const isLast = index === activities.length - 1

        return (
          <div key={index} className="relative">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200" />
            )}

            {/* Activity item */}
            <div
              className={`flex gap-3 ${
                activity.link ? 'cursor-pointer hover:bg-gray-50 -mx-3 px-3 py-2 rounded-lg' : ''
              }`}
              onClick={() => {
                if (activity.link) {
                  router.push(activity.link)
                }
              }}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {getTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
