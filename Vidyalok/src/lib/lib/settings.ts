import { z } from 'zod'
import { LibrarySettings } from '@/types'

export const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export const librarySettingsSchema = z.object({
  libraryName: z.string().min(2).max(120),
  libraryCode: z.string().min(2).max(20),
  address: z.string().min(5).max(240),
  phone: z.string().min(5).max(32),
  email: z.string().email(),
  website: z.string().url(),
  timezone: z.string().min(2).max(64),

  openingTime: z.string().regex(/^\d{2}:\d{2}$/),
  closingTime: z.string().regex(/^\d{2}:\d{2}$/),
  seatCapacity: z.number().min(0).max(5000),
  closedDays: z.array(z.enum(daysOfWeek)).min(0).max(7),
  maxBorrowDuration: z.number().int().min(1).max(180),
  maxRenewals: z.number().int().min(0).max(10),
  maxBooksPerUser: z.number().int().min(1).max(20),
  finePerDay: z.number().min(0).max(100),

  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  overdueNotifications: z.boolean(),
  reminderDaysBefore: z.number().int().min(1).max(14),
  digestEnabled: z.boolean(),
  digestSendTime: z.string().regex(/^\d{2}:\d{2}$/),
  escalationEmail: z.string().email(),

  sessionTimeout: z.number().int().min(5).max(480),
  passwordExpiry: z.number().int().min(30).max(365),
  loginAttempts: z.number().int().min(3).max(10),
  twoFactorAuth: z.boolean(),
  autoLogout: z.number().int().min(5).max(180),
  requireStrongPasswords: z.boolean(),
  dormantAccountThreshold: z.number().int().min(30).max(730),

  backupFrequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
  logRetention: z.number().int().min(30).max(3650),
  dataRetentionDays: z.number().int().min(30).max(3650),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().max(280),
  allowSelfServicePasswordReset: z.boolean(),

  smsSenderName: z.string().max(32),

  metadata: z
    .object({
      lastUpdatedAt: z.string().optional(),
      lastUpdatedBy: z.string().optional(),
    })
    .default({}),
})

export type LibrarySettingsPayload = z.infer<typeof librarySettingsSchema>

export const DEFAULT_LIBRARY_SETTINGS: LibrarySettings = {
  libraryName: 'VidyaLok Smart Library',
  libraryCode: 'VSL001',
  address: '123 Education Street, Knowledge City, KC 12345',
  phone: '+1 (555) 123-4567',
  email: 'admin@vidyalok.edu',
  website: 'https://library.vidyalok.edu',
  timezone: 'Asia/Kolkata',

  openingTime: '08:00',
  closingTime: '22:00',
  seatCapacity: 150,
  closedDays: ['Sunday'],
  maxBorrowDuration: 14,
  maxRenewals: 2,
  maxBooksPerUser: 5,
  finePerDay: 2,

  emailNotifications: true,
  smsNotifications: false,
  overdueNotifications: true,
  reminderDaysBefore: 3,
  digestEnabled: true,
  digestSendTime: '09:00',
  escalationEmail: 'librarian@vidyalok.edu',

  sessionTimeout: 45,
  passwordExpiry: 90,
  loginAttempts: 5,
  twoFactorAuth: false,
  autoLogout: 15,
  requireStrongPasswords: true,
  dormantAccountThreshold: 180,

  backupFrequency: 'daily',
  logRetention: 365,
  dataRetentionDays: 730,
  maintenanceMode: false,
  maintenanceMessage: 'The VidyaLok Smart Library will be back soon. Please check again later.',
  allowSelfServicePasswordReset: true,

  smsSenderName: 'VIDYALIB',

  metadata: {},
}

export const sanitizeLibrarySettings = (input: unknown): LibrarySettings => {
  const merged = {
    ...DEFAULT_LIBRARY_SETTINGS,
    ...(typeof input === 'object' && input !== null ? input : {}),
  }

  const parsed = librarySettingsSchema.parse(merged)

  return {
    ...DEFAULT_LIBRARY_SETTINGS,
    ...parsed,
    metadata: {
      ...DEFAULT_LIBRARY_SETTINGS.metadata,
      ...parsed.metadata,
    },
  }
}

export const prepareSettingsForPersist = (
  data: LibrarySettings,
  updater?: { id?: string | null; name?: string | null },
) => {
  const timestamp = new Date().toISOString()

  return {
    ...data,
    metadata: {
      lastUpdatedAt: timestamp,
      lastUpdatedBy: updater?.name ?? updater?.id ?? 'system',
    },
  }
}
