'use client'

import React from 'react'
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

export default function AdminDashboard() {
  // Mock user data
  const user = {
    name: "Dr. Priya Singh",
    role: "ADMIN" as const,
    studentId: "ADMIN001"
  }

  // Mock dashboard data
  const stats = {
    totalBooks: 1247,
    totalUsers: 523,
    activeBorrowings: 89,
    overdueBooks: 12,
    availableSeats: 45,
    todayEntries: 156
  }

  const recentActivities = [
    {
      id: '1',
      type: 'book_borrowed',
      user: 'Rahul Sharma (STU240001)',
      action: 'borrowed "Clean Code"',
      time: '10 minutes ago'
    },
    {
      id: '2',
      type: 'book_returned',
      user: 'Priya Patel (STU240002)',
      action: 'returned "Design Patterns"',
      time: '25 minutes ago'
    },
    {
      id: '3',
      type: 'user_entry',
      user: 'Amit Kumar (STU240003)',
      action: 'entered the library',
      time: '1 hour ago'
    },
    {
      id: '4',
      type: 'overdue',
      user: 'Sneha Gupta (STU240004)',
      action: 'has overdue book "Database Systems"',
      time: '2 hours ago'
    },
    {
      id: '5',
      type: 'book_request',
      user: 'Vikram Singh (STU240005)',
      action: 'requested "Machine Learning Yearning"',
      time: '3 hours ago'
    }
  ]

  const popularBooks = [
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      borrowCount: 15,
      trend: 'up'
    },
    {
      title: 'Design Patterns',
      author: 'Gang of Four',
      borrowCount: 12,
      trend: 'up'
    },
    {
      title: 'Effective Java',
      author: 'Joshua Bloch',
      borrowCount: 10,
      trend: 'down'
    },
    {
      title: 'Database Systems',
      author: 'Elmasri & Navathe',
      borrowCount: 8,
      trend: 'up'
    }
  ]

  const departmentStats = [
    { department: 'Computer Engineering', users: 185, percentage: 35 },
    { department: 'Information Technology', users: 142, percentage: 27 },
    { department: 'Electronics Engineering', users: 98, percentage: 19 },
    { department: 'Mechanical Engineering', users: 98, percentage: 19 }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'book_borrowed':
        return <BookOpen className="h-4 w-4 text-blue-600" />
      case 'book_returned':
        return <BookOpen className="h-4 w-4 text-green-600" />
      case 'user_entry':
        return <Users className="h-4 w-4 text-purple-600" />
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'book_request':
        return <TrendingUp className="h-4 w-4 text-orange-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      
      <div className="flex flex-1">
        <Sidebar userRole="ADMIN" />
        
        <main className="flex-1 ml-64 p-6 z-10" style={{marginTop: '80px'}}>
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600">Comprehensive overview of library operations and analytics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBooks.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">In library collection</p>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Registered students</p>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today&apos;s Entries</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayEntries}</div>
                  <p className="text-xs text-muted-foreground">Library visits today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Borrowings</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeBorrowings}</div>
                  <p className="text-xs text-muted-foreground">Books borrowed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.overdueBooks}</div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Seats</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.availableSeats}</div>
                  <p className="text-xs text-muted-foreground">Out of 100 total</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activities */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>
                    Latest actions and events in the library
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span> {activity.action}
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Books */}
              <Card>
                <CardHeader>
                  <CardTitle>Popular Books</CardTitle>
                  <CardDescription>
                    Most borrowed books this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popularBooks.map((book, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{book.title}</h4>
                          <p className="text-xs text-gray-600">{book.author}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{book.borrowCount}</span>
                          {book.trend === 'up' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Department-wise Users</CardTitle>
                  <CardDescription>
                    Distribution of users across departments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentStats.map((dept, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{dept.department}</span>
                          <span className="text-gray-600">{dept.users} users</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${dept.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Frequently used administrative functions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <BookOpen className="h-6 w-6" />
                      <span className="text-xs">Add Book</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <Users className="h-6 w-6" />
                      <span className="text-xs">Add User</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <AlertTriangle className="h-6 w-6" />
                      <span className="text-xs">Send Alert</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                      <BarChart3 className="h-6 w-6" />
                      <span className="text-xs">View Reports</span>
                    </Button>
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
