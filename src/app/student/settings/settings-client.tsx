'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { User, Bell, Shield, Eye, EyeOff, Save, Sparkles, Plus, Loader2, X } from 'lucide-react'

import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type HeaderUser = {
  name: string
  role: 'STUDENT'
  studentId: string
}

type ProfileState = {
  name: string
  email: string
  phone: string
  address: string
  department: string
  academicYear: string
  semester: number | null
}

type PreferenceDefaults = {
  interests: string[]
  availableCategories: string[]
}

interface SettingsClientProps {
  user: HeaderUser
  profileDefaults: ProfileState
  preferenceDefaults: PreferenceDefaults
}

const MAX_INTERESTS = 12

export default function SettingsClient({ user, profileDefaults, preferenceDefaults }: SettingsClientProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [profileData, setProfileData] = useState<ProfileState>(profileDefaults)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    dueDateReminders: true,
    overdueAlerts: true,
    newBookAlerts: true,
    systemUpdates: false,
    maintenanceAlerts: true,
  })
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private',
    borrowingHistory: 'private',
    contactInfo: 'limited',
    academicInfo: 'private',
  })
  const [initialInterests, setInitialInterests] = useState<string[]>(preferenceDefaults.interests)
  const [selectedInterests, setSelectedInterests] = useState<string[]>(preferenceDefaults.interests)
  const [interestInput, setInterestInput] = useState('')
  const [interestError, setInterestError] = useState('')
  const [isSavingInterests, setIsSavingInterests] = useState(false)

  useEffect(() => {
    setProfileData(profileDefaults)
  }, [profileDefaults])

  useEffect(() => {
    setInitialInterests(preferenceDefaults.interests)
    setSelectedInterests(preferenceDefaults.interests)
  }, [preferenceDefaults.interests])

  const suggestionOptions = useMemo(() => {
    const seen = new Set<string>()
    const cleaned: string[] = []

    for (const category of preferenceDefaults.availableCategories) {
      const normalized = category.trim()
      if (!normalized) continue

      const key = normalized.toLowerCase()
      if (seen.has(key)) continue

      seen.add(key)
      cleaned.push(normalized)

      if (cleaned.length >= 36) {
        break
      }
    }

    return cleaned
  }, [preferenceDefaults.availableCategories])

  const interestsChanged = useMemo(() => {
    if (selectedInterests.length !== initialInterests.length) {
      return true
    }

    return selectedInterests.some((interest, index) => interest !== initialInterests[index])
  }, [initialInterests, selectedInterests])

  const interestLimitReached = selectedInterests.length >= MAX_INTERESTS
  const remainingInterestSlots = Math.max(0, MAX_INTERESTS - selectedInterests.length)

  const handleProfileSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Profile updated:', profileData)
    setSavedMessage('Profile settings saved successfully!')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!')
      return
    }

    if (!passwordData.newPassword.trim()) {
      alert('New password cannot be empty')
      return
    }

    console.log('Password change requested')
    setSavedMessage('Password changed successfully!')
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handleNotificationSave = () => {
    console.log('Notification settings updated:', notifications)
    setSavedMessage('Notification settings saved!')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handlePrivacySave = () => {
    console.log('Privacy settings updated:', privacySettings)
    setSavedMessage('Privacy settings saved!')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const normalizeInterestValue = (value: string) => value.trim().replace(/\s+/g, ' ')

  const removeInterest = (value: string) => {
    setSelectedInterests((prev) => prev.filter((interest) => interest.toLowerCase() !== value.toLowerCase()))
    setInterestError('')
  }

  const addInterest = (rawValue: string) => {
    const normalized = normalizeInterestValue(rawValue)

    if (!normalized) {
      setInterestError('Please enter an interest before adding it.')
      return
    }

    if (selectedInterests.some((interest) => interest.toLowerCase() === normalized.toLowerCase())) {
      setInterestInput('')
      setInterestError('')
      return
    }

    if (selectedInterests.length >= MAX_INTERESTS) {
      setInterestError(`You can select up to ${MAX_INTERESTS} interests.`)
      return
    }

    setSelectedInterests((prev) => [...prev, normalized])
    setInterestInput('')
    setInterestError('')
  }

  const toggleInterest = (value: string) => {
    const normalized = normalizeInterestValue(value)
    const exists = selectedInterests.some((interest) => interest.toLowerCase() === normalized.toLowerCase())

    if (exists) {
      removeInterest(normalized)
      return
    }

    if (selectedInterests.length >= MAX_INTERESTS) {
      setInterestError(`You can select up to ${MAX_INTERESTS} interests.`)
      return
    }

    setSelectedInterests((prev) => [...prev, normalized])
    setInterestError('')
  }

  const handleAddInterest = () => {
    addInterest(interestInput)
  }

  const handleInterestSave = async () => {
    setInterestError('')
    setIsSavingInterests(true)

    try {
      const response = await fetch('/api/student/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interests: selectedInterests }),
      })

      const payload = await response.json()

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error ?? 'Unable to save your reading preferences right now.')
      }

      const updatedInterests = Array.isArray(payload?.data?.interests)
        ? payload.data.interests
        : selectedInterests

      setInitialInterests(updatedInterests)
      setSelectedInterests(updatedInterests)
      setSavedMessage('Reading preferences saved!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save your reading preferences right now.'
      setInterestError(message)
    } finally {
      setIsSavingInterests(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ color: '#1f2937' }}>
      <Header user={user} />

      <div className="flex flex-1">
        <Sidebar userRole="STUDENT" />

        <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64 student-main">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900" style={{ color: '#111827' }}>
                Settings
              </h1>
              <p className="text-gray-600" style={{ color: '#4b5563' }}>
                Manage your account preferences and privacy settings.
              </p>
            </div>

            {savedMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {savedMessage}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                  <Sparkles className="h-5 w-5" />
                  <span>Reading Preferences</span>
                </CardTitle>
                <CardDescription style={{ color: '#6b7280' }}>
                  Tell us what you enjoy reading to improve your personalised recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {interestError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {interestError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" style={{ color: '#374151' }}>
                    Your interests
                  </label>
                  {selectedInterests.length === 0 ? (
                    <p className="text-sm text-gray-500" style={{ color: '#6b7280' }}>
                      You haven&rsquo;t added any interests yet. Choose from the suggestions below or add your own topics.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedInterests.map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                        >
                          {interest}
                          <button
                            type="button"
                            onClick={() => removeInterest(interest)}
                            className="rounded-full p-0.5 text-blue-500 transition hover:bg-blue-100 hover:text-blue-700"
                            aria-label={`Remove ${interest}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500" style={{ color: '#6b7280' }}>
                    {remainingInterestSlots > 0
                      ? `${remainingInterestSlots} more ${remainingInterestSlots === 1 ? 'interest' : 'interests'} can be added.`
                      : 'Interest limit reached.'}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Input
                    value={interestInput}
                    onChange={(event) => {
                      setInterestInput(event.target.value)
                      if (interestError) {
                        setInterestError('')
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        handleAddInterest()
                      }
                    }}
                    placeholder="Add a custom interest (e.g. Machine Learning)"
                    className="bg-white text-gray-900 sm:flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddInterest}
                    variant="outline"
                    className="border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700 sm:w-auto"
                    disabled={interestLimitReached || !interestInput.trim()}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Interest
                  </Button>
                </div>

                {suggestionOptions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700" style={{ color: '#374151' }}>
                      Suggested topics
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestionOptions.map((option) => {
                        const isActive = selectedInterests.some(
                          (interest) => interest.toLowerCase() === option.toLowerCase(),
                        )

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => toggleInterest(option)}
                            className={`rounded-full border px-3 py-1 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
                              isActive
                                ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600'
                            }`}
                            aria-pressed={isActive}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-xs text-gray-500" style={{ color: '#6b7280' }}>
                      Tap a topic to {selectedInterests.length ? 'add or remove it from' : 'add it to'} your list.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-gray-500" style={{ color: '#6b7280' }}>
                    Updates feed directly into your personalised recommendations.
                  </span>
                  <Button
                    type="button"
                    onClick={handleInterestSave}
                    disabled={!interestsChanged || isSavingInterests}
                    className="sm:w-auto"
                  >
                    {isSavingInterests ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Reading Preferences
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription style={{ color: '#6b7280' }}>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                        Full Name
                      </label>
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="bg-white text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                        Student ID
                      </label>
                      <Input value={user.studentId} disabled className="bg-gray-50 text-gray-900" />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        placeholder="Enter your email"
                        className="bg-white text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                        Phone Number
                      </label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="Enter your phone number"
                        className="bg-white text-gray-900"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                        Address
                      </label>
                      <Input
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        placeholder="Enter your address"
                        className="bg-white text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                        Department / Branch
                      </label>
                      <Input
                        value={profileData.department || 'Not set'}
                        disabled
                        className="bg-gray-50 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                        Academic Year
                      </label>
                      <Input
                        value={profileData.academicYear || 'Not set'}
                        disabled
                        className="bg-gray-50 text-gray-900"
                      />
                    </div>

                    {profileData.semester !== null && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                          Semester
                        </label>
                        <Input value={`Semester ${profileData.semester}`} disabled className="bg-gray-50 text-gray-900" />
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile Changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                  <Shield className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription style={{ color: '#6b7280' }}>
                  Change your password and manage account security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                        Current Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                          required
                          className="bg-white text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Enter new password"
                          required
                          className="bg-white text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Confirm new password"
                          required
                          className="bg-white text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription style={{ color: '#6b7280' }}>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                    { key: 'dueDateReminders', label: 'Due Date Reminders', desc: 'Get reminded about upcoming due dates' },
                    { key: 'overdueAlerts', label: 'Overdue Alerts', desc: 'Get alerts for overdue books' },
                    { key: 'newBookAlerts', label: 'New Book Alerts', desc: 'Get notified about new book arrivals' },
                    { key: 'systemUpdates', label: 'System Updates', desc: 'Receive system maintenance notifications' },
                    { key: 'maintenanceAlerts', label: 'Maintenance Alerts', desc: 'Get notified about scheduled maintenance' },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                      <div>
                        <h4 className="font-medium text-gray-900" style={{ color: '#1f2937' }}>
                          {setting.label}
                        </h4>
                        <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>
                          {setting.desc}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[setting.key as keyof typeof notifications]}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              [setting.key]: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleNotificationSave}
                  variant="outline"
                  className="bg-green-600 text-white border-green-600 hover:bg-green-700 hover:border-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                  <Shield className="h-5 w-5" />
                  <span>Privacy Settings</span>
                </CardTitle>
                <CardDescription style={{ color: '#6b7280' }}>
                  Control who can see your information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'profileVisibility', label: 'Profile Visibility', desc: 'Who can see your profile' },
                    { key: 'borrowingHistory', label: 'Borrowing History', desc: 'Who can see your borrowing history' },
                    { key: 'contactInfo', label: 'Contact Information', desc: 'Who can see your contact details' },
                    { key: 'academicInfo', label: 'Academic Information', desc: 'Who can see your academic details' },
                  ].map((setting) => (
                    <div key={setting.key} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700" style={{ color: '#374151' }}>
                        {setting.label}
                      </label>
                      <select
                        value={privacySettings[setting.key as keyof typeof privacySettings]}
                        onChange={(e) =>
                          setPrivacySettings({
                            ...privacySettings,
                            [setting.key]: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="public">Public</option>
                        <option value="limited">Limited</option>
                        <option value="private">Private</option>
                      </select>
                      <p className="text-xs text-gray-500" style={{ color: '#6b7280' }}>
                        {setting.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handlePrivacySave}
                  variant="outline"
                  className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:border-purple-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Privacy Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
