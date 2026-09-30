'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MessageSquare, Star, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { FeedbackType } from '@/types'

const feedbackTypeOptions: Array<{ value: FeedbackType; label: string }> = [
  { value: FeedbackType.GENERAL, label: 'General Feedback' },
  { value: FeedbackType.SUGGESTION, label: 'Suggestion' },
  { value: FeedbackType.COMPLAINT, label: 'Complaint' },
  { value: FeedbackType.TECHNICAL_ISSUE, label: 'Technical Issue' },
  { value: FeedbackType.BOOK_REQUEST, label: 'Book or Service Request' }
]

type FeedbackRecordStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ACKNOWLEDGED' | 'UNDER_REVIEW'

const createLocalId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `feedback-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const feedbackStatusStyles: Record<FeedbackRecordStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'border border-blue-200 bg-blue-100 text-blue-800' },
  IN_PROGRESS: { label: 'In Progress', className: 'border border-amber-200 bg-amber-100 text-amber-800' },
  RESOLVED: { label: 'Resolved', className: 'border border-green-200 bg-green-100 text-green-800' },
  CLOSED: { label: 'Closed', className: 'border border-gray-200 bg-gray-100 text-gray-800' },
  ACKNOWLEDGED: { label: 'Acknowledged', className: 'border border-indigo-200 bg-indigo-100 text-indigo-800' },
  UNDER_REVIEW: { label: 'Under Review', className: 'border border-purple-200 bg-purple-100 text-purple-800' }
}

const normalizeFeedbackStatus = (value?: string | null): FeedbackRecordStatus => {
  const upper = (value ?? '').toUpperCase() as FeedbackRecordStatus
  if (upper && upper in feedbackStatusStyles) {
    return upper
  }
  return 'PENDING'
}

const normalizeFeedbackType = (value?: string | null): FeedbackType => {
  if (!value) {
    return FeedbackType.GENERAL
  }

  const upper = value.toUpperCase()
  const matchingType = (Object.values(FeedbackType) as string[]).find((t) => t === upper)

  return (matchingType as FeedbackType | undefined) ?? FeedbackType.GENERAL
}

export default function StudentFeedbackPage() {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(FeedbackType.GENERAL)
  const [rating, setRating] = useState(0)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  // Define feedback type
  interface Feedback {
    id: string;
    type: FeedbackType;
    rating: number;
    subject: string;
    message: string;
    status: FeedbackRecordStatus;
    response?: string;
    createdAt: string;
    date?: Date;
    userId?: string;
  }

  interface ApiFeedbackItem {
    id?: string
    type?: string | null
    subject?: string | null
    message?: string | null
    status?: string | null
    createdAt?: string | null
    userId?: string | null
    response?: string | null
    rating?: number | null
  }
  
  const [previousFeedback, setPreviousFeedback] = useState<Feedback[]>([])
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true)

  // User session data
  const { data: session } = useSession()
  
  // Define a strongly typed user object
  const user = {
    name: session?.user?.name || "Student",
    role: (session?.user?.role as string) || "STUDENT",
    studentId: (session?.user?.studentId as string) || ""
  }
  
  // Fetch previous feedback
  useEffect(() => {
    async function fetchFeedback() {
      if (!session?.user) {
        setIsLoadingFeedback(false)
        return
      }
      
      try {
  const response = await fetch('/api/feedback', { credentials: 'include' })
        
        if (!response.ok) {
          throw new Error('Failed to fetch feedback')
        }
        
        const data = await response.json()

        if (!data?.success) {
          throw new Error(data?.message || 'Failed to fetch feedback')
        }

        const items: ApiFeedbackItem[] = Array.isArray(data.feedback) ? data.feedback : []

        const normalizedFeedback = items.map((item) => {
          const createdAt = item.createdAt ?? new Date().toISOString()

          return {
            id: item.id ?? createLocalId(),
            type: normalizeFeedbackType(item.type),
            rating: typeof item.rating === 'number' ? item.rating : 0,
            subject: item.subject ?? 'Untitled feedback',
            message: item.message ?? '',
            status: normalizeFeedbackStatus(item.status),
            response: item.response ?? undefined,
            createdAt,
            date: createdAt ? new Date(createdAt) : undefined,
            userId: item.userId ?? undefined
          } satisfies Feedback
        })

        setPreviousFeedback(normalizedFeedback)
      } catch (error) {
        console.error('Error fetching feedback:', error)
        setPreviousFeedback([])
      } finally {
        setIsLoadingFeedback(false)
      }
    }
    
    fetchFeedback()
  }, [session, submitted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user) {
      setErrorMessage('You must be logged in to submit feedback')
      return
    }

    const trimmedSubject = subject.trim()
    const trimmedMessage = message.trim()

    if (!trimmedSubject || !trimmedMessage) {
      setErrorMessage('Subject and message are required')
      return
    }
    
    setIsLoading(true)
    setErrorMessage('')
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          feedbackType,
          type: feedbackType,
          rating,
          subject: trimmedSubject,
          message: trimmedMessage
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit feedback')
      }
      
      setSubmitted(true)
      // Reset after feedback is submitted
      setTimeout(() => {
        setSubmitted(false)
        setRating(0)
        setSubject('')
        setMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Unknown date";
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      
      <div className="flex flex-1">
        <Sidebar userRole="STUDENT" />
        
  <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64 student-main">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Feedback & Support</h1>
              <p className="text-gray-600">
                Share your thoughts, suggestions, or report issues to help us improve your library experience.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feedback Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Submit Feedback</span>
                  </CardTitle>
                  <CardDescription>
                    Help us improve by sharing your experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Thank you for your feedback!
                      </h3>
                      <p className="text-gray-600">
                        We appreciate your input and will review it shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Feedback Type */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Feedback Type
                        </label>
                        <select
                          value={feedbackType}
                          onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {feedbackTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Rating */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Overall Rating (Optional)
                        </label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className={`p-1 transition-colors focus:outline-none`}
                              aria-label={`Rate ${star} stars`}
                            >
                              <Star 
                                className={`h-6 w-6 ${
                                  star <= rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-yellow-200 hover:text-yellow-300'
                                }`} 
                                fill={star <= rating ? 'currentColor' : 'none'} 
                                strokeWidth={1.5}
                                stroke="currentColor"
                              />
                            </button>
                          ))}
                        </div>
                        {rating > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            You rated: {rating} {rating === 1 ? 'star' : 'stars'}
                          </p>
                        )}
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Subject
                        </label>
                        <Input
                          placeholder="Brief summary of your feedback"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          required
                        />
                      </div>

                      {/* Message */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Message
                        </label>
                        <textarea
                          placeholder="Please provide detailed feedback..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>

                      {errorMessage && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-start space-x-2 mb-4">
                          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <span>{errorMessage}</span>
                        </div>
                      )}
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Feedback
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Previous Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Previous Feedback</CardTitle>
                  <CardDescription>
                    Track the status of your submitted feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoadingFeedback ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-600">Loading your feedback...</p>
                      </div>
                    ) : previousFeedback.length > 0 ? (
                      previousFeedback.map((feedback) => {
                        const statusStyle = feedbackStatusStyles[feedback.status] ?? feedbackStatusStyles.PENDING

                        return (
                          <div key={feedback.id} className="border rounded-lg p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">{feedback.subject}</h4>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle.className}`}
                              >
                                {statusStyle.label}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 capitalize">
                              Type: {feedback.type.replace(/_/g, ' ')}
                            </p>

                            <p className="text-sm text-gray-700">{feedback.message}</p>

                            {feedback.response && (
                              <div className="bg-gray-50 p-3 rounded-md mt-2">
                                <p className="text-sm font-medium text-gray-900 mb-1">Response:</p>
                                <p className="text-sm text-gray-700">{feedback.response}</p>
                              </div>
                            )}

                            <p className="text-xs text-gray-500">
                              Submitted: {formatDate(feedback.createdAt || feedback.date)}
                            </p>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">No previous feedback found</p>
                        <p className="text-sm text-gray-500">Your submitted feedback will appear here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Need Immediate Help?</CardTitle>
                <CardDescription>
                  Contact our support team directly for urgent matters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Library Desk</h4>
                    <p className="text-blue-700 text-sm">Ground Floor, Main Building</p>
                    <p className="text-blue-700 text-sm">Mon-Fri: 9 AM - 6 PM</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Phone Support</h4>
                    <p className="text-green-700 text-sm">+91 98765 43210</p>
                    <p className="text-green-700 text-sm">Mon-Fri: 9 AM - 5 PM</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Email Support</h4>
                    <p className="text-purple-700 text-sm">library@apsit.edu.in</p>
                    <p className="text-purple-700 text-sm">Response within 24 hours</p>
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
