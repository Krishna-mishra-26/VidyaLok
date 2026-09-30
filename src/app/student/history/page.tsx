'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Calendar,
  Download,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { BorrowingStatus } from '@/types'

type StatusFilterValue = 'all' | BorrowingStatus
type YearFilterValue = 'all' | string

type BorrowingApiBook = {
  title?: string | null
  author?: string | null
  isbn?: string | null
  category?: string | null
  publisher?: string | null
  location?: string | null
  condition?: string | null
}

type BorrowingApiRecord = {
  id: string
  userId: string
  bookId: string
  borrowDate: string
  dueDate: string
  returnDate?: string | null
  status?: BorrowingStatus | string | null
  fineAmount?: number | null
  finePaid?: boolean | null
  book?: BorrowingApiBook | null
}

type BorrowingsApiResponse = {
  success: boolean
  data: BorrowingApiRecord[]
  error?: string
}

interface BorrowingHistoryRecord {
  id: string
  title: string
  author: string
  isbn: string
  category: string | null
  publisher: string | null
  location: string | null
  condition: string | null
  borrowDate: Date
  dueDate: Date
  returnDate: Date | null
  status: BorrowingStatus
  fineAmount: number
  finePaid: boolean
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

const STATUS_LABELS: Record<BorrowingStatus, string> = {
  [BorrowingStatus.BORROWED]: 'Borrowed',
  [BorrowingStatus.RETURNED]: 'Returned',
  [BorrowingStatus.OVERDUE]: 'Overdue',
  [BorrowingStatus.LOST]: 'Lost/Damaged',
  [BorrowingStatus.RENEWED]: 'Renewed',
}

const STATUS_ORDER: BorrowingStatus[] = [
  BorrowingStatus.BORROWED,
  BorrowingStatus.RETURNED,
  BorrowingStatus.OVERDUE,
  BorrowingStatus.RENEWED,
  BorrowingStatus.LOST,
]

const CONDITION_LABELS: Record<string, string> = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
  DAMAGED: 'Damaged',
}

const CONDITION_COLORS: Record<string, string> = {
  EXCELLENT: 'text-emerald-600',
  GOOD: 'text-blue-600',
  FAIR: 'text-amber-600',
  POOR: 'text-orange-600',
  DAMAGED: 'text-red-600',
}

const isBorrowingStatus = (value: string): value is BorrowingStatus =>
  (Object.values(BorrowingStatus) as string[]).includes(value)

const parseDate = (value?: string | Date | null): Date | null => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDate = (date: Date | null, fallback = '—') =>
  date
    ? date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : fallback

const formatDuration = (borrowDate: Date, returnDate: Date | null) => {
  const endDate = returnDate ?? new Date()
  const diffMs = Math.max(0, endDate.getTime() - borrowDate.getTime())
  const days = Math.max(1, Math.ceil(diffMs / MS_PER_DAY))
  return returnDate ? `${days} day${days === 1 ? '' : 's'}` : `${days} day${days === 1 ? '' : 's'} so far`
}

const formatCurrency = (value: number) => INR_FORMATTER.format(value)

const formatCondition = (condition?: string | null) => {
  if (!condition) return 'Not specified'
  const upper = condition.toUpperCase()
  return CONDITION_LABELS[upper] ?? condition
}

const getConditionColor = (condition?: string | null) => {
  if (!condition) return 'text-gray-600'
  const upper = condition.toUpperCase()
  return CONDITION_COLORS[upper] ?? 'text-gray-600'
}

const getStatusLabel = (status: BorrowingStatus) => STATUS_LABELS[status] ?? status

const getStatusColor = (status: BorrowingStatus) => {
  switch (status) {
    case BorrowingStatus.RETURNED:
      return 'bg-green-100 text-green-800 border-green-200'
    case BorrowingStatus.OVERDUE:
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case BorrowingStatus.LOST:
      return 'bg-red-100 text-red-800 border-red-200'
    case BorrowingStatus.RENEWED:
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusIcon = (status: BorrowingStatus) => {
  switch (status) {
    case BorrowingStatus.RETURNED:
      return <CheckCircle className="h-4 w-4" />
    case BorrowingStatus.OVERDUE:
      return <AlertTriangle className="h-4 w-4" />
    case BorrowingStatus.LOST:
      return <XCircle className="h-4 w-4" />
    case BorrowingStatus.RENEWED:
      return <RefreshCw className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const normalizeBorrowingHistoryRecord = (
  record: BorrowingApiRecord,
): BorrowingHistoryRecord => {
  const borrowDate = parseDate(record.borrowDate) ?? new Date()
  const dueDate = parseDate(record.dueDate) ?? borrowDate
  const returnDate = parseDate(record.returnDate)

  const rawStatus = typeof record.status === 'string' ? record.status.toUpperCase() : record.status
  const status: BorrowingStatus = rawStatus && isBorrowingStatus(String(rawStatus))
    ? (rawStatus as BorrowingStatus)
    : BorrowingStatus.BORROWED

  return {
    id: record.id,
    title: record.book?.title?.trim() || 'Unknown title',
    author: record.book?.author?.trim() || 'Unknown author',
    isbn: record.book?.isbn?.trim() || 'N/A',
    category: record.book?.category?.trim() || null,
    publisher: record.book?.publisher?.trim() || null,
    location: record.book?.location?.trim() || null,
    condition: record.book?.condition?.trim() || null,
    borrowDate,
    dueDate,
    returnDate,
    status,
    fineAmount: Number(record.fineAmount ?? 0),
    finePaid: Boolean(record.finePaid),
  }
}

export default function StudentHistoryPage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterValue>('all')
  const [selectedYear, setSelectedYear] = useState<YearFilterValue>('all')
  const [historyRecords, setHistoryRecords] = useState<BorrowingHistoryRecord[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const headerUser = useMemo(() => {
    const sessionUser = session?.user

    if (!sessionUser) {
      return undefined
    }

    return {
      name: sessionUser.name ?? 'Student',
      role: sessionUser.role ?? 'STUDENT',
      studentId: sessionUser.studentId ?? sessionUser.id ?? 'UNKNOWN',
    }
  }, [session?.user])

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.replace('/login')
    }
  }, [sessionStatus, router])

  const sessionUserId = session?.user?.id ?? ''

  const fetchHistory = useCallback(
    async (signal?: AbortSignal) => {
      if (!sessionUserId) return

      setIsHistoryLoading(true)
      setLoadError(null)

      try {
        const params = new URLSearchParams({ userId: sessionUserId, limit: '200' })
        const response = await fetch(`/api/borrowings?${params.toString()}`, {
          credentials: 'include',
          signal,
        })

        const payload: BorrowingsApiResponse = await response.json()

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error ?? 'Unable to load borrowing history')
        }

        const normalized = Array.isArray(payload.data)
          ? payload.data.map(normalizeBorrowingHistoryRecord)
          : []

        normalized.sort((a, b) => b.borrowDate.getTime() - a.borrowDate.getTime())
        setHistoryRecords(normalized)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        console.error('Failed to load borrowing history', error)
        setLoadError(error instanceof Error ? error.message : 'Failed to load borrowing history')
      } finally {
        setIsHistoryLoading(false)
      }
    },
    [sessionUserId],
  )

  useEffect(() => {
    if (sessionStatus !== 'authenticated' || !sessionUserId) {
      return
    }

    const controller = new AbortController()
    fetchHistory(controller.signal)

    return () => controller.abort()
  }, [sessionStatus, sessionUserId, fetchHistory])

  const statusOptions = useMemo(() => {
    const unique = new Set(historyRecords.map((record) => record.status))
    return Array.from(unique).sort(
      (a, b) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b),
    )
  }, [historyRecords])

  useEffect(() => {
    if (selectedStatus !== 'all' && !statusOptions.includes(selectedStatus)) {
      setSelectedStatus('all')
    }
  }, [selectedStatus, statusOptions])

  const yearOptions = useMemo(() => {
    const years = new Set(
      historyRecords.map((record) => record.borrowDate.getFullYear().toString()),
    )
    const sortedYears = Array.from(years).sort((a, b) => Number(b) - Number(a))
    return ['all', ...sortedYears]
  }, [historyRecords])

  useEffect(() => {
    if (selectedYear !== 'all' && !yearOptions.includes(selectedYear)) {
      setSelectedYear('all')
    }
  }, [selectedYear, yearOptions])

  const filteredHistory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return historyRecords.filter((record) => {
      const matchesQuery =
        !query ||
        record.title.toLowerCase().includes(query) ||
        record.author.toLowerCase().includes(query) ||
        record.isbn.toLowerCase().includes(query)

      const matchesStatus =
        selectedStatus === 'all' || record.status === selectedStatus

      const matchesYear =
        selectedYear === 'all' || record.borrowDate.getFullYear().toString() === selectedYear

      return matchesQuery && matchesStatus && matchesYear
    })
  }, [historyRecords, searchQuery, selectedStatus, selectedYear])

  const summary = useMemo(() => {
    const total = historyRecords.length
    const currentlyBorrowed = historyRecords.filter(
      (record) => record.status === BorrowingStatus.BORROWED || record.status === BorrowingStatus.RENEWED,
    ).length

    const returned = historyRecords.filter((record) => record.status === BorrowingStatus.RETURNED).length
    const overdue = historyRecords.filter((record) => record.status === BorrowingStatus.OVERDUE).length

    const totalFines = historyRecords.reduce((acc, record) => acc + record.fineAmount, 0)
    const outstandingFines = historyRecords
      .filter((record) => record.fineAmount > 0 && !record.finePaid)
      .reduce((acc, record) => acc + record.fineAmount, 0)

    const averageBorrowDuration = historyRecords.length
      ? Math.round(
          historyRecords.reduce((acc, record) => {
            const durationInDays = Math.ceil(
              ((record.returnDate ?? new Date()).getTime() - record.borrowDate.getTime()) / MS_PER_DAY,
            )
            return acc + Math.max(1, durationInDays)
          }, 0) / historyRecords.length,
        )
      : 0

    return {
      total,
      currentlyBorrowed,
      returned,
      overdue,
      totalFines,
      outstandingFines,
      averageBorrowDuration,
    }
  }, [historyRecords])

  const handleDownloadCsv = useCallback(() => {
    if (!filteredHistory.length) return

    const headerRow = [
      'Title',
      'Author',
      'ISBN',
      'Borrowed On',
      'Due On',
      'Returned On',
      'Status',
      'Fine Amount',
      'Fine Paid',
      'Condition',
    ]

    const rows = filteredHistory.map((record) => [
      record.title,
      record.author,
      record.isbn,
      formatDate(record.borrowDate),
      formatDate(record.dueDate),
      formatDate(record.returnDate, 'Not returned'),
      getStatusLabel(record.status),
      record.fineAmount ? formatCurrency(record.fineAmount) : 'No fine',
      record.fineAmount ? (record.finePaid ? 'Yes' : 'No') : 'N/A',
      record.condition ? formatCondition(record.condition) : 'N/A',
    ])

    const csvContent = [headerRow, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'borrowing-history.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [filteredHistory])

  const renderContent = () => {
    if (sessionStatus === 'loading') {
      return (
        <div className="flex h-full items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )
    }

    if (loadError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          <h3 className="text-lg font-semibold">We couldn’t load your borrowing history</h3>
          <p className="mt-2 text-sm">{loadError}</p>
          <Button className="mt-4" onClick={() => fetchHistory()}>Try again</Button>
        </div>
      )
    }

    if (isHistoryLoading && !historyRecords.length) {
      return (
        <div className="flex h-full items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )
    }

    if (!historyRecords.length) {
      return (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-blue-900">
          <h3 className="text-lg font-semibold">No borrowing activity yet</h3>
          <p className="mt-2 text-sm">Once you borrow books from the library, your full history will show up here.</p>
        </div>
      )
    }

    if (!filteredHistory.length) {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h3 className="text-lg font-semibold">No records match your filters</h3>
          <p className="mt-2 text-sm">Try adjusting your search keywords, status, or year filters.</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {filteredHistory.map((record) => {
          const isReturned = record.status === BorrowingStatus.RETURNED
          const isOverdue = record.status === BorrowingStatus.OVERDUE
          const isLost = record.status === BorrowingStatus.LOST
          const isActive = record.status === BorrowingStatus.BORROWED || record.status === BorrowingStatus.RENEWED

          return (
            <Card key={record.id} className="border border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-slate-900">{record.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600">{record.author}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>ISBN: {record.isbn}</span>
                      {record.category && <span>Category: {record.category}</span>}
                      {record.publisher && <span>Publisher: {record.publisher}</span>}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(record.status)}`}
                    >
                      {getStatusIcon(record.status)}
                      {getStatusLabel(record.status)}
                    </span>

                    {record.fineAmount > 0 && (
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                          record.finePaid ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        {record.finePaid ? 'Fine settled' : `Fine due: ${formatCurrency(record.fineAmount)}`}
                      </span>
                    )}

                    {record.condition && (
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium ${getConditionColor(record.condition)}`}
                      >
                        <FileText className="h-4 w-4" />
                        Condition: {formatCondition(record.condition)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Borrowed on
                    </div>
                    <p className="mt-2 text-base text-slate-900">{formatDate(record.borrowDate)}</p>
                    <p className="text-xs text-slate-500">Duration: {formatDuration(record.borrowDate, record.returnDate)}</p>
                  </div>

                  <div className={`rounded-lg border p-4 ${isOverdue ? 'border-orange-200 bg-orange-50' : 'border-slate-100 bg-slate-50'}`}>
                    <div className={`flex items-center gap-2 text-sm font-semibold ${isOverdue ? 'text-orange-800' : 'text-slate-700'}`}>
                      <Clock className={`h-4 w-4 ${isOverdue ? 'text-orange-600' : 'text-blue-600'}`} />
                      Due on
                    </div>
                    <p className={`mt-2 text-base ${isOverdue ? 'text-orange-800' : 'text-slate-900'}`}>{formatDate(record.dueDate)}</p>
                    <p className={`text-xs ${isOverdue ? 'text-orange-700' : 'text-slate-500'}`}>
                      {isOverdue ? 'Overdue! Please return as soon as possible.' : 'Return or renew before this date.'}
                    </p>
                  </div>

                  <div className={`rounded-lg border p-4 ${isReturned ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}>
                    <div className={`flex items-center gap-2 text-sm font-semibold ${isReturned ? 'text-emerald-800' : 'text-slate-700'}`}>
                      <CheckCircle className={`h-4 w-4 ${isReturned ? 'text-emerald-600' : 'text-blue-600'}`} />
                      Returned on
                    </div>
                    <p className={`mt-2 text-base ${isReturned ? 'text-emerald-900' : 'text-slate-900'}`}>
                      {isReturned ? formatDate(record.returnDate) : 'Not returned yet'}
                    </p>
                    <p className={`text-xs ${isReturned ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {isReturned
                        ? 'Thank you for returning on time!'
                        : isActive
                          ? 'Keep track to avoid fines.'
                          : isLost
                            ? 'Please contact the librarian for assistance.'
                            : 'Please return at the earliest.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  if (sessionStatus === 'loading' && !headerUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your student profile…</span>
        </div>
      </div>
    )
  }

  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-2 text-center text-slate-600">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
          <p>Redirecting you to the login page…</p>
        </div>
      </div>
    )
  }

  const isAuthenticated = sessionStatus === 'authenticated'

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header user={headerUser} />

      <div className="flex flex-1">
        <Sidebar userRole="STUDENT" />

        <main className="flex-1 w-full px-4 pb-16 pt-24 sm:px-6 md:ml-64 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-slate-900">Borrowing History</h1>
              <p className="text-slate-600">
                Track every book you have borrowed, stay on top of due dates, and keep your fines clear.
              </p>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total books handled</p>
                  <p className="text-xl font-semibold text-slate-900">{summary.total}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Returned on time</p>
                  <p className="text-xl font-semibold text-slate-900">{summary.returned}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Currently overdue</p>
                  <p className="text-xl font-semibold text-slate-900">{summary.overdue}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Avg. borrow duration</p>
                  <p className="text-xl font-semibold text-slate-900">{summary.averageBorrowDuration} days</p>
                </div>
              </CardContent>
            </Card>
          </section>

            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search by title, author, or ISBN"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="pl-10"
                    aria-label="Search borrowing history"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value as StatusFilterValue)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    aria-label="Filter by status"
                  >
                    <option value="all">All statuses</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(event.target.value as YearFilterValue)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    aria-label="Filter by year"
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year === 'all' ? 'All years' : year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={handleDownloadCsv}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                disabled={!filteredHistory.length || !isAuthenticated}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </CardContent>
          </Card>

            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
