import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { getSeatSnapshot } from '@/lib/seat-service'

import SeatAvailabilityClient from './seat-availability-client'

export default async function StudentSeatAvailabilityPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    redirect('/login?callbackUrl=/student/seats')
  }

  if (session.user.role !== 'STUDENT') {
    if (session.user.role === 'ADMIN' || session.user.role === 'LIBRARIAN') {
      redirect('/admin')
    }
    redirect('/login')
  }

  const snapshot = await getSeatSnapshot()

  return (
    <SeatAvailabilityClient
      user={{
        name: session.user.name ?? 'Student',
        role: 'STUDENT',
        studentId: session.user.studentId ?? 'UNKNOWN',
      }}
      initialSnapshot={snapshot}
    />
  )
}
