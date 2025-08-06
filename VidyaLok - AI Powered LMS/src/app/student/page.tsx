'use client'

import React from 'react'
import { BookOpen, Users, Clock, AlertTriangle, TrendingUp, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

// Utility function for consistent date formatting
const formatDate = (date: Date) => {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
}

export default function StudentDashboard() {
  // Mock user data
  const user = {
    name: "Rahul Sharma",
    role: "STUDENT" as const,
    studentId: "STU240001"
  }

  // Mock dashboard data
  const stats = {
    booksCurrentlyBorrowed: 3,
    overdueBooks: 1,
    totalBooksRead: 15,
    availableSeats: 45
  }

  const recentBorrowings = [
    {
      id: '1',
      book: { title: 'Data Structures and Algorithms', author: 'Thomas H. Cormen' },
      borrowDate: new Date('2025-01-28'),
      dueDate: new Date('2025-02-11'),
      status: 'BORROWED' as const
    },
    {
      id: '2',
      book: { title: 'Computer Networks', author: 'Andrew S. Tanenbaum' },
      borrowDate: new Date('2025-01-25'),
      dueDate: new Date('2025-02-08'),
      status: 'BORROWED' as const
    },
    {
      id: '3',
      book: { title: 'Database Management Systems', author: 'Raghu Ramakrishnan' },
      borrowDate: new Date('2025-01-20'),
      dueDate: new Date('2025-02-03'),
      status: 'OVERDUE' as const
    }
  ]

  const recommendedBooks = [
    {
      id: '1',
      title: 'Machine Learning Yearning',
      author: 'Andrew Ng',
      category: 'Artificial Intelligence',
      available: true
    },
    {
      id: '2',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: 'Software Engineering',
      available: true
    },
    {
      id: '3',
      title: 'System Design Interview',
      author: 'Alex Xu',
      category: 'Software Engineering',
      available: false
    }
  ]

  const upcomingDueDates = [
    {
      book: 'Computer Networks',
      dueDate: new Date('2025-02-08'),
      daysLeft: 3
    },
    {
      book: 'Data Structures and Algorithms',
      dueDate: new Date('2025-02-11'),
      daysLeft: 6
    }
  ]

  return (
    <div className="flex flex-col min-h-screen student-dashboard">
      <Header user={user} />
      
      <div className="flex flex-1">
        <Sidebar userRole="STUDENT" />
        
        <main className="flex-1 ml-64 p-6 student-main">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Header */}
            <div className="welcome-header space-y-3 p-6 rounded-2xl mb-8">
              <h1 className="welcome-title text-4xl font-bold">
              Welcome back, <span className="user-name-visible" style={{color: '#0066cc !important', fontWeight: '900', WebkitTextFillColor: '#0066cc'}}>{user.name} !</span>
              </h1>
              <p className="welcome-subtitle text-lg">Here&apos;s what&apos;s happening with your library account today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Currently Borrowed</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.booksCurrentlyBorrowed}</div>
                  <p className="text-xs text-muted-foreground">Active borrowings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.overdueBooks}</div>
                  <p className="text-xs text-muted-foreground">Please return soon</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Books Read</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBooksRead}</div>
                  <p className="text-xs text-muted-foreground">This semester</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Seats</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.availableSeats}</div>
                  <p className="text-xs text-muted-foreground">Out of 100 total</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Borrowings */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Borrowings</CardTitle>
                  <CardDescription>
                    Books you currently have borrowed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBorrowings.map((borrowing) => (
                      <div key={borrowing.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{borrowing.book.title}</h4>
                          <p className="text-sm text-gray-600">{borrowing.book.author}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {formatDate(borrowing.dueDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              borrowing.status === 'OVERDUE'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {borrowing.status === 'OVERDUE' ? 'Overdue' : 'Active'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Due Dates */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Due Dates</CardTitle>
                  <CardDescription>
                    Don&apos;t forget to return these books
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingDueDates.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-blue-500" />
                          <div>
                            <h4 className="font-medium">{item.book}</h4>
                            <p className="text-sm text-gray-600">
                              Due: {formatDate(item.dueDate)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.daysLeft <= 3
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {item.daysLeft} days left
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommended Books */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>
                  Books picked based on your interests and academic progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendedBooks.map((book) => (
                    <div key={book.id} className="border rounded-lg p-4 space-y-3">
                      <div>
                        <h4 className="font-medium">{book.title}</h4>
                        <p className="text-sm text-gray-600">{book.author}</p>
                        <p className="text-xs text-gray-500">{book.category}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={book.available ? "default" : "outline"}
                        disabled={!book.available}
                        className="w-full"
                      >
                        {book.available ? 'Borrow Book' : 'Not Available'}
                      </Button>
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
                  Frequently used features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <BookOpen className="h-6 w-6" />
                    <span>Search Books</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <Clock className="h-6 w-6" />
                    <span>Entry/Exit Log</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <Users className="h-6 w-6" />
                    <span>Seat Availability</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                    <TrendingUp className="h-6 w-6" />
                    <span>Request Book</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
