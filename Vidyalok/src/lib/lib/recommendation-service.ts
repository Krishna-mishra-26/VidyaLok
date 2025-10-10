import { prisma } from './prisma'
import { getAllBooks } from './books-dataset'

type RecommendationInput = {
  userId: string
  limit?: number
  excludeBookIds?: string[]
}

type RecommendationCandidate = {
  id: string
  title: string
  author: string | null
  category: string
  department: string
  availableCopies: number
  addedAt: Date
}

export type PersonalizedRecommendation = {
  id: string
  title: string
  author: string
  category: string
  department: string
  availableCopies: number
  score: number
  reasons: string[]
  isNewArrival: boolean
  isPopular: boolean
}

export type RecommendationContext = {
  explicitInterests: string[]
  derivedCategories: string[]
  department: string | null
  fallbackUsed: boolean
}

export type RecommendationResult = {
  items: PersonalizedRecommendation[]
  context: RecommendationContext
}

const NEW_ARRIVAL_DAYS = 60
const POPULAR_LOOKBACK_DAYS = 90
const POPULAR_SAMPLE_SIZE = 300

const now = () => new Date()

const differenceInDays = (started: Date, ended: Date) => {
  const diffMs = ended.getTime() - started.getTime()
  return diffMs / (1000 * 60 * 60 * 24)
}

const buildExcludeSet = (input: RecommendationInput, activeBorrowings: { bookId: string }[]) => {
  const exclude = new Set<string>(input.excludeBookIds ?? [])
  activeBorrowings.forEach((borrowing) => {
    if (borrowing.bookId) {
      exclude.add(borrowing.bookId)
    }
  })
  return exclude
}

const collectTopCategoriesFromHistory = (history: { book?: { category: string | null } | null }[]) => {
  const counts = new Map<string, number>()

  history.forEach((entry) => {
    const category = entry.book?.category?.trim()
    if (!category) return
    counts.set(category, (counts.get(category) ?? 0) + 1)
  })

  const sorted = Array.from(counts.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])

  return sorted.map(([category]) => category)
}

const fetchPopularBookIds = async () => {
  const lookbackStart = new Date(now().getTime() - POPULAR_LOOKBACK_DAYS * 24 * 60 * 60 * 1000)

  const borrowings = await prisma.borrowing.findMany({
    where: {
      borrowDate: { gte: lookbackStart },
    },
    select: { bookId: true },
    orderBy: { borrowDate: 'desc' },
    take: POPULAR_SAMPLE_SIZE,
  })

  const counts = new Map<string, number>()
  borrowings.forEach((entry) => {
    if (!entry.bookId) return
    counts.set(entry.bookId, (counts.get(entry.bookId) ?? 0) + 1)
  })

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([bookId]) => bookId)
}

const fetchBooksByIds = async (bookIds: string[]) => {
  if (!bookIds.length) return []

  const books = await prisma.book.findMany({
    where: { id: { in: bookIds } },
    select: {
      id: true,
      title: true,
      author: true,
      category: true,
      department: true,
      availableCopies: true,
      addedAt: true,
    },
  })

  // Preserve order matching bookIds
  const bookMap = new Map<string, RecommendationCandidate>()
  books.forEach((book) => bookMap.set(book.id, book))
  return bookIds
    .map((id) => bookMap.get(id))
    .filter((candidate): candidate is RecommendationCandidate => Boolean(candidate))
}

const fetchCandidateBooks = async (
  filters: {
    categories: string[]
    department: string | null
    excludeIds: Set<string>
    limit: number
  },
) => {
  const orClauses = []
  if (filters.categories.length) {
    orClauses.push({ category: { in: filters.categories } })
  }
  if (filters.department) {
    orClauses.push({ department: filters.department })
  }

  const where = {
    availableCopies: { gt: 0 },
    id: { notIn: Array.from(filters.excludeIds) },
    ...(orClauses.length ? { OR: orClauses } : {}),
  }

  const candidates = await prisma.book.findMany({
    where,
    orderBy: { addedAt: 'desc' },
    take: filters.limit,
    select: {
      id: true,
      title: true,
      author: true,
      category: true,
      department: true,
      availableCopies: true,
      addedAt: true,
    },
  })

  return candidates
}

const enrichCandidates = (
  candidates: RecommendationCandidate[],
  context: RecommendationContext,
  popularIds: Set<string>,
  derivedCategorySet: Set<string>,
): PersonalizedRecommendation[] => {
  const nowDate = now()
  return candidates.map((candidate) => {
    const reasons = new Set<string>()
    let score = 0

    if (context.explicitInterests.includes(candidate.category)) {
      score += 3
      reasons.add(`Matches your interest in ${candidate.category}`)
    }

    if (derivedCategorySet.has(candidate.category)) {
      score += 2
      reasons.add(`You often borrow ${candidate.category} titles`)
    }

    if (context.department && candidate.department === context.department) {
      score += 2
      reasons.add('From your department collection')
    }

    const daysSinceAdded = Math.abs(differenceInDays(candidate.addedAt, nowDate))
    const isNewArrival = Number.isFinite(daysSinceAdded) && daysSinceAdded <= NEW_ARRIVAL_DAYS
    if (isNewArrival) {
      score += 1
      reasons.add('New arrival this term')
    }

    const isPopular = popularIds.has(candidate.id)
    if (isPopular) {
      score += 1
      reasons.add('Popular with other students')
    }

    // Ensure base score if no reasons triggered but candidate exists
    if (score === 0) {
      score = 1
      reasons.add('Handpicked by the library team')
    }

    return {
      id: candidate.id,
      title: candidate.title,
      author: candidate.author ?? 'Unknown author',
      category: candidate.category,
      department: candidate.department,
      availableCopies: candidate.availableCopies,
      score,
      reasons: Array.from(reasons),
      isNewArrival,
      isPopular,
    }
  })
}

export async function getPersonalizedRecommendations(
  input: RecommendationInput,
): Promise<RecommendationResult> {
  const limit = input.limit ?? 6

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      branch: true,
      department: true,
      interests: true,
    },
  })

  if (!user) {
    return {
      items: [],
      context: {
        explicitInterests: [],
        derivedCategories: [],
        department: null,
        fallbackUsed: true,
      },
    }
  }

  const [activeBorrowings, recentHistory] = await Promise.all([
    prisma.borrowing.findMany({
      where: {
        userId: user.id,
        status: { in: ['BORROWED', 'OVERDUE', 'RENEWED'] },
      },
      select: { bookId: true },
    }),
    prisma.borrowing.findMany({
      where: { userId: user.id },
      include: { book: { select: { category: true } } },
      orderBy: { borrowDate: 'desc' },
      take: 40,
    }),
  ])

  const excludeIds = buildExcludeSet(input, activeBorrowings)
  const derivedCategories = collectTopCategoriesFromHistory(recentHistory)
  const explicitInterests = Array.from(new Set(user.interests ?? [])).filter(Boolean)
  const userDepartment = user.branch ?? user.department ?? null

  const popularBookIds = await fetchPopularBookIds()
  const popularIdSet = new Set(popularBookIds.slice(0, 20))

  const candidateCategories = Array.from(
    new Set([...explicitInterests, ...derivedCategories]),
  )

  const primaryCandidates = await fetchCandidateBooks({
    categories: candidateCategories,
    department: userDepartment,
    excludeIds,
    limit: limit * 3,
  })

  const candidateMap = new Map<string, RecommendationCandidate>()
  primaryCandidates.forEach((candidate) => {
    candidateMap.set(candidate.id, candidate)
  })

  let fallbackUsed = false

  if (candidateMap.size < limit) {
    fallbackUsed = true

    const fallbackBooks = await prisma.book.findMany({
      where: {
        availableCopies: { gt: 0 },
        id: { notIn: Array.from(excludeIds) },
      },
      orderBy: { addedAt: 'desc' },
      take: limit * 3,
      select: {
        id: true,
        title: true,
        author: true,
        category: true,
        department: true,
        availableCopies: true,
        addedAt: true,
      },
    })

    fallbackBooks.forEach((candidate) => {
      if (!candidateMap.has(candidate.id)) {
        candidateMap.set(candidate.id, candidate)
      }
    })

    // Add popular books if still under limit
    if (candidateMap.size < limit && popularIdSet.size) {
      const remainingPopularIds = Array.from(popularIdSet).filter(
        (bookId) => !candidateMap.has(bookId) && !excludeIds.has(bookId),
      )

      const popularBooks = await fetchBooksByIds(remainingPopularIds.slice(0, limit * 2))
      popularBooks.forEach((candidate) => {
        if (!candidateMap.has(candidate.id)) {
          candidateMap.set(candidate.id, candidate)
        }
      })
    }
  }

  const enriched = enrichCandidates(
    Array.from(candidateMap.values()),
    {
      explicitInterests,
      derivedCategories,
      department: userDepartment,
      fallbackUsed,
    },
    popularIdSet,
    new Set(derivedCategories),
  )

  let items = enriched
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return b.availableCopies - a.availableCopies
    })
    .slice(0, limit)

  if (!items.length) {
    const datasetFallback = await buildDatasetFallback({
      explicitInterests,
      department: userDepartment,
      limit,
      excludeIds,
    })

    if (datasetFallback.length) {
      items = datasetFallback
      fallbackUsed = true
    }
  }

  return {
    items,
    context: {
      explicitInterests,
      derivedCategories,
      department: userDepartment,
      fallbackUsed,
    },
  }
}

type DatasetFallbackInput = {
  explicitInterests: string[]
  department: string | null
  limit: number
  excludeIds: Set<string>
}

const buildDatasetFallback = async ({
  explicitInterests,
  department,
  limit,
  excludeIds,
}: DatasetFallbackInput): Promise<PersonalizedRecommendation[]> => {
  try {
    const books = await getAllBooks()

    if (!books.length) {
      return []
    }

    const interestTokens = explicitInterests
      .map((interest) => interest.trim().toLowerCase())
      .filter(Boolean)

    const scored = books
      .filter((book) => !excludeIds.has(book.id))
      .map((book) => {
        const reasons = new Set<string>()
        let score = 1
        let matchedInterest: string | null = null

        const searchable = `${book.title} ${book.author}`.toLowerCase()

        interestTokens.forEach((token, index) => {
          if (searchable.includes(token)) {
            score += 3
            const originalInterest = explicitInterests[index]
            reasons.add(`Matches your interest in ${originalInterest}`)
            if (!matchedInterest) {
              matchedInterest = originalInterest
            }
          }
        })

        if (department && book.department.toLowerCase() === department.toLowerCase()) {
          score += 2
          reasons.add('From your department collection')
        }

        if (book.copies >= 5) {
          score += 1
          reasons.add('Popular in the general catalog')
        }

        return {
          book,
          score,
          reasons: Array.from(reasons),
          matchedInterest,
        }
      })

    const sorted = scored
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score
        }
        if (b.book.copies !== a.book.copies) {
          return b.book.copies - a.book.copies
        }
        return a.book.title.localeCompare(b.book.title)
      })
      .slice(0, limit)

    return sorted.map(({ book, score, reasons, matchedInterest }) => ({
      id: `dataset-${book.id}`,
      title: book.title,
      author: book.author || 'Unknown author',
      category: matchedInterest ?? book.department,
      department: book.department,
      availableCopies: Math.max(book.copies, 1),
      score,
      reasons: reasons.length ? reasons : ['Featured from the library catalog'],
      isNewArrival: false,
      isPopular: book.copies >= 5,
    }))
  } catch (error) {
    console.error('[recommendation-service] Failed to load dataset fallback', error)
    return []
  }
}