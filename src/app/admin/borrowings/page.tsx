'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  Filter,
  IndianRupee,
  Loader2,
  RefreshCw,
  Search,
  TrendingUp
} from 'lucide-react'

import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BorrowingStatus } from '@/types'

type BorrowingStatusFilter = 'ALL' | keyof typeof BorrowingStatus

type BorrowingsApiResponse = {
  success: boolean
  data: BorrowingApiRecord[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  metrics: {
    active: number
    overdue: number
    dueSoon: number
    outstandingFine: number
  }
  generatedAt: string
  error?: string
}

type BorrowingApiRecord = {
  id: string
  borrowDate: string
  dueDate: string
  returnDate: string | null
  status: BorrowingStatus
  fineAmount: number
  finePaid: boolean
  user: {
    id: string
    name: string
    email: string
    studentId: string
    phone: string | null
    branch: string | null
    department: string | null
  }
  book: {
    id: string
    title: string
    author: string
    isbn: string
    category: string
    publisher: string | null
  }
}

type BorrowingRow = {
  id: string
  borrowDate: Date
  dueDate: Date
  returnDate: Date | null
  status: BorrowingStatus
  fineAmount: number
  finePaid: boolean
  user: BorrowingApiRecord['user']
  book: BorrowingApiRecord['book']
}

const PAGE_SIZE = 25
const SEARCH_DEBOUNCE_MS = 250

const STATUS_OPTIONS: Array<{ label: string; value: BorrowingStatusFilter }> = [
  { label: 'All statuses', value: 'ALL' },
  { label: 'Active (Borrowed)', value: 'BORROWED' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Returned', value: 'RETURNED' },
  { label: 'Renewed', value: 'RENEWED' },
  { label: 'Lost / Missing', value: 'LOST' }
]

const STATUS_STYLES: Record<BorrowingStatus, string> = {
  BORROWED: 'bg-blue-50 text-blue-700 border border-blue-200',
  OVERDUE: 'bg-red-50 text-red-700 border border-red-200',
  RETURNED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  RENEWED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  LOST: 'bg-orange-50 text-orange-700 border border-orange-200'
}

const SORT_FIELDS = [
  { value: 'borrowDate', label: 'Borrowed on' },
  { value: 'dueDate', label: 'Due on' },
  { value: 'returnDate', label: 'Returned on' },
  { value: 'fineAmount', label: 'Fine amount' }
]

const formatDateTime = (value: Date | null) =>
  value
    ? value.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '—'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value)

export default function AdminBorrowingsPage() {
  const [records, setRecords] = useState<BorrowingRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<BorrowingStatusFilter>('ALL')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [withFinesOnly, setWithFinesOnly] = useState(false)
  const [outstandingOnly, setOutstandingOnly] = useState(false)
  const [sortField, setSortField] = useState<'borrowDate' | 'dueDate' | 'returnDate' | 'fineAmount'>(
    'borrowDate'
  )
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 })
  const [metrics, setMetrics] = useState({ active: 0, overdue: 0, dueSoon: 0, outstandingFine: 0 })
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(PAGE_SIZE))
    params.set('sort', sortField)
    params.set('direction', sortDirection)

    if (statusFilter !== 'ALL') {
      params.set('status', statusFilter)
    }

    if (debouncedSearch) {
      params.set('q', debouncedSearch)
    }

    if (overdueOnly) {
      params.set('overdue', 'true')
    }

    if (withFinesOnly) {
      params.set('withFines', 'true')
    }

    if (outstandingOnly) {
      params.set('outstandingFines', 'true')
    }

    return params
  }, [page, sortField, sortDirection, statusFilter, debouncedSearch, overdueOnly, withFinesOnly, outstandingOnly])

  const fetchBorrowings = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = buildQueryParams()

      const response = await fetch(`/api/admin/borrowings?${params.toString()}`, {
        cache: 'no-store'
      })

      const payload: BorrowingsApiResponse | null = await response.json().catch(() => null)

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error ?? 'Unable to load borrowings right now.')
      }

      const normalized: BorrowingRow[] = payload.data.map((record) => ({
        id: record.id,
        borrowDate: new Date(record.borrowDate),
        dueDate: new Date(record.dueDate),
        returnDate: record.returnDate ? new Date(record.returnDate) : null,
        status: record.status,
        fineAmount: Number(record.fineAmount ?? 0),
        finePaid: Boolean(record.finePaid),
        user: record.user,
        book: record.book
      }))

      setRecords(normalized)
      setPagination(payload.pagination)
      setMetrics(payload.metrics)
      setLastUpdated(new Date(payload.generatedAt))
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load borrowings')
      setRecords([])
    } finally {
      setIsLoading(false)
    }
  }, [buildQueryParams])

  useEffect(() => {
    fetchBorrowings()
  }, [fetchBorrowings])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, overdueOnly, withFinesOnly, outstandingOnly, sortField, sortDirection, debouncedSearch])

  const refresh = useCallback(() => {
    fetchBorrowings()
  }, [fetchBorrowings])

  const resultsSummary = useMemo(() => {
    if (isLoading) {
      return 'Refreshing borrowing ledger…'
    }

    if (error) {
      return error
    }

    const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1
    const end = Math.min(pagination.page * pagination.pageSize, pagination.total)
    return `Showing ${start}-${end} of ${pagination.total} records`
  }, [isLoading, error, pagination])

  const canGoPrevious = pagination.page > 1
  const canGoNext = pagination.page < pagination.totalPages

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar userRole="ADMIN" />
        <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Borrowing Operations</h1>
                <p className="text-gray-600 mt-1">
                  Monitor every lending transaction, overdue follow-up, and fine in real-time.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={refresh} disabled={isLoading} className="flex items-center gap-2">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Refresh
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-blue-700">{metrics.active.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">Currently issued copies</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Alerts</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-red-600">{metrics.overdue.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">Require immediate follow-up</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Due in 3 days</CardTitle>
                  <CalendarClock className="h-5 w-5 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-amber-600">{metrics.dueSoon.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">Send reminders proactively</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outstanding Fines</CardTitle>
                  <IndianRupee className="h-5 w-5 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-emerald-600">{formatCurrency(metrics.outstandingFine)}</div>
                  <p className="text-xs text-gray-500">Pending collections</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Borrowing Ledger</CardTitle>
                  <p className="text-sm text-gray-500">{resultsSummary}</p>
                  {lastUpdated && (
                    <p className="text-xs text-gray-400 mt-1">Last updated {formatDateTime(lastUpdated)}</p>
                  )}
                </div>
                <div className="flex flex-col gap-3 w-full lg:w-auto">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 lg:w-72">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by student, book, ISBN, or email"
                        className="pl-9"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className={`flex items-center gap-2 ${overdueOnly ? '!border-red-500 !text-red-600' : ''}`}
                      onClick={() => setOverdueOnly((value) => !value)}
                    >
                      <Filter className="h-4 w-4" />
                      Overdue
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value as BorrowingStatusFilter)}
                      className="min-w-[180px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={sortField}
                      onChange={(event) => setSortField(event.target.value as typeof sortField)}
                      className="min-w-[160px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                      {SORT_FIELDS.map((field) => (
                        <option key={field.value} value={field.value}>
                          Sort by {field.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={sortDirection}
                      onChange={(event) => setSortDirection(event.target.value as typeof sortDirection)}
                      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="desc">Newest first</option>
                      <option value="asc">Oldest first</option>
                    </select>

                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={withFinesOnly}
                        onChange={(event) => setWithFinesOnly(event.target.checked)}
                      />
                      Show fines
                    </label>

                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={outstandingOnly}
                        onChange={(event) => setOutstandingOnly(event.target.checked)}
                      />
                      Unpaid only
                    </label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="min-w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Borrowed on</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Book details</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Due / Returned</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Fine</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {records.length === 0 && !isLoading ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                            No borrowing records match your filters yet.
                          </td>
                        </tr>
                      ) : (
                        records.map((record) => {
                          const statusClass = STATUS_STYLES[record.status] ?? 'bg-gray-100 text-gray-700'
                          const isOverdue = record.status === BorrowingStatus.OVERDUE
                          const hasFine = record.fineAmount > 0
                          const fineLabel = record.finePaid ? 'Paid' : hasFine ? 'Pending' : '—'

                          return (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 text-sm text-gray-700">
                                <div className="font-medium text-gray-900">{formatDateTime(record.borrowDate)}</div>
                                <div className="text-xs text-gray-500">#{record.id.slice(-8)}</div>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-700">
                                <div className="font-medium text-gray-900">{record.user.name}</div>
                                <div className="text-xs text-gray-500">ID: {record.user.studentId}</div>
                                <div className="text-xs text-gray-400">{record.user.email}</div>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-700">
                                <div className="font-medium text-gray-900">{record.book.title}</div>
                                <div className="text-xs text-gray-500">{record.book.author}</div>
                                <div className="text-xs text-gray-400">ISBN: {record.book.isbn}</div>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-700">
                                <div className="font-medium text-gray-900">Due {formatDateTime(record.dueDate)}</div>
                                <div className="text-xs text-gray-500">
                                  {record.returnDate ? `Returned ${formatDateTime(record.returnDate)}` : 'Not returned'}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm">
                                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                                  <TrendingUp className="h-3.5 w-3.5" />
                                  {record.status}
                                </span>
                                {isOverdue && (
                                  <div className="text-xs text-red-600 mt-1">Overdue — escalate with student</div>
                                )}
                              </td>
                              <td className="px-4 py-4 text-right text-sm text-gray-700">
                                <div className={`font-semibold ${hasFine ? 'text-emerald-600' : 'text-gray-500'}`}>
                                  {hasFine ? formatCurrency(record.fineAmount) : '—'}
                                </div>
                                <div className={`text-xs ${record.finePaid ? 'text-emerald-600' : hasFine ? 'text-red-600' : 'text-gray-400'}`}>
                                  {fineLabel}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>

                  {isLoading && (
                    <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Syncing live data…
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-gray-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={!canGoPrevious || isLoading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage((current) => current + 1)}
                      disabled={!canGoNext || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
