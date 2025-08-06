import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, bookId } = body

    // Check if book is available
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    })

    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      )
    }

    if (book.availableCopies <= 0) {
      return NextResponse.json(
        { success: false, error: 'Book is not available' },
        { status: 400 }
      )
    }

    // Check if user already has this book
    const existingBorrowing = await prisma.borrowing.findFirst({
      where: {
        userId,
        bookId,
        status: 'BORROWED'
      }
    })

    if (existingBorrowing) {
      return NextResponse.json(
        { success: false, error: 'You already have this book borrowed' },
        { status: 400 }
      )
    }

    // Create borrowing record
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14) // 14 days from now

    const borrowing = await prisma.borrowing.create({
      data: {
        userId,
        bookId,
        dueDate,
        status: 'BORROWED'
      },
      include: {
        book: true,
        user: true
      }
    })

    // Update book availability
    await prisma.book.update({
      where: { id: bookId },
      data: {
        availableCopies: book.availableCopies - 1
      }
    })

    return NextResponse.json({
      success: true,
      data: borrowing
    })
  } catch (error) {
    console.error('Error borrowing book:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to borrow book' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: Record<string, unknown> = {}

    if (userId) {
      where.userId = userId
    }

    if (status) {
      where.status = status
    }

    const total = await prisma.borrowing.count({ where })

    const borrowings = await prisma.borrowing.findMany({
      where,
      include: {
        book: true,
        user: true
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { borrowDate: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: borrowings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching borrowings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch borrowings' },
      { status: 500 }
    )
  }
}
