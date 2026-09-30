'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BookOpen, Plus, Clock, CheckCircle, XCircle, AlertCircle, Search, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

type BookRequestItem = {
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
}

export default function StudentRequestPage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()

  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [requests, setRequests] = useState<BookRequestItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [newRequest, setNewRequest] = useState({
    type: 'book_request',
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    edition: '',
    reason: '',
    priority: 'medium',
    description: '',
  })

  const user = session?.user

  const tabClasses = (tab: 'new' | 'existing') =>
    `relative inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
      activeTab === tab
        ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-md ring-1 ring-blue-200'
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
    }`

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.replace('/login')
    }
  }, [sessionStatus, router])

  const fetchRequests = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const response = await fetch('/api/book-requests', {
        credentials: 'include',
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message ?? 'Unable to load requests')
      }

  const payload = await response.json()
  setRequests(Array.isArray(payload.data) ? (payload.data as BookRequestItem[]) : [])
    } catch (error) {
      console.error('Failed to load requests', error)
      setLoadError(error instanceof Error ? error.message : 'Unable to load requests')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchRequests()
    }
  }, [sessionStatus, fetchRequests])

  const handleSubmitRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isSubmitting) return

    setSubmitMessage(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/book-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type: newRequest.type,
          title: newRequest.title.trim(),
          author: newRequest.author.trim() || null,
          isbn: newRequest.isbn.trim() || null,
          publisher: newRequest.publisher.trim() || null,
          edition: newRequest.edition.trim() || null,
          reason: newRequest.reason.trim(),
          priority: newRequest.priority,
          description: newRequest.description.trim() || null,
        }),
      })

      const payload = (await response.json().catch(() => null)) as {
        data?: BookRequestItem
        message?: string
      } | null

      if (!response.ok) {
        throw new Error(payload?.message ?? 'Failed to submit request')
      }

      const createdRequest = payload?.data

      if (createdRequest) {
        setRequests((prev) => [createdRequest, ...prev])
      } else {
        await fetchRequests()
      }

      setSubmitMessage({ type: 'success', text: 'Request submitted successfully! You will be notified on updates.' })
      setActiveTab('existing')
      setNewRequest({
        type: 'book_request',
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        edition: '',
        reason: '',
        priority: 'medium',
        description: '',
      })
    } catch (error) {
      console.error('Failed to submit request', error)
      setSubmitMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to submit request',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase?.() ?? ''
    switch (normalizedStatus) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'in_progress':
      case 'ordered':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase?.() ?? ''
    switch (normalizedStatus) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'in_progress':
      case 'ordered':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    const normalizedPriority = priority?.toLowerCase?.() ?? ''
    switch (normalizedPriority) {
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

  const formatDate = (value: string | null) => {
    if (!value) return '-'
    try {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) {
        return '-'
      }
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch (error) {
      console.error('Failed to format date', error)
      return '-'
    }
  }

  const categoryOptions = [
    { value: 'all', label: 'All Request Types' },
    { value: 'book_request', label: 'Book Purchase' },
    { value: 'book_renewal', label: 'Book Renewal' },
    { value: 'library_service', label: 'Library Service' },
    { value: 'research_access', label: 'Research Access' },
    { value: 'study_room', label: 'Study Room' },
    { value: 'other', label: 'Other' },
  ]

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const normalizedQuery = searchQuery.trim().toLowerCase()
      const matchesSearch =
        normalizedQuery.length === 0 ||
        [request.bookTitle, request.author ?? '', request.isbn ?? '', request.id]
          .some((field) => field?.toLowerCase?.().includes(normalizedQuery))

      const matchesCategory = selectedCategory === 'all' || request.requestType === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [requests, searchQuery, selectedCategory])

  const statusCounts = useMemo(
    () =>
      requests.reduce(
        (counts, request) => {
          const normalized = request.status?.toUpperCase?.() ?? 'PENDING'

          switch (normalized) {
            case 'PENDING':
              counts.pending += 1
              break
            case 'APPROVED':
              counts.approved += 1
              break
            case 'COMPLETED':
              counts.approved += 1
              counts.completed += 1
              break
            case 'ORDERED':
            case 'IN_PROGRESS':
              counts.inProgress += 1
              break
            case 'REJECTED':
              counts.rejected += 1
              break
            default:
              break
          }

          counts.total += 1
          return counts
        },
        { pending: 0, approved: 0, inProgress: 0, rejected: 0, completed: 0, total: 0 }
      ),
    [requests]
  )

  const headerUser = user
    ? {
        name: user.name ?? 'Student User',
        role: user.role ?? 'STUDENT',
        studentId: user.studentId ?? user.id,
      }
    : undefined

  if (sessionStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your profile...</span>
        </div>
      </div>
    )
  }

  if (!headerUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
          <p className="text-gray-600">Redirecting you to the login page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ color: '#1f2937' }}>
  <Header user={headerUser} />
      
      <div className="flex flex-1">
        <Sidebar userRole="STUDENT" />
        
        <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64 student-main">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900" style={{ color: '#111827' }}>My Requests</h1>
              <p className="text-gray-600" style={{ color: '#4b5563' }}>
                Submit new requests and track the status of your existing requests.
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-sm">
              <nav className="flex flex-wrap gap-2">
                <button onClick={() => setActiveTab('new')} className={tabClasses('new')}>
                  <Plus className="h-4 w-4" />
                  New Request
                </button>
                <button onClick={() => setActiveTab('existing')} className={tabClasses('existing')}>
                  <BookOpen className="h-4 w-4" />
                  My Requests ({requests.length})
                </button>
              </nav>
            </div>

            {/* New Request Tab */}
            {activeTab === 'new' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                    <Plus className="h-5 w-5" />
                    <span>Submit New Request</span>
                  </CardTitle>
                  <CardDescription style={{ color: '#6b7280' }}>
                    Fill out the form below to submit a new request to the library administration.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitMessage && (
                    <div
                      className={`mb-4 rounded-lg border p-3 text-sm ${
                        submitMessage.type === 'error'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-green-200 bg-green-50 text-green-700'
                      }`}
                    >
                      {submitMessage.text}
                    </div>
                  )}
                  <form onSubmit={handleSubmitRequest} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                          Request Type *
                        </label>
                        <select
                          value={newRequest.type}
                          onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          style={{ color: '#111827' }}
                        >
                          <option value="book_request">Book Purchase Request</option>
                          <option value="book_renewal">Book Renewal Request</option>
                          <option value="library_service">Library Service Request</option>
                          <option value="research_access">Research Database Access</option>
                          <option value="study_room">Study Room Booking</option>
                          <option value="other">Other Request</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                          Priority Level
                        </label>
                        <select
                          value={newRequest.priority}
                          onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          style={{ color: '#111827' }}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                        Title/Subject *
                      </label>
                      <Input
                        value={newRequest.title}
                        onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                        placeholder="Enter the title of book/service you're requesting"
                        required
                        className="bg-white text-gray-900"
                        style={{ color: '#111827' }}
                      />
                    </div>

                    {(newRequest.type === 'book_request' || newRequest.type === 'book_renewal') && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                              Author
                            </label>
                            <Input
                              value={newRequest.author}
                              onChange={(e) => setNewRequest({...newRequest, author: e.target.value})}
                              placeholder="Enter author name"
                              className="bg-white text-gray-900"
                              style={{ color: '#111827' }}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                              ISBN (Optional)
                            </label>
                            <Input
                              value={newRequest.isbn}
                              onChange={(e) => setNewRequest({...newRequest, isbn: e.target.value})}
                              placeholder="Enter ISBN number"
                              className="bg-white text-gray-900"
                              style={{ color: '#111827' }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                              Publisher
                            </label>
                            <Input
                              value={newRequest.publisher}
                              onChange={(e) => setNewRequest({...newRequest, publisher: e.target.value})}
                              placeholder="Enter publisher name"
                              className="bg-white text-gray-900"
                              style={{ color: '#111827' }}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                              Edition
                            </label>
                            <Input
                              value={newRequest.edition}
                              onChange={(e) => setNewRequest({...newRequest, edition: e.target.value})}
                              placeholder="Enter edition (e.g., 5th Edition)"
                              className="bg-white text-gray-900"
                              style={{ color: '#111827' }}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                        Reason for Request *
                      </label>
                      <Input
                        value={newRequest.reason}
                        onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                        placeholder="Brief reason for your request"
                        required
                        className="bg-white text-gray-900"
                        style={{ color: '#111827' }}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block" style={{ color: '#374151' }}>
                        Additional Details
                      </label>
                      <textarea
                        value={newRequest.description}
                        onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                        placeholder="Provide any additional details or special requirements..."
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        style={{ color: '#111827' }}
                      />
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        onClick={() => {
                          setSubmitMessage(null)
                          setNewRequest({
                            type: 'book_request',
                            title: '',
                            author: '',
                            isbn: '',
                            publisher: '',
                            edition: '',
                            reason: '',
                            priority: 'medium',
                            description: '',
                          })
                        }}
                      >
                        Reset Form
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-md hover:from-sky-500 hover:via-blue-500 hover:to-indigo-500"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </span>
                        ) : (
                          'Submit Request'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Existing Requests Tab */}
            {activeTab === 'existing' && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, author, or request ID..."
                            className="pl-10 bg-white text-gray-900"
                            style={{ color: '#111827' }}
                          />
                        </div>
                      </div>
                      <div>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          style={{ color: '#111827' }}
                        >
                          {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex md:ml-auto">
                        <Button onClick={fetchRequests} variant="outline" disabled={isLoading} className="w-full md:w-auto">
                          {isLoading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Refreshing
                            </span>
                          ) : (
                            'Refresh'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Request Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="text-sm text-gray-600" style={{ color: '#6b7280' }}>Pending</p>
                          <p className="text-2xl font-bold text-yellow-600" style={{ color: '#d97706' }}>
                            {statusCounts.pending}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600" style={{ color: '#6b7280' }}>Approved</p>
                          <p className="text-2xl font-bold text-green-600" style={{ color: '#059669' }}>
                            {statusCounts.approved}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600" style={{ color: '#6b7280' }}>In Progress</p>
                          <p className="text-2xl font-bold text-blue-600" style={{ color: '#2563eb' }}>
                            {statusCounts.inProgress}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="text-sm text-gray-600" style={{ color: '#6b7280' }}>Rejected</p>
                          <p className="text-2xl font-bold text-red-600" style={{ color: '#dc2626' }}>
                            {statusCounts.rejected}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Requests List */}
                <div className="space-y-4">
                  {loadError && (
                    <Card>
                      <CardContent className="flex flex-col gap-3 p-6">
                        <div className="flex items-center gap-3 text-red-600">
                          <XCircle className="h-5 w-5" />
                          <span>{loadError}</span>
                        </div>
                        <div>
                          <Button onClick={fetchRequests} variant="outline" className="w-fit">
                            Try Again
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {isLoading ? (
                    <Card>
                      <CardContent className="flex items-center gap-3 p-6 text-gray-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading your requests...</span>
                      </CardContent>
                    </Card>
                  ) : filteredRequests.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                          No Requests Found
                        </h3>
                        <p className="text-gray-600" style={{ color: '#6b7280' }}>
                          {searchQuery || selectedCategory !== 'all' 
                            ? "No requests match your search criteria." 
                            : "You haven't submitted any requests yet."}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900" style={{ color: '#111827' }}>
                                  {request.bookTitle}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(request.status)}`}>
                                  {request.status.replace('_', ' ').toUpperCase()}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(request.priority)}`}>
                                  {request.priority.toUpperCase()} PRIORITY
                                </span>
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-600" style={{ color: '#6b7280' }}>
                                <p><strong>Request ID:</strong> {request.id}</p>
                                <p><strong>Request Type:</strong> {requestTypeLabel(request.requestType)}</p>
                                {request.author && <p><strong>Author:</strong> {request.author}</p>}
                                {request.publisher && <p><strong>Publisher:</strong> {request.publisher}</p>}
                                {request.edition && <p><strong>Edition:</strong> {request.edition}</p>}
                                {request.isbn && <p><strong>ISBN:</strong> {request.isbn}</p>}
                                <p><strong>Reason:</strong> {request.reason}</p>
                                {request.description && <p><strong>Details:</strong> {request.description}</p>}
                                <p><strong>Submitted:</strong> {formatDate(request.createdAt)}</p>
                                {request.respondedAt && <p><strong>Last Updated:</strong> {formatDate(request.respondedAt)}</p>}
                              </div>
                              
                              {request.adminNotes && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <p className="text-sm font-medium text-blue-900" style={{ color: '#1e3a8a' }}>
                                    Admin Response:
                                  </p>
                                  <p className="text-sm text-blue-700 mt-1" style={{ color: '#1d4ed8' }}>
                                    {request.adminNotes}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(request.status)}
                              <span className="text-sm text-gray-500" style={{ color: '#9ca3af' }}>
                                {requestTypeLabel(request.requestType)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
