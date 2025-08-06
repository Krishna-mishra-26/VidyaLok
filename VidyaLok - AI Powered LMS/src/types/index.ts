import { UserRole, BookStatus, BookCondition, BorrowingStatus, FeedbackType, FeedbackStatus, BroadcastType, BookRequestStatus } from '@prisma/client'

// Database Types
export interface User {
  id: string
  studentId: string
  email: string
  name: string
  phone?: string
  role: UserRole
  branch?: string
  semester?: number
  yearOfStudy?: number
  interests: string[]
  password: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Book {
  id: string
  isbn: string
  title: string
  author: string
  publisher?: string
  category: string
  department: string
  description?: string
  totalCopies: number
  availableCopies: number
  location: string
  status: BookStatus
  condition: BookCondition
  addedAt: Date
  updatedAt: Date
}

export interface Borrowing {
  id: string
  userId: string
  bookId: string
  borrowDate: Date
  dueDate: Date
  returnDate?: Date
  status: BorrowingStatus
  fineAmount: number
  finePaid: boolean
  user?: User
  book?: Book
}

export interface EntryLog {
  id: string
  userId: string
  entryTime: Date
  exitTime?: Date
  duration?: number
  user?: User
}

export interface SeatAvailability {
  id: string
  totalSeats: number
  occupiedSeats: number
  availableSeats: number
  lastUpdated: Date
}

export interface Feedback {
  id: string
  userId: string
  type: FeedbackType
  subject: string
  message: string
  status: FeedbackStatus
  response?: string
  createdAt: Date
  resolvedAt?: Date
  user?: User
}

export interface Broadcast {
  id: string
  title: string
  message: string
  type: BroadcastType
  isActive: boolean
  targetUsers: string[]
  createdAt: Date
  expiresAt?: Date
}

export interface BookRequest {
  id: string
  userId: string
  bookTitle: string
  author: string
  isbn?: string
  reason: string
  status: BookRequestStatus
  adminNotes?: string
  respondedAt?: Date
  createdAt: Date
}

export interface Analytics {
  id: string
  date: Date
  totalUsers: number
  activeUsers: number
  totalBorrowings: number
  totalReturns: number
  overdueBooks: number
  peakHours: string[]
  departmentStats?: Record<string, unknown>
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T = unknown> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface LoginForm {
  studentId: string
  password: string
}

export interface BookSearchForm {
  query: string
  category?: string
  department?: string
  author?: string
}

export interface FeedbackForm {
  type: FeedbackType
  subject: string
  message: string
}

export interface BookRequestForm {
  bookTitle: string
  author: string
  isbn?: string
  reason: string
}

export interface BroadcastForm {
  title: string
  message: string
  type: BroadcastType
  targetUsers: string[]
  expiresAt?: Date
}

// Dashboard Types
export interface DashboardStats {
  totalBooks: number
  totalUsers: number
  activeBorrowings: number
  overdueBooks: number
  availableSeats: number
  todayEntries: number
}

export interface BookStats {
  mostBorrowedBooks: Array<{
    book: Book
    borrowCount: number
  }>
  departmentWiseUsage: Array<{
    department: string
    borrowCount: number
  }>
  categoryWiseDistribution: Array<{
    category: string
    count: number
  }>
}

export interface UserStats {
  topBorrowers: Array<{
    user: User
    borrowCount: number
  }>
  departmentWiseUsers: Array<{
    department: string
    userCount: number
  }>
  activeUsersToday: number
}

// Chart Data Types
export interface ChartData {
  name: string
  value: number
  fill?: string
}

export interface TimeSeriesData {
  date: string
  borrowings: number
  returns: number
  entries: number
}

// Notification Types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  createdAt: Date
  read: boolean
}

// Export enums for easy access
export {
  UserRole,
  BookStatus,
  BookCondition,
  BorrowingStatus,
  FeedbackType,
  FeedbackStatus,
  BroadcastType,
  BookRequestStatus
}
