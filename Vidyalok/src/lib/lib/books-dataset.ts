import { promises as fs } from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { CANONICAL_DEPARTMENTS, type CanonicalDepartment } from '@/constants/departments'
import { resolveDepartment } from '@/lib/department-utils'

export interface LibraryBook {
  id: string
  department: CanonicalDepartment
  publisher: string
  author: string
  title: string
  copies: number
}

export interface BookSearchOptions {
  query?: string
  department?: string
  publisher?: string
  author?: string
  page?: number
  pageSize?: number
}

export interface BookSearchResult {
  items: LibraryBook[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  stats: {
    totalCopies: number
    lowStockCount: number
    lowStockCopies: number
    healthyCopies: number
    singleCopyCount: number
    averageCopies: number
  }
}

export interface BookAggregations {
  departments: string[]
  publishers: string[]
  authors: string[]
}

interface InternalBookRecord extends LibraryBook {
  searchVector: string
}

const BOOKS_DATASET_PATH = path.join(process.cwd(), 'Books Dataset.csv')
const DEFAULT_PAGE_SIZE = 50

let cachedBooks: InternalBookRecord[] | null = null
let cachedAggregations: BookAggregations | null = null
let cachedMtime: number | null = null

const normalizeString = (value?: string | null) => (value ?? '').trim()

const buildSearchVector = (book: LibraryBook) =>
  [book.title, book.author, book.publisher, book.department]
    .join(' | ')
    .toLowerCase()

const stripSearchVector = ({ searchVector: _searchVector, ...book }: InternalBookRecord): LibraryBook => {
  void _searchVector
  return book
}

const parseCopies = (value: string | null | undefined) => {
  const parsed = Number.parseInt((value ?? '').trim(), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

async function readDatasetFile(): Promise<string> {
  try {
    return await fs.readFile(BOOKS_DATASET_PATH, 'utf-8')
  } catch (error) {
    console.error('[books-dataset] Failed to read dataset file:', error)
    throw new Error('Library books dataset file is missing or unreadable')
  }
}

async function getFileModifiedTime(): Promise<number | null> {
  try {
    const stats = await fs.stat(BOOKS_DATASET_PATH)
    return stats.mtimeMs
  } catch (error) {
    console.error('[books-dataset] Failed to stat dataset file:', error)
    return null
  }
}

async function loadBooksFromCsv(): Promise<InternalBookRecord[]> {
  const csvContent = await readDatasetFile()
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as Array<Record<string, string>>

  const books: InternalBookRecord[] = []

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index]
    const title = normalizeString(record.title)

    if (!title) {
      continue
    }

    const author = normalizeString(record.author)
    const publisher = normalizeString(record.publishercode)
  const department = resolveDepartment(record.Department)
    const copies = parseCopies(record.Count)

    const book: LibraryBook = {
      id: `book-${index + 1}`,
      title,
      author,
      publisher,
      department,
      copies
    }

    books.push({
      ...book,
      searchVector: buildSearchVector(book)
    })
  }

  return books
}

async function ensureCache(): Promise<InternalBookRecord[]> {
  const currentMtime = await getFileModifiedTime()

  if (cachedBooks) {
    if (!cachedMtime || (currentMtime && currentMtime > cachedMtime)) {
      const freshBooks = await loadBooksFromCsv()
      cachedBooks = freshBooks
      cachedAggregations = null
      cachedMtime = currentMtime ?? Date.now()
    }
    return cachedBooks
  }

  const freshBooks = await loadBooksFromCsv()
  cachedBooks = freshBooks
  cachedAggregations = null
  cachedMtime = currentMtime ?? Date.now()
  return freshBooks
}

function buildAggregations(books: InternalBookRecord[]): BookAggregations {
  const departments = new Set<CanonicalDepartment>()
  const publishers = new Set<string>()
  const authors = new Set<string>()

  books.forEach((book) => {
    if (book.department) {
      departments.add(book.department)
    }
    if (book.publisher) {
      publishers.add(book.publisher)
    }
    if (book.author) {
      authors.add(book.author)
    }
  })

  return {
    departments: CANONICAL_DEPARTMENTS.filter((dept) => departments.has(dept)),
    publishers: Array.from(publishers).sort((a, b) => a.localeCompare(b)),
    authors: Array.from(authors).sort((a, b) => a.localeCompare(b))
  }
}

export async function getBooksAggregations(): Promise<BookAggregations> {
  const books = await ensureCache()
  if (!cachedAggregations) {
    cachedAggregations = buildAggregations(books)
  }
  return cachedAggregations
}

export async function searchBooks(options: BookSearchOptions = {}): Promise<BookSearchResult> {
  const books = await ensureCache()

  const query = normalizeString(options.query).toLowerCase()
  const department = normalizeString(options.department)
  const publisher = normalizeString(options.publisher)
  const author = normalizeString(options.author)

  const matches = books.filter((book) => {
    if (query) {
      const tokens = query.split(/\s+/).filter(Boolean)
      const hasAllTokens = tokens.every((token) => book.searchVector.includes(token))
      if (!hasAllTokens) {
        return false
      }
    }

    if (department && book.department.toLowerCase() !== department.toLowerCase()) {
      return false
    }

    if (publisher && book.publisher.toLowerCase() !== publisher.toLowerCase()) {
      return false
    }

    if (author && book.author.toLowerCase() !== author.toLowerCase()) {
      return false
    }

    return true
  })

  const pageSize = options.pageSize && options.pageSize > 0 ? options.pageSize : DEFAULT_PAGE_SIZE
  const page = options.page && options.page > 0 ? options.page : 1
  const offset = (page - 1) * pageSize

  let totalCopies = 0
  let lowStockCount = 0
  let lowStockCopies = 0
  let healthyCopies = 0
  let singleCopyCount = 0

  for (const book of matches) {
    totalCopies += book.copies

    if (book.copies <= 2) {
      lowStockCount += 1
      lowStockCopies += book.copies
      if (book.copies === 1) {
        singleCopyCount += 1
      }
    } else {
      healthyCopies += book.copies
    }
  }

  const averageCopies = matches.length > 0 ? totalCopies / matches.length : 0

  const paginatedItems = matches.slice(offset, offset + pageSize)

  return {
    items: paginatedItems.map(stripSearchVector),
    total: matches.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(matches.length / pageSize)),
    stats: {
      totalCopies,
      lowStockCount,
      lowStockCopies,
      healthyCopies,
      singleCopyCount,
      averageCopies
    }
  }
}

export async function getBookById(bookId: string): Promise<LibraryBook | null> {
  const books = await ensureCache()
  const match = books.find((book) => book.id === bookId)
  if (!match) {
    return null
  }
  return stripSearchVector(match)
}

export async function getAllBooks(): Promise<LibraryBook[]> {
  const books = await ensureCache()
  return books.map(stripSearchVector)
}
