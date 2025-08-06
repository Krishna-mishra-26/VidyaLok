'use client'

import React, { useState } from 'react'
import { Search, BookOpen, User, MapPin, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

export default function StudentBooksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  // Mock user data
  const user = {
    name: "Rahul Sharma",
    role: "STUDENT" as const,
    studentId: "STU240001"
  }

  // Mock books data
  const books = [
    {
      id: '1',
      isbn: '978-0262046305',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      publisher: 'MIT Press',
      category: 'Computer Science',
      department: 'Computer Engineering',
      description: 'Comprehensive introduction to algorithms and data structures',
      totalCopies: 5,
      availableCopies: 3,
      location: 'CS-A-101',
      rating: 4.8,
      status: 'AVAILABLE' as const
    },
    {
      id: '2',
      isbn: '978-0134685991',
      title: 'Effective Java',
      author: 'Joshua Bloch',
      publisher: 'Addison-Wesley',
      category: 'Programming',
      department: 'Computer Engineering',
      description: 'Best practices for Java programming language',
      totalCopies: 3,
      availableCopies: 1,
      location: 'CS-B-205',
      rating: 4.6,
      status: 'AVAILABLE' as const
    },
    {
      id: '3',
      isbn: '978-0135956056',
      title: 'Clean Architecture',
      author: 'Robert C. Martin',
      publisher: 'Prentice Hall',
      category: 'Software Engineering',
      department: 'Computer Engineering',
      description: 'Guide to software architecture and design principles',
      totalCopies: 4,
      availableCopies: 0,
      location: 'CS-C-310',
      rating: 4.5,
      status: 'BORROWED' as const
    },
    {
      id: '4',
      isbn: '978-1449373320',
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      publisher: "O'Reilly Media",
      category: 'Database Systems',
      department: 'Computer Engineering',
      description: 'The big ideas behind reliable, scalable, and maintainable systems',
      totalCopies: 2,
      availableCopies: 2,
      location: 'CS-D-115',
      rating: 4.9,
      status: 'AVAILABLE' as const
    },
    {
      id: '5',
      isbn: '978-0321125215',
      title: 'Domain-Driven Design',
      author: 'Eric Evans',
      publisher: 'Addison-Wesley',
      category: 'Software Engineering',
      department: 'Computer Engineering',
      description: 'Tackling complexity in the heart of software',
      totalCopies: 3,
      availableCopies: 1,
      location: 'CS-E-220',
      rating: 4.4,
      status: 'AVAILABLE' as const
    }
  ]

  const categories = [
    'all',
    'Computer Science',
    'Programming',
    'Software Engineering',
    'Database Systems',
    'Artificial Intelligence',
    'Machine Learning'
  ]

  const departments = [
    'all',
    'Computer Engineering',
    'Information Technology',
    'Electronics Engineering',
    'Mechanical Engineering'
  ]

  const filteredBooks = books.filter(book => {
    const matchesSearch = searchQuery === '' || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery)
    
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory
    const matchesDepartment = selectedDepartment === 'all' || book.department === selectedDepartment
    
    return matchesSearch && matchesCategory && matchesDepartment
  })

  const handleBorrowBook = (bookId: string) => {
    // TODO: Implement borrow functionality
    console.log('Borrowing book:', bookId)
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
              <h1 className="text-3xl font-bold">Book Search</h1>
              <p className="text-gray-600">Find and borrow books from our collection</p>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Search Books</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title, author, or ISBN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Department
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {departments.map(department => (
                        <option key={department} value={department}>
                          {department === 'all' ? 'All Departments' : department}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="text-sm text-gray-600">
                  Showing {filteredBooks.length} of {books.length} books
                </div>
              </CardContent>
            </Card>

            {/* Books Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{book.title}</CardTitle>
                        <CardDescription className="flex items-center space-x-1 mt-1">
                          <User className="h-4 w-4" />
                          <span>{book.author}</span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-yellow-600">
                        <Star className="h-4 w-4 fill-current" />
                        <span>{book.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm">{book.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Category</div>
                        <div className="font-medium">{book.category}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Publisher</div>
                        <div className="font-medium">{book.publisher}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">ISBN</div>
                        <div className="font-medium">{book.isbn}</div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-gray-500">Location</div>
                          <div className="font-medium">{book.location}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className="text-gray-500">Available: </span>
                          <span className={`font-medium ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {book.availableCopies}/{book.totalCopies}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            book.status === 'AVAILABLE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {book.status === 'AVAILABLE' ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                      
                      <Button
                        onClick={() => handleBorrowBook(book.id)}
                        disabled={book.availableCopies === 0}
                        size="sm"
                      >
                        {book.availableCopies > 0 ? 'Borrow Book' : 'Unavailable'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredBooks.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search criteria or filters to find more books.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
