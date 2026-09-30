'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Armchair,
  BarChart3,
  GaugeCircle,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Users
} from 'lucide-react'

import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SeatCrowdLevel, SeatEntryPointBreakdown, SeatPeakHour, SeatSnapshot } from '@/lib/seat-service'

type ActiveOccupant = {
  id: string
  entryTime: string
  entryPoint: string
  entryMethod: string
  notes: string | null
  user: {
    id: string
    name: string
    studentId: string
    email: string
    department: string | null
    branch: string | null
  }
}

type SeatActivityRecord = {
  id: string
  entryTime: string
  exitTime: string | null
  status: 'ACTIVE' | 'COMPLETED'
  entryPoint: string
  user: {
    id: string
    name: string
    studentId: string
    department: string | null
  }
}

type AdminSeatPayload = {
  snapshot: SeatSnapshot
  activeOccupants: ActiveOccupant[]
  recentActivity: SeatActivityRecord[]
  generatedAt: string
}

type AdminSeatApiResponse = {
  success: boolean
  data?: AdminSeatPayload
  error?: string
}

const AUTO_REFRESH_SECONDS = 120

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

const crowdLevelAccent = (level: SeatCrowdLevel): string => {
  switch (level) {
    case 'FULL':
      return 'text-red-600'
    case 'BUSY':
      return 'text-orange-500'
    case 'MODERATE':
      return 'text-yellow-600'
    default:
      return 'text-emerald-600'
  }
}

const crowdLevelProgressColor = (level: SeatCrowdLevel): string => {
  switch (level) {
    case 'FULL':
      return 'bg-red-600'
    case 'BUSY':
      return 'bg-orange-500'
    case 'MODERATE':
      return 'bg-yellow-500'
    default:
      return 'bg-emerald-600'
  }
}

const formatDurationLabel = (minutes: number): string => {
  if (!Number.isFinite(minutes) || minutes <= 0) return '< 1 min'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`
  }
  return `${hours} hr ${remainingMinutes} min`
}

const computeDurationMinutes = (entryIso: string, exitIso?: string | null): number => {
  const entry = new Date(entryIso).getTime()
  const exit = exitIso ? new Date(exitIso).getTime() : Date.now()
  if (Number.isNaN(entry) || Number.isNaN(exit) || exit <= entry) {
    return 0
  }
  return Math.round((exit - entry) / (1000 * 60))
}

const formatDateTime = (value: string) => {
  const date = new Date(value)
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatAverageStay = (minutes: number | null) => {
  if (minutes === null) return '—'
  return formatDurationLabel(minutes)
}

const formatPercentage = (value: number): string => `${value.toFixed(1)}%`

const entryMethodLabel = (method: string) => {
  switch (method) {
    case 'manual':
      return 'Manual Entry'
    case 'kiosk':
      return 'Self-Service Kiosk'
    default:
      return 'QR Code'
  }
}

export default function AdminSeatIntelligencePage() {
  const [payload, setPayload] = useState<AdminSeatPayload | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchSnapshot = useCallback(async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options

    if (!silent) {
      setIsLoading(true)
    }

    try {
      const response = await fetch('/api/admin/seats', { cache: 'no-store' })
      const body = (await response.json()) as AdminSeatApiResponse

      if (!response.ok || !body.success || !body.data) {
        throw new Error(body.error ?? 'Unable to load live seat analytics')
      }

      setPayload(body.data)
      setError(null)
    } catch (fetchError) {
      console.error('[ADMIN_SEATS_PAGE]', fetchError)
      setError(fetchError instanceof Error ? fetchError.message : 'Unexpected error loading seat data')
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void fetchSnapshot()
  }, [fetchSnapshot])

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchSnapshot({ silent: true })
    }, AUTO_REFRESH_SECONDS * 1000)

    return () => clearInterval(interval)
  }, [fetchSnapshot])

  const filteredOccupants = useMemo(() => {
    if (!payload) return []
    if (!searchTerm.trim()) return payload.activeOccupants

    const query = searchTerm.trim().toLowerCase()
    return payload.activeOccupants.filter((record) => {
      const haystack = [
        record.user.name,
        record.user.studentId,
        record.user.email,
        record.entryPoint,
        record.entryMethod,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [payload, searchTerm])

  const snapshot = payload?.snapshot

  const breakdown = useMemo<SeatEntryPointBreakdown[]>(() => snapshot?.entryPointBreakdown ?? [], [snapshot])
  const peakHours = useMemo<SeatPeakHour[]>(() => snapshot?.peakHours ?? [], [snapshot])

  const occupancyProgressStyle = useMemo(() => {
    if (!snapshot) return 'bg-emerald-600'
    return crowdLevelProgressColor(snapshot.crowdLevel)
  }, [snapshot])

  const lastUpdatedLabel = payload ? formatDateTime(payload.generatedAt) : '—'

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar userRole="ADMIN" />
        <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Seat Intelligence Command Center</h1>
                <p className="text-gray-600 mt-1">
                  Live telemetry derived from entry logs—no mock data, just the pulse of the library in real time.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500">Last synced {lastUpdatedLabel}</div>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => fetchSnapshot()}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Refresh
                </Button>
              </div>
            </div>

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="flex flex-row items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <CardTitle className="text-red-700">Unable to load live seat analytics</CardTitle>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </CardHeader>
              </Card>
            )}

            {snapshot && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
                      <GaugeCircle className="h-5 w-5 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold text-gray-900">
                        {Math.round(snapshot.occupancyRate)}%
                      </div>
                      <p className={`text-sm ${crowdLevelAccent(snapshot.crowdLevel)}`}>
                        {crowdLevelLabel(snapshot.crowdLevel)} ({snapshot.occupiedSeats.toLocaleString()} of {snapshot.totalSeats.toLocaleString()} seats)
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Occupants</CardTitle>
                      <Users className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold text-blue-700">{snapshot.occupiedSeats.toLocaleString()}</div>
                      <p className="text-sm text-gray-500">Verified via open entry logs</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Entries Today</CardTitle>
                      <Armchair className="h-5 w-5 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold text-indigo-600">{snapshot.todaysEntries.toLocaleString()}</div>
                      <p className="text-sm text-gray-500">Exit confirmations {snapshot.todaysExits.toLocaleString()}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Stay</CardTitle>
                      <Activity className="h-5 w-5 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold text-amber-600">{formatAverageStay(snapshot.averageStayMinutes)}</div>
                      <p className="text-sm text-gray-500">Computed from completed visits today</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <Card className="xl:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Live Occupancy Gauge</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="h-4 rounded-full bg-gray-200">
                          <div
                            className={`h-4 rounded-full ${occupancyProgressStyle}`}
                            style={{ width: `${Math.min(100, Math.round(snapshot.occupancyRate))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Available: {snapshot.availableSeats.toLocaleString()}</span>
                          <span>Occupancy Rate: {formatPercentage(snapshot.occupancyRate)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Peak Footfall Today</CardTitle>
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {peakHours.length === 0 ? (
                        <p className="text-sm text-gray-500">No peak data yet. Once entries are recorded, top hours will appear automatically.</p>
                      ) : (
                        peakHours.map((hour) => (
                          <div key={hour.hour} className="flex items-center justify-between text-sm text-gray-700">
                            <span>{hour.label}</span>
                            <span className="font-semibold text-gray-900">{hour.count.toLocaleString()} entries</span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <Card className="xl:col-span-2">
                    <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">Who&apos;s inside right now</CardTitle>
                        <p className="text-sm text-gray-500">Pulled directly from open entry logs</p>
                      </div>
                      <div className="relative w-full lg:w-72">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          placeholder="Search by name, ID, or entry point"
                          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                      <div className="min-w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Visitor</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Entry point</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Since</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Duration</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Method</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredOccupants.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                                  No active occupants match your filter.
                                </td>
                              </tr>
                            ) : (
                              filteredOccupants.map((record) => {
                                const durationMinutes = computeDurationMinutes(record.entryTime)
                                const durationLabel = formatDurationLabel(durationMinutes)
                                return (
                                  <tr key={record.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                      <div className="font-semibold text-gray-900">{record.user.name}</div>
                                      <div className="text-xs text-gray-500">ID: {record.user.studentId}</div>
                                      <div className="text-xs text-gray-400">{record.user.email}</div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                      <div className="flex items-center gap-2 font-medium text-gray-900">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        {record.entryPoint}
                                      </div>
                                      {record.user.department && (
                                        <div className="text-xs text-gray-500">Department: {record.user.department}</div>
                                      )}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700">{formatDateTime(record.entryTime)}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700">{durationLabel}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700">{entryMethodLabel(record.entryMethod)}</td>
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                      {record.notes ? (
                                        <span className="block rounded bg-gray-50 px-3 py-2 text-xs text-gray-600">
                                          {record.notes}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-gray-400">—</span>
                                      )}
                                    </td>
                                  </tr>
                                )
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Entry point mix</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {breakdown.length === 0 ? (
                        <p className="text-sm text-gray-500">Entry points update automatically once visitors check in.</p>
                      ) : (
                        breakdown.map((segment) => (
                          <div key={segment.entryPoint} className="space-y-1">
                            <div className="flex items-center justify-between text-sm text-gray-700">
                              <span>{segment.entryPoint}</span>
                              <span className="font-semibold text-gray-900">{segment.activeCount.toLocaleString()} inside</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-blue-500"
                                style={{ width: `${Math.min(100, segment.percentage)}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500">{segment.percentage.toFixed(1)}% of current occupancy</div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Recent activity (last 12 hours)</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <div className="min-w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Visitor</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Entry time</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Exit time</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Duration</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {payload.recentActivity.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                                No recorded entry activity in the last 12 hours.
                              </td>
                            </tr>
                          ) : (
                            payload.recentActivity.map((record) => {
                              const durationMinutes = computeDurationMinutes(record.entryTime, record.exitTime)
                              const isActive = record.status === 'ACTIVE'
                              return (
                                <tr key={record.id} className={isActive ? 'bg-blue-50/40' : undefined}>
                                  <td className="px-4 py-4 text-sm text-gray-700">
                                    <div className="font-semibold text-gray-900">{record.user.name}</div>
                                    <div className="text-xs text-gray-500">ID: {record.user.studentId}</div>
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-700">{formatDateTime(record.entryTime)}</td>
                                  <td className="px-4 py-4 text-sm text-gray-700">{record.exitTime ? formatDateTime(record.exitTime) : '—'}</td>
                                  <td className="px-4 py-4 text-sm text-gray-700">{formatDurationLabel(durationMinutes)}</td>
                                  <td className="px-4 py-4 text-sm">
                                    <span
                                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isActive ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}
                                    >
                                      {isActive ? 'Inside now' : 'Completed'}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!payload && !isLoading && !error && (
              <Card>
                <CardContent className="py-12 flex flex-col items-center gap-3 text-center text-gray-500">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <p>Preparing live seat analytics…</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
