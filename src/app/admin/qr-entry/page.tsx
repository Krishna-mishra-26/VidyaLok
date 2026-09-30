'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Scanner } from '@yudiel/react-qr-scanner'
import type { IDetectedBarcode } from '@yudiel/react-qr-scanner'
import {
  QrCode,
  Scan,
  Check,
  X,
  Clock,
  User,
  Shield,
  Download,
  RefreshCw,
  AlertCircle,
  MapPin,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

const ENTRY_POINTS = ['Main Entrance', 'Side Gate', 'Reading Hall', 'Digital Lab']

interface AdminEntryRecord {
  id: string
  studentId: string
  studentName: string
  department: string | null
  entryPoint: string | null
  entryMethod: string | null
  entryTime: Date
  exitTime: Date | null
  durationMinutes: number | null
}

interface EntrySummary {
  stats: {
    studentsInside: number
    todaysEntries: number
  }
  recentEntries: AdminEntryRecord[]
}

type EntryType = 'ENTRY' | 'EXIT'

type EntryMethod = 'qr_code' | 'manual'

interface StudentProfile {
  studentId: string
  name: string
  email: string | null
  branch: string | null
  department: string | null
  yearOfStudy: number | null
  semester: number | null
}

interface ScanOutcome {
  success: boolean
  message: string
  timestamp: Date
  entryType?: EntryType
  method?: EntryMethod
  location?: string | null
  student?: StudentProfile
}

interface ApiEntryRecord {
  id: string
  studentId: string
  studentName: string
  department?: string | null
  entryPoint?: string | null
  entryMethod?: string | null
  entryTime: string
  exitTime?: string | null
  durationMinutes?: number | null
}

interface ApiSummaryResponse {
  stats?: {
    studentsInside?: number
    todaysEntries?: number
  }
  recentEntries?: ApiEntryRecord[]
  success?: boolean
  message?: string
}

interface VerifyApiResponse extends ApiSummaryResponse {
  success: true
  entryType: EntryType
  student: StudentProfile
}

const DEFAULT_USER = {
  name: 'Admin',
  role: 'ADMIN',
  studentId: 'ADMIN',
}

const parseEntrySummary = (data: ApiSummaryResponse | null): EntrySummary => ({
  stats: {
    studentsInside: data?.stats?.studentsInside ?? 0,
    todaysEntries: data?.stats?.todaysEntries ?? 0,
  },
  recentEntries: (data?.recentEntries ?? []).map((entry) => ({
    id: entry.id,
    studentId: entry.studentId,
    studentName: entry.studentName,
    department: entry.department ?? null,
    entryPoint: entry.entryPoint ?? 'Main Entrance',
    entryMethod: entry.entryMethod ?? 'qr_code',
    entryTime: new Date(entry.entryTime),
    exitTime: entry.exitTime ? new Date(entry.exitTime) : null,
    durationMinutes: entry.durationMinutes ?? null,
  })),
})

export default function QREntrySystemPage() {
  const { data: session } = useSession()
  const [summary, setSummary] = useState<EntrySummary | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [scanResult, setScanResult] = useState<ScanOutcome | null>(null)
  const [manualEntry, setManualEntry] = useState('')
  const [entryPoint, setEntryPoint] = useState<string>(ENTRY_POINTS[0])
  const [notes, setNotes] = useState('')
  const [scannerActive, setScannerActive] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [scanLock, setScanLock] = useState(false)
  const lastScanRef = useRef<{ token: string; time: number }>({ token: '', time: 0 })

  const headerUser = useMemo(() => {
    if (session?.user) {
      return {
        name: session.user.name ?? DEFAULT_USER.name,
        role: session.user.role ?? 'ADMIN',
        studentId: session.user.studentId ?? DEFAULT_USER.studentId,
      }
    }

    return DEFAULT_USER
  }, [session?.user])

  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true)
    setApiError(null)
    try {
  const response = await fetch('/api/qr-code/verify', { method: 'GET', credentials: 'include' })
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as ApiSummaryResponse | null
        throw new Error(payload?.message ?? 'Failed to load entry data')
      }
      const data = (await response.json()) as ApiSummaryResponse
      setSummary(parseEntrySummary(data))
      setLastUpdated(new Date())
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error while loading data'
      setApiError(message)
    } finally {
      setLoadingSummary(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const processRequest = useCallback(
    async ({ token, studentId, method }: { token?: string; studentId?: string; method: EntryMethod }) => {
      if (!token && !studentId) return

      setProcessing(true)
      setApiError(null)

      try {
        const response = await fetch('/api/qr-code/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            token,
            studentId,
            entryPoint,
            notes: notes.trim() || undefined,
          }),
        })

        const payload = (await response.json().catch(() => null)) as VerifyApiResponse | ApiSummaryResponse | null

        if (!response.ok || !payload || payload.success !== true) {
          throw new Error(payload?.message ?? 'Failed to record entry')
        }

        const verifyPayload = payload as VerifyApiResponse
        const parsedSummary = parseEntrySummary(verifyPayload)
        setSummary(parsedSummary)
        setLastUpdated(new Date())

        setScanResult({
          success: true,
          message: verifyPayload.entryType === 'ENTRY' ? 'Entry recorded successfully' : 'Exit recorded successfully',
          entryType: verifyPayload.entryType,
          method,
          timestamp: new Date(),
          location: parsedSummary.recentEntries[0]?.entryPoint ?? entryPoint,
          student: verifyPayload.student,
        })

        setManualEntry('')
        setNotes('')
        setScannerActive(false)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to process scan'
        setScanResult({ success: false, message, timestamp: new Date(), method })
      } finally {
        setProcessing(false)
        setScanLock(false)
      }
    },
    [entryPoint, notes]
  )

  const handleToken = useCallback(
    (token: string) => {
      const normalizedToken = token.trim()
      if (!normalizedToken || processing || scanLock) return

      const now = Date.now()
      if (lastScanRef.current.token === normalizedToken && now - lastScanRef.current.time < 2500) {
        return
      }

      lastScanRef.current = { token: normalizedToken, time: now }
      setScanLock(true)
      void processRequest({ token: normalizedToken, method: 'qr_code' })
    },
    [processing, scanLock, processRequest]
  )

  const handleScan = useCallback(
    (codes: IDetectedBarcode[]) => {
      const [first] = codes
      if (!first?.rawValue) return
      handleToken(first.rawValue)
    },
    [handleToken]
  )

  const handleManualSubmit = () => {
    if (!manualEntry.trim()) {
      setScanResult({ success: false, message: 'Enter a valid student ID', timestamp: new Date(), method: 'manual' })
      return
    }
    setScanLock(true)
    void processRequest({ studentId: manualEntry.trim().toUpperCase(), method: 'manual' })
  }

  const exportRecentEntries = () => {
    if (!summary) return

    const rows = summary.recentEntries.map((entry) => [
      entry.entryTime.toLocaleString(),
      entry.studentId,
      entry.studentName,
      entry.department ?? '-',
      entry.entryPoint ?? '-',
      entry.entryMethod ?? '-',
      entry.exitTime ? entry.exitTime.toLocaleTimeString() : '-',
      entry.durationMinutes ? `${entry.durationMinutes} mins` : '-',
    ])

    const csv = [
      ['Timestamp', 'Student ID', 'Student Name', 'Department', 'Entry Point', 'Method', 'Exit Time', 'Duration'],
      ...rows,
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `library_entries_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const studentsInside = summary?.stats.studentsInside ?? 0
  const todaysEntries = summary?.stats.todaysEntries ?? 0
  const recentEntries = summary?.recentEntries ?? []

  return (
    <div className="flex flex-col min-h-screen" style={{ color: '#1f2937' }}>
      <Header user={headerUser} />

      <div className="flex flex-1">
        <Sidebar userRole="ADMIN" />

  <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64 student-main">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900" style={{ color: '#111827' }}>
                  QR Entry/Exit System
                </h1>
                <p className="text-gray-600" style={{ color: '#4b5563' }}>
                  Scan student QR codes or record manual entries for precise attendance logs
                </p>
              </div>
              <div className="flex space-x-2">
                <Button onClick={exportRecentEntries} variant="outline" className="flex items-center space-x-2" disabled={!summary}>
                  <Download className="h-4 w-4" />
                  <span>Export Recent</span>
                </Button>
                <Button onClick={fetchSummary} variant="outline" className="flex items-center space-x-2" disabled={loadingSummary}>
                  {loadingSummary ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span>Refresh</span>
                </Button>
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Clock className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-900" style={{ color: '#1e3a8a' }}>
                        {new Date().toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-blue-700" style={{ color: '#1d4ed8' }}>
                        {new Date().toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-blue-900" style={{ color: '#1e3a8a' }}>
                      Students Inside: {studentsInside}
                    </p>
                    <p className="text-sm text-blue-700" style={{ color: '#1d4ed8' }}>
                      Today&apos;s Entries: {todaysEntries}
                    </p>
                    {lastUpdated && (
                      <p className="text-xs text-blue-600 mt-1" style={{ color: '#2563eb' }}>
                        Last sync: {lastUpdated.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {apiError && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-4">
                  <div className="flex items-start space-x-3 text-red-700">
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="font-semibold">Dashboard data unavailable</p>
                      <p className="text-sm">{apiError}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                    <QrCode className="h-5 w-5" />
                    <span>QR Code Scanner</span>
                  </CardTitle>
                  <CardDescription style={{ color: '#6b7280' }}>
                    Use the device camera to automatically detect student QR tokens
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
                    {scannerActive ? (
                      <Scanner
                        constraints={{ facingMode: 'environment' }}
                        onScan={handleScan}
                        onError={(error: unknown) =>
                          setScanResult({
                            success: false,
                            message: error instanceof Error ? error.message : 'Scanner error',
                            timestamp: new Date(),
                            method: 'qr_code',
                          })
                        }
                        allowMultiple={false}
                        scanDelay={1800}
                        styles={{ container: { width: '100%', height: '100%' } }}
                      />
                    ) : (
                      <div className="text-center text-gray-200 space-y-3">
                        <Scan className="h-12 w-12 mx-auto" />
                        <p>Enable the scanner to start reading QR codes</p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setScannerActive((prev) => !prev)}
                      className={`flex-1 ${scannerActive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    >
                      {scannerActive ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Stop Scanner
                        </>
                      ) : (
                        <>
                          <Scan className="h-4 w-4 mr-2" />
                          Start Scanner
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2" style={{ color: '#374151' }}>
                        Entry Point
                      </p>
                      <select
                        value={entryPoint}
                        onChange={(event) => setEntryPoint(event.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                      >
                        {ENTRY_POINTS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2" style={{ color: '#374151' }}>
                        Manual Entry (Fallback)
                      </p>
                      <div className="flex space-x-2">
                        <Input
                          value={manualEntry}
                          onChange={(event) => setManualEntry(event.target.value)}
                          placeholder="Enter Student ID manually"
                          className="bg-white text-gray-900"
                        />
                        <Button onClick={handleManualSubmit} variant="outline" disabled={processing}>
                          Submit
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2" style={{ color: '#374151' }}>
                        Notes (optional)
                      </p>
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Add remarks for manual overrides or special cases"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                    <User className="h-5 w-5" />
                    <span>Latest Scan Result</span>
                  </CardTitle>
                  <CardDescription style={{ color: '#6b7280' }}>
                    Details from the most recent QR or manual verification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {processing && (
                    <div className="flex items-center space-x-3 text-sm text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing scan...</span>
                    </div>
                  )}

                  {!processing && !scanResult && (
                    <div className="text-sm text-gray-500">
                      No scans processed yet. Activate the scanner or enter a student ID to begin.
                    </div>
                  )}

                  {scanResult && (
                    <div
                      className={`rounded-lg border p-4 ${
                        scanResult.success ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {scanResult.success ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                          <p className="font-semibold">{scanResult.message}</p>
                        </div>
                        <span className="text-xs">
                          {scanResult.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      {scanResult.student && (
                        <div className="mt-3 space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{scanResult.student.name}</span>
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                              {scanResult.entryType}
                            </span>
                          </div>
                          <div className="text-gray-600">
                            <p>ID: {scanResult.student.studentId}</p>
                            <p>Department: {scanResult.student.department ?? 'Not set'}</p>
                            <p>Year/Sem: {scanResult.student.yearOfStudy ?? '-'} / {scanResult.student.semester ?? '-'}</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 text-xs text-gray-600 space-y-1">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span>Method: {scanResult.method === 'qr_code' ? 'QR Scanner' : 'Manual Override'}</span>
                        </div>
                        {scanResult.location && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>Entry Point: {scanResult.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                  <Clock className="h-5 w-5" />
                  <span>Recent Entry/Exit Activity</span>
                </CardTitle>
                <CardDescription style={{ color: '#6b7280' }}>
                  Live feed of the latest scans recorded across entry points
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSummary ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="h-20 rounded-lg bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : recentEntries.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    No entries logged yet today. Incoming scans will appear here immediately.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentEntries.map((entry) => (
                      <div key={entry.id} className="p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                entry.exitTime ? 'bg-red-500' : 'bg-green-500'
                              }`}
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    entry.exitTime ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {entry.exitTime ? 'EXIT' : 'ENTRY'}
                                </span>
                                <span className="text-sm font-medium text-gray-900" style={{ color: '#111827' }}>
                                  {entry.studentName} ({entry.studentId})
                                </span>
                              </div>
                              <p className="text-xs text-gray-500" style={{ color: '#6b7280' }}>
                                {entry.department ?? 'General Department'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-600" style={{ color: '#4b5563' }}>
                            <p>{entry.entryTime.toLocaleTimeString()}</p>
                            <p>{entry.entryTime.toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{entry.entryPoint ?? 'Main Entrance'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <span>Method: {entry.entryMethod ?? 'qr_code'}</span>
                          </div>
                          <div>
                            <p>Exit Time: {entry.exitTime ? entry.exitTime.toLocaleTimeString() : '—'}</p>
                          </div>
                          <div>
                            <p>Duration: {entry.durationMinutes ? `${entry.durationMinutes} mins` : '—'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
