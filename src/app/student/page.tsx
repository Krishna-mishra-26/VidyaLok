import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import {
	BookOpen,
	Users,
	Clock,
	AlertTriangle,
	TrendingUp,
	Calendar,
	Sparkles,
} from 'lucide-react'

import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getPersonalizedRecommendations } from '@/lib/recommendation-service'
import type { PersonalizedRecommendation } from '@/lib/recommendation-service'

type ActiveBorrowing = {
	id: string
	title: string
	author: string
	dueDate: string | null
	status: 'BORROWED' | 'OVERDUE'
}

type UpcomingDue = {
	id: string
	title: string
	dueDate: string
	message: string
	severity: 'danger' | 'warning'
}

type RecommendationDisplay = PersonalizedRecommendation & {
	isAvailable: boolean
}

type RecentBorrowing = {
	id: string
	title: string
	status: string
	borrowDate: string | null
	dueDate: string | null
}

function formatDate(date: string | Date | null) {
	if (!date) return '—'
	const value = typeof date === 'string' ? new Date(date) : date
	if (Number.isNaN(value.getTime())) return '—'
	return value.toLocaleDateString('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	})
}

function calculateDaysLeft(date: string | Date | null) {
	if (!date) return null
	const dueDate = typeof date === 'string' ? new Date(date) : date
	if (Number.isNaN(dueDate.getTime())) return null
	const diff = dueDate.getTime() - Date.now()
	return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function buildUpcomingList(items: ActiveBorrowing[]): UpcomingDue[] {
	return items
		.filter((item) => item.dueDate)
		.map((item) => {
			const daysLeft = calculateDaysLeft(item.dueDate)
			let message = '—'
			let severity: 'danger' | 'warning' = 'warning'

			if (daysLeft === null) {
				message = 'Due date unavailable'
			} else if (daysLeft < 0) {
				severity = 'danger'
				const overdueBy = Math.abs(daysLeft)
				message = `${overdueBy} day${overdueBy === 1 ? '' : 's'} overdue`
			} else if (daysLeft === 0) {
				severity = 'danger'
				message = 'Due today'
			} else {
				if (daysLeft <= 3) {
					severity = 'danger'
				}
				message = `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`
			}

			return {
				id: item.id,
				title: item.title,
				dueDate: item.dueDate!,
				message,
				severity,
			}
		})
		.sort((a, b) => {
			const aDays = calculateDaysLeft(a.dueDate)
			const bDays = calculateDaysLeft(b.dueDate)
			return (aDays ?? Number.POSITIVE_INFINITY) - (bDays ?? Number.POSITIVE_INFINITY)
		})
		.slice(0, 5)
}

export default async function StudentDashboard() {
	const session = await getServerSession(authOptions)

	if (!session || !session.user?.id) {
		redirect('/login?callbackUrl=/student')
	}

	if (session.user.role !== 'STUDENT') {
		if (session.user.role === 'ADMIN' || session.user.role === 'LIBRARIAN') {
			redirect('/admin')
		}
		redirect('/login')
	}

	const userRecord = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: {
			id: true,
			name: true,
			email: true,
			studentId: true,
			branch: true,
			semester: true,
			yearOfStudy: true,
			interests: true,
			phone: true,
		},
	})

	if (!userRecord) {
		redirect('/login?callbackUrl=/student')
	}

	const userId = userRecord.id

	const activeBorrowingsRaw = await prisma.borrowing.findMany({
		where: {
			userId,
			status: {
				in: ['BORROWED', 'OVERDUE'],
			},
		},
		include: {
			book: true,
		},
		orderBy: [{ dueDate: 'asc' }, { borrowDate: 'desc' }],
	})

	type ActiveBorrowingRecord = (typeof activeBorrowingsRaw)[number]

	const [totalBooksRead, seatSnapshot, fullBorrowingHistory, booksCurrentlyBorrowedCount, overdueBooksCount] =
		await Promise.all([
			prisma.borrowing.count({
				where: { userId, status: 'RETURNED' },
			}),
			prisma.seatAvailability.findFirst({
				orderBy: { lastUpdated: 'desc' },
			}),
			prisma.borrowing.findMany({
				where: { userId },
				include: { book: true },
				orderBy: { borrowDate: 'desc' },
				take: 5,
			}),
			prisma.borrowing.count({
				where: { userId, status: 'BORROWED' },
			}),
			prisma.borrowing.count({
				where: { userId, status: 'OVERDUE' },
			}),
		])

	const currentBorrowings: ActiveBorrowing[] = activeBorrowingsRaw.slice(0, 5).map((borrowing: ActiveBorrowingRecord): ActiveBorrowing => ({
		id: borrowing.id,
		title: borrowing.book?.title ?? 'Unknown title',
		author: borrowing.book?.author ?? 'Unknown author',
		dueDate: borrowing.dueDate ? borrowing.dueDate.toISOString() : null,
		status: borrowing.status as 'BORROWED' | 'OVERDUE',
	}))

	type BorrowingHistoryRecord = (typeof fullBorrowingHistory)[number]

	const recentBorrowings: RecentBorrowing[] = fullBorrowingHistory.map((borrowing: BorrowingHistoryRecord) => ({
		id: borrowing.id,
		title: borrowing.book?.title ?? 'Unknown title',
		status: borrowing.status,
		borrowDate: borrowing.borrowDate ? borrowing.borrowDate.toISOString() : null,
		dueDate: borrowing.dueDate ? borrowing.dueDate.toISOString() : null,
	}))

	const upcomingDueDates = buildUpcomingList(currentBorrowings)

	const { items: personalizedRecommendations, context: recommendationContext } = await getPersonalizedRecommendations({
		userId,
		limit: 6,
	})

	const recommendations: RecommendationDisplay[] = personalizedRecommendations.map((item) => ({
		...item,
		isAvailable: item.availableCopies > 0,
	}))

	const stats = {
		booksCurrentlyBorrowed: booksCurrentlyBorrowedCount,
		overdueBooks: overdueBooksCount,
		totalBooksRead,
		availableSeats: seatSnapshot?.availableSeats ?? 0,
		totalSeats: seatSnapshot?.totalSeats ?? 0,
	}

	const headerUser = {
		name: userRecord.name,
		role: 'STUDENT',
		studentId: userRecord.studentId,
	}

	return (
		<div className="flex flex-col min-h-screen student-dashboard">
			<Header user={headerUser} />

			<div className="flex flex-1">
				<Sidebar userRole="STUDENT" />

				<main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64 student-main">
					<div className="max-w-7xl mx-auto space-y-6">
						<div className="welcome-header space-y-3 p-6 rounded-2xl mb-8">
							<h1 className="welcome-title text-4xl font-bold">
								Welcome back,
								<span
									className="user-name-visible"
									style={{ color: '#0066cc', fontWeight: 900, WebkitTextFillColor: '#0066cc' }}
								>
									{' '}
									{userRecord.name}
								</span>
								!
							</h1>
							<p className="welcome-subtitle text-lg">
								Here&apos;s what&apos;s happening with your library account today.
							</p>
						</div>

						<Card>
							<CardHeader>
								<CardTitle>Your library profile</CardTitle>
								<CardDescription>Account details synced from the VidyaLok registry</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
									<div>
										<p className="text-muted-foreground">Student ID</p>
										<p className="font-semibold">{userRecord.studentId}</p>
									</div>
									<div>
										<p className="text-muted-foreground">Email</p>
										<p className="font-semibold break-all">{userRecord.email}</p>
									</div>
									<div>
										<p className="text-muted-foreground">Branch</p>
										<p className="font-semibold">{userRecord.branch ?? 'Not set'}</p>
									</div>
									<div>
										<p className="text-muted-foreground">Semester / Year</p>
										<p className="font-semibold">
											{userRecord.semester ? `Semester ${userRecord.semester}` : '—'} /{' '}
											{userRecord.yearOfStudy ? `Year ${userRecord.yearOfStudy}` : '—'}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Currently Borrowed</CardTitle>
									<BookOpen className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats.booksCurrentlyBorrowed}</div>
									<p className="text-xs text-muted-foreground">Active borrowings</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
									<AlertTriangle className="h-4 w-4 text-red-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-red-600">{stats.overdueBooks}</div>
									<p className="text-xs text-muted-foreground">Please return soon</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Books Read</CardTitle>
									<TrendingUp className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats.totalBooksRead}</div>
									<p className="text-xs text-muted-foreground">Completed borrowings</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Available Seats</CardTitle>
									<Users className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-green-600">{stats.availableSeats}</div>
									<p className="text-xs text-muted-foreground">
										{stats.totalSeats ? `Out of ${stats.totalSeats} total` : 'Live feeds update every few minutes'}
									</p>
								</CardContent>
							</Card>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<CardTitle>Current Borrowings</CardTitle>
									<CardDescription>Books you currently have checked out</CardDescription>
								</CardHeader>
								<CardContent>
									{currentBorrowings.length === 0 ? (
										<p className="text-sm text-muted-foreground">
											You don&apos;t have any active borrowings. Explore the catalogue to start reading.
										</p>
									) : (
										<div className="space-y-4">
											{currentBorrowings.map((borrowing) => (
												<div key={borrowing.id} className="flex items-center justify-between p-3 border rounded-lg">
													<div className="flex-1">
														<h4 className="font-medium">{borrowing.title}</h4>
														<p className="text-sm text-gray-600">{borrowing.author}</p>
														<p className="text-xs text-gray-500 mt-1">Due: {formatDate(borrowing.dueDate)}</p>
													</div>
													<div className="text-right">
														<span
															className={`px-2 py-1 rounded-full text-xs font-medium ${
																borrowing.status === 'OVERDUE'
																	? 'bg-red-100 text-red-800'
																	: 'bg-green-100 text-green-800'
															}`}
														>
															{borrowing.status === 'OVERDUE' ? 'Overdue' : 'Active'}
														</span>
													</div>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Upcoming Due Dates</CardTitle>
									<CardDescription>Don&apos;t forget to return these books</CardDescription>
								</CardHeader>
								<CardContent>
									{upcomingDueDates.length === 0 ? (
										<p className="text-sm text-muted-foreground">
											No due dates coming up. You&apos;re all caught up!
										</p>
									) : (
										<div className="space-y-4">
											{upcomingDueDates.map((item) => (
												<div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
													<div className="flex items-center space-x-3">
														<Calendar className="h-5 w-5 text-blue-500" />
														<div>
															<h4 className="font-medium">{item.title}</h4>
															<p className="text-sm text-gray-600">Due: {formatDate(item.dueDate)}</p>
														</div>
													</div>
													<div className="text-right">
														<span
															className={`px-2 py-1 rounded-full text-xs font-medium ${
																item.severity === 'danger'
																	? 'bg-red-100 text-red-800'
																	: 'bg-yellow-100 text-yellow-800'
															}`}
														>
															{item.message}
														</span>
													</div>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</div>

									<Card>
										<CardHeader>
											<CardTitle>Recent activity</CardTitle>
								<CardDescription>Your latest five borrowings</CardDescription>
							</CardHeader>
							<CardContent>
								{recentBorrowings.length === 0 ? (
									<p className="text-sm text-muted-foreground">No borrowing history yet.</p>
								) : (
									<div className="space-y-3">
										{recentBorrowings.map((borrowing) => (
											<div key={borrowing.id} className="flex items-center justify-between border rounded-lg p-3">
												<div>
													<h4 className="font-medium">{borrowing.title}</h4>
													<p className="text-xs text-gray-500">
														Borrowed on {formatDate(borrowing.borrowDate)}
														{borrowing.dueDate ? ` • Due ${formatDate(borrowing.dueDate)}` : ''}
													</p>
												</div>
												<span className="text-xs font-medium uppercase text-muted-foreground">
													{borrowing.status}
												</span>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Recommended for you</CardTitle>
								<CardDescription>Suggestions based on your department, reading history, and saved interests</CardDescription>
							</CardHeader>
							<CardContent>
								{recommendations.length === 0 ? (
									<div className="space-y-4">
										<p className="text-sm text-muted-foreground">
											{recommendationContext.explicitInterests.length === 0
												? 'Add your interests in settings to start receiving personalised recommendations tailored to you.'
												: 'We are gathering more data from your reading habits. Check back soon for fresh picks.'}
										</p>
										<Button asChild variant="outline" size="sm" className="w-fit">
											<Link href="/student/settings">Update your interests</Link>
										</Button>
									</div>
								) : (
									<div className="space-y-6">
										{(recommendationContext.explicitInterests.length > 0 || recommendationContext.derivedCategories.length > 0) && (
											<div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
												{recommendationContext.explicitInterests.map((interest) => (
													<span
														key={`interest-${interest}`}
														className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-medium text-blue-700"
													>
														Interest: {interest}
													</span>
												))}
												{recommendationContext.derivedCategories.map((category) => (
													<span
														key={`derived-${category}`}
														className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 font-medium text-purple-700"
													>
														Because you read {category}
													</span>
												))}
											</div>
										)}

										<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
											{recommendations.map((book) => (
												<div key={book.id} className="flex h-full flex-col justify-between gap-4 rounded-lg border p-4 shadow-sm">
													<div className="space-y-2">
														<div className="space-y-1">
															<h4 className="text-base font-semibold text-slate-900">{book.title}</h4>
															<p className="text-sm text-slate-600">{book.author}</p>
															<p className="text-xs text-slate-500">{book.category} • {book.department}</p>
														</div>
														<div className="flex flex-wrap gap-2 text-[10px] font-medium uppercase tracking-wide text-slate-700">
															{book.isNewArrival && (
																<span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">New arrival</span>
															)}
															{book.isPopular && (
																<span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">Popular pick</span>
															)}
															{!book.isNewArrival && !book.isPopular && (
																<span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Staff pick</span>
															)}
														</div>
														<ul className="space-y-1 text-xs text-slate-600">
															{book.reasons.map((reason) => (
																<li key={reason} className="flex items-start gap-2">
																	<Sparkles className="mt-0.5 h-3.5 w-3.5 text-blue-500" />
																	<span>{reason}</span>
																</li>
															))}
														</ul>
													</div>
													<Button
														asChild
														size="sm"
														variant={book.isAvailable ? 'default' : 'outline'}
														disabled={!book.isAvailable}
														className="w-full"
													>
														<Link href={`/student/books?highlight=${book.id}`}>
															{book.isAvailable
																? `View in catalogue (${book.availableCopies} available)`
																: 'Currently unavailable'}
														</Link>
													</Button>
												</div>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Quick actions</CardTitle>
								<CardDescription>Head straight to the tools you use most</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4 student-quick-actions">
									<Button
										asChild
										variant="outline"
										className="quick-action-button h-20 flex flex-col items-center justify-center space-y-2"
									>
										<Link href="/student/books" className="quick-action-link">
											<BookOpen className="h-6 w-6" />
											<span>Search books</span>
										</Link>
									</Button>
									<Button
										asChild
										variant="outline"
										className="quick-action-button h-20 flex flex-col items-center justify-center space-y-2"
									>
										<Link href="/student/logs" className="quick-action-link">
											<Clock className="h-6 w-6" />
											<span>Entry / exit log</span>
										</Link>
									</Button>
									<Button
										asChild
										variant="outline"
										className="quick-action-button h-20 flex flex-col items-center justify-center space-y-2"
									>
										<Link href="/student/seats" className="quick-action-link">
											<Users className="h-6 w-6" />
											<span>Seat availability</span>
										</Link>
									</Button>
									<Button
										asChild
										variant="outline"
										className="quick-action-button h-20 flex flex-col items-center justify-center space-y-2"
									>
										<Link href="/student/request" className="quick-action-link">
											<TrendingUp className="h-6 w-6" />
											<span>Request a book</span>
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</main>
			</div>
		</div>
	)
}
