'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Clock, Calendar, MapPin, Download, Search, ArrowUpDown, Eye, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

// Client-side time display component to avoid hydration issues
function ClientTimeDisplay({ date }: { date: Date }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span>Loading...</span>
  }

  return <span>{date.toLocaleString()}</span>
}

export default function StudentLogsPage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [logs] = useState([
    {
      id: 'LOG001',
      type: 'entry',
      timestamp: new Date('2025-01-20T09:15:00'),
      location: 'Main Entrance',
      duration: null,
      purpose: 'Study Session',
      seat: 'A-45',
      notes: 'Preparing for midterm exams'
    },
    {
      id: 'LOG002',
      type: 'exit',
      timestamp: new Date('2025-01-20T13:30:00'),
      location: 'Main Entrance',
      duration: '4h 15m',
      purpose: 'Study Session',
      seat: 'A-45',
      notes: null
    },
    {
      id: 'LOG003',
      type: 'entry',
      timestamp: new Date('2025-01-19T14:00:00'),
      location: 'Side Gate',
      duration: null,
      purpose: 'Book Return',
      seat: null,
      notes: 'Returned Data Structures textbook'
    },
    {
      id: 'LOG004',
      type: 'exit',
      timestamp: new Date('2025-01-19T14:20:00'),
      location: 'Side Gate',
      duration: '20m',
      purpose: 'Book Return',
      seat: null,
      notes: null
    },
    {
      id: 'LOG005',
      type: 'entry',
      timestamp: new Date('2025-01-18T10:30:00'),
      location: 'Main Entrance',
      duration: null,
      purpose: 'Group Study',
      seat: 'B-12',
      notes: 'Team project discussion'
    },
    {
      id: 'LOG006',
      type: 'exit',
      timestamp: new Date('2025-01-18T16:45:00'),
      location: 'Main Entrance',
      duration: '6h 15m',
      purpose: 'Group Study',
      seat: 'B-12',
      notes: null
    },
    {
      id: 'LOG007',
      type: 'entry',
      timestamp: new Date('2025-01-17T11:00:00'),
      location: 'Main Entrance',
      duration: null,
      purpose: 'Research',
      seat: 'C-28',
      notes: 'Working on thesis research'
    },
    {
      id: 'LOG008',
      type: 'exit',
      timestamp: new Date('2025-01-17T17:30:00'),
      location: 'Main Entrance',
      duration: '6h 30m',
      purpose: 'Research',
      seat: 'C-28',
      notes: null
    },
    {
      id: 'LOG009',
      type: 'entry',
      timestamp: new Date('2025-01-16T15:15:00'),
      location: 'Emergency Exit',
      duration: null,
      purpose: 'Book Borrowing',
      seat: null,
      notes: 'Borrowed Machine Learning textbook'
    },
    {
      id: 'LOG010',
      type: 'exit',
      timestamp: new Date('2025-01-16T15:45:00'),
      location: 'Emergency Exit',
      duration: '30m',
      purpose: 'Book Borrowing',
      seat: null,
      notes: null
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedDateRange, setSelectedDateRange] = useState('week')

  const headerUser = useMemo(() => {
    const sessionUser = session?.user

    if (!sessionUser) {
      return undefined
    }

    return {
      name: sessionUser.name ?? 'Student',
      role: sessionUser.role ?? 'STUDENT',
      studentId: sessionUser.studentId ?? sessionUser.id ?? 'UNKNOWN'
    }
  }, [session?.user])

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.replace('/login')
    }
  }, [sessionStatus, router])

  // Filter logs based on search and filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.seat && log.seat.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = filterType === 'all' || log.type === filterType

    // Date range filter
    const logDate = new Date(log.timestamp)
    const now = new Date()
    let matchesDate = true
    
    if (selectedDateRange === 'today') {
      matchesDate = logDate.toDateString() === now.toDateString()
    } else if (selectedDateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      matchesDate = logDate >= weekAgo
    } else if (selectedDateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      matchesDate = logDate >= monthAgo
    }

    return matchesSearch && matchesType && matchesDate
  })

  // Sort logs
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortOrder === 'asc') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    } else {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    }
  })

  // Calculate statistics
  const todayEntries = logs.filter(log => 
    log.type === 'entry' && 
    new Date(log.timestamp).toDateString() === new Date().toDateString()
  ).length

  const weekEntries = logs.filter(log => {
    const logDate = new Date(log.timestamp)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return log.type === 'entry' && logDate >= weekAgo
  }).length

  const exitLogs = logs.filter(log => log.type === 'exit' && log.duration)
  const totalVisitDuration = exitLogs.reduce((total, log) => {
    const duration = log.duration!
    const [hourPart, minutePart] = duration.split('h')
    const hours = parseFloat(hourPart || '0')
    const minutes = parseFloat(minutePart?.split('m')[0] || '0') / 60
    return total + hours + minutes
  }, 0)
  const averageVisitDuration = exitLogs.length ? totalVisitDuration / exitLogs.length : 0

  const totalVisits = logs.filter(log => log.type === 'entry').length

  const getLogIcon = (type: string) => {
    return type === 'entry' ? (
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
    ) : (
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
    )
  }

  const exportLogs = () => {
    const csvContent = [
      ['Date', 'Time', 'Type', 'Location', 'Duration', 'Purpose', 'Seat', 'Notes'],
      ...sortedLogs.map(log => [
        log.timestamp.toLocaleDateString(),
        log.timestamp.toLocaleTimeString(),
        log.type.toUpperCase(),
        log.location,
        log.duration || '-',
        log.purpose,
        log.seat || '-',
        log.notes || '-'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const studentIdentifier = headerUser?.studentId ?? 'student'
    a.download = `library_logs_${studentIdentifier}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (sessionStatus === 'loading' && !headerUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your profile...</span>
        </div>
      </div>
    )
  }

  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
          <p className="text-gray-600">Redirecting you to the login page...</p>
        </div>
      </div>
    )
  }

  if (!headerUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
          <p className="text-gray-600">Preparing your visit logs...</p>
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
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900" style={{ color: '#111827' }}>
                  Entry/Exit Logs
                </h1>
                <p className="text-gray-600" style={{ color: '#4b5563' }}>
                  Track your library visit history and activity patterns.
                </p>
              </div>
              <Button 
                onClick={exportLogs}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Logs</span>
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium" style={{ color: '#374151' }}>
                    {"Today's Visits"}
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600" style={{ color: '#2563eb' }}>
                    {todayEntries}
                  </div>
                  <p className="text-xs text-muted-foreground" style={{ color: '#6b7280' }}>
                    Entries today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium" style={{ color: '#374151' }}>
                    This Week
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600" style={{ color: '#059669' }}>
                    {weekEntries}
                  </div>
                  <p className="text-xs text-muted-foreground" style={{ color: '#6b7280' }}>
                    Visits this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium" style={{ color: '#374151' }}>
                    Average Duration
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600" style={{ color: '#7c3aed' }}>
                    {averageVisitDuration.toFixed(1)}h
                  </div>
                  <p className="text-xs text-muted-foreground" style={{ color: '#6b7280' }}>
                    Per visit
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium" style={{ color: '#374151' }}>
                    Total Visits
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600" style={{ color: '#ea580c' }}>
                    {totalVisits}
                  </div>
                  <p className="text-xs text-muted-foreground" style={{ color: '#6b7280' }}>
                    All time
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search logs by ID, purpose, location, seat, or notes..."
                        className="pl-10 bg-white text-gray-900"
                        style={{ color: '#111827' }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      style={{ color: '#111827' }}
                    >
                      <option value="all">All Types</option>
                      <option value="entry">Entry Only</option>
                      <option value="exit">Exit Only</option>
                    </select>

                    <select
                      value={selectedDateRange}
                      onChange={(e) => setSelectedDateRange(e.target.value)}
                      className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      style={{ color: '#111827' }}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>

                    <Button
                      variant="outline"
                      onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                      className="flex items-center space-x-2"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logs List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                  <Eye className="h-5 w-5" />
                  <span>Activity Logs ({sortedLogs.length})</span>
                </CardTitle>
                <CardDescription style={{ color: '#6b7280' }}>
                  Detailed history of your library visits and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sortedLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ color: '#111827' }}>
                      No Logs Found
                    </h3>
                    <p className="text-gray-600" style={{ color: '#6b7280' }}>
                      {searchQuery || filterType !== 'all' || selectedDateRange !== 'all'
                        ? "No logs match your search criteria."
                        : "You haven't visited the library yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                            {getLogIcon(log.type)}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                log.type === 'entry' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {log.type.toUpperCase()}
                              </span>
                              <span className="text-sm font-medium text-gray-900" style={{ color: '#111827' }}>
                                {log.purpose}
                              </span>
                              {log.seat && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded" style={{ color: '#6b7280' }}>
                                  Seat {log.seat}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600" style={{ color: '#6b7280' }}>
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <ClientTimeDisplay date={log.timestamp} />
                              </span>
                              <span className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{log.location}</span>
                              </span>
                              {log.duration && (
                                <span className="text-blue-600" style={{ color: '#2563eb' }}>
                                  Duration: {log.duration}
                                </span>
                              )}
                            </div>
                            
                            {log.notes && (
                              <p className="text-sm text-gray-500 italic" style={{ color: '#6b7280' }}>
                                {log.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-xs text-gray-500" style={{ color: '#9ca3af' }}>
                            {log.id}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: '#1f2937' }}>Recent Activity</CardTitle>
                  <CardDescription style={{ color: '#6b7280' }}>
                    Your latest library visits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sortedLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-2">
                          {getLogIcon(log.type)}
                          <span className="text-sm text-gray-900" style={{ color: '#111827' }}>
                            {log.purpose}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500" style={{ color: '#6b7280' }}>
                          {log.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle style={{ color: '#1f2937' }}>Most Used Locations</CardTitle>
                  <CardDescription style={{ color: '#6b7280' }}>
                    Your preferred entry points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.from(new Set(logs.map(log => log.location)))
                      .map(location => ({
                        location,
                        count: logs.filter(log => log.location === location).length
                      }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5)
                      .map((item) => (
                        <div key={item.location} className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-900" style={{ color: '#111827' }}>
                            {item.location}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded" style={{ color: '#6b7280' }}>
                            {item.count} visits
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
