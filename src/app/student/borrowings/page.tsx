'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BookOpen, Clock, AlertTriangle, CheckCircle, Calendar, User, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

type BorrowingStatus = 'BORROWED' | 'OVERDUE' | 'RETURNED' | 'RENEWED' | 'LOST'

interface BorrowedBook {
  title: string
  author: string
  isbn: string
  category: string
  publisher?: string | null
}

interface BorrowingApiBook {
  title?: string | null
  author?: string | null
  isbn?: string | null
  category?: string | null
  publisher?: string | null
}

interface BorrowingApiRecord {
  id: string
  userId: string
  bookId: string
  borrowDate: string
  dueDate: string
  returnDate?: string | null
  status: BorrowingStatus
  fineAmount?: number | null
  finePaid?: boolean | null
  book?: BorrowingApiBook | null
}

interface BorrowingsApiResponse {
  success: boolean
  data: BorrowingApiRecord[]
  error?: string
}

interface BorrowingRecord {
  id: string
  book: BorrowedBook
  borrowDate: Date
  dueDate: Date
  returnDate?: Date | null
  status: BorrowingStatus
  fineAmount: number
  finePaid: boolean
  daysUntilDue: number
  renewalCount?: number
  maxRenewals?: number
  rating?: number
}

const DAILY_FINE_INR = 2
const MS_IN_DAY = 1000 * 60 * 60 * 24
const DEFAULT_MAX_RENEWALS = 2

const startOfToday = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

const formatDate = (date?: Date | null) =>
  date
    ? date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : '—'

const getDaysUntilDue = (dueDate: Date, baseDate: Date) => {
  const diffDays = (dueDate.getTime() - baseDate.getTime()) / MS_IN_DAY
  return diffDays >= 0 ? Math.ceil(diffDays) : Math.floor(diffDays)
}

const normalizeBorrowingRecord = (record: BorrowingApiRecord, baseDate: Date): BorrowingRecord => {
  const borrowDate = new Date(record.borrowDate)
  const dueDate = new Date(record.dueDate)
  const returnDate = record.returnDate ? new Date(record.returnDate) : null

  const statusFromApi = (record.status ?? 'BORROWED') as BorrowingStatus
  const daysUntilDue = getDaysUntilDue(dueDate, baseDate)
  const normalizedStatus: BorrowingStatus =
    statusFromApi === 'BORROWED' && daysUntilDue < 0 ? 'OVERDUE' : statusFromApi

  const overdueDays = normalizedStatus === 'OVERDUE' ? Math.abs(daysUntilDue) : 0
  const baseFine = Number(record.fineAmount ?? 0)
  const fineAmount =
    normalizedStatus === 'OVERDUE' ? Math.max(baseFine, overdueDays * DAILY_FINE_INR) : baseFine

  return {
    id: record.id,
    book: {
      title: record.book?.title ?? 'Unknown title',
      author: record.book?.author ?? 'Unknown author',
      isbn: record.book?.isbn ?? 'N/A',
      category: record.book?.category ?? 'Uncategorized',
      publisher: record.book?.publisher ?? null
    },
    borrowDate,
    dueDate,
    returnDate,
    status: normalizedStatus,
    fineAmount,
    finePaid: Boolean(record.finePaid),
    daysUntilDue,
    renewalCount: 0,
    maxRenewals: DEFAULT_MAX_RENEWALS
  }
}

export default function StudentBorrowingsPage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')
  const [borrowings, setBorrowings] = useState<BorrowingRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  const studentId = session?.user?.id ?? ''
  const headerUser = session?.user
    ? {
        name: session.user.name ?? 'Student',
        role: session.user.role ?? 'STUDENT',
        studentId: session.user.studentId ?? 'UNKNOWN'
      }
    : undefined

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.replace('/login')
    }
  }, [sessionStatus, router])

  const fetchBorrowings = useCallback(async () => {
    if (!studentId) {
      return
    }

    setIsLoading(true)
    setLoadError(null)

    try {
      const params = new URLSearchParams({
        userId: studentId,
        limit: '100'
      })

      const response = await fetch(`/api/borrowings?${params.toString()}`, {
        credentials: 'include'
      })

      const payload: BorrowingsApiResponse | null = await response.json().catch(() => null)

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error ?? 'Unable to load borrowings')
      }

      const baseDate = startOfToday()
      const normalized = Array.isArray(payload.data)
        ? payload.data.map((record) => normalizeBorrowingRecord(record, baseDate))
        : []

      setBorrowings(normalized)
    } catch (error) {
      console.error('Failed to load borrowings', error)
      setLoadError(error instanceof Error ? error.message : 'Unable to load borrowings')
    } finally {
      setIsLoading(false)
      setHasFetched(true)
    }
  }, [studentId])

  useEffect(() => {
    if (sessionStatus === 'authenticated' && studentId) {
      fetchBorrowings()
    }
  }, [sessionStatus, studentId, fetchBorrowings])

  const { activeBorrowings, overdueBorrowings, borrowingHistory } = useMemo(() => {
    const active: BorrowingRecord[] = []
    const overdue: BorrowingRecord[] = []
    const history: BorrowingRecord[] = []

    borrowings.forEach((record) => {
      switch (record.status) {
        case 'RETURNED':
          history.push(record)
          break
        case 'OVERDUE':
          overdue.push(record)
          break
        case 'BORROWED':
        case 'RENEWED':
          active.push(record)
          break
        case 'LOST':
          overdue.push(record)
          break
        default:
          history.push(record)
      }
    })

    return {
      activeBorrowings: active,
      overdueBorrowings: overdue,
      borrowingHistory: history
    }
  }, [borrowings])

  const summary = useMemo(() => {
    const outstandingFine = [...activeBorrowings, ...overdueBorrowings].reduce((sum, borrowing) => {
      if (borrowing.finePaid) {
        return sum
      }
      return sum + borrowing.fineAmount
    }, 0)

    const completedReads = borrowingHistory.filter((record) => record.status === 'RETURNED').length

    return {
      activeBorrowings: activeBorrowings.length,
      overdueBorrowings: overdueBorrowings.length,
      totalFine: outstandingFine,
      booksRead: completedReads
    }
  }, [activeBorrowings, overdueBorrowings, borrowingHistory])

  const isPageLoading = isLoading || sessionStatus === 'loading'

  const handleRenewBook = async (borrowingId: string) => {
    // TODO: Implement renewal functionality
    console.log('Renewing book:', borrowingId)
  }

  const handlePayFine = async (borrowingId: string) => {
    // TODO: Implement fine payment
    console.log('Paying fine for:', borrowingId)
  }

  const getStatusColor = (status: BorrowingStatus) => {
    switch (status) {
      case 'BORROWED':
      case 'RENEWED':
        return 'bg-blue-100 text-blue-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      case 'RETURNED':
        return 'bg-green-100 text-green-800'
      case 'LOST':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: BorrowingStatus) => {
    switch (status) {
      case 'OVERDUE':
        return 'Overdue'
      case 'RETURNED':
        return 'Returned'
      case 'RENEWED':
        return 'Renewed'
      case 'LOST':
        return 'Marked Lost'
      default:
        return 'Borrowed'
    }
  }

  const renderStars = (rating = 0) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ))

  const renderBorrowingCard = (borrowing: BorrowingRecord) => {
    const isOverdue = borrowing.status === 'OVERDUE'
    const renewalsUsed = borrowing.renewalCount ?? 0
    const maxRenewals = borrowing.maxRenewals ?? DEFAULT_MAX_RENEWALS
    const canRenew =
      (borrowing.status === 'BORROWED' || borrowing.status === 'RENEWED') && renewalsUsed < maxRenewals
    const daysIndicator = isOverdue
      ? Math.abs(borrowing.daysUntilDue)
      : Math.max(borrowing.daysUntilDue, 0)
    const outstandingFine = borrowing.fineAmount > 0 && !borrowing.finePaid

    return (
      <Card key={borrowing.id} className={isOverdue ? 'border-red-200 bg-red-50' : ''}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{borrowing.book.title}</h3>
                  <p className="text-gray-600 flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{borrowing.book.author}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    ISBN: {borrowing.book.isbn} • {borrowing.book.category}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(borrowing.status)}`}>
                  {getStatusLabel(borrowing.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Borrowed Date</p>
                    <p className="font-medium">{formatDate(borrowing.borrowDate)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Due Date</p>
                    <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                      {formatDate(borrowing.dueDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-gray-500">{isOverdue ? 'Overdue by' : 'Days left'}</p>
                    <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                      {daysIndicator} {daysIndicator === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                </div>
              </div>

              {borrowing.fineAmount > 0 && (
                <div
                  className={`mt-3 rounded-lg border p-3 ${
                    borrowing.finePaid
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-amber-200 bg-amber-50'
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      borrowing.finePaid ? 'text-emerald-700' : 'text-amber-800'
                    }`}
                  >
                    {borrowing.finePaid ? 'Fine Paid' : 'Fine Amount'}: ₹
                    {borrowing.fineAmount.toLocaleString('en-IN')}
                  </p>
                  <p className={`text-xs ${borrowing.finePaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {borrowing.finePaid
                      ? 'This fine has already been settled.'
                      : 'Late return fine (₹2 per day)'}
                  </p>
                </div>
              )}
            </div>

            <div className="ml-6 flex flex-col space-y-2">
              {canRenew && (
                <Button onClick={() => handleRenewBook(borrowing.id)} size="sm" variant="outline">
                  Renew Book
                </Button>
              )}
              {outstandingFine && (
                <Button
                  onClick={() => handlePayFine(borrowing.id)}
                  size="sm"
                  variant="default"
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Pay Fine
                </Button>
              )}
              <p className="text-xs text-gray-500 text-center">
                Renewals: {renewalsUsed}/{maxRenewals}
              </p>
              {borrowing.fineAmount > 0 && borrowing.finePaid && (
                <p className="text-xs text-emerald-600 text-center">Fine settled</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleBrowseBooks = () => {
    router.push('/student/books')
  }

  const LoadingState = () => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center space-y-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">Fetching your borrowings</p>
          <p className="text-xs text-gray-500">Please wait while we load the latest records.</p>
        </div>
      </CardContent>
    </Card>
  )

  const ErrorState = ({ message }: { message: string }) => (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <div>
          <h3 className="text-lg font-semibold text-red-700">Unable to load borrowings</h3>
          <p className="text-sm text-red-600">{message}</p>
        </div>
        <Button onClick={() => fetchBorrowings()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </CardContent>
    </Card>
  )

  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="flex min-h-screen flex-col">
        <Header user={headerUser} />
        <main className="flex flex-1 items-center justify-center bg-gray-50 p-6">
          <Card>
            <CardContent className="space-y-3 p-8 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-amber-500" />
              <h2 className="text-xl font-semibold text-gray-900">Please sign in</h2>
              <p className="text-sm text-gray-600">
                You need to be signed in as a student to view your borrowings.
              </p>
              <Button onClick={() => router.replace('/login')} className="mt-2">
                Go to login
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const showLoadingState = isPageLoading && !hasFetched

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={headerUser} />

      <div className="flex flex-1">
        <Sidebar userRole="STUDENT" />

        <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">
            {showLoadingState ? (
              <LoadingState />
            ) : loadError ? (
              <ErrorState message={loadError} />
            ) : (
              <>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">My Borrowings</h1>
                    <p className="text-gray-600">Manage your borrowed books and view history</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="gap-2 rounded-full border-blue-200 bg-blue-50 text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-100 hover:text-blue-700 focus-visible:ring-offset-2 focus-visible:ring-blue-200 disabled:pointer-events-none disabled:border-blue-100 disabled:bg-blue-50 disabled:text-blue-300"
                      onClick={() => fetchBorrowings()}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Currently Borrowed</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary.activeBorrowings}</div>
                      <p className="text-xs text-muted-foreground">Active borrowings</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{summary.overdueBorrowings}</div>
                      <p className="text-xs text-muted-foreground">Need immediate attention</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Outstanding Fine</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-600">
                        ₹{summary.totalFine.toLocaleString('en-IN')}
                      </div>
                      <p className="text-xs text-muted-foreground">Pending payment</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Books Read</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{summary.booksRead}</div>
                      <p className="text-xs text-muted-foreground">Successfully returned</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('current')}
                      className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'current'
                          ? 'bg-blue-50 text-blue-600 shadow-sm'
                          : 'text-gray-500 hover:bg-slate-100 hover:text-gray-700'
                      }`}
                    >
                      Current Borrowings ({activeBorrowings.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'history'
                          ? 'bg-blue-50 text-blue-600 shadow-sm'
                          : 'text-gray-500 hover:bg-slate-100 hover:text-gray-700'
                      }`}
                    >
                      Borrowing History ({borrowingHistory.length})
                    </button>
                  </nav>
                </div>

                {activeTab === 'current' && (
                  <div className="space-y-6">
                    {activeBorrowings.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Active Borrowings</h3>
                        {activeBorrowings.map((borrowing) => renderBorrowingCard(borrowing))}
                      </div>
                    )}

                    {overdueBorrowings.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-red-600">Overdue Borrowings</h3>
                        {overdueBorrowings.map((borrowing) => renderBorrowingCard(borrowing))}
                      </div>
                    )}

                    {activeBorrowings.length === 0 && overdueBorrowings.length === 0 && (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                          <h3 className="mb-2 text-lg font-medium text-gray-900">No current borrowings</h3>
                          <p className="text-gray-600">
                            You don&apos;t have any books borrowed at the moment.
                          </p>
                          <Button
                            className="mt-4 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-sm transition-colors hover:from-sky-500 hover:to-blue-600 focus-visible:ring-2 focus-visible:ring-blue-200"
                            onClick={handleBrowseBooks}
                          >
                            Browse books
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    {borrowingHistory.map((borrowing) => (
                      <Card key={borrowing.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-3 flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold">{borrowing.book.title}</h3>
                                  <p className="flex items-center space-x-1 text-gray-600">
                                    <User className="h-4 w-4" />
                                    <span>{borrowing.book.author}</span>
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    ISBN: {borrowing.book.isbn} • {borrowing.book.category}
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(borrowing.status)}`}
                                >
                                  {getStatusLabel(borrowing.status)}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
                                <div>
                                  <p className="text-gray-500">Borrowed Date</p>
                                  <p className="font-medium">{formatDate(borrowing.borrowDate)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Due Date</p>
                                  <p className="font-medium">{formatDate(borrowing.dueDate)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Return Date</p>
                                  <p className="font-medium">{formatDate(borrowing.returnDate)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Your Rating</p>
                                  <div className="flex items-center space-x-1">
                                    {borrowing.rating && borrowing.rating > 0 ? (
                                      renderStars(borrowing.rating)
                                    ) : (
                                      <span className="text-sm text-gray-400">Not rated</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {borrowing.fineAmount > 0 && (
                                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                  <p className="text-sm text-amber-800">
                                    {borrowing.finePaid ? 'Fine Paid' : 'Fine Assessed'}: ₹
                                    {borrowing.fineAmount.toLocaleString('en-IN')}
                                  </p>
                                  {!borrowing.finePaid && (
                                    <p className="text-xs text-amber-600">Late return fine</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {borrowingHistory.length === 0 && (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                          <h3 className="mb-2 text-lg font-medium text-gray-900">No borrowing history</h3>
                          <p className="text-gray-600">You haven&apos;t borrowed any books yet.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
