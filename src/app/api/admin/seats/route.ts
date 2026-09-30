import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSeatSnapshot } from '@/lib/seat-service'
import { UserRole } from '@/types'

const MAX_ACTIVE_OCCUPANTS = 100
const RECENT_ACTIVITY_LIMIT = 40

const ensureAdminAccess = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) }
  }

  const role = session.user.role as UserRole | undefined
  if (!role || (role !== UserRole.ADMIN && role !== UserRole.LIBRARIAN)) {
    return { error: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }) }
  }

  return { session }
}

export async function GET(request: NextRequest) {
  const access = await ensureAdminAccess()
  if ('error' in access) {
    return access.error
  }

  try {
    const [snapshot, activeOccupants, recentActivity] = await Promise.all([
      getSeatSnapshot(),
      prisma.entryLog.findMany({
        where: { exitTime: null },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              studentId: true,
              email: true,
              department: true,
              branch: true,
            },
          },
        },
        orderBy: { entryTime: 'desc' },
        take: Math.max(10, Math.min(MAX_ACTIVE_OCCUPANTS, Number(request.nextUrl.searchParams.get('activeLimit')) || MAX_ACTIVE_OCCUPANTS)),
      }),
      prisma.entryLog.findMany({
        orderBy: { entryTime: 'desc' },
        where: { entryTime: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) } },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              studentId: true,
              department: true,
            },
          },
        },
        take: Math.max(20, Math.min(RECENT_ACTIVITY_LIMIT, Number(request.nextUrl.searchParams.get('activityLimit')) || RECENT_ACTIVITY_LIMIT)),
      }),
    ])

    const serializeActive = activeOccupants.map((record) => ({
      id: record.id,
      entryTime: record.entryTime.toISOString(),
      entryPoint: record.entryPoint ?? 'General Access',
      entryMethod: record.entryMethod ?? 'qr_code',
      notes: record.notes ?? null,
      user: record.user,
    }))

    const serializeActivity = recentActivity.map((record) => ({
      id: record.id,
      entryTime: record.entryTime.toISOString(),
      exitTime: record.exitTime ? record.exitTime.toISOString() : null,
      status: record.exitTime ? 'COMPLETED' : 'ACTIVE',
      entryPoint: record.entryPoint ?? 'General Access',
      user: record.user,
    }))

    return NextResponse.json({
      success: true,
      data: {
        snapshot,
        activeOccupants: serializeActive,
        recentActivity: serializeActivity,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[ADMIN_SEATS_GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load live seat analytics' },
      { status: 500 },
    )
  }
}
