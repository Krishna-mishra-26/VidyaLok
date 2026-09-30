import { prisma } from './prisma'

type RawOpenLog = {
  entryPoint?: string | null
}

export type SeatCrowdLevel = 'LOW' | 'MODERATE' | 'BUSY' | 'FULL'

export interface SeatEntryPointBreakdown {
  entryPoint: string
  activeCount: number
  percentage: number
}

export interface SeatPeakHour {
  label: string
  hour: number
  count: number
}

export interface SeatSnapshot {
  totalSeats: number
  occupiedSeats: number
  availableSeats: number
  occupancyRate: number
  crowdLevel: SeatCrowdLevel
  lastUpdated: string
  todaysEntries: number
  todaysExits: number
  averageStayMinutes: number | null
  entryPointBreakdown: SeatEntryPointBreakdown[]
  peakHours: SeatPeakHour[]
}

const DEFAULT_TOTAL_SEATS = 100

const getStartOfDay = (date: Date = new Date()) => {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

const ensureSeatRecord = async () => {
  const existing = await prisma.seatAvailability.findFirst({
    orderBy: { lastUpdated: 'desc' },
  })

  if (existing) {
    return existing
  }

  return prisma.seatAvailability.create({
    data: {
      totalSeats: DEFAULT_TOTAL_SEATS,
      occupiedSeats: 0,
      availableSeats: DEFAULT_TOTAL_SEATS,
    },
  })
}

const calculateCrowdLevel = (occupancyRate: number): SeatCrowdLevel => {
  if (occupancyRate >= 95) return 'FULL'
  if (occupancyRate >= 75) return 'BUSY'
  if (occupancyRate >= 45) return 'MODERATE'
  return 'LOW'
}

const calculateAverageStayMinutes = (durations: Array<{ entryTime: Date; exitTime: Date }>): number | null => {
  if (!durations.length) return null

  const totalMinutes = durations.reduce((sum, log) => {
    const exit = log.exitTime.getTime()
    const entry = log.entryTime.getTime()
    if (Number.isNaN(exit) || Number.isNaN(entry) || exit <= entry) {
      return sum
    }
    return sum + (exit - entry) / (1000 * 60)
  }, 0)

  const average = totalMinutes / durations.length
  return Number.isFinite(average) ? Math.round(average) : null
}

const buildPeakHours = (entries: Array<{ entryTime: Date }>): SeatPeakHour[] => {
  if (!entries.length) {
    return []
  }

  const buckets = new Map<number, number>()

  entries.forEach(({ entryTime }) => {
    const hour = entryTime.getHours()
    buckets.set(hour, (buckets.get(hour) ?? 0) + 1)
  })

  const sorted = Array.from(buckets.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return sorted.map(([hour, count]) => ({
    hour,
    count,
    label: formatHourRange(hour),
  }))
}

const formatHourRange = (hour: number): string => {
  const startHour = hour % 24
  const endHour = (hour + 1) % 24

  const format = (value: number) => {
    const period = value >= 12 ? 'PM' : 'AM'
    const normalizedHour = value % 12 === 0 ? 12 : value % 12
    return `${normalizedHour}:00 ${period}`
  }

  return `${format(startHour)} - ${format(endHour)}`
}

export async function getSeatSnapshot(): Promise<SeatSnapshot> {
  const seatConfig = await ensureSeatRecord()
  const startOfToday = getStartOfDay()

  const [openLogsResult, todaysEntryLogs, todaysCompletedLogs] = await Promise.all([
    prisma.entryLog.aggregateRaw({
      pipeline: [
        {
          $match: {
            $or: [{ exitTime: { $exists: false } }, { exitTime: null }],
          },
        },
        {
          $project: {
            entryPoint: 1,
          },
        },
      ],
    }),
    prisma.entryLog.findMany({
      where: { entryTime: { gte: startOfToday } },
      select: { entryTime: true, entryPoint: true },
    }),
    prisma.entryLog.findMany({
      where: {
        exitTime: { not: null, gte: startOfToday },
      },
      select: { entryTime: true, exitTime: true },
    }),
  ])

  const openLogs: RawOpenLog[] = Array.isArray(openLogsResult)
    ? openLogsResult.map((item) => {
        if (typeof item === 'object' && item !== null && 'entryPoint' in item) {
          const entryPointValue = (item as { entryPoint?: unknown }).entryPoint

          if (typeof entryPointValue === 'string') {
            const trimmed = entryPointValue.trim()
            return { entryPoint: trimmed.length > 0 ? trimmed : null }
          }

          if (entryPointValue === null || entryPointValue === undefined) {
            return { entryPoint: null }
          }
        }

        return { entryPoint: null }
      })
    : []

  const occupiedSeats = Math.min(openLogs.length, seatConfig.totalSeats)
  const availableSeats = Math.max(seatConfig.totalSeats - occupiedSeats, 0)
  const occupancyRate = seatConfig.totalSeats === 0 ? 0 : (occupiedSeats / seatConfig.totalSeats) * 100
  const crowdLevel = calculateCrowdLevel(occupancyRate)

  const now = new Date()
  const updatedRecord = await prisma.seatAvailability.update({
    where: { id: seatConfig.id },
    data: {
      occupiedSeats,
      availableSeats,
      lastUpdated: now,
    },
  })

  const entryPointTotals = new Map<string, number>()
  openLogs.forEach(({ entryPoint }) => {
    const key = entryPoint ?? 'General Access'
    entryPointTotals.set(key, (entryPointTotals.get(key) ?? 0) + 1)
  })

  const breakdown: SeatEntryPointBreakdown[] = Array.from(entryPointTotals.entries()).map(([entryPoint, activeCount]) => ({
    entryPoint,
    activeCount,
    percentage: occupiedSeats === 0 ? 0 : Number(((activeCount / occupiedSeats) * 100).toFixed(1)),
  }))

  const completedDurations = todaysCompletedLogs.filter(
    (log: { entryTime: Date; exitTime: Date | null }): log is { entryTime: Date; exitTime: Date } => log.exitTime !== null,
  )

  const todaysEntries = todaysEntryLogs.length
  const todaysExits = completedDurations.length
  const averageStayMinutes = calculateAverageStayMinutes(completedDurations)
  const peakHours = buildPeakHours(todaysEntryLogs)

  return {
    totalSeats: updatedRecord.totalSeats,
    occupiedSeats: updatedRecord.occupiedSeats,
    availableSeats: updatedRecord.availableSeats,
    occupancyRate: Number(occupancyRate.toFixed(1)),
    crowdLevel,
    lastUpdated: updatedRecord.lastUpdated.toISOString(),
    todaysEntries,
    todaysExits,
    averageStayMinutes,
    entryPointBreakdown: breakdown.sort((a, b) => b.activeCount - a.activeCount),
    peakHours,
  }
}
