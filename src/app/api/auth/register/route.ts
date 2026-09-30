import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { resolveDepartment } from '@/lib/department-utils'
import { UserRole } from '@/types'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      studentId, 
      name, 
      email, 
      phone, 
      branch, 
      semester, 
      yearOfStudy, 
      password 
    } = body

    const trimmedStudentId = (studentId as string | undefined)?.trim() ?? ''
    const normalizedEmail = (email as string | undefined)?.trim().toLowerCase() ?? ''

    // Validation
    if (!trimmedStudentId || !name || !normalizedEmail || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if student ID already exists
    const existingStudentId = await prisma.user.findUnique({
      where: { studentId: trimmedStudentId }
    })

    if (existingStudentId) {
      return NextResponse.json(
        { error: 'Student ID already registered' },
        { status: 409 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Validate Student ID format
    if (!trimmedStudentId.match(/^\d{8}$/)) {
      return NextResponse.json(
        { error: 'Student ID must be 8 digits' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        studentId: trimmedStudentId,
        name,
        email: normalizedEmail,
        phone: phone || null,
  branch: branch || null,
  department: branch ? resolveDepartment(branch) : null,
        semester: semester ? parseInt(semester) : null,
        yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : null,
        password: hashedPassword,
        role: UserRole.STUDENT,
        isActive: true,
        interests: [],
      },
      select: {
        id: true,
        studentId: true,
        name: true,
        email: true,
        phone: true,
        branch: true,
        semester: true,
        yearOfStudy: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'User registered successfully',
      user
    }, { status: 201 })

  } catch (error: unknown) {
    console.error('Registration error:', error)

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2031') {
        return NextResponse.json(
          {
            error:
              'Database is not configured as a replica set. Start MongoDB with --replSet and run rs.initiate().' 
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}