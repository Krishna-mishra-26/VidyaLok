'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import {
  CANONICAL_DEPARTMENTS_WITH_ALL,
  type CanonicalDepartment
} from '@/constants/departments'
import { canonicalizeDepartmentList, resolveDepartment } from '@/lib/department-utils'

type AdminBook = {
  id: string
  title: string
  author: string
  publisher: string
  department: CanonicalDepartment
  copies: number
}

type RawAdminBook = Omit<AdminBook, 'department'> & { department: string }

type BooksApiResponse = {
  success: boolean
  data: RawAdminBook[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  filters: {
    departments: string[]
    publishers: string[]
    authors: string[]
  }
  stats: {
    totalCopies: number
    lowStockCopies: number
    lowStockCount: number
    healthyCopies: number
    singleCopyCount: number
    averageCopies: number
  }
}

const PAGE_SIZE = 40
const DEBOUNCE_MS = 250

type DepartmentFilterValue = (typeof CANONICAL_DEPARTMENTS_WITH_ALL)[number]

const getStockStatus = (copies: number) => {
  if (copies === 0) return 'out_of_stock'
  if (copies <= 2) return 'low_stock'
  return 'available'
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'available':
      return 'text-green-600 bg-green-50'
    case 'low_stock':
      return 'text-yellow-600 bg-yellow-50'
    case 'out_of_stock':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export default function AdminBooksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentFilterValue>('all')
  const [selectedPublisher, setSelectedPublisher] = useState('all')
  const [books, setBooks] = useState<AdminBook[]>([])
  const [departments, setDepartments] = useState<DepartmentFilterValue[]>(
    Array.from(CANONICAL_DEPARTMENTS_WITH_ALL)
  )
  const [publishers, setPublishers] = useState<string[]>(['all'])
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 })
  const [catalogStats, setCatalogStats] = useState({
    totalCopies: 0,
    lowStockCopies: 0,
    lowStockCount: 0,
    healthyCopies: 0,
    singleCopyCount: 0,
    averageCopies: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedBooks, setSelectedBooks] = useState<string[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [actionDialog, setActionDialog] = useState<{
    mode: 'inspect' | 'delete' | 'more'
    book: AdminBook
  } | null>(null)
  const [bannerMessage, setBannerMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!bannerMessage) {
      return
    }

    const timer = window.setTimeout(() => setBannerMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [bannerMessage])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const buildQueryString = useCallback(
    (page: number, limit = PAGE_SIZE) => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))

      if (debouncedQuery) {
        params.set('query', debouncedQuery)
      }

      if (selectedDepartment !== 'all') {
        params.set('department', selectedDepartment)
      }

      if (selectedPublisher !== 'all') {
        params.set('publisher', selectedPublisher)
      }

      return params.toString()
    },
    [debouncedQuery, selectedDepartment, selectedPublisher]
  )

  const fetchBooks = useCallback(
    async (page = 1, signal?: AbortSignal) => {
      setIsLoading(true)
      setError(null)

      const queryString = buildQueryString(page)

      try {
        const response = await fetch(`/api/books?${queryString}`, { signal })

        if (!response.ok) {
          throw new Error('Unable to load books right now')
        }

        const payload: BooksApiResponse = await response.json()

        if (!payload.success) {
          throw new Error('Failed to load books')
        }

        const canonicalBooks: AdminBook[] = payload.data.map((book) => ({
          ...book,
          department: resolveDepartment(book.department)
        }))

        setBooks(canonicalBooks)
        setPagination(payload.pagination)
        setCatalogStats(payload.stats)

        if (payload.filters) {
          const canonicalFilters = canonicalizeDepartmentList(payload.filters.departments)
          setDepartments(['all', ...canonicalFilters])
          setPublishers(['all', ...payload.filters.publishers])
        }
      } catch (fetchError) {
        if ((fetchError as Error).name !== 'AbortError') {
          setError((fetchError as Error).message || 'Unable to load books.')
        }
      } finally {
        setIsLoading(false)
      }
    },
    [buildQueryString]
  )

  useEffect(() => {
    const controller = new AbortController()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchBooks(1, controller.signal)
    return () => controller.abort()
  }, [debouncedQuery, selectedDepartment, selectedPublisher, fetchBooks])

  useEffect(() => {
    setSelectedBooks((prev) => prev.filter((id) => books.some((book) => book.id === id)))
  }, [books])

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPagination((prev) => ({ ...prev, page: nextPage }))
      fetchBooks(nextPage)
    },
    [fetchBooks]
  )

  const handleSelectBook = (bookId: string) => {
    setSelectedBooks((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    )
  }

  const handleSelectAll = () => {
    if (selectedBooks.length === books.length) {
      setSelectedBooks([])
    } else {
      setSelectedBooks(books.map((book) => book.id))
    }
  }

  const handleBulkAction = useCallback(
    (action: string) => {
      console.info(`Bulk ${action} for books:`, selectedBooks)
      setBannerMessage(`Bulk ${action} is coming soon. Catalogue is read-only in this demo.`)
      setSelectedBooks([])
    },
    [selectedBooks]
  )

  const openActionDialog = useCallback((mode: 'inspect' | 'delete' | 'more', book: AdminBook) => {
    setActionDialog({ mode, book })
  }, [])

  const closeActionDialog = useCallback(() => {
    setActionDialog(null)
  }, [])

  const copyToClipboard = useCallback(async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setBannerMessage(message)
    } catch (copyError) {
      console.warn('Clipboard copy failed:', copyError)
      setBannerMessage('Unable to copy automatically. Please select and copy manually.')
    }
  }, [])

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true)
      const limit = Math.max(PAGE_SIZE, pagination.total || PAGE_SIZE)
      const queryString = buildQueryString(1, limit)
      const response = await fetch(`/api/books?${queryString}`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const payload: BooksApiResponse = await response.json()
      if (!payload.success) {
        throw new Error('Export failed')
      }

      const rows = [
        ['Title', 'Author', 'Publisher', 'Department', 'Copies'],
        ...payload.data.map((book) => [
          book.title,
          book.author,
          book.publisher,
          book.department,
          String(book.copies)
        ])
      ]

      const csvContent = rows
        .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `vidyalok-books-${Date.now()}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (exportError) {
      console.error('Book export failed:', exportError)
      setError('Unable to export catalog right now. Please retry later.')
    } finally {
      setIsExporting(false)
    }
  }, [buildQueryString, pagination.total])

  const pageCopies = books.reduce((sum, book) => sum + book.copies, 0)
  const healthyTitleCount = Math.max(pagination.total - catalogStats.lowStockCount, 0)
  const averageCopies = catalogStats.averageCopies
  const resultsSummary = useMemo(() => {
    if (isLoading) {
      return 'Loading inventory…'
    }

    if (error) {
      return error
    }

    const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1
    const end = Math.min(pagination.page * pagination.pageSize, pagination.total)
    const copySummary = pageCopies > 0 ? ` · ${pageCopies.toLocaleString()} copies in view` : ''
    const averageSummary = averageCopies > 0 ? ` · avg ${averageCopies.toFixed(1)} copies/title` : ''
    return `Showing ${start}-${end} of ${pagination.total} titles${copySummary}${averageSummary}`
  }, [isLoading, error, pagination, pageCopies, averageCopies])
  const canGoPrevious = pagination.page > 1
  const canGoNext = pagination.page < pagination.totalPages

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar userRole="ADMIN" />
        <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64 z-10 admin-books-content">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Book Inventory Management</h1>
                <p className="text-gray-600 mt-1">Monitor and curate the VidyaLok library collection.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex items-center gap-2" onClick={handleExport} disabled={isExporting || isLoading}>
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Export
                </Button>
                <Button variant="outline" className="flex items-center gap-2" disabled>
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <Button onClick={() => setShowAddForm(true)} variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Book
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Copies</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{catalogStats.totalCopies.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Across {pagination.total.toLocaleString()} titles</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Healthy Copies</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{catalogStats.healthyCopies.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Across {healthyTitleCount.toLocaleString()} resilient titles</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Single-Copy Titles</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{catalogStats.singleCopyCount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Need preservation attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{catalogStats.lowStockCount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Titles with ≤ 2 copies remaining</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="w-full">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by title, author, or keyword..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="w-full pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <select
                      value={selectedDepartment}
                      onChange={(event) =>
                        setSelectedDepartment(event.target.value as DepartmentFilterValue)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept === 'all' ? 'All departments' : dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full flex gap-2">
                    <select
                      value={selectedPublisher}
                      onChange={(event) => setSelectedPublisher(event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {publishers.map((publisher) => (
                        <option key={publisher} value={publisher}>
                          {publisher === 'all' ? 'All publishers' : publisher}
                        </option>
                      ))}
                    </select>
                    <Button variant="outline" size="icon" disabled className="shrink-0">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-gray-600 flex items-center gap-2">
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  <span>{resultsSummary}</span>
                </div>

                {selectedBooks.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-blue-700">{selectedBooks.length} book(s) selected</span>
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

                {bannerMessage && (
                  <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    {bannerMessage}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Books ({books.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">
                          <input
                            type="checkbox"
                            checked={books.length > 0 && selectedBooks.length === books.length}
                            onChange={handleSelectAll}
                            className="rounded"
                          />
                        </th>
                        <th className="text-left p-3">Book Details</th>
                        <th className="text-left p-3">Department</th>
                        <th className="text-left p-3">Publisher</th>
                        <th className="text-left p-3">Copies</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((book) => {
                        const status = getStockStatus(book.copies)
                        return (
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
                                <div className="font-medium text-gray-900 line-clamp-2" title={book.title}>
                                  {book.title}
                                </div>
                                <div className="text-sm text-gray-600">by {book.author || 'Unknown author'}</div>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="text-sm text-gray-700">{book.department || 'General'}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-sm text-gray-700">{book.publisher || 'Not specified'}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-sm font-medium text-gray-900">{book.copies}</span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(status)}`}>
                                {status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openActionDialog('inspect', book)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openActionDialog('delete', book)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openActionDialog('more', book)}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {!isLoading && books.length === 0 && !error && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
                    <p className="text-gray-600">Try broadening your filters to see more results.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!canGoPrevious || isLoading}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!canGoNext || isLoading}
                >
                  Next
                </Button>
              </div>
            )}

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-4 text-center text-red-700 text-sm font-medium">
                  {error}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

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
                  <label className="block text-sm font-medium mb-1">Publisher</label>
                  <Input placeholder="Publisher" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select department</option>
                    {departments.slice(1).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Copies</label>
                  <Input type="number" placeholder="Number of copies" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <Input placeholder="Additional notes" />
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
                <Button type="submit" className="flex-1" disabled>
                  Add Book
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {actionDialog.mode === 'inspect' && 'Book details'}
                  {actionDialog.mode === 'delete' && 'Delete book'}
                  {actionDialog.mode === 'more' && 'More actions'}
                </h2>
                <p className="text-sm text-gray-500">
                  {actionDialog.mode === 'inspect' && 'Review catalogue metadata for this title.'}
                  {actionDialog.mode === 'delete' && 'Catalogue updates are disabled in this preview environment.'}
                  {actionDialog.mode === 'more' && 'Quick shortcuts and context-aware utilities.'}
                </p>
              </div>
              <Button variant="outline" size="icon" onClick={closeActionDialog}>
                ×
              </Button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {actionDialog.mode === 'inspect' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs uppercase tracking-wide text-gray-500">Title</span>
                      <p className="mt-1 text-sm font-medium text-gray-900 leading-snug">
                        {actionDialog.book.title}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wide text-gray-500">Author</span>
                      <p className="mt-1 text-sm text-gray-800">{actionDialog.book.author || 'Unknown author'}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wide text-gray-500">Publisher</span>
                      <p className="mt-1 text-sm text-gray-800">{actionDialog.book.publisher || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wide text-gray-500">Department</span>
                      <p className="mt-1 text-sm text-gray-800">{actionDialog.book.department || 'General'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Copies in stock</p>
                      <p className="text-xs text-gray-500">Total copies recorded in the dataset</p>
                    </div>
                    <span className="text-2xl font-semibold text-gray-900">{actionDialog.book.copies}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(actionDialog.book.title, 'Book title copied to clipboard.')}
                    >
                      Copy title
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(actionDialog.book.author, 'Author copied to clipboard.')}
                      disabled={!actionDialog.book.author}
                    >
                      Copy author
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(actionDialog.book.id, 'Internal book identifier copied.')}
                    >
                      Copy book ID
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500">
                    Editing will be enabled once persistence APIs are connected. For now, use the copy
                    shortcuts above when preparing inventory updates.
                  </p>
                </div>
              )}

              {actionDialog.mode === 'delete' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                    VidyaLok is running in a read-only preview. Physical deletions are disabled to protect the
                    source dataset.
                  </div>
                  <p className="text-sm text-gray-600">
                    To remove this title in production, connect the catalogue service to the master database and
                    re-run the delete workflow from the admin console.
                  </p>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={closeActionDialog}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}

              {actionDialog.mode === 'more' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                    <p className="text-sm font-medium text-blue-900">Quick insights</p>
                    <p className="text-xs text-blue-700 mt-1">
                      {actionDialog.book.title} is catalogued under the {actionDialog.book.department || 'General'}
                      {actionDialog.book.department ? ' department' : ''} and supplied by{' '}
                      {actionDialog.book.publisher || 'an unspecified publisher'}. Use the buttons below to share
                      details with your acquisitions team.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        copyToClipboard(
                          `${actionDialog.book.title} by ${actionDialog.book.author || 'Unknown author'} (${actionDialog.book.publisher || 'Publisher N/A'})`,
                          'Summary copied. Paste it into your message thread.'
                        )
                        closeActionDialog()
                      }}
                    >
                      Copy book summary
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        copyToClipboard(
                          `Requesting ${actionDialog.book.copies} copies of ${actionDialog.book.title} for ${actionDialog.book.department || 'AIML department'}.`,
                          'Procurement note copied to clipboard.'
                        )
                        closeActionDialog()
                      }}
                    >
                      Copy procurement note
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500">
                    Additional workflows (hold requests, replenishment alerts, vendor links) will appear here after
                    the acquisitions microservice is connected.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <Button variant="outline" onClick={closeActionDialog}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
