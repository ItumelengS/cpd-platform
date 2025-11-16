'use client'

import { Eye, Users, DollarSign, FileText, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface CreatorStatCardProps {
  icon: 'eye' | 'users' | 'dollar' | 'file'
  value: number | string
  label: string
  trend: number
  trendDirection: 'up' | 'down' | 'neutral'
}

export default function CreatorStatCard({
  icon,
  value,
  label,
  trend,
  trendDirection,
}: CreatorStatCardProps) {
  const icons = {
    eye: Eye,
    users: Users,
    dollar: DollarSign,
    file: FileText,
  }

  const iconColors = {
    eye: 'bg-blue-50 text-blue-600',
    users: 'bg-green-50 text-green-600',
    dollar: 'bg-purple-50 text-purple-600',
    file: 'bg-orange-50 text-orange-600',
  }

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  }

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  }

  const Icon = icons[icon]
  const TrendIcon = trendIcons[trendDirection]

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconColors[icon]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>

          <p className="text-2xl font-bold text-gray-900 mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>

          <p className="text-sm text-gray-600 mb-2">{label}</p>

          {trend !== 0 && (
            <div className={`flex items-center gap-1 text-sm font-medium ${trendColors[trendDirection]}`}>
              <TrendIcon className="h-4 w-4" />
              <span>
                {trendDirection === 'up' && '+'}
                {Math.abs(trend).toFixed(1)}%
              </span>
              <span className="text-gray-500 font-normal">vs last month</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
