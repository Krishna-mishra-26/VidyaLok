'use client'

import React, { useState } from 'react'
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Info,
  Megaphone,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

export default function AdminBroadcastPage() {
  const [showComposeForm, setShowComposeForm] = useState(false)
  const [selectedAudience, setSelectedAudience] = useState('all')
  const [messageType, setMessageType] = useState('info')

  // Mock broadcast data
  const broadcasts = [
    {
      id: '1',
      title: 'Library Hours Extended for Exam Season',
      message: 'The library will remain open until 10 PM during the examination period (Dec 15-30). Additional study spaces have been arranged on the 2nd floor.',
      type: 'info',
      audience: 'all',
      targetCount: 485,
      deliveredCount: 482,
      readCount: 387,
      createdAt: '2024-12-28T10:30:00Z',
      status: 'sent',
      priority: 'normal'
    },
    {
      id: '2',
      title: 'New Book Collection Available',
      message: 'We have added 50+ new Computer Science and AI/ML books to our collection. Visit the CS section on the 3rd floor to explore.',
      type: 'info',
      audience: 'Computer Science',
      targetCount: 120,
      deliveredCount: 118,
      readCount: 95,
      createdAt: '2024-12-27T14:20:00Z',
      status: 'sent',
      priority: 'normal'
    },
    {
      id: '3',
      title: 'Overdue Book Reminder',
      message: 'You have books that are overdue. Please return them immediately to avoid additional fines. Check your account for details.',
      type: 'warning',
      audience: 'overdue_users',
      targetCount: 23,
      deliveredCount: 23,
      readCount: 18,
      createdAt: '2024-12-26T09:15:00Z',
      status: 'sent',
      priority: 'high'
    },
    {
      id: '4',
      title: 'System Maintenance Notice',
      message: 'The library management system will be under maintenance on Sunday, Dec 29 from 2 AM to 6 AM. Online services will be temporarily unavailable.',
      type: 'alert',
      audience: 'all',
      targetCount: 485,
      deliveredCount: 0,
      readCount: 0,
      createdAt: '2024-12-28T16:00:00Z',
      status: 'scheduled',
      priority: 'high',
      scheduledAt: '2024-12-29T01:00:00Z'
    },
    {
      id: '5',
      title: 'Welcome New Students!',
      message: 'Welcome to APSIT Library! Your student accounts have been activated. Visit the help desk for library orientation and to collect your library cards.',
      type: 'success',
      audience: 'new_users',
      targetCount: 45,
      deliveredCount: 45,
      readCount: 32,
      createdAt: '2024-12-25T11:00:00Z',
      status: 'sent',
      priority: 'normal'
    }
  ]

  const audiences = [
    { value: 'all', label: 'All Students', count: 485 },
    { value: 'Computer Science', label: 'Computer Science Dept.', count: 120 },
    { value: 'Electronics', label: 'Electronics Dept.', count: 95 },
    { value: 'Mechanical', label: 'Mechanical Dept.', count: 110 },
    { value: 'Civil', label: 'Civil Dept.', count: 85 },
    { value: 'active_borrowers', label: 'Active Borrowers', count: 156 },
    { value: 'overdue_users', label: 'Users with Overdue Books', count: 23 },
    { value: 'new_users', label: 'New Users (Last 30 days)', count: 45 }
  ]

  const messageTypes = [
    { value: 'info', label: 'Information', icon: Info, color: 'blue' },
    { value: 'success', label: 'Success', icon: CheckCircle, color: 'green' },
    { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'yellow' },
    { value: 'alert', label: 'Alert', icon: AlertTriangle, color: 'red' }
  ]

  const getTypeIcon = (type: string) => {
    const typeConfig = messageTypes.find(t => t.value === type)
    if (!typeConfig) return Info
    return typeConfig.icon
  }

  const getTypeColor = (type: string) => {
    const colors = {
      info: 'text-blue-600 bg-blue-50',
      success: 'text-green-600 bg-green-50',
      warning: 'text-yellow-600 bg-yellow-50',
      alert: 'text-red-600 bg-red-50'
    }
    return colors[type as keyof typeof colors] || colors.info
  }

  const getStatusColor = (status: string) => {
    const colors = {
      sent: 'text-green-600 bg-green-50',
      scheduled: 'text-blue-600 bg-blue-50',
      draft: 'text-gray-600 bg-gray-50',
      failed: 'text-red-600 bg-red-50'
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const totalStats = {
    totalBroadcasts: broadcasts.length,
    sentToday: broadcasts.filter(b => {
      const today = new Date().toDateString()
      return new Date(b.createdAt).toDateString() === today && b.status === 'sent'
    }).length,
    pendingScheduled: broadcasts.filter(b => b.status === 'scheduled').length,
    averageReadRate: Math.round(
      broadcasts.filter(b => b.status === 'sent').reduce((sum, b) => 
        sum + (b.readCount / b.deliveredCount * 100), 0
      ) / broadcasts.filter(b => b.status === 'sent').length
    )
  }

  const handleCompose = () => {
    setShowComposeForm(true)
  }

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle sending broadcast
    console.log('Sending broadcast...')
    setShowComposeForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar userRole="ADMIN" />
        <main className="flex-1 p-6 ml-64 z-10" style={{marginTop: '80px'}}>
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Broadcast Management</h1>
                <p className="text-gray-600 mt-1">Send announcements and notifications to students</p>
              </div>
              <Button onClick={handleCompose} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Compose Broadcast
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Broadcasts</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStats.totalBroadcasts}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
                  <Send className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{totalStats.sentToday}</div>
                  <p className="text-xs text-muted-foreground">Delivered messages</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{totalStats.pendingScheduled}</div>
                  <p className="text-xs text-muted-foreground">Pending delivery</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Read Rate</CardTitle>
                  <Eye className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{totalStats.averageReadRate}%</div>
                  <p className="text-xs text-muted-foreground">Message engagement</p>
                </CardContent>
              </Card>
            </div>

            {/* Broadcasts List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Broadcasts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {broadcasts.map((broadcast) => {
                    const TypeIcon = getTypeIcon(broadcast.type)
                    return (
                      <div key={broadcast.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <TypeIcon className="h-4 w-4" />
                              <h3 className="font-semibold">{broadcast.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(broadcast.type)}`}>
                                {broadcast.type}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(broadcast.status)}`}>
                                {broadcast.status}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{broadcast.message}</p>
                            
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>
                                  {audiences.find(a => a.value === broadcast.audience)?.label || broadcast.audience}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(broadcast.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                              </div>
                              {broadcast.status === 'sent' && (
                                <>
                                  <div>Delivered: {broadcast.deliveredCount}/{broadcast.targetCount}</div>
                                  <div>Read: {broadcast.readCount} ({Math.round(broadcast.readCount/broadcast.deliveredCount*100)}%)</div>
                                </>
                              )}
                              {broadcast.status === 'scheduled' && broadcast.scheduledAt && (
                                <div>Scheduled: {new Date(broadcast.scheduledAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {broadcast.status === 'sent' && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Delivery Rate</span>
                              <span>{Math.round(broadcast.deliveredCount/broadcast.targetCount*100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${broadcast.deliveredCount/broadcast.targetCount*100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Compose Broadcast Modal */}
      {showComposeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Compose Broadcast
              </h2>
              <Button variant="outline" onClick={() => setShowComposeForm(false)}>
                ×
              </Button>
            </div>
            
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input placeholder="Broadcast title" required />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Message Type</label>
                  <select 
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {messageTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Audience</label>
                  <select 
                    value={selectedAudience}
                    onChange={(e) => setSelectedAudience(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {audiences.map(audience => (
                      <option key={audience.value} value={audience.value}>
                        {audience.label} ({audience.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  placeholder="Type your message here..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Schedule (Optional)</label>
                  <input 
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input type="checkbox" id="emailNotification" className="rounded" />
                <label htmlFor="emailNotification" className="text-sm">Also send as email notification</label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Broadcast
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowComposeForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
