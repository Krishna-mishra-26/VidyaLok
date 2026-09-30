import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import type { Prisma } from '@prisma/client'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BorrowingStatus, UserAccountStatus, UserRole } from '@/types'

type UserWhereInput = Prisma.UserWhereInput
type UserOrderByWithRelationInput = Prisma.UserOrderByWithRelationInput
type UserCreateInput = Prisma.UserCreateInput
type UserUpdateInput = Prisma.UserUpdateInput

type UserBorrowingSummary = {
  total: number
  active: number
  overdue: number
  outstandingFines: number
}

const EXPORT_ROW_LIMIT = 5000
const SORTABLE_FIELDS = new Set(['createdAt', 'name', 'lastLoginAt', 'loginCount'])
const SORT_DIRECTIONS = new Set(['asc', 'desc'])

const createUserSchema = z.object({
  studentId: z.string().min(3, 'Student ID must be at least 3 characters long'),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Provide a valid email address').transform((value) => value.toLowerCase()),
  phone: z.string().max(20).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.nativeEnum(UserRole).default(UserRole.STUDENT),
  accountStatus: z.nativeEnum(UserAccountStatus).default(UserAccountStatus.ACTIVE),
  branch: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  designation: z.string().max(120).optional(),
  interests: z.array(z.string().min(1)).max(20).optional(),
  semester: z.union([z.coerce.number().int().min(1).max(12), z.null()]).optional(),
  yearOfStudy: z.union([z.coerce.number().int().min(1).max(8), z.null()]).optional(),
  activateImmediately: z.boolean().optional(),
})

const updateStatusSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1, 'Select at least one user'),
  accountStatus: z.nativeEnum(UserAccountStatus),
  isActive: z.boolean().optional(),
  note: z.string().max(280).optional(),
})

const updateUserSchema = z.object({
  id: z.string().min(1, 'User id is required'),
  studentId: z.string().min(3).optional(),
  name: z.string().min(2).optional(),
  email: z
    .string()
    .email('Provide a valid email address')
    .transform((value) => value.toLowerCase())
    .optional(),
  phone: z.string().max(20).optional(),
  role: z.nativeEnum(UserRole).optional(),
  accountStatus: z.nativeEnum(UserAccountStatus).optional(),
  branch: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  designation: z.string().max(120).optional(),
  interests: z.array(z.string().min(1)).max(20).optional(),
  semester: z.coerce.number().int().min(1).max(12).optional(),
  yearOfStudy: z.coerce.number().int().min(1).max(8).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
  isActive: z.boolean().optional(),
})

const ensureAdminAccess = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }
  }

  const userRole = session.user.role as UserRole | undefined
  if (!userRole || (userRole !== UserRole.ADMIN && userRole !== UserRole.LIBRARIAN)) {
    return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) }
  }

  return { session }
}

const mapSearchStatuses = (raw: string | null): UserAccountStatus[] | undefined => {
  if (!raw) return undefined
  const parts = raw.split(',').map((value) => value.trim().toUpperCase())
  const allowed = Object.values(UserAccountStatus)
  const filtered = parts.filter((value): value is UserAccountStatus =>
    allowed.includes(value as UserAccountStatus),
  )

  return filtered.length ? filtered : undefined
}

const parseSort = (field: string | null, direction: string | null) => {
  const normalizedField = field && SORTABLE_FIELDS.has(field) ? field : 'createdAt'
  const normalizedDirection = direction && SORT_DIRECTIONS.has(direction) ? direction : 'desc'

  return { field: normalizedField, direction: normalizedDirection as 'asc' | 'desc' }
}

const buildUserWhereClause = (params: URLSearchParams): UserWhereInput => {
  const where: Record<string, unknown> = {}

  const searchQuery = params.get('q')?.trim() ?? ''
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { email: { contains: searchQuery, mode: 'insensitive' } },
      { studentId: { contains: searchQuery, mode: 'insensitive' } },
      { phone: { contains: searchQuery, mode: 'insensitive' } },
      { branch: { contains: searchQuery, mode: 'insensitive' } },
      { department: { contains: searchQuery, mode: 'insensitive' } },
    ]
  }

  const role = params.get('role')?.toUpperCase()
  if (role && Object.values(UserRole).includes(role as UserRole)) {
    where.role = role as UserRole
  }

  const statuses = mapSearchStatuses(params.get('status'))
  if (statuses && statuses.length) {
    where.accountStatus = { in: statuses }
  }

  const department = params.get('department')?.trim()
  if (department) {
    where.department = { equals: department }
  }

  const branch = params.get('branch')?.trim()
  if (branch) {
    where.branch = { equals: branch }
  }

  const isActiveParam = params.get('isActive')
  if (isActiveParam === 'true') {
    where.isActive = true
  } else if (isActiveParam === 'false') {
    where.isActive = false
  }

  const createdFrom = params.get('createdFrom')
  const createdTo = params.get('createdTo')
  if (createdFrom || createdTo) {
    const createdAtFilter: Record<string, Date> = {}
    if (createdFrom) {
      const fromDate = new Date(createdFrom)
      if (!Number.isNaN(fromDate.getTime())) {
        createdAtFilter.gte = fromDate
      }
    }
    if (createdTo) {
      const toDate = new Date(createdTo)
      if (!Number.isNaN(toDate.getTime())) {
        createdAtFilter.lte = toDate
      }
    }
    if (Object.keys(createdAtFilter).length) {
      where.createdAt = createdAtFilter
    }
  }

  return where as UserWhereInput
}

const serializeCsv = (records: Array<Record<string, unknown>>) => {
  if (!records.length) {
    return '"ID","Name","Email","Student ID","Role","Status","Department","Branch","Created At"\r\n'
  }

  const headers = Object.keys(records[0])
  const escapeValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return ''
    }
    const stringValue = value instanceof Date ? value.toISOString() : String(value)
    const escaped = stringValue.replace(/"/g, '""')
    return `"${escaped}` + '"'
  }

  const headerLine = headers.map((header) => `"${header.replace(/"/g, '""')}"`).join(',')
  const bodyLines = records.map((record) =>
    headers.map((header) => escapeValue(record[header])).join(','),
  )

  return [headerLine, ...bodyLines].join('\r\n')
}

const userListSelect = {
  id: true,
  name: true,
  email: true,
  studentId: true,
  phone: true,
  role: true,
  accountStatus: true,
  branch: true,
  department: true,
  designation: true,
  semester: true,
  yearOfStudy: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  loginCount: true,
  isActive: true,
  _count: {
    select: {
      borrowings: true,
    },
  },
} satisfies Prisma.UserSelect

type UserListWithCounts = Prisma.UserGetPayload<{ select: typeof userListSelect }>

type EnrichedUserRecord = Omit<UserListWithCounts, '_count'> & {
  borrowingsCount: number
  borrowingSummary: UserBorrowingSummary
}

const enrichUsersWithBorrowingSummary = async (users: UserListWithCounts[]): Promise<EnrichedUserRecord[]> => {
  if (!users.length) return []

  const userIds = users.map((user) => user.id)
  const borrowings = await prisma.borrowing.findMany({
    where: { userId: { in: userIds } },
    select: {
      userId: true,
      status: true,
      dueDate: true,
      fineAmount: true,
      returnDate: true,
    },
  })

  const now = new Date()
  const borrowingMap = new Map<string, UserBorrowingSummary>()
  const defaultSummary: UserBorrowingSummary = {
    total: 0,
    active: 0,
    overdue: 0,
    outstandingFines: 0,
  }

  for (const record of borrowings) {
    const summary = borrowingMap.get(record.userId) ?? { ...defaultSummary }

    summary.total += 1

    if (record.status === BorrowingStatus.BORROWED || record.status === BorrowingStatus.RENEWED) {
      summary.active += 1
    }

    const isOverdueStatus = record.status === BorrowingStatus.OVERDUE
    const isPastDueDate = record.status === BorrowingStatus.BORROWED && record.dueDate && record.dueDate < now
    if (isOverdueStatus || isPastDueDate) {
      summary.overdue += 1
    }

    if (!record.returnDate && record.fineAmount > 0) {
      summary.outstandingFines += record.fineAmount
    }

    borrowingMap.set(record.userId, summary)
  }

  return users.map(({ _count, ...user }) => {
    const summary = borrowingMap.get(user.id) ?? { ...defaultSummary }

    return {
      ...user,
      borrowingsCount: _count.borrowings,
      borrowingSummary: summary,
    }
  })
}

export async function GET(request: Request) {
  const { error } = await ensureAdminAccess()
  if (error) return error

  const params = new URL(request.url).searchParams
  const where = buildUserWhereClause(params)
  const mergeWhere = (extra: Partial<UserWhereInput>): UserWhereInput => (
    { ...where, ...extra } as UserWhereInput
  )

  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, Number.parseInt(params.get('limit') ?? '20', 10)))
  const { field: sortField, direction: sortDirection } = parseSort(params.get('sortBy'), params.get('sortOrder'))
  const skip = (page - 1) * limit

  const orderBy = [
    { [sortField]: sortDirection },
    ...(sortField === 'createdAt' ? [] : [{ createdAt: 'desc' as const }]),
  ] as UserOrderByWithRelationInput[]

  try {
    const exportType = params.get('export')

    if (exportType === 'csv') {
      const exportUsers = await prisma.user.findMany({
        where,
        orderBy,
        take: EXPORT_ROW_LIMIT,
        select: {
          id: true,
          name: true,
          email: true,
          studentId: true,
          role: true,
          accountStatus: true,
          department: true,
          branch: true,
          createdAt: true,
        },
      })

      const csvPayload = exportUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        status: user.accountStatus,
        department: user.department ?? '',
        branch: user.branch ?? '',
        createdAt: user.createdAt.toISOString(),
      }))

      const csv = serializeCsv(csvPayload)
      const filename = `vidyalok-users-${Date.now()}.csv`

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    const usersPromise = prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: userListSelect,
    })

    const countsPromise = Promise.all([
      prisma.user.count({ where }),
      prisma.user.count({ where: mergeWhere({ accountStatus: UserAccountStatus.ACTIVE }) }),
      prisma.user.count({ where: mergeWhere({ accountStatus: UserAccountStatus.INACTIVE }) }),
      prisma.user.count({ where: mergeWhere({ accountStatus: UserAccountStatus.SUSPENDED }) }),
      prisma.user.count({ where: mergeWhere({ role: UserRole.ADMIN }) }),
      prisma.user.count({ where: mergeWhere({ role: UserRole.LIBRARIAN }) }),
      prisma.user.count({ where: mergeWhere({ role: UserRole.STUDENT }) }),
    ]) as Promise<[
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ]>

    const [users, counts] = await Promise.all([usersPromise, countsPromise])
    const [totalUsers, activeCount, inactiveCount, suspendedCount, adminCount, librarianCount, studentCount] = counts

    const results = await enrichUsersWithBorrowingSummary(users)

    const includeStats = params.get('includeStats') !== 'false'

    return NextResponse.json({
      data: results,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
      ...(includeStats
        ? {
            stats: {
              accountStatus: {
                active: activeCount,
                inactive: inactiveCount,
                suspended: suspendedCount,
              },
              roles: {
                admins: adminCount,
                librarians: librarianCount,
                students: studentCount,
              },
            },
          }
        : {}),
    })
  } catch (err) {
    console.error('[ADMIN_USERS_GET]', err)
    return NextResponse.json({ message: 'Failed to load users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { error } = await ensureAdminAccess()
  if (error) return error

  try {
    const payload = await request.json()
    const {
      studentId,
      name,
      email,
      phone,
      password,
      role,
      accountStatus,
      branch,
      department,
      designation,
      interests,
      semester,
      yearOfStudy,
      activateImmediately,
    } = createUserSchema.parse(payload)

    const trimmedStudentId = studentId.trim().toUpperCase()
    const normalizedEmail = email.trim().toLowerCase()

    const [existingId, existingEmail] = await Promise.all([
      prisma.user.findUnique({ where: { studentId: trimmedStudentId } }),
      prisma.user.findUnique({ where: { email: normalizedEmail } }),
    ])

    if (existingId) {
      return NextResponse.json({ message: 'Student/Admin ID already registered' }, { status: 409 })
    }

    if (existingEmail) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const createdUser = await prisma.user.create({
      data: {
        studentId: trimmedStudentId,
        name,
        email: normalizedEmail,
        phone: phone ?? null,
        password: hashedPassword,
        role,
        accountStatus,
        branch: branch ?? null,
        department: department ?? null,
        designation: designation ?? null,
        interests: interests ?? [],
        semester: semester ?? null,
        yearOfStudy: yearOfStudy ?? null,
        isActive: activateImmediately ?? accountStatus === UserAccountStatus.ACTIVE,
  } satisfies UserCreateInput,
      select: userListSelect,
    })

    const [result] = await enrichUsersWithBorrowingSummary([createdUser])

    return NextResponse.json({
      message: 'User created successfully',
      data: result,
    }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid payload', issues: err.flatten() }, { status: 422 })
    }

    console.error('[ADMIN_USERS_POST]', err)
    return NextResponse.json({ message: 'Failed to create user' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { error } = await ensureAdminAccess()
  if (error) return error

  try {
    const payload = await request.json()
    const { id, password, studentId, email, semester, yearOfStudy, interests, ...rest } = updateUserSchema.parse(
      payload,
    )

    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

  const updates: UserUpdateInput = {}

    if (typeof rest.name === 'string' && rest.name.trim() && rest.name.trim() !== existingUser.name) {
      updates.name = rest.name.trim()
    }

    if (typeof rest.phone === 'string') {
      updates.phone = rest.phone.trim() ? rest.phone.trim() : null
    }

    if (typeof rest.branch === 'string') {
      updates.branch = rest.branch.trim() ? rest.branch.trim() : null
    }

    if (typeof rest.department === 'string') {
      updates.department = rest.department.trim() ? rest.department.trim() : null
    }

    if (typeof rest.designation === 'string') {
      updates.designation = rest.designation.trim() ? rest.designation.trim() : null
    }

    if (Array.isArray(interests)) {
      updates.interests = interests
    }

    if (typeof rest.role !== 'undefined') {
      updates.role = rest.role
    }

    if (typeof rest.accountStatus !== 'undefined') {
      updates.accountStatus = rest.accountStatus
    }

    if (typeof rest.isActive === 'boolean') {
      updates.isActive = rest.isActive
    }

    if (typeof semester !== 'undefined') {
      updates.semester = semester === null ? null : semester
    }

    if (typeof yearOfStudy !== 'undefined') {
      updates.yearOfStudy = yearOfStudy === null ? null : yearOfStudy
    }

    if (typeof studentId === 'string' && studentId.trim().toUpperCase() !== existingUser.studentId) {
      const normalizedStudentId = studentId.trim().toUpperCase()
      const conflict = await prisma.user.findUnique({ where: { studentId: normalizedStudentId } })
      if (conflict && conflict.id !== existingUser.id) {
        return NextResponse.json({ message: 'Student/Admin ID already registered' }, { status: 409 })
      }
      updates.studentId = normalizedStudentId
    }

    if (typeof email === 'string' && email.trim() !== existingUser.email) {
      const normalizedEmail = email.trim().toLowerCase()
      const conflict = await prisma.user.findUnique({ where: { email: normalizedEmail } })
      if (conflict && conflict.id !== existingUser.id) {
        return NextResponse.json({ message: 'Email already registered' }, { status: 409 })
      }
      updates.email = normalizedEmail
    }

    if (typeof password === 'string') {
      updates.password = await bcrypt.hash(password, 12)
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json({ message: 'No changes detected' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updates,
      select: userListSelect,
    })

    const [result] = await enrichUsersWithBorrowingSummary([updatedUser])

    return NextResponse.json({
      message: 'User updated successfully',
      data: result,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid payload', issues: err.flatten() }, { status: 422 })
    }

    console.error('[ADMIN_USERS_PUT]', err)
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const { error } = await ensureAdminAccess()
  if (error) return error

  try {
    const payload = await request.json()
    const { userIds, accountStatus, isActive } = updateStatusSchema.parse(payload)

    const updated = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: {
        accountStatus,
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
      },
    })

    return NextResponse.json({
      message: 'User status updated',
      updatedCount: updated.count,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid payload', issues: err.flatten() }, { status: 422 })
    }

    console.error('[ADMIN_USERS_PATCH]', err)
    return NextResponse.json({ message: 'Failed to update user status' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { error } = await ensureAdminAccess()
  if (error) return error

  try {
    const url = new URL(request.url)
    let userId = url.searchParams.get('id')?.trim()

    if (!userId) {
      try {
        const body = await request.json()
        if (body && typeof body.userId === 'string') {
          userId = body.userId.trim()
        }
      } catch {
        // Ignore body parse errors for DELETE without payload
      }
    }

    if (!userId) {
      return NextResponse.json({ message: 'User id is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    if (user.role !== UserRole.STUDENT) {
      return NextResponse.json({ message: 'Only student accounts can be deleted' }, { status: 409 })
    }

    const activeBorrowings = await prisma.borrowing.count({
      where: {
        userId: user.id,
        status: { in: [BorrowingStatus.BORROWED, BorrowingStatus.RENEWED, BorrowingStatus.OVERDUE] },
      },
    })

    if (activeBorrowings > 0) {
      return NextResponse.json(
        { message: 'Resolve outstanding borrowings before deleting this account' },
        { status: 409 },
      )
    }

    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId: user.id } }),
      prisma.account.deleteMany({ where: { userId: user.id } }),
      prisma.borrowing.deleteMany({ where: { userId: user.id } }),
      prisma.entryLog.deleteMany({ where: { userId: user.id } }),
      prisma.feedback.deleteMany({ where: { userId: user.id } }),
      prisma.bookRequest.deleteMany({ where: { userId: user.id } }),
      prisma.broadcastReceipt.deleteMany({ where: { userId: user.id } }),
      prisma.user.delete({ where: { id: user.id } }),
    ])

    return NextResponse.json({ message: 'User account permanently removed' })
  } catch (err) {
    console.error('[ADMIN_USERS_DELETE]', err)
    return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 })
  }
}
