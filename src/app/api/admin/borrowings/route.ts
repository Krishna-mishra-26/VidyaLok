import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type { Prisma } from '@prisma/client'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BorrowingStatus, UserRole } from '@/types'

const DEFAULT_PAGE_SIZE = 25
const MAX_PAGE_SIZE = 100
const STATUS_VALUES = new Set<string>(Object.values(BorrowingStatus))
const SORTABLE_FIELDS = new Set(['borrowDate', 'dueDate', 'returnDate', 'fineAmount'])
const SORT_DIRECTIONS = new Set(['asc', 'desc'])

const ensureAdminAccess = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }
  }

  const role = session.user.role as UserRole | undefined

  if (!role || (role !== UserRole.ADMIN && role !== UserRole.LIBRARIAN)) {
    return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) }
  }

  return { session }
}

const parseStatusFilter = (raw: string | null) => {
  if (!raw) return undefined
  const statuses = raw
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter((value): value is BorrowingStatus => STATUS_VALUES.has(value as BorrowingStatus))

  return statuses.length ? statuses : undefined
}

const parseDateInput = (raw: string | null) => {
  if (!raw) return undefined
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? undefined : date
}

type BorrowingsWithRelations = Array<{
  id: string
  borrowDate: Date
  dueDate: Date
  returnDate: Date | null
  status: BorrowingStatus
  fineAmount: number
  finePaid: boolean
  user: {
    id: string
    name: string
    email: string
    studentId: string
    phone: string | null
    branch: string | null
    department: string | null
  }
  book: {
    id: string
    title: string
    author: string
    isbn: string
    category: string
    publisher: string | null
  }
}>

const cloneWhere = (where: Prisma.BorrowingWhereInput): Prisma.BorrowingWhereInput =>
  JSON.parse(JSON.stringify(where))

export async function GET(request: NextRequest) {
  const access = await ensureAdminAccess()
  if ('error' in access) {
    return access.error
  }

  const params = request.nextUrl.searchParams
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10))
  const limitRaw = Number.parseInt(params.get('limit') ?? String(DEFAULT_PAGE_SIZE), 10)
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.isNaN(limitRaw) ? DEFAULT_PAGE_SIZE : limitRaw))

  const statuses = parseStatusFilter(params.get('status'))
  const searchQuery = params.get('q')?.trim()
  const overdueOnly = params.get('overdue') === 'true'
  const withFinesOnly = params.get('withFines') === 'true'
  const fineOutstandingOnly = params.get('outstandingFines') === 'true'
  const borrowFrom = parseDateInput(params.get('borrowedFrom'))
  const borrowTo = parseDateInput(params.get('borrowedTo'))
  const dueFrom = parseDateInput(params.get('dueFrom'))
  const dueTo = parseDateInput(params.get('dueTo'))

  const sortField = SORTABLE_FIELDS.has(params.get('sort') ?? '') ? (params.get('sort') as string) : 'borrowDate'
  const sortDirection = SORT_DIRECTIONS.has(params.get('direction') ?? '')
    ? (params.get('direction') as 'asc' | 'desc')
    : 'desc'

  const where: Prisma.BorrowingWhereInput = {}

  if (statuses?.length) {
    where.status = { in: statuses }
  } else if (overdueOnly) {
    where.status = BorrowingStatus.OVERDUE
  }

  if (withFinesOnly || fineOutstandingOnly) {
    where.fineAmount = { gt: 0 }
  }

  if (fineOutstandingOnly) {
    where.finePaid = { equals: false }
  }

  if (borrowFrom || borrowTo) {
    const borrowDateFilter: Prisma.DateTimeFilter = {}
    if (borrowFrom) {
      borrowDateFilter.gte = borrowFrom
    }
    if (borrowTo) {
      borrowDateFilter.lte = borrowTo
    }
    where.borrowDate = borrowDateFilter
  }

  if (dueFrom || dueTo) {
    const dueDateFilter: Prisma.DateTimeFilter = {}
    if (dueFrom) {
      dueDateFilter.gte = dueFrom
    }
    if (dueTo) {
      dueDateFilter.lte = dueTo
    }
    where.dueDate = dueDateFilter
  }

  if (searchQuery) {
    const insensitive = { contains: searchQuery, mode: 'insensitive' as const }
    where.OR = [
      { user: { name: insensitive } },
      { user: { studentId: insensitive } },
      { user: { email: insensitive } },
      { user: { phone: insensitive } },
      { book: { title: insensitive } },
      { book: { author: insensitive } },
      { book: { isbn: insensitive } },
      { book: { category: insensitive } },
    ]
  }

  const [total, borrowings] = await Promise.all([
    prisma.borrowing.count({ where }),
    prisma.borrowing.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            phone: true,
            branch: true,
            department: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            category: true,
            publisher: true,
          },
        },
      },
      orderBy: { [sortField]: sortDirection },
      take: limit,
      skip: (page - 1) * limit,
    }),
  ])

  const baseWhereClone = cloneWhere(where)
  const now = new Date()
  const dueSoonThreshold = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  const countPromises: Array<Promise<number>> = [
    prisma.borrowing.count({ where: { ...cloneWhere(baseWhereClone), status: BorrowingStatus.BORROWED } }),
    prisma.borrowing.count({ where: { ...cloneWhere(baseWhereClone), status: BorrowingStatus.OVERDUE } }),
    prisma.borrowing.count({
      where: {
        ...cloneWhere(baseWhereClone),
        status: BorrowingStatus.BORROWED,
        dueDate: { lte: dueSoonThreshold },
      },
    }),
  ]

  const [activeCount, overdueCount, dueSoonCount] = await Promise.all(countPromises)

  let outstandingFine = 0

  try {
    const fineAggregate = await prisma.borrowing.aggregate({
      _sum: { fineAmount: true },
      where: {
        ...cloneWhere(baseWhereClone),
        fineAmount: { gt: 0 },
        finePaid: false,
      },
    })

    outstandingFine = Number(fineAggregate._sum.fineAmount ?? 0)
  } catch {
    const unpaid = await prisma.borrowing.findMany({
      where: {
        ...cloneWhere(baseWhereClone),
        fineAmount: { gt: 0 },
        finePaid: false,
      },
      select: { fineAmount: true },
    })

    outstandingFine = unpaid.reduce((totalFine, record) => totalFine + Number(record.fineAmount ?? 0), 0)
  }

  const serialized = (borrowings as BorrowingsWithRelations).map((record) => ({
    id: record.id,
    borrowDate: record.borrowDate,
    dueDate: record.dueDate,
    returnDate: record.returnDate,
    status: record.status,
    fineAmount: Number(record.fineAmount ?? 0),
    finePaid: Boolean(record.finePaid),
    user: record.user,
    book: record.book,
  }))

  return NextResponse.json({
    success: true,
    data: serialized,
    pagination: {
      page,
      pageSize: limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    metrics: {
      active: activeCount,
      overdue: overdueCount,
      dueSoon: dueSoonCount,
      outstandingFine,
    },
    generatedAt: now.toISOString(),
  })
}
