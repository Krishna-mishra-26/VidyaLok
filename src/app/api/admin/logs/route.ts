import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type { Prisma } from '@prisma/client'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/types'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200
const LONG_STAY_THRESHOLD_MINUTES = 6 * 60

type EntryStatusFilter = 'open' | 'closed' | 'extended' | 'all'

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

const parseStatus = (value: string | null): EntryStatusFilter => {
  if (!value) return 'all'
  const normalized = value.toLowerCase()
  if (normalized === 'open' || normalized === 'closed' || normalized === 'extended') {
    return normalized
  }
  return 'all'
}

const parseDateInput = (value: string | null) => {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

const cloneWhere = (where: Prisma.EntryLogWhereInput): Prisma.EntryLogWhereInput =>
  JSON.parse(JSON.stringify(where))

export async function GET(request: NextRequest) {
  const access = await ensureAdminAccess()
  if ('error' in access) {
    return access.error
  }

  const params = request.nextUrl.searchParams
  const statusFilter = parseStatus(params.get('status'))
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10))
  const limitParsed = Number.parseInt(params.get('limit') ?? String(DEFAULT_LIMIT), 10)
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number.isNaN(limitParsed) ? DEFAULT_LIMIT : limitParsed))
  const searchQuery = params.get('q')?.trim()
  const entryPoint = params.get('entryPoint')?.trim()
  const entryMethod = params.get('entryMethod')?.trim()
  const fromDate = parseDateInput(params.get('from'))
  const toDate = parseDateInput(params.get('to'))

  const where: Prisma.EntryLogWhereInput = {}
  const now = new Date()
  const extendedThreshold = new Date(now.getTime() - LONG_STAY_THRESHOLD_MINUTES * 60 * 1000)

  switch (statusFilter) {
    case 'open':
      where.exitTime = null
      break
    case 'closed':
      where.exitTime = { not: null }
      break
    case 'extended':
      where.AND = [
        { exitTime: null },
        { entryTime: { lte: extendedThreshold } }
      ]
      break
    default:
      break
  }

  if (entryPoint) {
    where.entryPoint = { equals: entryPoint }
  }

  if (entryMethod) {
    where.entryMethod = { equals: entryMethod }
  }

  if (fromDate || toDate) {
    const entryFilter: Prisma.DateTimeFilter = {}
    if (fromDate) {
      entryFilter.gte = fromDate
    }
    if (toDate) {
      entryFilter.lte = toDate
    }
    where.entryTime = entryFilter
  }

  if (searchQuery) {
    const insensitive = { contains: searchQuery, mode: 'insensitive' as const }
    where.OR = [
      { user: { name: insensitive } },
      { user: { studentId: insensitive } },
      { user: { email: insensitive } },
      { entryPoint: insensitive },
      { entryMethod: insensitive },
      { notes: insensitive }
    ]
  }

  const sortDirection = params.get('direction') === 'asc' ? 'asc' : 'desc'
  const sortField = params.get('sort') === 'exitTime' ? 'exitTime' : 'entryTime'

  const [total, logs] = await Promise.all([
    prisma.entryLog.count({ where }),
    prisma.entryLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            department: true,
            branch: true,
          },
        },
      },
      orderBy: { [sortField]: sortDirection },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  const baseWhere = cloneWhere(where)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [openCount, entriesToday, exitsToday, extendedCount] = await Promise.all([
    prisma.entryLog.count({ where: { ...cloneWhere(baseWhere), exitTime: null } }),
    prisma.entryLog.count({ where: { ...cloneWhere(baseWhere), entryTime: { gte: startOfToday } } }),
    prisma.entryLog.count({ where: { ...cloneWhere(baseWhere), exitTime: { not: null, gte: startOfToday } } }),
    prisma.entryLog.count({
      where: {
        ...cloneWhere(baseWhere),
        exitTime: null,
        entryTime: { lte: extendedThreshold },
      },
    }),
  ])

  let averageStayMinutes = 0

  try {
    const stayAggregate = await prisma.entryLog.aggregate({
      _avg: { duration: true },
      where: {
        ...cloneWhere(baseWhere),
        exitTime: { not: null },
        duration: { gt: 0 },
      },
    })
    averageStayMinutes = Number(stayAggregate._avg.duration ?? 0)
  } catch {
    const samples = await prisma.entryLog.findMany({
      where: {
        ...cloneWhere(baseWhere),
        exitTime: { not: null },
      },
      select: { entryTime: true, exitTime: true, duration: true },
      take: 200,
    })

    if (samples.length) {
      const totalDuration = samples.reduce((totalMinutes, sample) => {
        if (typeof sample.duration === 'number' && sample.duration > 0) {
          return totalMinutes + sample.duration
        }
        if (sample.entryTime && sample.exitTime) {
          const diffMs = new Date(sample.exitTime).getTime() - new Date(sample.entryTime).getTime()
          return totalMinutes + Math.max(0, Math.round(diffMs / 60000))
        }
        return totalMinutes
      }, 0)

      averageStayMinutes = totalDuration / samples.length
    }
  }

  const serialized = logs.map((log) => {
    const entryTime = new Date(log.entryTime)
    const exitTime = log.exitTime ? new Date(log.exitTime) : null
    const durationMinutesFromField = typeof log.duration === 'number' ? log.duration : null
    const durationMinutes = durationMinutesFromField
      ? durationMinutesFromField
      : exitTime
        ? Math.max(0, Math.round((exitTime.getTime() - entryTime.getTime()) / 60000))
        : Math.max(0, Math.round((now.getTime() - entryTime.getTime()) / 60000))

    return {
      id: log.id,
      entryTime,
      exitTime,
      durationMinutes,
      entryPoint: log.entryPoint ?? 'Main Entrance',
      entryMethod: log.entryMethod ?? 'qr_code',
      recordedBy: log.recordedBy ?? null,
      notes: log.notes ?? null,
      user: log.user,
      stillInside: !exitTime,
      isExtended: !exitTime && entryTime <= extendedThreshold,
    }
  })

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
      openNow: openCount,
      entriesToday,
      exitsToday,
      extendedStays: extendedCount,
      averageStayMinutes,
    },
    generatedAt: now.toISOString(),
  })
}
