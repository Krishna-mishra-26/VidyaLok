'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  Megaphone,
  Repeat2,
  Filter,
  Search,
  Check,
  Circle,
} from 'lucide-react'

import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { StudentBroadcastRecord, StudentBroadcastSummary, BroadcastAudienceValue, BroadcastPriorityValue, BroadcastTypeValue } from '@/types'

interface BroadcastsApiResponse {
  data: StudentBroadcastRecord[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: StudentBroadcastSummary
}

interface BannerState {
  type: 'success' | 'error'
  message: string
}

const PAGE_SIZE = 10

// Quick filter definitions
const FILTER_TYPES: BroadcastTypeValue[] = ['ANNOUNCEMENT','ALERT','MAINTENANCE','EVENT','EMERGENCY']
const FILTER_PRIORITIES: BroadcastPriorityValue[] = ['URGENT','HIGH','NORMAL']

/**
 * Professional Color System (Broadcasts)
 * --------------------------------------------------
 * Goals:
 *  - Harmonized, low-chroma backgrounds for readability
 *  - Accessible contrast for text (WCAG AA+)
 *  - Consistent semantic mapping across types & priorities
 *  - Centralized tokens to evolve theme easily
 */
const PROFESSIONAL_COLORS = {
  baseBorder: 'border-slate-200',
  baseCard: 'bg-white',
  hoverBorder: 'hover:border-slate-300',
  unreadGlow: 'from-blue-50 via-white to-blue-50',
  // Type badges (background / text / border kept subtle)
  types: {
    ANNOUNCEMENT: 'bg-blue-50 text-blue-700 border border-blue-100',
    ALERT: 'bg-rose-50 text-rose-700 border border-rose-100',
    MAINTENANCE: 'bg-amber-50 text-amber-700 border border-amber-100',
    EVENT: 'bg-violet-50 text-violet-700 border border-violet-100',
    EMERGENCY: 'bg-red-50 text-red-700 border border-red-100',
  },
  priorities: {
    NORMAL: 'bg-slate-100 text-slate-700 border border-slate-200',
    HIGH: 'bg-orange-100 text-orange-700 border border-orange-200',
    URGENT: 'bg-red-100 text-red-700 border border-red-200',
  },
} as const

// Gradient accents for metrics bars & card top indicators
const ACCENT_GRADIENTS: Record<string, string> = {
  unread: 'from-blue-500 to-blue-600',
  urgent: 'from-red-500 to-rose-600',
  total: 'from-slate-600 to-slate-800',
  ANNOUNCEMENT: 'from-blue-400 to-blue-600',
  ALERT: 'from-rose-500 to-rose-600',
  MAINTENANCE: 'from-amber-500 to-orange-600',
  EVENT: 'from-violet-500 to-purple-600',
  EMERGENCY: 'from-red-600 to-red-700',
}

// Gradient text helper for dynamic headings
const gradientText = (accentKey: string) => `bg-gradient-to-r ${ACCENT_GRADIENTS[accentKey] ?? ACCENT_GRADIENTS.total} bg-clip-text text-transparent`

const TYPE_CONFIG: Record<BroadcastTypeValue, { label: string; icon: React.ComponentType<{ className?: string }>; badgeClass: string; gradient: string }> = {
  ANNOUNCEMENT: { label: 'Announcement', icon: Info, badgeClass: PROFESSIONAL_COLORS.types.ANNOUNCEMENT, gradient: ACCENT_GRADIENTS.ANNOUNCEMENT },
  ALERT: { label: 'Alert', icon: AlertTriangle, badgeClass: PROFESSIONAL_COLORS.types.ALERT, gradient: ACCENT_GRADIENTS.ALERT },
  MAINTENANCE: { label: 'Maintenance', icon: Clock, badgeClass: PROFESSIONAL_COLORS.types.MAINTENANCE, gradient: ACCENT_GRADIENTS.MAINTENANCE },
  EVENT: { label: 'Event', icon: Megaphone, badgeClass: PROFESSIONAL_COLORS.types.EVENT, gradient: ACCENT_GRADIENTS.EVENT },
  EMERGENCY: { label: 'Emergency', icon: AlertCircle, badgeClass: PROFESSIONAL_COLORS.types.EMERGENCY, gradient: ACCENT_GRADIENTS.EMERGENCY },
}

const PRIORITY_CONFIG: Record<BroadcastPriorityValue, { label: string; badgeClass: string }> = {
  NORMAL: { label: 'Normal Priority', badgeClass: PROFESSIONAL_COLORS.priorities.NORMAL },
  HIGH: { label: 'High Priority', badgeClass: PROFESSIONAL_COLORS.priorities.HIGH },
  URGENT: { label: 'Urgent Priority', badgeClass: PROFESSIONAL_COLORS.priorities.URGENT },
}

const AUDIENCE_LABELS: Record<BroadcastAudienceValue, string> = {
  ALL: 'All Students',
  DEPARTMENT: 'Specific Department',
  ROLE: 'Specific Role',
  CUSTOM: 'Custom Recipients',
}

const formatDateTime = (value: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

const resolveAudience = (record: StudentBroadcastRecord): string => {
  if (record.audience === 'ALL') return 'All Students'
  return AUDIENCE_LABELS[record.audience] ?? 'Targeted Recipients'
}

export default function StudentBroadcastsPage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()

  // Core data state
  const [records, setRecords] = useState<StudentBroadcastRecord[]>([])
  const [summary, setSummary] = useState<StudentBroadcastSummary | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 })

  // UI & UX state
  const [isLoading, setIsLoading] = useState(false)
  const [banner, setBanner] = useState<BannerState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mutatingId, setMutatingId] = useState<string | null>(null)

  // Persistent preference state (filters / search / density)
  const [activeTypeFilters, setActiveTypeFilters] = useState<Set<BroadcastTypeValue>>(() => {
    if (typeof window === 'undefined') return new Set()
    try { const raw = window.localStorage.getItem('broadcastTypeFilters'); return raw ? new Set(JSON.parse(raw) as BroadcastTypeValue[]) : new Set() } catch { return new Set() }
  })
  const [activePriorityFilters, setActivePriorityFilters] = useState<Set<BroadcastPriorityValue>>(() => {
    if (typeof window === 'undefined') return new Set()
    try { const raw = window.localStorage.getItem('broadcastPriorityFilters'); return raw ? new Set(JSON.parse(raw) as BroadcastPriorityValue[]) : new Set() } catch { return new Set() }
  })
  const [searchTerm, setSearchTerm] = useState(() => {
    if (typeof window === 'undefined') return ''
    try { return window.localStorage.getItem('broadcastSearch') || '' } catch { return '' }
  })

  // Persist filters & search
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('broadcastTypeFilters', JSON.stringify(Array.from(activeTypeFilters)))
        localStorage.setItem('broadcastPriorityFilters', JSON.stringify(Array.from(activePriorityFilters)))
        localStorage.setItem('broadcastSearch', searchTerm)
      }
    } catch {}
  }, [activeTypeFilters, activePriorityFilters, searchTerm])

  // Derived filtered view client-side (API could be extended later)
  const filteredRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return records.filter(r => {
      if (activeTypeFilters.size && !activeTypeFilters.has(r.type)) return false
      if (activePriorityFilters.size && !activePriorityFilters.has(r.priority)) return false
      if (term && !(`${r.title} ${r.message}`.toLowerCase().includes(term))) return false
      return true
    })
  }, [records, activeTypeFilters, activePriorityFilters, searchTerm])

  /**
   * Derived summary metrics for the current (filtered) visible set.
   * We intentionally base metrics on the filteredRecords so that users immediately see
   * how their active filters/search scope the dataset. If we later want a global vs filtered
   * toggle we can extend this without changing the UI contract of the cards below.
   */
  const metrics = useMemo(() => {
    const countsByType: Record<BroadcastTypeValue, number> = {
      ANNOUNCEMENT: 0,
      ALERT: 0,
      MAINTENANCE: 0,
      EVENT: 0,
      EMERGENCY: 0,
    }
    let unread = 0
    let urgent = 0
    filteredRecords.forEach(r => {
      countsByType[r.type] = (countsByType[r.type] ?? 0) + 1
      if (r.unread) unread += 1
      if (r.priority === 'URGENT') urgent += 1
    })
    return {
      total: filteredRecords.length,
      unread,
      urgent,
      countsByType,
    }
  }, [filteredRecords])

  /**
   * Group filtered records into temporal buckets for improved scannability.
   * Buckets: Today, Last 7 Days (excluding today), This Month (excluding previous), Earlier.
   * NOTE: We base grouping off deliveredAt (fallback sentAt) as the user-visible delivery time.
   */
  const grouped = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sevenDaysAgo = new Date(startOfToday)
    sevenDaysAgo.setDate(startOfToday.getDate() - 7)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    type BucketKey = 'TODAY' | 'LAST_7' | 'THIS_MONTH' | 'EARLIER'
    const buckets: Record<BucketKey, StudentBroadcastRecord[]> = {
      TODAY: [],
      LAST_7: [],
      THIS_MONTH: [],
      EARLIER: [],
    }

    filteredRecords.forEach(r => {
      const dateStr = r.deliveredAt || r.sentAt
      const d = dateStr ? new Date(dateStr) : null
      if (!d || Number.isNaN(d.getTime())) { buckets.EARLIER.push(r); return }
      if (d >= startOfToday) buckets.TODAY.push(r)
      else if (d >= sevenDaysAgo) buckets.LAST_7.push(r)
      else if (d >= startOfMonth) buckets.THIS_MONTH.push(r)
      else buckets.EARLIER.push(r)
    })

    return [
      { key: 'TODAY' as BucketKey, label: 'Today', items: buckets.TODAY },
      { key: 'LAST_7' as BucketKey, label: 'Last 7 Days', items: buckets.LAST_7 },
      { key: 'THIS_MONTH' as BucketKey, label: 'This Month', items: buckets.THIS_MONTH },
      { key: 'EARLIER' as BucketKey, label: 'Earlier', items: buckets.EARLIER },
    ].filter(section => section.items.length > 0)
  }, [filteredRecords])

  // Shape user for Header component
  const headerUser = useMemo(() => {
    const sessionUser = session?.user

    if (!sessionUser) {
      return undefined
    }

    return {
      name: sessionUser.name ?? 'Student',
      role: sessionUser.role ?? 'STUDENT',
      studentId: sessionUser.studentId ?? sessionUser.id ?? 'UNKNOWN',
    }
  }, [session])

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') router.replace('/login?callbackUrl=/student/broadcasts')
  }, [sessionStatus, router])

  const fetchBroadcasts = useCallback(async (requestedPage: number) => {
    setIsLoading(true)
    setError(null)

    const params = new URLSearchParams({ page: String(requestedPage), limit: String(PAGE_SIZE), view: 'student' })
    try {
      const response = await fetch(`/api/broadcasts?${params.toString()}`)
      if (!response.ok) throw new Error('Unable to load broadcasts right now')
      const payload: BroadcastsApiResponse = await response.json()
      setRecords(payload.data ?? [])
      setSummary(payload.summary ?? null)
      setPagination(payload.pagination ?? { page: requestedPage, limit: PAGE_SIZE, total: 0, totalPages: 1 })
    } catch (err) {
      console.error('Failed to load broadcasts', err)
      setError((err as Error).message || 'Unable to load broadcasts right now.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchBroadcasts(1)
    }
  }, [sessionStatus, fetchBroadcasts])

  const handleRefresh = useCallback(() => {
    fetchBroadcasts(pagination.page)
  }, [fetchBroadcasts, pagination.page])

  const handlePagination = useCallback(
    (direction: 'prev' | 'next') => {
      setPagination((prev) => {
        const nextPage = direction === 'prev' ? Math.max(prev.page - 1, 1) : Math.min(prev.page + 1, prev.totalPages)
        if (nextPage === prev.page) {
          return prev
        }
        fetchBroadcasts(nextPage)
        return { ...prev, page: nextPage }
      })
    },
    [fetchBroadcasts],
  )

  const mutateBroadcastStatus = useCallback(
    async (broadcastId: string, action: 'mark-read' | 'mark-unread') => {
      setMutatingId(broadcastId)
      setBanner(null)
      try {
        const response = await fetch(`/api/broadcasts/${broadcastId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        })

        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Unable to update broadcast')
        }

        await fetchBroadcasts(pagination.page)
        setBanner({ type: 'success', message: action === 'mark-read' ? 'Marked as read.' : 'Marked as unread.' })
      } catch (err) {
        console.error('Failed to update broadcast state', err)
        setBanner({ type: 'error', message: (err as Error).message || 'Unable to update broadcast.' })
      } finally {
        setMutatingId(null)
      }
    },
    [fetchBroadcasts, pagination.page],
  )

  const unreadCount = summary?.unreadCount ?? 0
  const isSessionReady = sessionStatus === 'authenticated' && Boolean(headerUser)
  const showEmptyState = !isLoading && !error && records.length === 0
  const showFilteredEmpty = !isLoading && !error && records.length > 0 && filteredRecords.length === 0

  if (sessionStatus === 'loading' && !headerUser) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header user={headerUser} />
      <div className="flex flex-1">
        <Sidebar userRole="STUDENT" />
        <main className="student-main flex-1 px-4 pb-16 pt-24 sm:px-6 md:ml-64" aria-describedby="broadcasts-heading">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <h1 id="broadcasts-heading" className="text-2xl font-semibold tracking-tight text-slate-900">Library Broadcasts</h1>
                  <p className="text-sm text-slate-600">
                    Stay informed about library maintenance, events, and emergency alerts tailored for you.
                  </p>
                </div>
                <div className="flex items-stretch gap-3">
                  <div className="flex items-center rounded-xl border border-blue-100 bg-blue-50 px-5 py-3 text-blue-800 shadow-sm">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">Unread</p>
                      <p className="text-2xl font-bold leading-none">{unreadCount}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleRefresh} disabled={isLoading || !isSessionReady} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Repeat2 className="mr-2 h-4 w-4" /> Refresh
                  </Button>
                </div>
              </div>
              {/* Filters + Search */}
              <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-start">
                <div className="flex flex-wrap items-center gap-2" aria-label="Filter broadcasts by type">
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"><Filter className="h-3.5 w-3.5" /> Type:</span>
                  {FILTER_TYPES.map(t => {
                    const cfg = TYPE_CONFIG[t]
                    const active = activeTypeFilters.has(t)
                    return (
                      <button
                        key={t}
                        onClick={() => setActiveTypeFilters(prev => { const next = new Set(prev); if (next.has(t)) next.delete(t); else next.add(t); return next })}
                        className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium outline-none transition ${active ? cfg.badgeClass + ' ring-2 ring-offset-1 ring-blue-200 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2'} hover:brightness-105`}
                        aria-pressed={active}
                      >
                        {active ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-2" aria-label="Filter broadcasts by priority">
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"><Filter className="h-3.5 w-3.5" /> Priority:</span>
                  {FILTER_PRIORITIES.map(p => {
                    const cfg = PRIORITY_CONFIG[p]
                    const active = activePriorityFilters.has(p)
                    return (
                      <button
                        key={p}
                        onClick={() => setActivePriorityFilters(prev => { const next = new Set(prev); if (next.has(p)) next.delete(p); else next.add(p); return next })}
                        className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium outline-none transition ${active ? cfg.badgeClass + ' ring-2 ring-offset-1 ring-orange-200 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2'} hover:brightness-105`}
                        aria-pressed={active}
                      >
                        {active ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                        {cfg.label.split(' ')[0]}
                      </button>
                    )
                  })}
                </div>
                <div className="flex w-full items-center gap-3 lg:ml-auto lg:max-w-xs">
                  <div className="relative w-full">
                    <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search broadcasts..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      aria-label="Search broadcasts"
                    />
                  </div>
                  {(activeTypeFilters.size>0 || activePriorityFilters.size>0 || searchTerm) && (
                    <button
                      onClick={() => { setActiveTypeFilters(new Set()); setActivePriorityFilters(new Set()); setSearchTerm('') }}
                      className="text-xs font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
                    >Reset</button>
                  )}
              
                </div>
              </div>
              

              {/* Summary Metrics Bar (filtered scope) */}
              <div className="mt-6" aria-label="Broadcast summary metrics">
                {isLoading ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6" role="list" aria-busy="true">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-50 via-white to-slate-100" />
                        <div className="relative space-y-2">
                          <div className="h-2 w-16 rounded bg-slate-200" />
                          <div className="h-6 w-10 rounded bg-slate-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6" role="list">
                    {(() => {
                      const base = [
                        { key: 'unread', label: 'Unread', value: metrics.unread, accent: ACCENT_GRADIENTS.unread, Icon: BellRing },
                        { key: 'urgent', label: 'Urgent', value: metrics.urgent, accent: ACCENT_GRADIENTS.urgent, Icon: AlertTriangle },
                        { key: 'total', label: 'Total', value: metrics.total, accent: ACCENT_GRADIENTS.total, Icon: Megaphone },
                      ]
                      const typeCards = FILTER_TYPES.map(t => ({
                        key: `type-${t}`,
                        label: TYPE_CONFIG[t].label.split(' ')[0],
                        value: metrics.countsByType[t],
                        accent: TYPE_CONFIG[t].gradient,
                        Icon: TYPE_CONFIG[t].icon,
                      })).filter(c => c.value > 0)
                      const cards = [...base, ...typeCards].slice(0, 12) // guard against overflow
                      return cards.map(c => (
                        <div
                          key={c.key}
                          role="listitem"
                          className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                        >
                          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.accent}`} aria-hidden="true" />
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                              <c.Icon className="h-3.5 w-3.5 text-slate-400" /> {c.label}
                            </span>
                          </div>
                          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{c.value}</p>
                        </div>
                      ))
                    })()}
                  </div>
                )}
                <p className="mt-2 text-[11px] text-slate-500">Metrics reflect the currently filtered set.</p>
              </div>
            </section>

            {banner && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${banner.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}
                role="status"
              >
                {banner.message}
              </div>
            )}

            {error && (
              <Card className="border-red-200 bg-red-50/40">
                <CardHeader>
                  <CardTitle className="text-red-700">Unable to load broadcasts</CardTitle>
                  <CardDescription className="text-red-600">{error}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleRefresh} variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
                    <Repeat2 className="mr-2 h-4 w-4" />
                    Try again
                  </Button>
                </CardContent>
              </Card>
            )}

            {isLoading && (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_,i) => (
                  <div key={i} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="absolute inset-0 -z-10 animate-pulse bg-gradient-to-br from-slate-100 via-white to-slate-50" />
                    <div className="mb-4 flex gap-2">
                      <div className="h-6 w-28 rounded-full bg-slate-200/70" />
                      <div className="h-6 w-24 rounded-full bg-slate-200/70" />
                    </div>
                    <div className="h-4 w-2/3 rounded bg-slate-200/70" />
                    <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
                    <div className="mt-6 grid grid-cols-3 gap-3">
                      <div className="h-10 rounded-lg bg-slate-100" />
                      <div className="h-10 rounded-lg bg-slate-100" />
                      <div className="h-10 rounded-lg bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showEmptyState && (
              <Card className="border-slate-200 bg-white">
                <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-slate-600">
                  <BellRing className="h-10 w-10 text-blue-400" />
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-slate-900">You&apos;re all caught up!</p>
                    <p className="text-sm text-slate-600">
                      New announcements from the library will appear here. Check back soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {showFilteredEmpty && (
              <Card className="border-slate-200 bg-white">
                <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-slate-600">
                  <Search className="h-10 w-10 text-slate-400" />
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-slate-900">No matches</p>
                    <p className="text-sm text-slate-600">Try adjusting filters or clearing the search.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && filteredRecords.length > 0 && (
              <div className="space-y-10" aria-live="polite">
                {grouped.map(section => (
                  <div key={section.key} className="space-y-4">
                    <div className="sticky top-20 z-10 -mx-1 flex flex-col gap-1 px-1">
                      <h3 className={`text-sm font-semibold tracking-wide ${gradientText(section.items[0]?.type || 'total')}`}>{section.label}</h3>
                      <span className="h-px w-full bg-gradient-to-r from-slate-300 via-slate-200/70 to-transparent" aria-hidden="true" />
                    </div>
                    {section.items.map(record => {
                  const typeConfig = TYPE_CONFIG[record.type]
                  const priorityConfig = PRIORITY_CONFIG[record.priority]
                  const Icon = typeConfig?.icon ?? Info
                  const isUnread = record.unread

                  return (
                    <Card
                      key={record.id}
                      className={`group relative overflow-hidden border ${PROFESSIONAL_COLORS.baseBorder} transition-all duration-300 hover:shadow-lg ${isUnread ? 'bg-gradient-to-br ' + PROFESSIONAL_COLORS.unreadGlow : PROFESSIONAL_COLORS.baseCard} ${PROFESSIONAL_COLORS.hoverBorder}`}
                    >
                      {/* Decorative left timeline bar with unread pulse */}
                      <span className={`absolute left-0 top-0 h-full w-1 ${isUnread ? 'bg-gradient-to-b ' + TYPE_CONFIG[record.type].gradient + ' animate-[pulse_2.4s_ease-in-out_infinite]' : 'bg-slate-200 group-hover:bg-gradient-to-b group-hover:from-blue-200 group-hover:to-blue-400'}`} aria-hidden="true" />
                      <CardHeader className="flex flex-col gap-2 border-b border-slate-100/80 bg-white/80 py-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${typeConfig?.badgeClass ?? ''}`}>
                              <Icon className="h-4 w-4" />
                              {typeConfig?.label ?? 'Announcement'}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${priorityConfig?.badgeClass ?? ''}`}>
                              {priorityConfig?.label ?? 'Normal Priority'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                            {isUnread ? (
                              <span className="flex items-center gap-1 text-blue-600">
                                <BellRing className="h-4 w-4 animate-[ping_3s_linear_infinite]" />
                                Unread
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                Read
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-900">{record.title}</h2>
                          <p className="mt-1 text-sm text-slate-600">{record.message}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 py-5">
                        <div className="grid gap-3 md:grid-cols-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Audience</p>
                            <p className="text-sm font-medium text-slate-800">{resolveAudience(record)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Sent</p>
                            <p className="text-sm font-medium text-slate-800">{formatDateTime(record.sentAt ?? record.deliveredAt)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Delivered</p>
                            <p className="text-sm font-medium text-slate-800">{formatDateTime(record.deliveredAt)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Read</p>
                            <p className="text-sm font-medium text-slate-800">
                              {record.readAt ? formatDateTime(record.readAt) : 'Not yet'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Expires</p>
                            <p className={`text-sm font-medium ${record.expiresAt ? 'text-slate-800' : 'text-slate-500'}`}>
                              {record.expiresAt ? formatDate(record.expiresAt) : 'No expiry'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                            <p className="text-sm font-medium text-slate-800">
                              {record.unread ? 'Action required' : 'No action needed'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {record.unread ? (
                            <Button
                              onClick={() => mutateBroadcastStatus(record.id, 'mark-read')}
                              disabled={mutatingId === record.id}
                              className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                              {mutatingId === record.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Updating…
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Mark as read
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => mutateBroadcastStatus(record.id, 'mark-unread')}
                              disabled={mutatingId === record.id}
                              variant="outline"
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              {mutatingId === record.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Updating…
                                </>
                              ) : (
                                <>
                                  <BellRing className="mr-2 h-4 w-4" />
                                  Mark unread
                                </>
                              )}
                            </Button>
                          )}
                          <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            <Clock className="h-4 w-4" /> Delivered {formatDateTime(record.deliveredAt)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !error && filteredRecords.length > 0 && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <div>
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePagination('prev')}
                    disabled={pagination.page === 1 || isLoading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePagination('next')}
                    disabled={pagination.page === pagination.totalPages || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {isSessionReady && !isLoading && !error && (
              <p className="text-center text-xs text-slate-500">
                Broadcasts are curated by the library team to keep you updated about important events and operational changes.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
