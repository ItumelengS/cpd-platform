'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { User, Bell, Lock, CreditCard, Save, Link as LinkIcon } from 'lucide-react'

type Tab = 'profile' | 'notifications' | 'privacy' | 'payout'

export default function CreatorSettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Profile settings
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    specialty: '',
    twitter: '',
    linkedin: '',
    website: '',
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    newFollower: true,
    newView: false,
    earnings: true,
    courseApproved: true,
    courseRejected: true,
    weeklyReport: true,
  })

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showActivity: true,
    includeInDirectory: true,
  })

  // Payout settings
  const [payout, setPayout] = useState({
    stripeConnected: false,
    minThreshold: 50,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/creator/settings')
      if (response.ok) {
        const data = await response.json()
        setProfile({
          name: data.name || '',
          bio: data.bio || '',
          specialty: data.specialty || '',
          twitter: data.socialLinks?.twitter || '',
          linkedin: data.socialLinks?.linkedin || '',
          website: data.socialLinks?.website || '',
        })
        setNotifications(data.notifications || notifications)
        setPrivacy(data.privacy || privacy)
        setPayout({
          stripeConnected: data.stripeOnboarded || false,
          minThreshold: data.minThreshold || 50,
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)

    try {
      const response = await fetch('/api/creator/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          notifications,
          privacy,
          payout,
        }),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'privacy' as Tab, label: 'Privacy', icon: Lock },
    { id: 'payout' as Tab, label: 'Payout', icon: CreditCard },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your creator account settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell people about yourself and your expertise..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {profile.bio.length} / 500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty
                </label>
                <input
                  type="text"
                  value={profile.specialty}
                  onChange={(e) =>
                    setProfile({ ...profile, specialty: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Dentistry, Pharmacology"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Social Links
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={profile.twitter}
                      onChange={(e) =>
                        setProfile({ ...profile, twitter: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://twitter.com/username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={profile.linkedin}
                      onChange={(e) =>
                        setProfile({ ...profile, linkedin: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) =>
                        setProfile({ ...profile, website: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Email Notifications
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Choose which notifications you want to receive
                </p>

                <div className="space-y-4">
                  {[
                    {
                      key: 'newFollower',
                      label: 'New Follower',
                      description: 'When someone starts following you',
                    },
                    {
                      key: 'newView',
                      label: 'New Views',
                      description: 'Daily summary of new content views',
                    },
                    {
                      key: 'earnings',
                      label: 'Earnings Updates',
                      description: 'When you receive new earnings',
                    },
                    {
                      key: 'courseApproved',
                      label: 'Course Approved',
                      description: 'When your course is approved for publishing',
                    },
                    {
                      key: 'courseRejected',
                      label: 'Course Rejected',
                      description: 'When your course submission is rejected',
                    },
                    {
                      key: 'weeklyReport',
                      label: 'Weekly Report',
                      description: 'Weekly summary of your performance',
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-3 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          notifications[item.key as keyof typeof notifications]
                        }
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            [item.key]: e.target.checked,
                          })
                        }
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Privacy Settings
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Control how your information is displayed
                </p>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.showEmail}
                      onChange={(e) =>
                        setPrivacy({ ...privacy, showEmail: e.target.checked })
                      }
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        Show email publicly
                      </p>
                      <p className="text-sm text-gray-500">
                        Display your email address on your public profile
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.showActivity}
                      onChange={(e) =>
                        setPrivacy({ ...privacy, showActivity: e.target.checked })
                      }
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        Allow followers to see activity
                      </p>
                      <p className="text-sm text-gray-500">
                        Let followers see when you publish new content
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.includeInDirectory}
                      onChange={(e) =>
                        setPrivacy({
                          ...privacy,
                          includeInDirectory: e.target.checked,
                        })
                      }
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        Include in creator directory
                      </p>
                      <p className="text-sm text-gray-500">
                        Allow users to discover you in the creator directory
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Payout Tab */}
          {activeTab === 'payout' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Payout Settings
                </h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">
                        {payout.stripeConnected
                          ? 'Stripe Connected'
                          : 'Connect Stripe Account'}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        {payout.stripeConnected
                          ? 'Your Stripe account is connected and ready to receive payouts'
                          : 'Connect your Stripe account to receive payouts from your content earnings'}
                      </p>
                    </div>
                  </div>
                </div>

                {!payout.stripeConnected && (
                  <a
                    href="/dashboard/creator/payout-setup"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    Set Up Payout Method
                  </a>
                )}

                {payout.stripeConnected && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Payout Threshold
                    </label>
                    <select
                      value={payout.minThreshold}
                      onChange={(e) =>
                        setPayout({
                          ...payout,
                          minThreshold: Number(e.target.value),
                        })
                      }
                      className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={25}>$25</option>
                      <option value={50}>$50</option>
                      <option value={100}>$100</option>
                      <option value={200}>$200</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-2">
                      Payouts will only be processed when your balance reaches this
                      amount
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="border-t px-6 py-4 bg-gray-50 flex items-center justify-between">
          <div>
            {saved && (
              <p className="text-sm text-green-600">Settings saved successfully!</p>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
