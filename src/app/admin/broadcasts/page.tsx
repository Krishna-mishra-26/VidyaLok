'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  CheckCircle,
  Clock,
  Eye,
  Info,
  Loader2,
  Megaphone,
  MessageSquare,
  Plus,
  Send,
  Undo2,
  Users,
} from 'lucide-react'

import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CANONICAL_DEPARTMENTS } from '@/constants/departments'
import type {
  AdminBroadcastRecord,
  AdminBroadcastSummary,
  BroadcastAudienceValue,
  BroadcastPriorityValue,
  BroadcastStatusValue,
  BroadcastTypeValue,
} from '@/types'

type BannerState = { type: 'success' | 'error'; message: string } | null

type PaginationState = {
  page: number
  limit: number
  total: number
  totalPages: number
}

type BroadcastFormState = {
  title: string
  message: string
  type: BroadcastTypeValue
  priority: BroadcastPriorityValue
  audience: BroadcastAudienceValue
  department: string
  role: string
  expiresAt: string
}

const TYPE_CONFIG: Record<BroadcastTypeValue, { label: string; icon: LucideIcon; badgeClass: string }> = {
  ANNOUNCEMENT: { label: 'Announcement', icon: Info, badgeClass: 'text-blue-600 bg-blue-50' },
  ALERT: { label: 'Alert', icon: AlertTriangle, badgeClass: 'text-red-600 bg-red-50' },
  MAINTENANCE: { label: 'Maintenance', icon: Clock, badgeClass: 'text-amber-600 bg-amber-50' },
  EVENT: { label: 'Event', icon: Megaphone, badgeClass: 'text-purple-600 bg-purple-50' },
  EMERGENCY: { label: 'Emergency', icon: AlertCircle, badgeClass: 'text-rose-600 bg-rose-50' },
}

const PRIORITY_CONFIG: Record<BroadcastPriorityValue, { label: string; badgeClass: string }> = {
  NORMAL: { label: 'Normal', badgeClass: 'text-slate-600 bg-slate-100' },
  HIGH: { label: 'High', badgeClass: 'text-orange-600 bg-orange-100' },
  URGENT: { label: 'Urgent', badgeClass: 'text-red-600 bg-red-100' },
}

const STATUS_CONFIG: Record<BroadcastStatusValue, { label: string; badgeClass: string }> = {
  SENT: { label: 'Sent', badgeClass: 'text-green-600 bg-green-100' },
  SCHEDULED: { label: 'Scheduled', badgeClass: 'text-blue-600 bg-blue-100' },
  DRAFT: { label: 'Draft', badgeClass: 'text-slate-600 bg-slate-100' },
  CANCELLED: { label: 'Cancelled', badgeClass: 'text-red-600 bg-red-100' },
}

const AUDIENCE_LABELS: Record<BroadcastAudienceValue, string> = {
  ALL: 'All Students',
  DEPARTMENT: 'Department',
  ROLE: 'Role',
  CUSTOM: 'Custom Recipients',
}

const ROLE_OPTIONS = [
  { value: 'STUDENT', label: 'Students' },
  { value: 'LIBRARIAN', label: 'Librarians' },
  { value: 'ADMIN', label: 'Administrators' },
]

const DEFAULT_DEPARTMENT = CANONICAL_DEPARTMENTS[0] ?? ''

const INITIAL_FORM_STATE: BroadcastFormState = {
  title: '',
  message: '',
  type: 'ANNOUNCEMENT',
  priority: 'NORMAL',
  audience: 'ALL',
  department: DEFAULT_DEPARTMENT,
  role: 'STUDENT',
  expiresAt: '',
}

const PAGE_SIZE = 10

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed)
}

const formatDateTime = (value: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)
}

const getAudienceDescription = (broadcast: AdminBroadcastRecord) => {
  if (broadcast.audience === 'DEPARTMENT') {
    const department =
      typeof broadcast.audienceFilter === 'object' && broadcast.audienceFilter
        ? String((broadcast.audienceFilter as Record<string, unknown>).department ?? '')
        : ''
    return department || 'Specific Department'
  }

  if (broadcast.audience === 'ROLE') {
    const role =
      typeof broadcast.audienceFilter === 'object' && broadcast.audienceFilter
        ? String((broadcast.audienceFilter as Record<string, unknown>).role ?? '')
        : ''
    if (!role) return 'Role'
    const option = ROLE_OPTIONS.find((item) => item.value === role)
    return option?.label ?? role
  }

  if (broadcast.audience === 'CUSTOM') {
    return 'Custom Recipients'
  }

  return AUDIENCE_LABELS[broadcast.audience]
}

export default function AdminBroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<AdminBroadcastRecord[]>([])
  const [summary, setSummary] = useState<AdminBroadcastSummary | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  })
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [banner, setBanner] = useState<BannerState>(null)
  const [showComposeForm, setShowComposeForm] = useState(false)
  const [formState, setFormState] = useState<BroadcastFormState>(INITIAL_FORM_STATE)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeBroadcast, setActiveBroadcast] = useState<AdminBroadcastRecord | null>(null)
  const [mutatingBroadcastId, setMutatingBroadcastId] = useState<string | null>(null)

  const fetchBroadcasts = useCallback(async (requestedPage: number) => {
    setIsLoading(true)
    setError(null)

    const params = new URLSearchParams({
      page: String(requestedPage),
      limit: String(PAGE_SIZE),
      view: 'admin',
    })

    try {
      const response = await fetch(`/api/broadcasts?${params.toString()}`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Unable to load broadcasts')
      }

      const payload = await response.json()
      setBroadcasts(payload.data ?? [])
      setSummary(payload.summary ?? null)
      setPagination(
        payload.pagination ?? {
          page: requestedPage,
          limit: PAGE_SIZE,
          total: payload.data?.length ?? 0,
          totalPages: 1,
        },
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load broadcasts'
      setError(message)
      setBroadcasts([])
      setPagination({ page: requestedPage, limit: PAGE_SIZE, total: 0, totalPages: 1 })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchBroadcasts(page)
  }, [fetchBroadcasts, page])

  const stats = useMemo(() => {
    if (summary) {
      return {
        totalBroadcasts: summary.totalBroadcasts,
        sentToday: summary.sentToday,
        scheduled: summary.scheduledCount,
        averageReadRate: summary.averageReadRate,
      }
    }

    const sentBroadcasts = broadcasts.filter((broadcast) => broadcast.status === 'SENT')
    const aggregate = sentBroadcasts.reduce((acc, broadcast) => {
      if (broadcast.deliveredCount === 0) return acc
      return acc + broadcast.readCount / broadcast.deliveredCount
    }, 0)

    const averageReadRate = sentBroadcasts.length
      ? Math.round((aggregate / sentBroadcasts.length) * 100)
      : 0

    return {
      totalBroadcasts: broadcasts.length,
      sentToday: sentBroadcasts.filter((broadcast) => {
        const sentAt = broadcast.sentAt ?? broadcast.createdAt
        const sentDate = new Date(sentAt)
        if (Number.isNaN(sentDate.getTime())) return false
        return sentDate.toDateString() === new Date().toDateString()
      }).length,
      scheduled: broadcasts.filter((broadcast) => broadcast.status === 'SCHEDULED').length,
      averageReadRate,
    }
  }, [broadcasts, summary])

  const filteredBroadcasts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) {
      return broadcasts
    }

    return broadcasts.filter(
      (broadcast) =>
        broadcast.title.toLowerCase().includes(term) ||
        broadcast.message.toLowerCase().includes(term),
    )
  }, [broadcasts, searchTerm])

  const resetForm = () => {
    setFormState((previous) => ({
      ...INITIAL_FORM_STATE,
      department: previous.department || INITIAL_FORM_STATE.department,
      role: previous.role || INITIAL_FORM_STATE.role,
    }))
    setFormError(null)
  }

  const handleComposeOpen = () => {
    resetForm()
    setShowComposeForm(true)
  }

  const handleComposeClose = () => {
    setShowComposeForm(false)
    setFormError(null)
  }

  const handleFormChange = (field: keyof BroadcastFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    const trimmedTitle = formState.title.trim()
    const trimmedMessage = formState.message.trim()

    if (!trimmedTitle || !trimmedMessage) {
      setFormError('Title and message are required')
      setIsSubmitting(false)
      return
    }

    const payload: Record<string, unknown> = {
      title: trimmedTitle,
      message: trimmedMessage,
      type: formState.type,
      priority: formState.priority,
      audience: formState.audience,
    }

    if (formState.audience === 'DEPARTMENT') {
      if (!formState.department) {
        setFormError('Choose a department for department-wide broadcasts')
        setIsSubmitting(false)
        return
      }
      payload.audienceFilter = { department: formState.department }
    }

    if (formState.audience === 'ROLE') {
      if (!formState.role) {
        setFormError('Choose a role for role-based broadcasts')
        setIsSubmitting(false)
        return
      }
      payload.audienceFilter = { role: formState.role }
    }

    if (formState.expiresAt) {
      payload.expiresAt = new Date(formState.expiresAt).toISOString()
    }

    try {
      const response = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        const message = errorBody?.message ?? 'Failed to send broadcast'
        throw new Error(message)
      }

      setBanner({ type: 'success', message: 'Broadcast sent to recipients successfully.' })
      setShowComposeForm(false)
      resetForm()
      setPage(1)
      await fetchBroadcasts(1)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send broadcast'
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleArchiveToggle = async (broadcast: AdminBroadcastRecord) => {
    const action = broadcast.isActive ? 'archive' : 'restore'
    setMutatingBroadcastId(broadcast.id)
    setBanner(null)

    try {
      const response = await fetch(`/api/broadcasts/${broadcast.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        const message = errorBody?.message ?? 'Failed to update broadcast'
        throw new Error(message)
      }

      setBanner({
        type: 'success',
        message: broadcast.isActive ? 'Broadcast archived successfully.' : 'Broadcast restored successfully.',
      })
      await fetchBroadcasts(page)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update broadcast'
      setBanner({ type: 'error', message })
    } finally {
      setMutatingBroadcastId(null)
    }
  }

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && page > 1) {
      setPage(page - 1)
    }

    if (direction === 'next' && page < pagination.totalPages) {
      setPage(page + 1)
    }
  }

  const renderBanner = () => {
    if (!banner) return null
    const Icon = banner.type === 'success' ? CheckCircle : AlertCircle
    const tone =
      banner.type === 'success'
        ? 'text-green-700 bg-green-50 border-green-200'
        : 'text-red-700 bg-red-50 border-red-200'

    return (
      <div className={`border ${tone} px-4 py-3 rounded-lg flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <span className="text-sm font-medium">{banner.message}</span>
        </div>
        <button
          type="button"
          className="text-sm text-slate-600 hover:text-slate-900"
          onClick={() => setBanner(null)}
        >
          Dismiss
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="flex">
        <Sidebar userRole="ADMIN" />
        <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64 z-10">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Broadcast Management</h1>
                <p className="text-gray-600 mt-1">Send announcements, alerts, and emergency updates to students</p>
              </div>
              <Button onClick={handleComposeOpen} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Compose Broadcast
              </Button>
            </div>

            {renderBanner()}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Broadcasts</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBroadcasts}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
                  <Send className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{stats.sentToday}</div>
                  <p className="text-xs text-muted-foreground">Delivered messages</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
                  <p className="text-xs text-muted-foreground">Pending delivery</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Read Rate</CardTitle>
                  <Eye className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.averageReadRate}%</div>
                  <p className="text-xs text-muted-foreground">Message engagement</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Recent Broadcasts</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Users className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search by title or message"
                      className="pl-9 w-64"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                {!error && isLoading && (
                  <div className="flex items-center justify-center py-16 text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-3 text-sm font-medium">Loading broadcasts...</span>
                  </div>
                )}

                {!error && !isLoading && filteredBroadcasts.length === 0 && (
                  <div className="border border-dashed border-slate-200 rounded-lg p-12 text-center text-slate-500">
                    <Megaphone className="h-10 w-10 mx-auto mb-3 text-slate-400" />
                    <p className="font-medium">No broadcasts match this search</p>
                    <p className="text-sm mt-1">Compose a new broadcast to notify students.</p>
                  </div>
                )}

                {!error && !isLoading && filteredBroadcasts.length > 0 && (
                  <div className="space-y-4">
                    {filteredBroadcasts.map((broadcast) => {
                      const typeConfig = TYPE_CONFIG[broadcast.type]
                      const priorityConfig = PRIORITY_CONFIG[broadcast.priority]
                      const statusConfig = STATUS_CONFIG[broadcast.status]
                      const TypeIcon = typeConfig.icon

                      return (
                        <div key={broadcast.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig.badgeClass}`}>
                                  <TypeIcon className="h-3.5 w-3.5" />
                                  {typeConfig.label}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig.badgeClass}`}>
                                  {priorityConfig.label}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.badgeClass}`}>
                                  {statusConfig.label}
                                </span>
                              </div>

                              <h3 className="text-lg font-semibold text-slate-900">{broadcast.title}</h3>
                              <p className="text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                                {broadcast.message}
                              </p>

                              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" />
                                  {getAudienceDescription(broadcast)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  Sent {formatDateTime(broadcast.sentAt ?? broadcast.createdAt)}
                                </span>
                                <span>
                                  Delivered: {broadcast.deliveredCount.toLocaleString()}
                                </span>
                                <span>
                                  Read: {broadcast.readCount.toLocaleString()} ({broadcast.readRate}% )
                                </span>
                                {broadcast.expiresAt && (
                                  <span>Expires on {formatDate(broadcast.expiresAt)}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 lg:items-end">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => setActiveBroadcast(broadcast)}
                              >
                                <Eye className="h-4 w-4" />
                                View details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                disabled={mutatingBroadcastId === broadcast.id}
                                onClick={() => handleArchiveToggle(broadcast)}
                              >
                                {mutatingBroadcastId === broadcast.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : broadcast.isActive ? (
                                  <Archive className="h-4 w-4" />
                                ) : (
                                  <Undo2 className="h-4 w-4" />
                                )}
                                {broadcast.isActive ? 'Archive' : 'Restore'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {!error && !isLoading && filteredBroadcasts.length > 0 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-slate-500">
                      Page {pagination.page} of {pagination.totalPages} • {pagination.total.toLocaleString()} broadcasts
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange('prev')}
                        disabled={page <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange('next')}
                        disabled={page >= pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {showComposeForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Compose Broadcast
              </h2>
              <Button variant="outline" size="icon" onClick={handleComposeClose}>
                <span className="sr-only">Close</span>
                ×
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {formError && (
                <div className="border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">{formError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Title</label>
                <Input
                  value={formState.title}
                  onChange={(event) => handleFormChange('title', event.target.value)}
                  placeholder="Broadcast title"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Message</label>
                <textarea
                  className="w-full min-h-[140px] rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formState.message}
                  onChange={(event) => handleFormChange('message', event.target.value)}
                  placeholder="Write a clear message for your recipients"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Message Type</label>
                  <select
                    value={formState.type}
                    onChange={(event) =>
                      handleFormChange('type', event.target.value as BroadcastTypeValue)
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Priority</label>
                  <select
                    value={formState.priority}
                    onChange={(event) =>
                      handleFormChange('priority', event.target.value as BroadcastPriorityValue)
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Audience</label>
                  <select
                    value={formState.audience}
                    onChange={(event) =>
                      handleFormChange('audience', event.target.value as BroadcastAudienceValue)
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Students</option>
                    <option value="DEPARTMENT">Specific Department</option>
                    <option value="ROLE">Specific Role</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Expires On (optional)</label>
                  <input
                    type="date"
                    value={formState.expiresAt}
                    onChange={(event) => handleFormChange('expiresAt', event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {formState.audience === 'DEPARTMENT' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Department</label>
                  <select
                    value={formState.department}
                    onChange={(event) => handleFormChange('department', event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CANONICAL_DEPARTMENTS.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formState.audience === 'ROLE' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Role</label>
                  <select
                    value={formState.role}
                    onChange={(event) => handleFormChange('role', event.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleComposeClose}
                  className="sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="sm:w-auto flex items-center gap-2">
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isSubmitting ? 'Sending…' : 'Send Broadcast'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeBroadcast && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">Broadcast details</h3>
                  <p className="text-xs text-slate-500">
                    Sent {formatDateTime(activeBroadcast.sentAt ?? activeBroadcast.createdAt)}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={() => setActiveBroadcast(null)}>
                <span className="sr-only">Close</span>
                ×
              </Button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {(() => {
                  const typeConfig = TYPE_CONFIG[activeBroadcast.type]
                  const priorityConfig = PRIORITY_CONFIG[activeBroadcast.priority]
                  const statusConfig = STATUS_CONFIG[activeBroadcast.status]
                  const TypeIcon = typeConfig.icon
                  return (
                    <>
                      <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig.badgeClass}`}>
                        <TypeIcon className="h-3.5 w-3.5" />
                        {typeConfig.label}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig.badgeClass}`}>
                        {priorityConfig.label}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.badgeClass}`}>
                        {statusConfig.label}
                      </span>
                    </>
                  )
                })()}
              </div>

              <div>
                <h4 className="text-xl font-semibold text-slate-900">{activeBroadcast.title}</h4>
                <p className="mt-3 text-slate-700 whitespace-pre-line leading-relaxed">
                  {activeBroadcast.message}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-500">Audience</p>
                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {getAudienceDescription(activeBroadcast)}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Created by {activeBroadcast.createdBy?.name ?? 'Administrator'}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-500">Engagement</p>
                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {activeBroadcast.readCount.toLocaleString()} reads of {activeBroadcast.deliveredCount.toLocaleString()} deliveries
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Read rate {activeBroadcast.readRate}%</p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase text-slate-500">Timeline</p>
                <dl className="mt-2 space-y-1 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <dt>Created</dt>
                    <dd>{formatDateTime(activeBroadcast.createdAt)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Sent</dt>
                    <dd>{formatDateTime(activeBroadcast.sentAt ?? activeBroadcast.createdAt)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Expires</dt>
                    <dd>{formatDate(activeBroadcast.expiresAt)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
