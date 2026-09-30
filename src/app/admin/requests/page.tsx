'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Clock,
  ListChecks,
  Loader2,
  PenSquare,
  RefreshCcw,
  Search,
  XCircle,
} from 'lucide-react'

interface AdminRequestItem {
  id: string
  requestType: string
  bookTitle: string
  author: string | null
  isbn: string | null
  reason: string
  priority: string
  status: string
  adminNotes: string | null
  respondedAt: string | null
  createdAt: string
  publisher: string | null
  edition: string | null
  description: string | null
  user?: {
    id: string
    name: string | null
    email: string | null
    studentId: string | null
    branch: string | null
    department: string | null
  }
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ORDERED', label: 'Ordered' },
  { value: 'COMPLETED', label: 'Completed' },
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const requestTypeLabel = (type: string) => {
  switch (type) {
    case 'book_request':
      return 'Book Purchase'
    case 'book_renewal':
      return 'Book Renewal'
    case 'library_service':
      return 'Library Service'
    case 'research_access':
      return 'Research Access'
    case 'study_room':
      return 'Study Room'
    default:
      return 'Other'
  }
}

const statusBadgeClasses = (status: string) => {
  const normalized = status?.toLowerCase?.() ?? ''
  switch (normalized) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700'
    case 'approved':
      return 'bg-green-100 text-green-700'
    case 'rejected':
      return 'bg-red-100 text-red-700'
    case 'ordered':
    case 'in_progress':
      return 'bg-blue-100 text-blue-700'
    case 'completed':
      return 'bg-emerald-100 text-emerald-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const priorityBadgeClasses = (priority: string) => {
  const normalized = priority?.toLowerCase?.() ?? ''
  switch (normalized) {
    case 'high':
      return 'bg-red-100 text-red-700'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700'
    case 'low':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const statusIcon = (status: string) => {
  const normalized = status?.toLowerCase?.() ?? ''
  switch (normalized) {
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'ordered':
    case 'in_progress':
      return <AlertCircle className="h-4 w-4 text-blue-500" />
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-emerald-500" />
    default:
      return <ListChecks className="h-4 w-4 text-gray-500" />
  }
}

const formatDate = (value: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminRequestsPage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()

  const [requests, setRequests] = useState<AdminRequestItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [activeRequest, setActiveRequest] = useState<AdminRequestItem | null>(null)
  const [formStatus, setFormStatus] = useState('PENDING')
  const [formPriority, setFormPriority] = useState('medium')
  const [formNotes, setFormNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const user = session?.user
  const isAuthorized = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN'

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.replace('/admin/login')
    }
  }, [sessionStatus, router])

  useEffect(() => {
    if (sessionStatus === 'authenticated' && !isAuthorized) {
      router.replace('/admin/login')
    }
  }, [sessionStatus, isAuthorized, router])

  const headerUser = isAuthorized
    ? {
        name: user?.name ?? 'Library Admin',
        role: user?.role ?? 'ADMIN',
        studentId: user?.studentId ?? user?.email ?? 'ADMIN',
      }
    : undefined

  const fetchRequests = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/book-requests', {
        credentials: 'include',
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.message ?? 'Failed to load requests')
      }

      const data = Array.isArray(payload?.data) ? (payload.data as AdminRequestItem[]) : []
      setRequests(data)
      setActiveRequest((prev) => {
        if (!data.length) return null
        if (!prev) return data[0]
        const updated = data.find((item) => item.id === prev.id)
        return updated ?? data[0]
      })
    } catch (fetchError) {
      console.error('Failed to load admin requests', fetchError)
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load requests')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sessionStatus === 'authenticated' && isAuthorized) {
      fetchRequests()
    }
  }, [sessionStatus, isAuthorized, fetchRequests])

  useEffect(() => {
    if (activeRequest) {
      setFormStatus(activeRequest.status ?? 'PENDING')
      setFormPriority((activeRequest.priority ?? 'medium').toLowerCase())
      setFormNotes(activeRequest.adminNotes ?? '')
      setUpdateMessage(null)
    } else {
      setUpdateMessage(null)
    }
  }, [activeRequest])

  useEffect(() => {
    if (!updateMessage) return
    const timeout = setTimeout(() => setUpdateMessage(null), 4000)
    return () => clearTimeout(timeout)
  }, [updateMessage])

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return requests.filter((request) => {
      const matchesSearch =
        query.length === 0 ||
        [
          request.bookTitle,
          request.author ?? '',
          request.isbn ?? '',
          request.user?.name ?? '',
          request.user?.studentId ?? '',
        ].some((field) => field?.toLowerCase?.().includes(query))

      const matchesStatus =
        statusFilter === 'all' || request.status?.toUpperCase?.() === statusFilter

      const matchesPriority =
        priorityFilter === 'all' || request.priority?.toLowerCase?.() === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [requests, searchQuery, statusFilter, priorityFilter])

  const statusSummary = useMemo(() => {
    return requests.reduce(
      (summary, request) => {
        const normalized = request.status?.toLowerCase?.() ?? 'pending'
        summary.total += 1
        if (normalized === 'pending') summary.pending += 1
        if (normalized === 'approved') summary.approved += 1
        if (normalized === 'rejected') summary.rejected += 1
        if (normalized === 'ordered' || normalized === 'in_progress') summary.ordered += 1
        if (normalized === 'completed') summary.completed += 1
        return summary
      },
      { total: 0, pending: 0, approved: 0, rejected: 0, ordered: 0, completed: 0 }
    )
  }, [requests])

  const updateRequest = useCallback(
    async (updates: { status?: string; priority?: string; adminNotes?: string | null }) => {
      if (!activeRequest) return

      setIsUpdating(true)
      setUpdateMessage(null)

      try {
        const response = await fetch(`/api/book-requests/${activeRequest.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(updates),
        })

        const payload = (await response.json().catch(() => null)) as {
          data?: AdminRequestItem
          message?: string
        } | null

        if (!response.ok) {
          throw new Error(payload?.message ?? 'Failed to update request')
        }

        const updated = payload?.data

        if (updated) {
          setRequests((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)))
          setActiveRequest((prev) => {
            if (!prev) return updated
            return prev.id === updated.id ? { ...prev, ...updated } : prev
          })
          setFormStatus(updated.status ?? 'PENDING')
          setFormPriority((updated.priority ?? 'medium').toLowerCase())
          setFormNotes(updated.adminNotes ?? '')
        } else {
          await fetchRequests()
        }

        setUpdateMessage({ type: 'success', text: 'Request updated successfully.' })
      } catch (updateError) {
        console.error('Failed to update request', updateError)
        setUpdateMessage({
          type: 'error',
          text: updateError instanceof Error ? updateError.message : 'Failed to update request',
        })
      } finally {
        setIsUpdating(false)
      }
    },
    [activeRequest, fetchRequests]
  )

  const handleSubmitUpdate = () => {
    updateRequest({
      status: formStatus,
      priority: formPriority,
      adminNotes: formNotes.trim() ? formNotes.trim() : null,
    })
  }

  const handleQuickUpdate = (statusValue: string) => {
    setFormStatus(statusValue)
    updateRequest({
      status: statusValue,
      priority: formPriority,
      adminNotes: formNotes.trim() ? formNotes.trim() : null,
    })
  }

  if (sessionStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    )
  }

  if (!isAuthorized || !headerUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
          <p className="text-gray-600">Redirecting to admin login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={headerUser} />
      <div className="flex">
        <Sidebar userRole="ADMIN" />
  <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Book Requests Management</h1>
                <p className="text-gray-600">Review, approve, and track student requests in real-time.</p>
              </div>
              <Button
                variant="outline"
                onClick={fetchRequests}
                disabled={isLoading}
                className="w-full rounded-lg border-slate-200 bg-white text-slate-600 shadow-sm transition-colors md:w-auto hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Refreshing
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Refresh
                  </span>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-gray-500">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{statusSummary.total}</p>
                  </div>
                  <ListChecks className="h-5 w-5 text-blue-500" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{statusSummary.pending}</p>
                  </div>
                  <Clock className="h-5 w-5 text-yellow-500" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-gray-500">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{statusSummary.approved}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-gray-500">Action Needed</p>
                    <p className="text-2xl font-bold text-blue-600">{statusSummary.pending + statusSummary.ordered}</p>
                  </div>
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search by title, student, or ISBN"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="all">All Statuses</option>
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      value={priorityFilter}
                      onChange={(event) => setPriorityFilter(event.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="all">All Priorities</option>
                      {priorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Requests Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {isLoading ? (
                  <div className="flex items-center justify-center gap-3 py-12 text-gray-600">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading requests...</span>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-center text-gray-500">
                    <BookOpen className="h-10 w-10 text-gray-400" />
                    <p className="font-medium text-gray-700">No requests found</p>
                    <p className="text-sm">Adjust your filters or refresh to see the latest submissions.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 text-slate-700">
                      <thead className="bg-slate-50/90 backdrop-blur-sm">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Request</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Student</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Submitted</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white/95">
                        {filteredRequests.map((request) => {
                          const isActive = activeRequest?.id === request.id
                          return (
                            <tr
                              key={request.id}
                              className={isActive ? 'bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50' : undefined}
                            >
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-800">{request.bookTitle}</div>
                                <div className="text-xs text-slate-500">{requestTypeLabel(request.requestType)}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-slate-800">{request.user?.name ?? 'Unknown Student'}</div>
                                <div className="text-xs text-slate-500">{request.user?.studentId ?? request.user?.email ?? '—'}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">{formatDate(request.createdAt)}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityBadgeClasses(request.priority)}`}>
                                  {request.priority?.toUpperCase?.() ?? 'MEDIUM'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses(request.status)}`}>
                                  {statusIcon(request.status)}
                                  {request.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  size="sm"
                                  variant={isActive ? 'default' : 'outline'}
                                  onClick={() => setActiveRequest(request)}
                                  className={
                                    isActive
                                      ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-md hover:from-sky-500 hover:via-blue-500 hover:to-indigo-500'
                                      : 'border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                                  }
                                >
                                  <span className="flex items-center gap-2">
                                    <PenSquare className="h-4 w-4" />
                                    Review
                                  </span>
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {activeRequest && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Request Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs uppercase text-gray-500">Title</p>
                        <p className="text-sm font-medium text-gray-900">{activeRequest.bookTitle}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-gray-500">Request Type</p>
                        <p className="text-sm text-gray-700">{requestTypeLabel(activeRequest.requestType)}</p>
                      </div>
                      {activeRequest.author && (
                        <div>
                          <p className="text-xs uppercase text-gray-500">Author</p>
                          <p className="text-sm text-gray-700">{activeRequest.author}</p>
                        </div>
                      )}
                      {activeRequest.publisher && (
                        <div>
                          <p className="text-xs uppercase text-gray-500">Publisher</p>
                          <p className="text-sm text-gray-700">{activeRequest.publisher}</p>
                        </div>
                      )}
                      {activeRequest.edition && (
                        <div>
                          <p className="text-xs uppercase text-gray-500">Edition</p>
                          <p className="text-sm text-gray-700">{activeRequest.edition}</p>
                        </div>
                      )}
                      {activeRequest.isbn && (
                        <div>
                          <p className="text-xs uppercase text-gray-500">ISBN</p>
                          <p className="text-sm text-gray-700">{activeRequest.isbn}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs uppercase text-gray-500">Student</p>
                        <p className="text-sm font-medium text-gray-900">{activeRequest.user?.name ?? 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{activeRequest.user?.studentId ?? activeRequest.user?.email ?? '—'}</p>
                      </div>
                      {activeRequest.user?.department && (
                        <div>
                          <p className="text-xs uppercase text-gray-500">Department</p>
                          <p className="text-sm text-gray-700">{activeRequest.user.department}</p>
                        </div>
                      )}
                      {activeRequest.user?.branch && (
                        <div>
                          <p className="text-xs uppercase text-gray-500">Branch</p>
                          <p className="text-sm text-gray-700">{activeRequest.user.branch}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs uppercase text-gray-500">Submitted On</p>
                        <p className="text-sm text-gray-700">{formatDate(activeRequest.createdAt)}</p>
                      </div>
                      {activeRequest.respondedAt && (
                        <div>
                          <p className="text-xs uppercase text-gray-500">Last Updated</p>
                          <p className="text-sm text-gray-700">{formatDate(activeRequest.respondedAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase text-gray-500">Reason</p>
                    <p className="text-sm text-gray-700">{activeRequest.reason}</p>
                    {activeRequest.description && (
                      <div>
                        <p className="text-xs uppercase text-gray-500">Additional Details</p>
                        <p className="text-sm text-gray-700">{activeRequest.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={formStatus}
                        onChange={(event) => setFormStatus(event.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Priority</label>
                      <select
                        value={formPriority}
                        onChange={(event) => setFormPriority(event.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        {priorityOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Current Status</label>
                      <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${statusBadgeClasses(activeRequest.status)}`}>
                        {statusIcon(activeRequest.status)}
                        {activeRequest.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Admin Notes</label>
                    <textarea
                      value={formNotes}
                      onChange={(event) => setFormNotes(event.target.value)}
                      rows={4}
                      placeholder="Add response or processing notes for this request..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  {updateMessage && (
                    <div
                      className={`rounded-lg border p-3 text-sm ${
                        updateMessage.type === 'error'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-green-200 bg-green-50 text-green-700'
                      }`}
                    >
                      {updateMessage.text}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleSubmitUpdate} disabled={isUpdating} className="bg-blue-600 text-white hover:bg-blue-700">
                      {isUpdating ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleQuickUpdate('APPROVED')}
                      disabled={isUpdating || formStatus === 'APPROVED'}
                      className="border-green-200 text-green-600 hover:bg-green-50"
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleQuickUpdate('REJECTED')}
                      disabled={isUpdating || formStatus === 'REJECTED'}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleQuickUpdate('ORDERED')}
                      disabled={isUpdating || formStatus === 'ORDERED'}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      Mark Ordered
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
