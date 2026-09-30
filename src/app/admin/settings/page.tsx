'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  Database,
  Bell,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Download,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { LibrarySettings } from '@/types'
import UserManagementPanel from './user-management-panel'

type LoadingState = 'idle' | 'loading' | 'saving' | 'error'
type MessageType = 'success' | 'error' | 'warning' | null

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<LibrarySettings | null>(null)
  const [originalSettings, setOriginalSettings] = useState<LibrarySettings | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>('loading')
  const [message, setMessage] = useState<{ type: MessageType; text: string }>({ type: null, text: '' })
  const [activeTab, setActiveTab] = useState('general')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const showMessage = useCallback((type: MessageType, text: string) => {
    setMessage({ type, text })
    window.setTimeout(() => setMessage({ type: null, text: '' }), 5000)
  }, [])

  const loadSettings = useCallback(async () => {
    try {
      setLoadingState('loading')
      const response = await fetch('/api/admin/settings')
      const result = await response.json()

      if (result.success && result.data) {
        setSettings(result.data)
        setOriginalSettings(result.data)
        setLoadingState('idle')
      } else {
        throw new Error(result.error || 'Failed to load settings')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setLoadingState('error')
      showMessage('error', 'Failed to load settings. Please refresh the page.')
    }
  }, [showMessage])

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  const handleSettingChange = <K extends keyof LibrarySettings>(
    key: K,
    value: LibrarySettings[K]
  ) => {
    if (!settings) return

    setSettings((prev) => {
      if (!prev) return prev
      return { ...prev, [key]: value }
    })

    // Clear validation error for this field
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  const validateSettings = (): boolean => {
    if (!settings) return false

    const errors: Record<string, string> = {}

    // Validate required text fields
    if (!settings.libraryName?.trim()) errors.libraryName = 'Library name is required'
    if (!settings.libraryCode?.trim()) errors.libraryCode = 'Library code is required'
    if (!settings.email?.trim()) errors.email = 'Email is required'
    if (!settings.website?.trim()) errors.website = 'Website URL is required'

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (settings.email && !emailRegex.test(settings.email)) {
      errors.email = 'Invalid email format'
    }
    if (settings.escalationEmail && !emailRegex.test(settings.escalationEmail)) {
      errors.escalationEmail = 'Invalid escalation email format'
    }

    // Validate URL format
    try {
      new URL(settings.website)
    } catch {
      errors.website = 'Invalid website URL'
    }

    // Validate time format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!timeRegex.test(settings.openingTime)) {
      errors.openingTime = 'Invalid time format (HH:MM)'
    }
    if (!timeRegex.test(settings.closingTime)) {
      errors.closingTime = 'Invalid time format (HH:MM)'
    }

    // Validate numeric ranges
    if (settings.seatCapacity < 0 || settings.seatCapacity > 5000) {
      errors.seatCapacity = 'Seat capacity must be between 0 and 5000'
    }
    if (settings.maxBorrowDuration < 1 || settings.maxBorrowDuration > 180) {
      errors.maxBorrowDuration = 'Borrow duration must be between 1 and 180 days'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!settings || !validateSettings()) {
      showMessage('error', 'Please fix validation errors before saving')
      return
    }

    setLoadingState('saving')
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      const result = await response.json()

      if (result.success && result.data) {
        setSettings(result.data)
        setOriginalSettings(result.data)
        setLoadingState('idle')
        showMessage('success', 'Settings saved successfully!')
      } else {
        throw new Error(result.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setLoadingState('idle')
      showMessage('error', 'Failed to save settings. Please try again.')
    }
  }

  const handleReset = () => {
    if (originalSettings) {
      setSettings({ ...originalSettings })
      setValidationErrors({})
      showMessage('warning', 'Changes discarded')
    }
  }

  const hasChanges = () => {
    if (!settings || !originalSettings) return false
    return JSON.stringify(settings) !== JSON.stringify(originalSettings)
  }

  const exportSettings = () => {
    if (!settings) return

    const dataStr = JSON.stringify(settings, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute(
      'download',
      `vidyalok-settings-${new Date().toISOString().split('T')[0]}.json`
    )
    linkElement.click()
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'operations', label: 'Operations', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'system', label: 'System', icon: Database },
  ]

  if (loadingState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar userRole="ADMIN" />
          <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64">
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (loadingState === 'error' || !settings) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar userRole="ADMIN" />
          <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64">
            <div className="max-w-6xl mx-auto">
              <Card>
                <CardContent className="py-12 text-center">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Failed to Load Settings</h2>
                  <p className="text-gray-600 mb-4">
                    Unable to load library settings. Please try refreshing the page.
                  </p>
                  <Button onClick={loadSettings}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar userRole="ADMIN" />
        <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Library Settings</h1>
                  <p className="text-gray-600">Configure system preferences and operational parameters</p>
                  {settings.metadata?.lastUpdatedAt && (
                    <p className="text-sm text-gray-500 mt-1">
                      Last updated: {new Date(settings.metadata.lastUpdatedAt).toLocaleString()}
                      {settings.metadata.lastUpdatedBy && ` by ${settings.metadata.lastUpdatedBy}`}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={exportSettings} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={!hasChanges()}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges() || loadingState === 'saving'}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {loadingState === 'saving' ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {loadingState === 'saving' ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>

              {/* Messages */}
              {message.type === 'success' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{message.text}</span>
                </div>
              )}

              {message.type === 'error' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
                  <XCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{message.text}</span>
                </div>
              )}

              {message.type === 'warning' && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span>{message.text}</span>
                </div>
              )}

              {hasChanges() && !message.type && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span>You have unsaved changes. Don&apos;t forget to save your settings.</span>
                </div>
              )}
            </div>

            {/* Settings Navigation */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Settings Content */}
            <div className="space-y-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      General Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Library Name
                        </label>
                        <Input
                          value={settings.libraryName}
                          onChange={(e) => handleSettingChange('libraryName', e.target.value)}
                          placeholder="Enter library name"
                          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                          style={{ color: '#111827' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Library Code
                        </label>
                        <Input
                          value={settings.libraryCode}
                          onChange={(e) => handleSettingChange('libraryCode', e.target.value)}
                          placeholder="Enter library code"
                          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                          style={{ color: '#111827' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <Input
                        value={settings.address}
                        onChange={(e) => handleSettingChange('address', e.target.value)}
                        placeholder="Enter complete address"
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                        style={{ color: '#111827' }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          value={settings.phone}
                          onChange={(e) => handleSettingChange('phone', e.target.value)}
                          placeholder="Enter phone number"
                          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                          style={{ color: '#111827' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={settings.email}
                          onChange={(e) => handleSettingChange('email', e.target.value)}
                          placeholder="Enter email address"
                          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                          style={{ color: '#111827' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website URL
                        </label>
                        <Input
                          value={settings.website}
                          onChange={(e) => handleSettingChange('website', e.target.value)}
                          placeholder="Enter website URL"
                          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                          style={{ color: '#111827' }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Operational Settings */}
              {activeTab === 'operations' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Operational Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Opening Time
                        </label>
                        <Input
                          type="time"
                          value={settings.openingTime}
                          onChange={(e) => handleSettingChange('openingTime', e.target.value)}
                          className="bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                          style={{ color: '#111827' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Closing Time
                        </label>
                        <Input
                          type="time"
                          value={settings.closingTime}
                          onChange={(e) => handleSettingChange('closingTime', e.target.value)}
                          className="bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                          style={{ color: '#111827' }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Borrow Duration (Days)
                        </label>
                        <Input
                          type="number"
                          value={settings.maxBorrowDuration}
                          onChange={(e) => handleSettingChange('maxBorrowDuration', parseInt(e.target.value))}
                          min="1"
                          max="365"
                          className="bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                          style={{ color: '#111827' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Renewals
                        </label>
                        <Input
                          type="number"
                          value={settings.maxRenewals}
                          onChange={(e) => handleSettingChange('maxRenewals', parseInt(e.target.value))}
                          min="0"
                          max="10"
                          className="bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                          style={{ color: '#111827' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Books Per User
                        </label>
                        <Input
                          type="number"
                          value={settings.maxBooksPerUser}
                          onChange={(e) => handleSettingChange('maxBooksPerUser', parseInt(e.target.value))}
                          min="1"
                          max="20"
                          className="bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                          style={{ color: '#111827' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fine Per Day ($)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={settings.finePerDay}
                        onChange={(e) => handleSettingChange('finePerDay', parseFloat(e.target.value))}
                        min="0"
                        max="100"
                        className="bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        style={{ color: '#111827' }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Email Notifications</h3>
                          <p className="text-sm text-gray-600">Send email notifications to users</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">SMS Notifications</h3>
                          <p className="text-sm text-gray-600">Send SMS notifications to users</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('smsNotifications', !settings.smsNotifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.smsNotifications ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Overdue Notifications</h3>
                          <p className="text-sm text-gray-600">Automatically send overdue reminders</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('overdueNotifications', !settings.overdueNotifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.overdueNotifications ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.overdueNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reminder Days Before Due Date
                      </label>
                      <Input
                        type="number"
                        value={settings.reminderDaysBefore}
                        onChange={(e) => handleSettingChange('reminderDaysBefore', parseInt(e.target.value))}
                        min="1"
                        max="14"
                        className="bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        style={{ color: '#111827' }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Timeout (Minutes)
                        </label>
                        <Input
                          type="number"
                          value={settings.sessionTimeout}
                          onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                          min="5"
                          max="480"
                          className="bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                          style={{ color: '#111827' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Expiry (Days)
                        </label>
                        <Input
                          type="number"
                          value={settings.passwordExpiry}
                          onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
                          min="30"
                          max="365"
                          className="bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                          style={{ color: '#111827' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Login Attempts
                        </label>
                        <Input
                          type="number"
                          value={settings.loginAttempts}
                          onChange={(e) => handleSettingChange('loginAttempts', parseInt(e.target.value))}
                          min="3"
                          max="10"
                          className="bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                          style={{ color: '#111827' }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('twoFactorAuth', !settings.twoFactorAuth)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'users' && <UserManagementPanel />}

              {/* System Settings */}
              {activeTab === 'system' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      System Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Backup Frequency
                        </label>
                        <select
                          value={settings.backupFrequency}
                          onChange={(e) =>
                            handleSettingChange(
                              'backupFrequency',
                              e.target.value as 'hourly' | 'daily' | 'weekly' | 'monthly'
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Log Retention (Days)
                        </label>
                        <Input
                          type="number"
                          value={settings.logRetention}
                          onChange={(e) => handleSettingChange('logRetention', parseInt(e.target.value))}
                          min="30"
                          max="3650"
                          className="bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                          style={{ color: '#111827' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Auto Logout (Minutes)
                        </label>
                        <Input
                          type="number"
                          value={settings.autoLogout}
                          onChange={(e) => handleSettingChange('autoLogout', parseInt(e.target.value))}
                          min="5"
                          max="120"
                          className="bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                          style={{ color: '#111827' }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Maintenance Mode</h3>
                        <p className="text-sm text-gray-600">Enable maintenance mode for system updates</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('maintenanceMode', !settings.maintenanceMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {settings.maintenanceMode && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="font-medium">Maintenance Mode Active</span>
                        </div>
                        <p className="text-red-700 text-sm mt-1">
                          The system is in maintenance mode. Users will see a maintenance message.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
