import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import SettingsClient from './settings-client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function formatAcademicYear(yearOfStudy?: number | null): string {
  if (!yearOfStudy) {
    return 'Not set'
  }

  const remainderHundred = yearOfStudy % 100
  const remainderTen = yearOfStudy % 10

  let suffix = 'th'
  if (remainderHundred < 11 || remainderHundred > 13) {
    if (remainderTen === 1) suffix = 'st'
    else if (remainderTen === 2) suffix = 'nd'
    else if (remainderTen === 3) suffix = 'rd'
  }

  return `${yearOfStudy}${suffix} Year`
}

export default async function StudentSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    redirect('/login?callbackUrl=/student/settings')
  }

  if (session.user.role !== 'STUDENT') {
    if (session.user.role === 'ADMIN' || session.user.role === 'LIBRARIAN') {
      redirect('/admin')
    }
    redirect('/login')
  }

  const [userRecord, categoryRecords] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        phone: true,
        branch: true,
        department: true,
        semester: true,
        yearOfStudy: true,
        interests: true,
      },
    }),
    prisma.book.findMany({
      select: { category: true },
      where: { category: { not: '' } },
      take: 500,
    }),
  ])

  if (!userRecord) {
    redirect('/login?callbackUrl=/student/settings')
  }

  const departmentLabel = userRecord.branch ?? userRecord.department ?? ''

  const profileDefaults = {
    name: userRecord.name ?? '',
    email: userRecord.email ?? '',
    phone: userRecord.phone ?? '',
    address: '',
    department: departmentLabel,
    academicYear: formatAcademicYear(userRecord.yearOfStudy),
    semester: userRecord.semester ?? null,
  }

  const availableCategories = Array.from(
    new Set(
      categoryRecords
        .map((book) => book.category?.trim())
        .filter((category): category is string => Boolean(category)),
    ),
  ).sort((a, b) => a.localeCompare(b))

  const preferenceDefaults = {
    interests: userRecord.interests ?? [],
    availableCategories,
  }

  return (
    <SettingsClient
      user={{
        name: userRecord.name,
        role: 'STUDENT',
        studentId: userRecord.studentId,
      }}
      profileDefaults={profileDefaults}
      preferenceDefaults={preferenceDefaults}
    />
  )
}
