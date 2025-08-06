import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const totalBooks = await prisma.book.count()
    const totalUsers = await prisma.user.count({ where: { role: 'STUDENT' } })
    const activeBorrowings = await prisma.borrowing.count({ where: { status: 'BORROWED' } })
    const overdueBooks = await prisma.borrowing.count({ where: { status: 'OVERDUE' } })
    
    // Get seat availability (mock data for now)
    const seatData = await prisma.seatAvailability.findFirst()
    const availableSeats = seatData?.availableSeats || 45

    // Get today's entries
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEntries = await prisma.entryLog.count({
      where: {
        entryTime: {
          gte: today
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalBooks,
        totalUsers,
        activeBorrowings,
        overdueBooks,
        availableSeats,
        todayEntries
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
