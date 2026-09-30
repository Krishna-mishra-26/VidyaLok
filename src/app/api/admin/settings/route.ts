import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DEFAULT_LIBRARY_SETTINGS, prepareSettingsForPersist, sanitizeLibrarySettings } from '@/lib/settings'
import { UserRole } from '@/types'

const SETTINGS_KEY = 'library-settings'

const isPrivilegedRole = (role?: string | null): role is UserRole.ADMIN | UserRole.LIBRARIAN => {
  if (!role) {
    return false
  }

  return role === UserRole.ADMIN || role === UserRole.LIBRARIAN
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!isPrivilegedRole(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const record = await prisma.systemSetting.findUnique({ where: { key: SETTINGS_KEY } })

    const sanitized = sanitizeLibrarySettings(record?.data ?? DEFAULT_LIBRARY_SETTINGS)
    const enriched = {
      ...sanitized,
      metadata: {
        ...sanitized.metadata,
        lastUpdatedAt: sanitized.metadata.lastUpdatedAt ?? record?.updatedAt?.toISOString(),
        lastUpdatedBy: sanitized.metadata.lastUpdatedBy ?? record?.updatedBy ?? undefined,
      },
    }

    return NextResponse.json({ success: true, data: enriched })
  } catch (error) {
    console.error('[ADMIN_SETTINGS_GET]', error)
    return NextResponse.json({ success: false, error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!isPrivilegedRole(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
    }

    const sanitizedPayload = sanitizeLibrarySettings(body)
    const preparedPayload = prepareSettingsForPersist(sanitizedPayload, {
      id: session.user.id,
      name: session.user.name,
    })

    const saved = await prisma.systemSetting.upsert({
      where: { key: SETTINGS_KEY },
      create: {
        key: SETTINGS_KEY,
        data: preparedPayload,
        updatedBy: session.user.name ?? session.user.id ?? 'system',
      },
      update: {
        data: preparedPayload,
        updatedBy: session.user.name ?? session.user.id ?? 'system',
        version: { increment: 1 },
      },
    })

    const response = sanitizeLibrarySettings(saved.data)

    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    console.error('[ADMIN_SETTINGS_PUT]', error)
    const message = error instanceof Error ? error.message : 'Failed to update settings'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
