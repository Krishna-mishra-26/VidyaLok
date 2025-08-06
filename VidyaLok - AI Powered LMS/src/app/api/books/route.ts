import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query') || ''
    const category = searchParams.get('category')
    const department = searchParams.get('department')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    const where: Record<string, unknown> = {}

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { author: { contains: query, mode: 'insensitive' } },
        { isbn: { contains: query } }
      ]
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (department && department !== 'all') {
      where.department = department
    }

    // Get total count
    const total = await prisma.book.count({ where })

    // Get books with pagination
    const books = await prisma.book.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { title: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error searching books:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search books' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { isbn, title, author, publisher, category, department, description, totalCopies, location } = body

    const book = await prisma.book.create({
      data: {
        isbn,
        title,
        author,
        publisher,
        category,
        department,
        description,
        totalCopies,
        availableCopies: totalCopies,
        location,
        status: 'AVAILABLE',
        condition: 'GOOD'
      }
    })

    return NextResponse.json({
      success: true,
      data: book
    })
  } catch (error) {
    console.error('Error creating book:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create book' },
      { status: 500 }
    )
  }
}
