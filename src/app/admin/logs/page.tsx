'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Clock3,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  Timer,
  Users
} from 'lucide-react'

import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type EntryStatusFilter = 'all' | 'open' | 'closed' | 'extended'

type EntryLogApiRecord = {
  id: string
  entryTime: string
  exitTime: string | null
  durationMinutes: number
  entryPoint: string
  entryMethod: string
  recordedBy: string | null
  notes: string | null
  stillInside: boolean
  isExtended: boolean
  user: {
    id: string
    name: string
    email: string
    studentId: string
    department: string | null
    branch: string | null
  }
}

type EntryLogRow = {
  id: string
  entryTime: Date
  exitTime: Date | null
  durationMinutes: number
  entryPoint: string
  entryMethod: string
  recordedBy: string | null
  notes: string | null
  stillInside: boolean
  isExtended: boolean
  user: EntryLogApiRecord['user']
}

type LogsApiResponse = {
  success: boolean
  data: EntryLogApiRecord[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  metrics: {
    openNow: number
    entriesToday: number
    exitsToday: number
    extendedStays: number
    averageStayMinutes: number
  }
  generatedAt: string
  error?: string
}

const PAGE_SIZE = 50
const SEARCH_DEBOUNCE_MS = 250

const STATUS_OPTIONS: Array<{ label: string; value: EntryStatusFilter }> = [
  { label: 'All visits', value: 'all' },
  { label: 'Inside now', value: 'open' },
  { label: 'Completed visits', value: 'closed' },
  { label: 'Extended stay alerts', value: 'extended' }
]

const ENTRY_METHOD_LABELS: Record<string, string> = {
  qr_code: 'QR Code',
  manual: 'Manual Entry',
  kiosk: 'Self Service Kiosk'
}

const formatDateTime = (value: Date) =>
  value.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

const formatDuration = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return 'Less than a minute'
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) {
    return `${mins} min`
  }
  return `${hours} hr ${mins} min`
}

export default function AdminLogsPage() {
  const [records, setRecords] = useState<EntryLogRow[]>([])
  const [statusFilter, setStatusFilter] = useState<EntryStatusFilter>('all')
  const [entryMethodFilter, setEntryMethodFilter] = useState<string>('all')
  const [entryPointFilter, setEntryPointFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortField, setSortField] = useState<'entryTime' | 'exitTime'>('entryTime')
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc')
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 })
  const [metrics, setMetrics] = useState({
    openNow: 0,
    entriesToday: 0,
    exitsToday: 0,
    extendedStays: 0,
    averageStayMinutes: 0
  })
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search])

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()
    params.set('page', String(pagination.page))
    params.set('limit', String(PAGE_SIZE))
    params.set('sort', sortField)
    params.set('direction', sortDirection)

    if (statusFilter !== 'all') {
      params.set('status', statusFilter)
    }

    if (entryMethodFilter !== 'all') {
      params.set('entryMethod', entryMethodFilter)
    }

    if (entryPointFilter !== 'all') {
      params.set('entryPoint', entryPointFilter)
    }

    if (debouncedSearch) {
      params.set('q', debouncedSearch)
    }

    return params
  }, [pagination.page, sortField, sortDirection, statusFilter, entryMethodFilter, entryPointFilter, debouncedSearch])

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = buildQueryParams()
      const response = await fetch(`/api/admin/logs?${params.toString()}`, {
        cache: 'no-store'
      })

      const payload: LogsApiResponse | null = await response.json().catch(() => null)

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error ?? 'Unable to load entry logs right now.')
      }

      const normalized: EntryLogRow[] = payload.data.map((log) => ({
        id: log.id,
        entryTime: new Date(log.entryTime),
        exitTime: log.exitTime ? new Date(log.exitTime) : null,
        durationMinutes: log.durationMinutes,
        entryPoint: log.entryPoint,
        entryMethod: log.entryMethod,
        recordedBy: log.recordedBy,
        notes: log.notes,
        stillInside: log.stillInside,
        isExtended: log.isExtended,
        user: log.user
      }))

      setRecords(normalized)
      setPagination(payload.pagination)
      setMetrics(payload.metrics)
      setLastUpdated(new Date(payload.generatedAt))
    } catch (fetchError) {
      setRecords([])
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load entry logs')
    } finally {
      setIsLoading(false)
    }
  }, [buildQueryParams])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    setPagination((current) => (current.page === 1 ? current : { ...current, page: 1 }))
  }, [statusFilter, entryMethodFilter, entryPointFilter, debouncedSearch, sortField, sortDirection])

  const refresh = useCallback(() => {
    fetchLogs()
  }, [fetchLogs])

  const entryPointOptions = useMemo(() => {
    const unique = new Set<string>()
    records.forEach((record) => unique.add(record.entryPoint))
    return Array.from(unique).sort()
  }, [records])

  const canGoPrevious = pagination.page > 1
  const canGoNext = pagination.page < pagination.totalPages

  const resultsSummary = useMemo(() => {
    if (isLoading) return 'Syncing live gate events…'
    if (error) return error
    const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1
    const end = Math.min(pagination.page * pagination.pageSize, pagination.total)
    return `Showing ${start}-${end} of ${pagination.total} scans`
  }, [isLoading, error, pagination])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar userRole="ADMIN" />
        <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Entry & Exit Intelligence</h1>
                <p className="text-gray-600 mt-1">
                  Track real-time footfall, identify extended stays, and maintain a secure campus library.
                </p>
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={refresh}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inside right now</CardTitle>
                  <Users className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-blue-700">{metrics.openNow.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">Active occupants scanned in</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Entries today</CardTitle>
                  <LogIn className="h-5 w-5 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-emerald-600">{metrics.entriesToday.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">Unique scans since midnight</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Exits confirmed</CardTitle>
                  <LogOut className="h-5 w-5 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-indigo-600">{metrics.exitsToday.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">Checked-out visitors today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Extended stays</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-red-600">{metrics.extendedStays.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">Inside for 6+ hours</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Visitor Timeline</CardTitle>
                  <p className="text-sm text-gray-500">{resultsSummary}</p>
                  {lastUpdated && (
                    <p className="text-xs text-gray-400 mt-1">Last updated {formatDateTime(lastUpdated)}</p>
                  )}
                </div>
                <div className="flex flex-col gap-3 w-full lg:w-auto">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 lg:w-72">
                      <Search className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by student, ID, or notes"
                        className="pl-9"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Avg stay {formatDuration(Math.round(metrics.averageStayMinutes))}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value as EntryStatusFilter)}
                      className="min-w-[180px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={entryMethodFilter}
                      onChange={(event) => setEntryMethodFilter(event.target.value)}
                      className="min-w-[160px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="all">All methods</option>
                      <option value="qr_code">QR Code</option>
                      <option value="manual">Manual entry</option>
                      <option value="kiosk">Self-service kiosk</option>
                    </select>

                    <select
                      value={entryPointFilter}
                      onChange={(event) => setEntryPointFilter(event.target.value)}
                      className="min-w-[160px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="all">All entry points</option>
                      {entryPointOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <select
                      value={sortField}
                      onChange={(event) => setSortField(event.target.value as typeof sortField)}
                      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="entryTime">Sort by entry time</option>
                      <option value="exitTime">Sort by exit time</option>
                    </select>

                    <select
                      value={sortDirection}
                      onChange={(event) => setSortDirection(event.target.value as typeof sortDirection)}
                      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="desc">Newest first</option>
                      <option value="asc">Oldest first</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="min-w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Entry time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Visitor</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Entry point</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {records.length === 0 && !isLoading ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                            No entry activity matches your filters yet.
                          </td>
                        </tr>
                      ) : (
                        records.map((record) => {
                          const isInside = record.stillInside
                          const isExtended = record.isExtended
                          const statusBadgeClass = isInside
                            ? isExtended
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                          const rowAccentClass = isInside
                            ? isExtended
                              ? 'bg-amber-50/60 hover:bg-amber-50 transition-colors'
                              : 'bg-emerald-50/60 hover:bg-emerald-50 transition-colors'
                            : 'hover:bg-slate-50 transition-colors'
                          const stayTextClass = isInside
                            ? isExtended
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                            : 'text-slate-500'

                          return (
                            <tr key={record.id} className={rowAccentClass}>
                              <td className="px-4 py-4 text-sm text-gray-700">
                                <div className="font-medium text-gray-900">{formatDateTime(record.entryTime)}</div>
                                {record.exitTime && (
                                  <div className="text-xs text-gray-500">Exited {formatDateTime(record.exitTime)}</div>
                                )}
                              </td>
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
                                <div className="text-xs text-gray-500">
                                  {ENTRY_METHOD_LABELS[record.entryMethod] ?? record.entryMethod}
                                </div>
                                {record.recordedBy && (
                                  <div className="text-xs text-gray-400">Logged by {record.recordedBy}</div>
                                )}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-700">
                                <div className="font-medium text-gray-900">{formatDuration(record.durationMinutes)}</div>
                                {record.stillInside && (
                                  <div className={`text-xs font-medium ${stayTextClass}`}>
                                    {record.isExtended ? 'Inside — monitor extended stay' : 'Currently in the library'}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 text-sm">
                                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass}`}>
                                  {record.stillInside ? (
                                    record.isExtended ? (
                                      <Activity className="h-3.5 w-3.5" />
                                    ) : (
                                      <Clock3 className="h-3.5 w-3.5" />
                                    )
                                  ) : (
                                    <LogOut className="h-3.5 w-3.5" />
                                  )}
                                  {record.stillInside ? (record.isExtended ? 'Extended stay' : 'Inside now') : 'Exited'}
                                </span>
                              </td>
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

                  {isLoading && (
                    <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Syncing scanner activity…
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-gray-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPagination((current) => ({ ...current, page: Math.max(1, current.page - 1) }))
                      }
                      disabled={!canGoPrevious || isLoading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPagination((current) => ({ ...current, page: Math.min(current.totalPages, current.page + 1) }))
                      }
                      disabled={!canGoNext || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
