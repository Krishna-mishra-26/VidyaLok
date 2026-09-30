'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MessageSquare, Star, Clock, User, Search, Download, Eye, CheckCircle, AlertTriangle, XCircle, Reply, ThumbsUp, ThumbsDown, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { resolveDepartment } from '@/lib/department-utils'

type FeedbackStatus = 'open' | 'in_progress' | 'under_review' | 'resolved' | 'closed'
type FeedbackPriority = 'low' | 'medium' | 'high'
type FeedbackSentiment = 'positive' | 'negative' | 'constructive'

interface FeedbackItem {
  id: string
  studentId: string
  studentName: string
  category: string
  subject: string
  message: string
  rating: number
  priority: FeedbackPriority
  status: FeedbackStatus
  submittedAt: Date
  department: string
  year: string
  adminResponse: string | null
  responseAt: Date | null
  respondedBy: string | null
  tags: string[]
  attachments: string[]
  sentiment: FeedbackSentiment
}

interface ApiFeedbackItem {
  id: string
  userId?: string | null
  user?: {
    name?: string | null
    studentId?: string | null
    branch?: string | null
    department?: string | null
    year?: string | null
    yearOfStudy?: number | null
  } | null
  type?: string | null
  subject?: string | null
  message?: string | null
  rating?: number | null
  status?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  response?: string | null
  respondedBy?: string | null
  attachments?: string[] | null
}

const isApiFeedbackItem = (value: unknown): value is ApiFeedbackItem =>
  typeof value === 'object' && value !== null && 'id' in value

const createLocalId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `feedback-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const normalizeApiStatus = (status?: string) => (status ?? '').toUpperCase()

const mapApiStatus = (status?: string): FeedbackStatus => {
  switch (normalizeApiStatus(status)) {
    case 'IN_PROGRESS':
    case 'ACKNOWLEDGED':
      return 'in_progress'
    case 'UNDER_REVIEW':
      return 'under_review'
    case 'RESOLVED':
      return 'resolved'
    case 'CLOSED':
      return 'closed'
    case 'PENDING':
    default:
      return 'open'
  }
}

const mapStatusToApi = (status: FeedbackStatus): string => {
  switch (status) {
    case 'open':
      return 'PENDING'
    case 'in_progress':
      return 'IN_PROGRESS'
    case 'under_review':
      return 'UNDER_REVIEW'
    case 'resolved':
      return 'RESOLVED'
    case 'closed':
      return 'CLOSED'
    default:
      return 'PENDING'
  }
}

const determinePriority = (rating?: number): FeedbackPriority => {
  if (!rating) return 'medium'
  if (rating <= 2) return 'high'
  if (rating >= 4) return 'low'
  return 'medium'
}

const determineSentiment = (rating?: number): FeedbackSentiment => {
  if (!rating) return 'constructive'
  if (rating <= 2) return 'negative'
  if (rating >= 4) return 'positive'
  return 'constructive'
}

const formatCategory = (type?: string | null) => {
  if (!type) {
    return 'General'
  }

  const readable = type.replace(/_/g, ' ').toLowerCase()
  return readable.replace(/^(\w)|\s(\w)/g, (match) => match.toUpperCase())
}

const generateTags = (feedback: ApiFeedbackItem): string[] => {
  const tags: string[] = []
  if (feedback.type) tags.push(feedback.type)
  if (feedback.subject) {
    const words = feedback.subject.split(' ')
    words.forEach((word: string) => {
      if (word.length > 3 && !tags.includes(word.toLowerCase())) {
        tags.push(word.toLowerCase())
      }
    })
  }
  return tags.slice(0, 5)
}

const formatSentimentLabel = (sentiment: FeedbackSentiment) =>
  sentiment.charAt(0).toUpperCase() + sentiment.slice(1)

const getSentimentIcon = (sentiment: FeedbackSentiment) => {
  switch (sentiment) {
    case 'positive':
      return <ThumbsUp className="h-4 w-4 text-green-500" />
    case 'negative':
      return <ThumbsDown className="h-4 w-4 text-red-500" />
    case 'constructive':
      return <MessageSquare className="h-4 w-4 text-blue-500" />
    default:
      return <MessageSquare className="h-4 w-4 text-gray-500" />
  }
}

const getRatingStars = (rating: number) => (
  <div className="flex">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ))}
  </div>
)

const getPriorityColor = (priority: FeedbackPriority) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const formatStatusActionLabel = (status: FeedbackStatus) =>
  `Mark ${status
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')}`

const getStatusActionIcon = (status: FeedbackStatus) => {
  switch (status) {
    case 'open':
      return <AlertTriangle className="h-4 w-4" />
    case 'in_progress':
      return <Clock className="h-4 w-4" />
    case 'under_review':
      return <Eye className="h-4 w-4" />
    case 'closed':
      return <XCircle className="h-4 w-4" />
    case 'resolved':
    default:
      return <CheckCircle className="h-4 w-4" />
  }
}

const STATUS_ACTION_BUTTON_CLASSES: Record<FeedbackStatus, string> = {
  open: 'from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus-visible:ring-amber-300 shadow-[0_12px_24px_rgba(245,158,11,0.35)]',
  in_progress: 'from-blue-500 via-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus-visible:ring-blue-300 shadow-[0_12px_24px_rgba(59,130,246,0.32)]',
  under_review: 'from-purple-500 via-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 focus-visible:ring-purple-300 shadow-[0_12px_24px_rgba(168,85,247,0.32)]',
  resolved: 'from-emerald-500 via-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus-visible:ring-emerald-300 shadow-[0_12px_24px_rgba(16,185,129,0.32)]',
  closed: 'from-slate-600 via-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 focus-visible:ring-slate-400 shadow-[0_12px_24px_rgba(71,85,105,0.35)]',
}

const formatStudentIdentifier = (value?: string | null) => {
  if (!value) {
    return 'Not provided'
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return 'Not provided'
  }

  if (/^[A-Za-z0-9]{1,10}$/.test(trimmed)) {
    return trimmed.toUpperCase()
  }

  if (/^[a-f0-9]{24}$/i.test(trimmed)) {
    return `${trimmed.slice(0, 4).toUpperCase()}…${trimmed.slice(-4).toUpperCase()}`
  }

  return trimmed
}

const formatYearOfStudy = (value?: number | null) => {
  if (!value) {
    return 'Not provided'
  }

  const suffix = (() => {
    const remainderHundred = value % 100
    if (remainderHundred >= 11 && remainderHundred <= 13) {
      return 'th'
    }

    switch (value % 10) {
      case 1:
        return 'st'
      case 2:
        return 'nd'
      case 3:
        return 'rd'
      default:
        return 'th'
    }
  })()

  return `${value}${suffix} Year`
}

export default function AdminFeedbackPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedRating, setSelectedRating] = useState('all')
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
  const [replyText, setReplyText] = useState('')

  // Use actual user data from session
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const user = {
    name: session?.user?.name || "Library Admin",
    role: (session?.user?.role as string) || "ADMIN",
    studentId: (session?.user?.studentId as string) || "ADMIN001"
  }

  // Real feedback data from API
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([])
  const [statusSelection, setStatusSelection] = useState<FeedbackStatus>('open')
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null)

  // Fetch feedback data from the API
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!session?.user || session.user.role !== 'ADMIN') {
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        const response = await fetch('/api/feedback?page=1&limit=50', { credentials: 'include' })

        if (!response.ok) {
          throw new Error('Failed to fetch feedback data')
        }

        const rawData: unknown = await response.json()
        const payload = rawData as { success?: boolean; message?: string; feedback?: ApiFeedbackItem[] }

        if (!payload?.success) {
          throw new Error(payload?.message || 'Failed to load feedback data')
        }

        const sourceItems = Array.isArray(payload.feedback) ? payload.feedback.filter(isApiFeedbackItem) : []

        const formattedFeedback: FeedbackItem[] = sourceItems.map((item) => {
          const submittedAt = item.createdAt ? new Date(item.createdAt) : new Date()
          const rawDepartment = item.user?.department ?? item.user?.branch ?? ''
          const resolvedDepartment = rawDepartment ? resolveDepartment(rawDepartment) : 'Not provided'
          const normalizedYear = formatYearOfStudy(item.user?.yearOfStudy ?? null)

          return {
            id: item.id ?? createLocalId(),
            studentId: item.user?.studentId ?? item.userId ?? 'Unknown',
            studentName: item.user?.name ?? 'Unknown Student',
            category: formatCategory(item.type),
            subject: item.subject ?? '',
            message: item.message ?? '',
            rating: item.rating ?? 0,
            priority: determinePriority(item.rating ?? undefined),
            status: mapApiStatus(item.status ?? undefined) || 'open',
            submittedAt,
            department: resolvedDepartment,
            year: normalizedYear,
            adminResponse: item.response ?? null,
            responseAt: item.updatedAt ? new Date(item.updatedAt) : null,
            respondedBy: item.respondedBy ?? null,
            tags: generateTags(item),
            attachments: item.attachments ?? [],
            sentiment: determineSentiment(item.rating ?? undefined)
          }
        })

        setFeedbackList(formattedFeedback)
      } catch (err) {
        console.error('Error fetching feedback:', err)
        setError('Failed to load feedback data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedback()
  }, [session])

  useEffect(() => {
    if (!selectedFeedback) {
      setStatusSelection('open')
      setStatusUpdateError(null)
      return
    }

    setStatusSelection(selectedFeedback.status)
  }, [selectedFeedback])
  
  // Filter feedback items based on search query and filters
  const filteredItems = feedbackList.filter(feedback => {
    const matchesSearch = !searchQuery || feedback.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feedback.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feedback.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feedback.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory =
      selectedCategory === 'all' || feedback.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesStatus =
      selectedStatus === 'all' ||
      feedback.status === selectedStatus
    const matchesRating = selectedRating === 'all' || feedback.rating.toString() === selectedRating
    
    return matchesSearch && matchesCategory && matchesStatus && matchesRating
  })

  const handleStatusChange = async (feedbackId: string, newStatus: FeedbackStatus) => {
    const targetFeedback = feedbackList.find((feedback) => feedback.id === feedbackId)
    if (!targetFeedback) {
      return false
    }

    if (targetFeedback.status === newStatus) {
      return true
    }

    const apiStatus = mapStatusToApi(newStatus)

    setStatusUpdating(true)
    setStatusUpdateError(null)

    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: apiStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update feedback status')
      }

      let nextStatus = newStatus
      let nextResolvedAt: Date | null = targetFeedback.responseAt ?? null

      try {
        const payload = await response.json()
        if (payload?.feedback) {
          nextStatus = mapApiStatus(payload.feedback.status) || newStatus
          if (payload.feedback.resolvedAt) {
            nextResolvedAt = new Date(payload.feedback.resolvedAt)
          } else if (payload.feedback.updatedAt) {
            nextResolvedAt = new Date(payload.feedback.updatedAt)
          }
        }
      } catch (parseError) {
        console.warn('Unable to parse status update response:', parseError)
      }

      if (nextStatus !== 'resolved' && nextStatus !== 'closed') {
        nextResolvedAt = null
      }

      setFeedbackList((prev) =>
        prev.map((feedback) =>
          feedback.id === feedbackId
            ? {
                ...feedback,
                status: nextStatus,
                responseAt: nextResolvedAt ?? feedback.responseAt,
              }
            : feedback
        )
      )

      setSelectedFeedback((prev) =>
        prev && prev.id === feedbackId
          ? {
              ...prev,
              status: nextStatus,
              responseAt: nextResolvedAt ?? prev.responseAt,
            }
          : prev
      )

      setStatusSelection(nextStatus)
      return true
    } catch (error) {
      console.error('Error updating feedback status:', error)
      setStatusUpdateError('Failed to update status. Please try again.')
      return false
    } finally {
      setStatusUpdating(false)
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleReply = async (feedbackId: string) => {
    const trimmedReply = replyText.trim()

    if (!trimmedReply) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          response: trimmedReply,
          status: 'RESOLVED'
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit reply')
      }
      
      // Update local state
      const updatedAt = new Date()

      setFeedbackList(prev => prev.map(feedback => 
        feedback.id === feedbackId 
          ? { 
              ...feedback, 
              adminResponse: trimmedReply,
              responseAt: updatedAt,
              respondedBy: user.name,
              status: 'resolved'
            }
          : feedback
      ))

      setSelectedFeedback(prev =>
        prev && prev.id === feedbackId
          ? {
              ...prev,
              adminResponse: trimmedReply,
              responseAt: updatedAt,
              respondedBy: user.name,
              status: 'resolved'
            }
          : prev
      )
      setReplyText('')
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const exportFeedback = () => {
    const csvContent = [
      ['ID', 'Student Name', 'Category', 'Subject', 'Rating', 'Priority', 'Status', 'Date', 'Response'],
      ...filteredItems.map(feedback => [
        feedback.id,
        feedback.studentName,
        feedback.category,
        feedback.subject,
        feedback.rating.toString(),
        feedback.priority,
        feedback.status,
        feedback.submittedAt.toLocaleDateString(),
        feedback.adminResponse || 'No response'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `feedback_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Statistics
  const totalFeedback = feedbackList.length
  const openFeedback = feedbackList.filter(f => f.status === 'open').length
  const resolvedFeedback = feedbackList.filter(f => f.status === 'resolved').length
  const averageRating = totalFeedback > 0
    ? (feedbackList.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(1)
    : '0.0'
  const highPriorityCount = feedbackList.filter(f => f.priority === 'high').length

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen" style={{ color: '#1f2937' }}>
        <Header user={user} />

        <div className="flex flex-1">
          <Sidebar userRole="ADMIN" />

          <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64 student-main">
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-3 text-gray-600" style={{ color: '#4b5563' }}>
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p>Loading feedback data...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ color: '#1f2937' }}>
      <Header user={user} />
      
      <div className="flex flex-1">
        <Sidebar userRole="ADMIN" />
        
  <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64 student-main">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900" style={{ color: '#111827' }}>
                  Student Feedback Management
                </h1>
                <p className="text-gray-600" style={{ color: '#4b5563' }}>
                  View, manage, and respond to student feedback and suggestions
                </p>
              </div>
              <Button onClick={exportFeedback} className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700">
                <Download className="h-4 w-4" />
                <span>Export Feedback</span>
              </Button>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-1 h-5 w-5 text-red-500" />
                <div>
                  <p className="font-semibold">Unable to load feedback</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Statistics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600" style={{ color: '#2563eb' }}>
                    {totalFeedback}
                  </div>
                  <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>
                    Total Feedback
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600" style={{ color: '#ea580c' }}>
                    {openFeedback}
                  </div>
                  <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>
                    Open Issues
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600" style={{ color: '#059669' }}>
                    {resolvedFeedback}
                  </div>
                  <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>
                    Resolved
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600" style={{ color: '#d97706' }}>
                    {averageRating}
                  </div>
                  <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>
                    Avg Rating
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600" style={{ color: '#dc2626' }}>
                    {highPriorityCount}
                  </div>
                  <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>
                    High Priority
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by subject, message, or student name..."
                        className="pl-10 bg-white text-gray-900"
                        style={{ color: '#111827' }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      style={{ color: '#111827' }}
                    >
                      <option value="all">All Categories</option>
                      <option value="General">General Feedback</option>
                      <option value="Suggestion">Suggestions</option>
                      <option value="Complaint">Complaints</option>
                      <option value="Technical Issue">Technical Issues</option>
                      <option value="Book Request">Book / Service Requests</option>
                    </select>

                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      style={{ color: '#111827' }}
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="under_review">Under Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>

                    <select
                      value={selectedRating}
                      onChange={(e) => setSelectedRating(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      style={{ color: '#111827' }}
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900" style={{ color: '#111827' }}>
                  Feedback List ({filteredItems.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 admin-feedback-grid">
                {/* Feedback Cards */}
                <div className="space-y-4 max-h-screen overflow-y-auto admin-feedback-list">
                  {filteredItems.map((feedback) => (
                    <Card 
                      key={feedback.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedFeedback?.id === feedback.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => {
                        setSelectedFeedback(feedback)
                        setStatusSelection(feedback.status)
                        setStatusUpdateError(null)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1" style={{ color: '#111827' }}>
                                {feedback.subject}
                              </h3>
                              <div className="flex flex-col text-sm text-gray-600" style={{ color: '#4b5563' }}>
                                <div className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span className="font-medium text-gray-900" style={{ color: '#1f2937' }}>
                                    {feedback.studentName}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500" style={{ color: '#6b7280' }}>
                                  ID: {formatStudentIdentifier(feedback.studentId)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1 text-xs font-medium" style={{ color: '#4b5563' }}>
                                {getSentimentIcon(feedback.sentiment)}
                                <span>{formatSentimentLabel(feedback.sentiment)}</span>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium border ${
                                feedback.status === 'open' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                feedback.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                feedback.status === 'under_review' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                feedback.status === 'resolved' ? 'bg-green-100 text-green-800 border-green-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                              }`}>
                                {feedback.status === 'open' ? (
                                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                                ) : feedback.status === 'in_progress' ? (
                                  <Clock className="h-4 w-4 text-blue-500" />
                                ) : feedback.status === 'under_review' ? (
                                  <Eye className="h-4 w-4 text-purple-500" />
                                ) : feedback.status === 'resolved' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-gray-500" />
                                )}
                                <span className="ml-1">{feedback.status.replace('_', ' ').toUpperCase()}</span>
                              </span>
                            </div>
                          </div>

                          {/* Rating and Priority */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <div className="flex">
                                {feedback.rating > 0 ? (
                                  getRatingStars(feedback.rating)
                                ) : (
                                  <span className="text-xs text-gray-500" style={{ color: '#6b7280' }}>Not rated</span>
                                )}
                              </div>
                              <span className="text-sm text-gray-600 ml-2" style={{ color: '#4b5563' }}>
                                {feedback.rating > 0 ? `(${feedback.rating}/5)` : '(No rating)'}
                              </span>
                            </div>
                            
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(feedback.priority)}`}>
                              {feedback.priority.toUpperCase()}
                            </span>
                          </div>

                          {/* Message Preview */}
                          <p className="text-sm text-gray-700 line-clamp-2" style={{ color: '#374151' }}>
                            {feedback.message}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs text-gray-500" style={{ color: '#6b7280' }}>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{feedback.submittedAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded" style={{ color: '#374151' }}>
                              {feedback.category}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Feedback Detail Panel */}
                <div className="sticky top-6 admin-feedback-details">
                  {selectedFeedback ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between" style={{ color: '#1f2937' }}>
                          <span>Feedback Details</span>
                          <div className="flex space-x-2">
                            <select
                              value={statusSelection}
                              onChange={(e) => {
                                setStatusSelection(e.target.value as FeedbackStatus)
                                setStatusUpdateError(null)
                              }}
                              disabled={statusUpdating}
                              className="text-sm px-3 py-2 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                              style={{ color: '#111827' }}
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="under_review">Under Review</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                            <Button
                              onClick={() => void handleStatusChange(selectedFeedback.id, statusSelection)}
                              disabled={
                                statusUpdating ||
                                !statusSelection ||
                                selectedFeedback.status === statusSelection
                              }
                              className={`relative inline-flex items-center gap-2 rounded-xl border border-white/15 bg-gradient-to-r px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/60 ${STATUS_ACTION_BUTTON_CLASSES[statusSelection]} ${statusUpdating ? 'cursor-progress opacity-80' : ''}`}
                            >
                              {statusUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                getStatusActionIcon(statusSelection)
                              )}
                              <span>
                                {statusUpdating
                                  ? 'Updating…'
                                  : formatStatusActionLabel(statusSelection)}
                              </span>
                            </Button>
                          </div>
                          {statusUpdateError && (
                            <p className="text-xs text-red-600 mt-2">{statusUpdateError}</p>
                          )}
                          {!statusUpdateError && selectedFeedback.status === statusSelection && (
                            <p className="text-xs text-gray-500 mt-2">
                              Feedback already marked as {formatStatusActionLabel(statusSelection).replace('Mark ', '')}.
                            </p>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Student Info */}
                        <div className="border-b pb-4">
                          <h3 className="font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                            Student Information
                          </h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500" style={{ color: '#6b7280' }}>Name:</span>
                              <span className="ml-2 text-gray-900" style={{ color: '#111827' }}>
                                {selectedFeedback.studentName}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500" style={{ color: '#6b7280' }}>ID:</span>
                              <span className="ml-2 text-gray-900" style={{ color: '#111827' }}>
                                  {formatStudentIdentifier(selectedFeedback.studentId)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500" style={{ color: '#6b7280' }}>Department:</span>
                              <span className="ml-2 text-gray-900" style={{ color: '#111827' }}>
                                {selectedFeedback.department}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500" style={{ color: '#6b7280' }}>Year:</span>
                              <span className="ml-2 text-gray-900" style={{ color: '#111827' }}>
                                {selectedFeedback.year}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Feedback Content */}
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                            {selectedFeedback.subject}
                          </h3>
                          <p className="text-gray-700 mb-4" style={{ color: '#374151' }}>
                            {selectedFeedback.message}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-500" style={{ color: '#6b7280' }}>Rating:</span>
                              <div className="flex items-center space-x-1">
                                {selectedFeedback.rating > 0 ? (
                                  getRatingStars(selectedFeedback.rating)
                                ) : (
                                  <span className="text-xs text-gray-500" style={{ color: '#6b7280' }}>Not rated</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-500" style={{ color: '#6b7280' }}>Category:</span>
                              <span className="text-gray-900" style={{ color: '#111827' }}>
                                {selectedFeedback.category}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-500" style={{ color: '#6b7280' }}>Sentiment:</span>
                              <span className="flex items-center space-x-1 text-gray-900" style={{ color: '#111827' }}>
                                {getSentimentIcon(selectedFeedback.sentiment)}
                                <span>{formatSentimentLabel(selectedFeedback.sentiment)}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        {selectedFeedback.tags.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                              Tags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedFeedback.tags.map((tag: string, index: number) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Admin Response */}
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                            Admin Response
                          </h4>
                          
                          {selectedFeedback.adminResponse ? (
                            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                              <p className="text-gray-700 mb-2" style={{ color: '#374151' }}>
                                {selectedFeedback.adminResponse}
                              </p>
                              <div className="text-xs text-gray-500" style={{ color: '#6b7280' }}>
                                Responded by {selectedFeedback.respondedBy} on{' '}
                                {selectedFeedback.responseAt?.toLocaleDateString()}
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm mb-3" style={{ color: '#6b7280' }}>
                              No response yet
                            </p>
                          )}

                          <div className="space-y-2">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your response..."
                              rows={3}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                              style={{ color: '#111827' }}
                            />
                            <Button
                              onClick={() => handleReply(selectedFeedback.id)}
                              disabled={isSubmitting || !replyText.trim()}
                              className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                              {isSubmitting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Reply className="h-4 w-4 mr-2" />
                              )}
                              {isSubmitting ? 'Sending…' : 'Send Response'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                          Select Feedback
                        </h3>
                        <p className="text-gray-500" style={{ color: '#6b7280' }}>
                          Click on a feedback item to view details and respond
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
