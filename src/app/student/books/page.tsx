'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Search, BookOpen, User, Building2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import {
  CANONICAL_DEPARTMENTS_WITH_ALL,
  type CanonicalDepartment
} from '@/constants/departments'
import { canonicalizeDepartmentList, resolveDepartment } from '@/lib/department-utils'

type BookItem = {
  id: string
  title: string
  author: string
  publisher: string
  department: CanonicalDepartment
  copies: number
}

type RawBookItem = Omit<BookItem, 'department'> & { department: string }

type BooksApiResponse = {
  success: boolean
  data: RawBookItem[]
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
  stats?: {
    totalCopies: number
    lowStockCount: number
    lowStockCopies: number
    healthyCopies: number
    singleCopyCount: number
    averageCopies: number
  }
}

const PAGE_SIZE = 24
const DEBOUNCE_MS = 500

const normalizeQuery = (value: string) => value.trim().replace(/\s+/g, ' ')

type DepartmentFilterValue = (typeof CANONICAL_DEPARTMENTS_WITH_ALL)[number]

export default function StudentBooksPage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentFilterValue>('all')
  const [selectedPublisher, setSelectedPublisher] = useState('all')
  const [books, setBooks] = useState<BookItem[]>([])
  const [departments, setDepartments] = useState<DepartmentFilterValue[]>(
    Array.from(CANONICAL_DEPARTMENTS_WITH_ALL)
  )
  const [publishers, setPublishers] = useState<string[]>(['all'])
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [autoCorrection, setAutoCorrection] = useState<{ from: string; to: string } | null>(null)

  const searchDelayRef = useRef<number | null>(null)
  const activeRequestRef = useRef<AbortController | null>(null)
  const attemptedQueriesRef = useRef<Set<string>>(new Set())

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

  useEffect(() => {
    return () => {
      if (searchDelayRef.current) {
        window.clearTimeout(searchDelayRef.current)
        searchDelayRef.current = null
      }

      activeRequestRef.current?.abort()
    }
  }, [])

  const commitSearchQuery = useCallback((value: string) => {
    const normalized = normalizeQuery(value)
    setDebouncedQuery((previous) => (previous === normalized ? previous : normalized))
  }, [])

  const scheduleSearchCommit = useCallback(
    (value: string) => {
      const normalized = normalizeQuery(value)

      if (searchDelayRef.current) {
        window.clearTimeout(searchDelayRef.current)
        searchDelayRef.current = null
      }

      if (normalized.length === 0) {
        setIsTyping(false)
        commitSearchQuery('')
        return
      }

      if (normalized === debouncedQuery) {
        setIsTyping(false)
        return
      }

      setIsTyping(true)

      searchDelayRef.current = window.setTimeout(() => {
        commitSearchQuery(normalized)
        setIsTyping(false)
        searchDelayRef.current = null
      }, DEBOUNCE_MS)
    },
    [commitSearchQuery, debouncedQuery]
  )

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      setAutoCorrection(null)
      attemptedQueriesRef.current.clear()
      setSearchQuery(value)
      scheduleSearchCommit(value)
    },
    [scheduleSearchCommit]
  )

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (searchDelayRef.current) {
        window.clearTimeout(searchDelayRef.current)
        searchDelayRef.current = null
      }

      setAutoCorrection(null)
      attemptedQueriesRef.current.clear()
      setIsTyping(false)
      commitSearchQuery(searchQuery)
    },
    [commitSearchQuery, searchQuery]
  )

  const tryAutoCorrect = useCallback(
    async (query: string) => {
      const normalizedQuery = normalizeQuery(query)

      if (!normalizedQuery || attemptedQueriesRef.current.has(normalizedQuery)) {
        return false
      }

      attemptedQueriesRef.current.add(normalizedQuery)

      try {
        const response = await fetch(`/api/books/autocorrect?query=${encodeURIComponent(query)}`)

        if (!response.ok) {
          return false
        }

        const payload: { success: boolean; suggestion: string | null } = await response.json()

        if (!payload.success || !payload.suggestion) {
          return false
        }

        const suggestion = payload.suggestion.trim()
        const normalizedSuggestion = normalizeQuery(suggestion)

        if (!normalizedSuggestion || normalizedSuggestion === normalizedQuery) {
          return false
        }

        attemptedQueriesRef.current.add(normalizedSuggestion)

        if (searchDelayRef.current) {
          window.clearTimeout(searchDelayRef.current)
          searchDelayRef.current = null
        }

        setAutoCorrection({ from: query, to: suggestion })
        setIsTyping(false)
        setSearchQuery(suggestion)
        commitSearchQuery(suggestion)
        return true
      } catch (suggestionError) {
        console.error('Autocorrect suggestion failed:', suggestionError)
        return false
      }
    },
    [commitSearchQuery]
  )

  const buildQueryString = useCallback(
    (page: number) => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(PAGE_SIZE))

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
    async (page = 1) => {
      activeRequestRef.current?.abort()

      const controller = new AbortController()
      activeRequestRef.current = controller

      setIsLoading(true)
      setError(null)

      const queryString = buildQueryString(page)

      try {
        const response = await fetch(`/api/books?${queryString}`, { signal: controller.signal })

        if (!response.ok) {
          throw new Error('Unable to load books right now')
        }

        const payload: BooksApiResponse = await response.json()

        if (!payload.success) {
          throw new Error('Failed to load books')
        }

        const canonicalBooks: BookItem[] = payload.data.map((book) => ({
          ...book,
          department: resolveDepartment(book.department)
        }))

        setBooks(canonicalBooks)
        setPagination(payload.pagination)

        if (payload.filters) {
          const canonicalFilters = canonicalizeDepartmentList(payload.filters.departments)
          setDepartments(['all', ...canonicalFilters])
          setPublishers(['all', ...payload.filters.publishers])
        }

        if (payload.pagination.total === 0 && debouncedQuery) {
          void tryAutoCorrect(debouncedQuery)
        }
      } catch (fetchError) {
        if ((fetchError as Error).name !== 'AbortError') {
          console.error('Book search failed:', fetchError)
          setError((fetchError as Error).message || 'Unable to load books.')
        }
      } finally {
        if (activeRequestRef.current === controller) {
          activeRequestRef.current = null
          setIsLoading(false)
        }
      }
    },
    [buildQueryString, debouncedQuery, tryAutoCorrect]
  )

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchBooks(1)
  }, [debouncedQuery, selectedDepartment, selectedPublisher, fetchBooks])

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPagination((prev) => ({ ...prev, page: nextPage }))
      fetchBooks(nextPage)
    },
    [fetchBooks]
  )

  const resultsSummary = useMemo(() => {
    if (isTyping) {
      return 'Waiting for you to finish typing…'
    }

    if (isLoading) {
      return 'Loading books…'
    }

    if (error) {
      return error
    }

    const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1
    const end = Math.min(pagination.page * pagination.pageSize, pagination.total)
    return `Showing ${start}-${end} of ${pagination.total} books`
  }, [isTyping, isLoading, error, pagination])

  const canGoPrevious = pagination.page > 1
  const canGoNext = pagination.page < pagination.totalPages

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

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={headerUser} />

      <div className="flex flex-1">
        <Sidebar userRole="STUDENT" />

        <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Library Catalog</h1>
              <p className="text-gray-600">Search thousands of titles available in the VidyaLok library.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Search books</span>
                </CardTitle>
                <CardDescription>
                  Use filters to narrow down by department or publisher. Results update after you pause typing or press enter.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearchSubmit} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search by title, author, or keyword..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="pl-10"
                      aria-label="Search books"
                    />
                    <button type="submit" className="sr-only">
                      Run search
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Department</label>
                      <select
                        value={selectedDepartment}
                        onChange={(event) => {
                          setAutoCorrection(null)
                          attemptedQueriesRef.current.clear()
                          setSelectedDepartment(event.target.value as DepartmentFilterValue)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept === 'all' ? 'All departments' : dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Publisher</label>
                      <select
                        value={selectedPublisher}
                        onChange={(event) => {
                          setAutoCorrection(null)
                          attemptedQueriesRef.current.clear()
                          setSelectedPublisher(event.target.value)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {publishers.map((publisher) => (
                          <option key={publisher} value={publisher}>
                            {publisher === 'all' ? 'All publishers' : publisher}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-gray-600 flex items-center space-x-2">
                      {(isLoading || isTyping) && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                      <span>{resultsSummary}</span>
                    </div>
                    {autoCorrection && (
                      <p className="text-xs text-blue-600">
                        Showing results for <span className="font-semibold">“{autoCorrection.to}”</span>. Autocorrected from
                        {' '}
                        <span className="font-semibold">“{autoCorrection.from}”</span>.
                      </p>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {books.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg line-clamp-2" title={book.title}>
                          {book.title}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-1 mt-1">
                          <User className="h-4 w-4" />
                          <span>{book.author || 'Unknown author'}</span>
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="font-medium text-gray-700">{book.publisher || 'Publisher TBD'}</div>
                        <div className="flex items-center justify-end space-x-1 mt-1 text-blue-600">
                          <Building2 className="h-4 w-4" />
                          <span>{book.department || 'General collection'}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Author</div>
                        <div className="font-medium text-gray-800">{book.author || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Publisher</div>
                        <div className="font-medium text-gray-800">{book.publisher || 'Not specified'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Department</div>
                        <div className="font-medium text-gray-800">{book.department || 'General'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Copies available</div>
                        <div className="font-semibold text-green-700">{book.copies}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-gray-500">Request this title at the circulation desk.</span>
                      <Button size="sm" variant="outline" disabled>
                        Borrow request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!isLoading && books.length === 0 && !error && (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms or filters to explore more of the catalog.
                  </p>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-4 text-center text-red-700 text-sm font-medium">
                  {error}
                </CardContent>
              </Card>
            )}

            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center pt-4">
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
          </div>
        </main>
      </div>
    </div>
  )
}
