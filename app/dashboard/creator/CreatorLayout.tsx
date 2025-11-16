'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  DollarSign,
  Users,
  Settings,
  Menu,
  X,
  PlusCircle,
  Eye,
  UserCheck,
  TrendingUp,
  BookOpen,
} from 'lucide-react'

interface CreatorLayoutProps {
  children: React.ReactNode
  user: {
    name: string
    avatar?: string
  }
  stats: {
    totalViews: number
    totalFollowers: number
    monthlyEarnings: number
    contentPublished: number
  }
}

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard/creator',
    icon: LayoutDashboard,
  },
  {
    name: 'My Content',
    href: '/dashboard/creator/content',
    icon: FileText,
  },
  {
    name: 'Analytics',
    href: '/dashboard/creator/analytics',
    icon: BarChart3,
  },
  {
    name: 'Earnings',
    href: '/dashboard/creator/earnings',
    icon: DollarSign,
  },
  {
    name: 'Followers',
    href: '/dashboard/creator/followers',
    icon: Users,
  },
  {
    name: 'Settings',
    href: '/dashboard/creator/settings',
    icon: Settings,
  },
]

export default function CreatorLayout({
  children,
  user,
  stats,
}: CreatorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard/creator') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Close */}
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <Link href="/dashboard/creator" className="text-xl font-bold text-blue-600">
              Creator Hub
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="border-t px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-blue-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">Creator Account</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 lg:flex lg:items-center lg:justify-between">
              {/* Stats bar - hidden on mobile, shown on tablet+ */}
              <div className="hidden md:grid md:grid-cols-4 md:gap-4 lg:gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Views</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {stats.totalViews.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Followers</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {stats.totalFollowers.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Monthly Earnings</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ${stats.monthlyEarnings.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Published</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {stats.contentPublished}
                    </p>
                  </div>
                </div>
              </div>

              {/* Create button */}
              <div className="relative ml-auto">
                <button
                  onClick={() => setCreateMenuOpen(!createMenuOpen)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Create New</span>
                </button>

                {createMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setCreateMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border z-50">
                      <div className="py-1">
                        <Link
                          href="/dashboard/creator/courses/new"
                          onClick={() => setCreateMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          New Course
                        </Link>
                        <Link
                          href="/dashboard/creator/publications/new"
                          onClick={() => setCreateMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          New Publication
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile stats - shown only on mobile */}
          <div className="md:hidden border-t px-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Views</p>
                  <p className="text-sm font-semibold">{stats.totalViews.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Followers</p>
                  <p className="text-sm font-semibold">{stats.totalFollowers.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Earnings</p>
                  <p className="text-sm font-semibold">${stats.monthlyEarnings.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs text-gray-500">Published</p>
                  <p className="text-sm font-semibold">{stats.contentPublished}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
