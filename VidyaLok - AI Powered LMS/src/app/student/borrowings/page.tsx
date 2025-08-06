'use client'

import React, { useState } from 'react'
import { BookOpen, Clock, AlertTriangle, CheckCircle, Calendar, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

export default function StudentBorrowingsPage() {
  const [activeTab, setActiveTab] = useState('current')

  // Mock user data
  const user = {
    name: "Rahul Sharma",
    role: "STUDENT" as const,
    studentId: "STU240001"
  }

  // Mock borrowings data
  const currentBorrowings = [
    {
      id: '1',
      book: {
        title: 'Data Structures and Algorithms',
        author: 'Thomas H. Cormen',
        isbn: '978-0262046305',
        category: 'Computer Science'
      },
      borrowDate: new Date('2025-01-28'),
      dueDate: new Date('2025-02-11'),
      status: 'BORROWED' as const,
      renewalCount: 0,
      maxRenewals: 2
    },
    {
      id: '2',
      book: {
        title: 'Computer Networks',
        author: 'Andrew S. Tanenbaum',
        isbn: '978-0132126953',
        category: 'Computer Science'
      },
      borrowDate: new Date('2025-01-25'),
      dueDate: new Date('2025-02-08'),
      status: 'BORROWED' as const,
      renewalCount: 1,
      maxRenewals: 2
    },
    {
      id: '3',
      book: {
        title: 'Database Management Systems',
        author: 'Raghu Ramakrishnan',
        isbn: '978-0072465631',
        category: 'Database Systems'
      },
      borrowDate: new Date('2025-01-20'),
      dueDate: new Date('2025-02-03'),
      status: 'OVERDUE' as const,
      renewalCount: 0,
      maxRenewals: 2,
      fineAmount: 6 // ₹2 per day × 3 days
    }
  ]

  const borrowingHistory = [
    {
      id: '4',
      book: {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '978-0132350884',
        category: 'Software Engineering'
      },
      borrowDate: new Date('2025-01-10'),
      dueDate: new Date('2025-01-24'),
      returnDate: new Date('2025-01-22'),
      status: 'RETURNED' as const,
      rating: 5
    },
    {
      id: '5',
      book: {
        title: 'Design Patterns',
        author: 'Gang of Four',
        isbn: '978-0201633612',
        category: 'Software Engineering'
      },
      borrowDate: new Date('2025-01-05'),
      dueDate: new Date('2025-01-19'),
      returnDate: new Date('2025-01-19'),
      status: 'RETURNED' as const,
      rating: 4
    },
    {
      id: '6',
      book: {
        title: 'Effective Java',
        author: 'Joshua Bloch',
        isbn: '978-0134685991',
        category: 'Programming'
      },
      borrowDate: new Date('2024-12-15'),
      dueDate: new Date('2024-12-29'),
      returnDate: new Date('2025-01-02'),
      status: 'RETURNED' as const,
      fineAmount: 8, // Late return
      rating: 5
    }
  ]

  const calculateDaysLeft = (dueDate: Date) => {
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleRenewBook = async (borrowingId: string) => {
    // TODO: Implement renewal functionality
    console.log('Renewing book:', borrowingId)
  }

  const handlePayFine = async (borrowingId: string) => {
    // TODO: Implement fine payment
    console.log('Paying fine for:', borrowingId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BORROWED':
        return 'bg-blue-100 text-blue-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      case 'RETURNED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ))
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      
      <div className="flex flex-1">
        <Sidebar userRole="STUDENT" />
        
        <main className="flex-1 ml-64 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">My Borrowings</h1>
              <p className="text-gray-600">Manage your borrowed books and view history</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Currently Borrowed</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentBorrowings.filter(b => b.status === 'BORROWED').length}</div>
                  <p className="text-xs text-muted-foreground">Active borrowings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {currentBorrowings.filter(b => b.status === 'OVERDUE').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Need immediate attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Fine</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">
                    ₹{currentBorrowings.reduce((sum, b) => sum + (b.fineAmount || 0), 0)}
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
                  <div className="text-2xl font-bold text-green-600">{borrowingHistory.length}</div>
                  <p className="text-xs text-muted-foreground">This semester</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('current')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'current'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Current Borrowings ({currentBorrowings.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Borrowing History ({borrowingHistory.length})
                </button>
              </nav>
            </div>

            {/* Current Borrowings */}
            {activeTab === 'current' && (
              <div className="space-y-4">
                {currentBorrowings.map((borrowing) => {
                  const daysLeft = calculateDaysLeft(borrowing.dueDate)
                  const isOverdue = daysLeft < 0
                  
                  return (
                    <Card key={borrowing.id} className={`${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
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
                                {borrowing.status === 'OVERDUE' ? 'Overdue' : 'Borrowed'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="text-gray-500">Borrowed Date</p>
                                  <p className="font-medium">{borrowing.borrowDate.toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="text-gray-500">Due Date</p>
                                  <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                                    {borrowing.dueDate.toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <AlertTriangle className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                                <div>
                                  <p className="text-gray-500">
                                    {isOverdue ? 'Overdue by' : 'Days left'}
                                  </p>
                                  <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                                    {Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? 'day' : 'days'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {borrowing.fineAmount && (
                              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-amber-800 text-sm font-medium">
                                  Fine Amount: ₹{borrowing.fineAmount}
                                </p>
                                <p className="text-amber-600 text-xs">
                                  Late return fine (₹2 per day)
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="ml-6 flex flex-col space-y-2">
                            {borrowing.renewalCount < borrowing.maxRenewals && !isOverdue && (
                              <Button
                                onClick={() => handleRenewBook(borrowing.id)}
                                size="sm"
                                variant="outline"
                              >
                                Renew Book
                              </Button>
                            )}
                            {borrowing.fineAmount && (
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
                              Renewals: {borrowing.renewalCount}/{borrowing.maxRenewals}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {currentBorrowings.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No current borrowings</h3>
                      <p className="text-gray-600">
                        You don&apos;t have any books borrowed at the moment.
                      </p>
                      <Button className="mt-4">
                        Browse Books
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Borrowing History */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {borrowingHistory.map((borrowing) => (
                  <Card key={borrowing.id}>
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
                              Returned
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Borrowed Date</p>
                              <p className="font-medium">{borrowing.borrowDate.toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Due Date</p>
                              <p className="font-medium">{borrowing.dueDate.toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Return Date</p>
                              <p className="font-medium">{borrowing.returnDate?.toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Your Rating</p>
                              <div className="flex items-center space-x-1">
                                {borrowing.rating ? renderStars(borrowing.rating) : (
                                  <span className="text-gray-400 text-sm">Not rated</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {borrowing.fineAmount && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-amber-800 text-sm">
                                Fine Paid: ₹{borrowing.fineAmount} (Late return)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {borrowingHistory.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No borrowing history</h3>
                      <p className="text-gray-600">
                        You haven&apos;t borrowed any books yet.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
