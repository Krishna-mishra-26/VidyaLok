'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Armchair,
  Clock,
  MapPin,
  RefreshCw,
  Users,
} from 'lucide-react'

import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { SeatSnapshot, SeatCrowdLevel } from '@/lib/seat-service'

type HeaderUser = {
  name: string
  role: 'STUDENT'
  studentId: string
}

type SeatAvailabilityClientProps = {
  user: HeaderUser
  initialSnapshot: SeatSnapshot
}

type SeatSnapshotResponse = {
  success: boolean
  data?: SeatSnapshot
  error?: string
}

const AUTO_REFRESH_SECONDS = 120
const MAX_VISUAL_SEATS = 200

function ClientTimeDisplay({ isoString }: { isoString: string }) {
  const [mounted, setMounted] = useState(false)
  const date = useMemo(() => new Date(isoString), [isoString])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span>Updating…</span>
  }

  return <span>{date.toLocaleTimeString()}</span>
}

const crowdLevelLabel = (level: SeatCrowdLevel): string => {
  switch (level) {
    case 'FULL':
      return 'At Capacity'
    case 'BUSY':
      return 'Busy'
    case 'MODERATE':
      return 'Moderate'
    default:
      return 'Comfortable'
  }
}

const crowdLevelColor = (level: SeatCrowdLevel): string => {
  switch (level) {
    case 'FULL':
      return 'text-red-600'
    case 'BUSY':
      return 'text-orange-500'
    case 'MODERATE':
      return 'text-yellow-600'
    default:
      return 'text-green-600'
  }
}

const progressBarColor = (level: SeatCrowdLevel): string => {
  switch (level) {
    case 'FULL':
      return 'bg-red-600'
    case 'BUSY':
      return 'bg-orange-500'
    case 'MODERATE':
      return 'bg-yellow-500'
    default:
      return 'bg-green-600'
  }
}

const formatAverageStay = (minutes: number | null): string => {
  if (minutes === null) return '—'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`
  }
  return `${hours} hr ${remainingMinutes} min`
}

const formatPercentage = (value: number): string => `${value.toFixed(1)}%`

export default function SeatAvailabilityClient({ user, initialSnapshot }: SeatAvailabilityClientProps) {
  const [snapshot, setSnapshot] = useState<SeatSnapshot>(initialSnapshot)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshSnapshot = useCallback(async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options

    if (!silent) {
      setIsRefreshing(true)
    }

    try {
      const response = await fetch('/api/seats', { cache: 'no-store' })
      const payload = (await response.json()) as SeatSnapshotResponse

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || 'Unable to load seat availability data')
      }

      setSnapshot(payload.data)
      setError(null)
    } catch (err) {
      console.error('Failed to refresh seat availability', err)
      setError(err instanceof Error ? err.message : 'Unexpected error while refreshing seats')
    } finally {
      if (!silent) {
        setIsRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      void refreshSnapshot({ silent: true })
    }, AUTO_REFRESH_SECONDS * 1000)

    return () => clearInterval(interval)
  }, [refreshSnapshot])

  const seatGrid = useMemo(() => {
    const totalSlots = Math.min(snapshot.totalSeats, MAX_VISUAL_SEATS)
    return Array.from({ length: totalSlots }, (_, index) => ({
      id: index + 1,
      isOccupied: index < snapshot.occupiedSeats,
    }))
  }, [snapshot.totalSeats, snapshot.occupiedSeats])

  const occupancyRateRounded = Math.round(snapshot.occupancyRate)
  const crowdLabel = crowdLevelLabel(snapshot.crowdLevel)
  const occupancyTextColor = crowdLevelColor(snapshot.crowdLevel)
  const progressColor = progressBarColor(snapshot.crowdLevel)
  const showSeatCapNotice = snapshot.totalSeats > MAX_VISUAL_SEATS

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />

      <div className="flex flex-1">
        <Sidebar userRole="STUDENT" />

        <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Seat Availability</h1>
                <p className="text-gray-600">
                  Live occupancy data calculated from current entry logs
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => refreshSnapshot()}
                  disabled={isRefreshing}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Refreshing…' : 'Refresh'}</span>
                </Button>
              </div>
            </div>

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <CardTitle className="text-red-700">Could not refresh seats</CardTitle>
                    <CardDescription className="text-red-600">
                      {error}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Seats</CardTitle>
                  <Armchair className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{snapshot.totalSeats}</div>
                  <p className="text-xs text-muted-foreground">Library capacity</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Seats</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{snapshot.availableSeats}</div>
                  <p className="text-xs text-muted-foreground">Ready for use</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Occupied Seats</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{snapshot.occupiedSeats}</div>
                  <p className="text-xs text-muted-foreground">Derived from active entry logs</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                  <Users className={`h-4 w-4 ${occupancyTextColor}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${occupancyTextColor}`}>{occupancyRateRounded}%</div>
                  <p className={`text-xs font-medium ${occupancyTextColor}`}>{crowdLabel}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Library Seat Map</CardTitle>
                  <CardDescription>
                    Each block represents a seat (green = available, red = occupied)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-10 gap-2">
                    {seatGrid.map((seat) => (
                      <div
                        key={seat.id}
                        className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium border transition-colors duration-300 ${
                          seat.isOccupied
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-green-100 text-green-800 border-green-200'
                        }`}
                        title={`Seat ${seat.id} – ${seat.isOccupied ? 'Occupied' : 'Available'}`}
                      >
                        {seat.id}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-100 border border-green-200 rounded" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-100 border border-red-200 rounded" />
                      <span>Occupied</span>
                    </div>
                  </div>

                  {showSeatCapNotice && (
                    <p className="mt-4 text-xs text-gray-500 text-center">
                      Showing the first {MAX_VISUAL_SEATS} seats for visualization. Full occupancy is calculated from entry logs.
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Occupancy Status</CardTitle>
                    <CardDescription>Real-time crowd estimation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${occupancyTextColor}`}>{occupancyRateRounded}%</div>
                      <div className={`text-lg font-medium ${occupancyTextColor}`}>{crowdLabel}</div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${Math.min(occupancyRateRounded, 100)}%` }}
                      />
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Available:</span>
                        <span className="font-medium">{snapshot.availableSeats} seats</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Occupied:</span>
                        <span className="font-medium">{snapshot.occupiedSeats} seats</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Last Updated</CardTitle>
                    <CardDescription>
                      Data refreshes automatically every {AUTO_REFRESH_SECONDS / 60} minutes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <ClientTimeDisplay isoString={snapshot.lastUpdated} />
                    </div>
                    <p className="text-xs text-gray-500">
                      Occupancy values are derived from live entry/exit logs. Use the refresh button for an immediate update.
                    </p>
                    <Button
                      onClick={() => refreshSnapshot()}
                      disabled={isRefreshing}
                      size="sm"
                      className="w-full"
                    >
                      {isRefreshing ? 'Updating…' : 'Refresh now'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Entry Point Breakdown</CardTitle>
                  <CardDescription>Open sessions grouped by entry location</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {snapshot.entryPointBreakdown.length === 0 ? (
                    <p className="text-sm text-gray-500">No active visitors right now.</p>
                  ) : (
                    <div className="space-y-3">
                      {snapshot.entryPointBreakdown.map((item) => (
                        <div key={item.entryPoint} className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">{item.entryPoint}</p>
                              <p className="text-xs text-gray-500">
                                {item.activeCount} active {item.activeCount === 1 ? 'visitor' : 'visitors'}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{formatPercentage(item.percentage)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Today&apos;s Activity</CardTitle>
                    <CardDescription>Entry logs since midnight</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span>Entries today</span>
                      </span>
                      <span className="font-semibold">{snapshot.todaysEntries}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span>Exits today</span>
                      </span>
                      <span className="font-semibold">{snapshot.todaysExits}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span>Average stay</span>
                      </span>
                      <span className="font-semibold">{formatAverageStay(snapshot.averageStayMinutes)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Peak Hours</CardTitle>
                    <CardDescription>Highest entry counts today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {snapshot.peakHours.length === 0 ? (
                      <p className="text-sm text-gray-500">No trends yet today.</p>
                    ) : (
                      <div className="space-y-2">
                        {snapshot.peakHours.map((hour) => (
                          <div key={hour.hour} className="flex items-center justify-between text-sm text-gray-700">
                            <span>{hour.label}</span>
                            <span className="font-semibold">{hour.count} entries</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
