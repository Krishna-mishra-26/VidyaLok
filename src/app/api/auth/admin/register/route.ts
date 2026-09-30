import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/types'

const ADMIN_ID_REGEX = /^ADM\d{4}$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      adminId,
      name,
      email,
      phone,
      department,
      designation,
      password,
      adminCode,
    } = body

    const trimmedAdminId = (adminId as string | undefined)?.trim().toUpperCase() ?? ''
    const normalizedEmail = (email as string | undefined)?.trim().toLowerCase() ?? ''
    const expectedAdminCode = process.env.ADMIN_REGISTRATION_CODE ?? 'APSIT2025'

    if (!trimmedAdminId || !name || !normalizedEmail || !password || !adminCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!ADMIN_ID_REGEX.test(trimmedAdminId)) {
      return NextResponse.json({ error: 'Admin ID must follow format ADM1234' }, { status: 400 })
    }

    if (adminCode !== expectedAdminCode) {
      return NextResponse.json({ error: 'Invalid admin registration code' }, { status: 401 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 })
    }

    const existingAdminId = await prisma.user.findUnique({
      where: { studentId: trimmedAdminId },
    })

    if (existingAdminId) {
      return NextResponse.json({ error: 'Admin ID already registered' }, { status: 409 })
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const adminData = {
      studentId: trimmedAdminId,
      name,
      email: normalizedEmail,
      phone: phone || null,
      branch: null,
      semester: null,
      yearOfStudy: null,
      department: department || null,
      designation: designation || null,
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
  interests: [],
    }

    const createdUser = await prisma.user.create({
      data: adminData,
    })

  const { password: _password, ...safeUser } = createdUser
  void _password

    return NextResponse.json({
      message: 'Admin registered successfully',
      user: safeUser,
    }, { status: 201 })
  } catch (error) {
    console.error('Admin registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
