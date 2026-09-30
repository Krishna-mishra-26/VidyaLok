// Define enums locally to avoid import issues during development
export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  LIBRARIAN = 'LIBRARIAN'
}

export enum UserAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED'
}

export enum BookCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  DAMAGED = 'DAMAGED'
}

export enum BorrowingStatus {
  BORROWED = 'BORROWED',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
  LOST = 'LOST',
  RENEWED = 'RENEWED'
}

export enum FeedbackType {
  COMPLAINT = 'COMPLAINT',
  SUGGESTION = 'SUGGESTION',
  TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
  BOOK_REQUEST = 'BOOK_REQUEST',
  GENERAL = 'GENERAL'
}

export enum FeedbackStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum BroadcastType {
  EMERGENCY = 'EMERGENCY',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  MAINTENANCE = 'MAINTENANCE',
  EVENT = 'EVENT',
  ALERT = 'ALERT'
}

export enum BookRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ORDERED = 'ORDERED',
  COMPLETED = 'COMPLETED'
}

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

export type BroadcastTypeValue = 'ANNOUNCEMENT' | 'ALERT' | 'MAINTENANCE' | 'EVENT' | 'EMERGENCY'

export type BroadcastPriorityValue = 'NORMAL' | 'HIGH' | 'URGENT'

export type BroadcastAudienceValue = 'ALL' | 'DEPARTMENT' | 'ROLE' | 'CUSTOM'

export type BroadcastStatusValue = 'DRAFT' | 'SCHEDULED' | 'SENT' | 'CANCELLED'

export interface BroadcastBadgeMeta {
  kind: 'info' | 'alert' | 'maintenance' | 'event' | 'emergency'
  label: string
}

export interface AdminBroadcastRecord {
  id: string
  title: string
  message: string
  type: BroadcastTypeValue
  priority: BroadcastPriorityValue
  status: BroadcastStatusValue
  isActive: boolean
  audience: BroadcastAudienceValue
  audienceFilter: Record<string, unknown> | null
  deliveredCount: number
  readCount: number
  readRate: number
  createdAt: string
  updatedAt: string
  sentAt: string | null
  expiresAt: string | null
  scheduleAt: string | null
  badge: BroadcastBadgeMeta
  createdBy: {
    id: string
    name: string | null
    email: string | null
  }
}

export interface AdminBroadcastSummary {
  totalBroadcasts: number
  sentToday: number
  scheduledCount: number
  averageReadRate: number
}

export interface StudentBroadcastRecord {
  id: string
  title: string
  message: string
  type: BroadcastTypeValue
  priority: BroadcastPriorityValue
  audience: BroadcastAudienceValue
  sentAt: string | null
  expiresAt: string | null
  deliveredAt: string
  readAt: string | null
  unread: boolean
  badge: BroadcastBadgeMeta
}

export interface StudentBroadcastSummary {
  unreadCount: number
}

// Library Settings Types
export interface LibrarySettings {
  // General Information
  libraryName: string
  libraryCode: string
  address: string
  phone: string
  email: string
  website: string
  timezone: string

  // Operations & Circulation
  openingTime: string
  closingTime: string
  seatCapacity: number
  closedDays: string[]
  maxBorrowDuration: number
  maxRenewals: number
  maxBooksPerUser: number
  finePerDay: number

  // Notifications
  emailNotifications: boolean
  smsNotifications: boolean
  overdueNotifications: boolean
  reminderDaysBefore: number
  digestEnabled: boolean
  digestSendTime: string
  escalationEmail: string

  // Security & Access
  sessionTimeout: number
  passwordExpiry: number
  loginAttempts: number
  twoFactorAuth: boolean
  autoLogout: number
  requireStrongPasswords: boolean
  dormantAccountThreshold: number

  // System & Compliance
  backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly'
  logRetention: number
  dataRetentionDays: number
  maintenanceMode: boolean
  maintenanceMessage: string
  allowSelfServicePasswordReset: boolean

  // Integrations
  smsSenderName: string

  // Metadata
  metadata: {
    lastUpdatedAt?: string
    lastUpdatedBy?: string
  }
}
