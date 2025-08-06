'use client'

import React, { useState } from 'react'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Download,
  Upload,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

export default function AdminBooksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedBooks, setSelectedBooks] = useState<string[]>([])

  // Mock book data
  const books = [
    {
      id: '1',
      title: 'Data Structures and Algorithms in Java',
      author: 'Robert Lafore',
      isbn: '978-0672324536',
      category: 'Computer Science',
      totalCopies: 10,
      availableCopies: 7,
      borrowedCopies: 3,
      status: 'available',
      condition: 'good',
      location: 'CS-A1-001',
      publishedDate: '2017-01-15',
      addedDate: '2024-01-15'
    },
    {
      id: '2',
      title: 'Introduction to Machine Learning',
      author: 'Alpaydin Ethem',
      isbn: '978-0262028189',
      category: 'Computer Science',
      totalCopies: 8,
      availableCopies: 2,
      borrowedCopies: 5,
      status: 'low_stock',
      condition: 'good',
      location: 'CS-A2-045',
      publishedDate: '2020-03-10',
      addedDate: '2024-02-01'
    },
    {
      id: '3',
      title: 'Digital Signal Processing',
      author: 'John G. Proakis',
      isbn: '978-0131873742',
      category: 'Electronics',
      totalCopies: 5,
      availableCopies: 0,
      borrowedCopies: 4,
      status: 'out_of_stock',
      condition: 'fair',
      location: 'EC-B1-023',
      publishedDate: '2019-06-20',
      addedDate: '2024-01-20'
    },
    {
      id: '4',
      title: 'Database System Concepts',
      author: 'Abraham Silberschatz',
      isbn: '978-0078022159',
      category: 'Computer Science',
      totalCopies: 12,
      availableCopies: 9,
      borrowedCopies: 3,
      status: 'available',
      condition: 'excellent',
      location: 'CS-A1-078',
      publishedDate: '2018-09-15',
      addedDate: '2024-01-10'
    }
  ]

  const categories = ['all', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Mathematics', 'Physics']

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.isbn.includes(searchQuery)
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-50'
      case 'low_stock': return 'text-yellow-600 bg-yellow-50'
      case 'out_of_stock': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for books:`, selectedBooks)
    setSelectedBooks([])
  }

  const handleSelectBook = (bookId: string) => {
    setSelectedBooks(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    )
  }

  const handleSelectAll = () => {
    if (selectedBooks.length === filteredBooks.length) {
      setSelectedBooks([])
    } else {
      setSelectedBooks(filteredBooks.map(book => book.id))
    }
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
                <h1 className="text-3xl font-bold">Book Inventory Management</h1>
                <p className="text-gray-600 mt-1">Manage your library&apos;s book collection</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Book
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{books.reduce((sum, book) => sum + book.totalCopies, 0)}</div>
                  <p className="text-xs text-muted-foreground">{books.length} unique titles</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {books.reduce((sum, book) => sum + book.availableCopies, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Ready to borrow</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Borrowed</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {books.reduce((sum, book) => sum + book.borrowedCopies, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Currently out</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {books.filter(book => book.status === 'low_stock' || book.status === 'out_of_stock').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by title, author, or ISBN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedBooks.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-blue-700">
                      {selectedBooks.length} book(s) selected
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('edit')}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
                        Delete
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                        Export
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Books Table */}
            <Card>
              <CardHeader>
                <CardTitle>Books ({filteredBooks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">
                          <input
                            type="checkbox"
                            checked={selectedBooks.length === filteredBooks.length && filteredBooks.length > 0}
                            onChange={handleSelectAll}
                            className="rounded"
                          />
                        </th>
                        <th className="text-left p-3">Book Details</th>
                        <th className="text-left p-3">Category</th>
                        <th className="text-left p-3">Copies</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Condition</th>
                        <th className="text-left p-3">Location</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBooks.map((book) => (
                        <tr key={book.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedBooks.includes(book.id)}
                              onChange={() => handleSelectBook(book.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{book.title}</div>
                              <div className="text-sm text-gray-600">by {book.author}</div>
                              <div className="text-xs text-gray-500">ISBN: {book.isbn}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {book.category}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <div>Total: {book.totalCopies}</div>
                              <div className="text-green-600">Available: {book.availableCopies}</div>
                              <div className="text-blue-600">Borrowed: {book.borrowedCopies}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(book.status)}`}>
                              {book.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`text-sm font-medium ${getConditionColor(book.condition)}`}>
                              {book.condition}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-gray-600">{book.location}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredBooks.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Add Book Modal would go here */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add New Book</h2>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                ×
              </Button>
            </div>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input placeholder="Book title" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Author</label>
                  <Input placeholder="Author name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ISBN</label>
                  <Input placeholder="ISBN number" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select category</option>
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Copies</label>
                  <Input type="number" placeholder="Number of copies" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Input placeholder="Shelf location (e.g., CS-A1-001)" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Published Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Condition</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Book description (optional)"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Add Book</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
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
