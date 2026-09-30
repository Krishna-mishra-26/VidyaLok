'use client'

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useSession } from 'next-auth/react'
import QRCode from 'react-qr-code'
import {
  QrCode,
  Download,
  User,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

interface QrRecentEntry {
  id: string
  entryTime: Date
  exitTime: Date | null
  durationMinutes: number | null
  currentlyInside: boolean
}

interface QrTokenResponse {
  token: string
  issuedAt: number
  expiresAt: number
  ttlMinutes: number
  status: {
    currentlyInside: boolean
    expiringSoon: boolean
    lastVisit: {
      entryTime: Date
      exitTime: Date | null
      durationMinutes: number | null
    } | null
  }
  student: {
    id: string
    name: string
    studentId: string
    email: string | null
    phone: string | null
    branch: string | null
    department: string | null
    yearOfStudy: number | null
    semester: number | null
    joinedAt: string
  }
  recentEntries: QrRecentEntry[]
}

const DEFAULT_USER = {
  name: 'Student',
  role: 'STUDENT',
  studentId: 'UNKNOWN',
}

interface QrTokenApiResponse {
  token: string
  issuedAt: number | string
  expiresAt: number | string
  ttlMinutes: number
  status: {
    currentlyInside: boolean
    expiringSoon: boolean
    lastVisit: {
      entryTime: string
      exitTime: string | null
      durationMinutes: number | null
    } | null
  }
  student: {
    id: string
    name: string
    studentId: string
    email: string | null
    phone: string | null
    branch: string | null
    department: string | null
    yearOfStudy: number | null
    semester: number | null
    joinedAt: string
  }
  recentEntries: Array<{
    id: string
    entryTime: string
    exitTime: string | null
    durationMinutes: number | null
    currentlyInside: boolean
  }>
}

export default function StudentQRCodePage() {
  const { data: session } = useSession()
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [qrState, setQrState] = useState<QrTokenResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const qrContainerRef = useRef<HTMLDivElement | null>(null)

  const fetchQrData = useCallback(
    async (regenerate = false) => {
      setError(null)
      if (regenerate) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      try {
        const response = await fetch('/api/qr-code', {
          method: regenerate ? 'POST' : 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.message ?? 'Unable to load QR data')
        }

        const data = (await response.json()) as QrTokenApiResponse

        const parsed: QrTokenResponse = {
          ...data,
          issuedAt: Number(data.issuedAt),
          expiresAt: Number(data.expiresAt),
          status: {
            ...data.status,
            lastVisit: data.status.lastVisit
              ? {
                  ...data.status.lastVisit,
                  entryTime: new Date(data.status.lastVisit.entryTime),
                  exitTime: data.status.lastVisit.exitTime
                    ? new Date(data.status.lastVisit.exitTime)
                    : null,
                }
              : null,
          },
          recentEntries: (data.recentEntries ?? []).map((entry) => ({
            id: entry.id,
            entryTime: new Date(entry.entryTime),
            exitTime: entry.exitTime ? new Date(entry.exitTime) : null,
            durationMinutes: entry.durationMinutes ?? null,
            currentlyInside: Boolean(entry.currentlyInside),
          })),
        }

        setQrState(parsed)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error while loading QR details'
        setError(message)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchQrData(false)
  }, [fetchQrData])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!qrState) {
      return
    }

    const msUntilExpiry = qrState.expiresAt - Date.now()
    if (msUntilExpiry <= 0) {
      fetchQrData(false)
      return
    }

    const refreshDelay = Math.max(0, msUntilExpiry - 45_000)
    const timeout = window.setTimeout(() => fetchQrData(false), refreshDelay)
    return () => window.clearTimeout(timeout)
  }, [qrState, fetchQrData])

  const handleRegenerate = async () => {
    await fetchQrData(true)
  }

  const handleDownload = () => {
    const svgElement = qrContainerRef.current?.querySelector('svg') ?? null
    if (!qrState?.token || !svgElement) return

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${qrState.student.studentId}_library_qr.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  const isCurrentlyInside = qrState?.status.currentlyInside ?? false

  const lastEntryLabel = useMemo(() => {
    const record = qrState?.recentEntries?.[0]
    if (!record) {
      return 'No recent activity'
    }

    const type = record.exitTime ? 'exit' : 'entry'
    const timestamp = record.exitTime ?? record.entryTime
    const diffMinutes = Math.max(1, Math.round((Date.now() - timestamp.getTime()) / 60000))
    if (diffMinutes >= 60) {
      const hours = Math.floor(diffMinutes / 60)
      const remaining = diffMinutes % 60
      return `Last ${type} ${hours}h ${remaining}m ago`
    }
    return `Last ${type} ${diffMinutes}m ago`
  }, [qrState])

  const expiresInLabel = useMemo(() => {
    if (!qrState) return null
    const nowTimestamp = currentTime.getTime()
    const ms = Math.max(0, qrState.expiresAt - nowTimestamp)
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
  }, [qrState, currentTime])

  const headerUser = useMemo(() => {
    if (session?.user) {
      return {
        name: session.user.name ?? qrState?.student.name ?? DEFAULT_USER.name,
        role: session.user.role ?? 'STUDENT',
        studentId: session.user.studentId ?? qrState?.student.studentId ?? DEFAULT_USER.studentId,
      }
    }

    if (qrState?.student) {
      return {
        name: qrState.student.name,
        role: 'STUDENT',
        studentId: qrState.student.studentId,
      }
    }

    return DEFAULT_USER
  }, [session?.user, qrState?.student])

  const formattedRecentEntries = useMemo(() => {
    return (qrState?.recentEntries ?? []).map((entry) => {
      const type = entry.exitTime ? 'exit' : 'entry'
      const time = entry.exitTime ?? entry.entryTime
      return {
        id: entry.id,
        type,
        timestamp: time,
        entryTime: entry.entryTime,
        exitTime: entry.exitTime,
        durationMinutes: entry.durationMinutes,
      }
    })
  }, [qrState])

  const joinedAt = qrState?.student.joinedAt ? new Date(qrState.student.joinedAt) : null

  const hasActiveAccess = true

  return (
    <div className="flex flex-col min-h-screen" style={{ color: '#1f2937' }}>
      <Header user={headerUser} />

      <div className="flex flex-1">
        <Sidebar userRole="STUDENT" />

        <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64 student-main">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900" style={{ color: '#111827' }}>
                My QR Code
              </h1>
              <p className="text-gray-600" style={{ color: '#4b5563' }}>
                Access your live QR code for seamless entry and exit tracking
              </p>
            </div>

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-4">
                  <div className="flex items-start space-x-3 text-red-700">
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">Unable to load QR details</p>
                      <p className="text-sm">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => fetchQrData(false)}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className={`${isCurrentlyInside ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCurrentlyInside ? 'bg-green-100' : 'bg-blue-100'
                      }`}
                    >
                      {isCurrentlyInside ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Clock className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-semibold ${
                          isCurrentlyInside ? 'text-green-900' : 'text-blue-900'
                        }`}
                        style={{ color: isCurrentlyInside ? '#14532d' : '#1e3a8a' }}
                      >
                        {isCurrentlyInside ? 'Currently Inside Library' : 'Currently Outside Library'}
                      </h3>
                      <p
                        className={`text-sm ${
                          isCurrentlyInside ? 'text-green-700' : 'text-blue-700'
                        }`}
                        style={{ color: isCurrentlyInside ? '#166534' : '#1d4ed8' }}
                      >
                        {qrState ? lastEntryLabel : 'Loading status...'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900" style={{ color: '#111827' }}>
                      {currentTime.toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>
                      {currentTime.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {qrState && (
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500" style={{ color: '#6b7280' }}>Token Issued</p>
                      <p className="font-medium text-gray-900" style={{ color: '#111827' }}>
                        {new Date(qrState.issuedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500" style={{ color: '#6b7280' }}>Token Expires</p>
                      <p className="font-medium text-gray-900" style={{ color: '#111827' }}>
                        {new Date(qrState.expiresAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
               </CardContent>
             </Card>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                     <QrCode className="h-5 w-5" />
                     <span>Your QR Code</span>
                   </CardTitle>
                   <CardDescription style={{ color: '#6b7280' }}>
                     Scan this QR code at the gate to log entry and exit automatically
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-6">
                   <div className="text-center">
                     <div
                       ref={qrContainerRef}
                       className="w-64 h-64 bg-white border-2 border-gray-300 rounded-lg mx-auto flex items-center justify-center shadow-lg p-6"
                     >
                       {loading ? (
                         <div className="space-y-2">
                           <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 animate-pulse" />
                           <p className="text-sm text-gray-500">Generating secure QR...</p>
                         </div>
                       ) : qrState?.token ? (
                         <QRCode value={qrState.token} className="h-full w-full" size={220} viewBox="0 0 256 256" />
                       ) : (
                         <div className="space-y-2">
                           <QrCode className="h-16 w-16 text-gray-400 mx-auto" />
                           <p className="text-sm text-gray-500">No QR token available</p>
                         </div>
                       )}
                     </div>
                     {qrState?.status.expiringSoon && (
                       <p className="mt-3 text-xs text-amber-600 font-medium">
                         Token expiring soon. Regenerate to avoid disruptions.
                       </p>
                     )}
                     {qrState && (
                       <p className="mt-2 text-sm text-gray-600">
                         Expires in: <span className="font-semibold text-gray-800">{expiresInLabel}</span>
                       </p>
                     )}
                   </div>

                   <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>
                       <p className="text-gray-500" style={{ color: '#6b7280' }}>Issued</p>
                       <p className="font-medium text-gray-900" style={{ color: '#111827' }}>
                         {qrState ? new Date(qrState.issuedAt).toLocaleString() : '—'}
                       </p>
                     </div>
                     <div>
                       <p className="text-gray-500" style={{ color: '#6b7280' }}>Expires</p>
                       <p className="font-medium text-gray-900" style={{ color: '#111827' }}>
                         {qrState ? new Date(qrState.expiresAt).toLocaleString() : '—'}
                       </p>
                     </div>
                   </div>

                   <div className="border-t pt-3">
                     <div className="flex items-center space-x-2 text-sm">
                       <Shield className="h-4 w-4 text-green-500" />
                       <span className="text-green-700" style={{ color: '#166534' }}>
                         Secure, single-use token protected with cryptographic signing
                       </span>
                     </div>
                   </div>

                   <div className="space-y-2">
                     <Button
                       onClick={handleDownload}
                       disabled={!qrState?.token || loading}
                       className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                     >
                       <Download className="h-4 w-4 mr-2" />
                       Download QR Code (SVG)
                     </Button>

                     <Button
                       onClick={handleRegenerate}
                       variant="outline"
                       className="w-full"
                       disabled={refreshing}
                     >
                       <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                       {refreshing ? 'Generating...' : 'Regenerate QR Code'}
                     </Button>
                   </div>

                   <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm space-y-1" style={{ color: '#b45309' }}>
                     <p className="font-medium text-yellow-800" style={{ color: '#92400e' }}>Usage tips</p>
                     <ul className="list-disc list-inside space-y-1">
                       <li>Show the QR at the entry kiosk scanner to log your attendance.</li>
                       <li>Regenerate if the token is close to expiry or after sharing.</li>
                       <li>Keep your QR private. Admins can deactivate suspicious usage.</li>
                     </ul>
                   </div>
                 </CardContent>
               </Card>

               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                     <User className="h-5 w-5" />
                     <span>Profile Information</span>
                   </CardTitle>
                   <CardDescription style={{ color: '#6b7280' }}>
                     Your registered academic details linked to this QR code
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="text-center">
                     <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto flex items-center justify-center">
                       <User className="h-10 w-10 text-gray-600" />
                     </div>
                     <h3 className="mt-2 text-lg font-semibold text-gray-900" style={{ color: '#111827' }}>
                       {qrState?.student.name ?? '—'}
                     </h3>
                     <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>
                       {qrState?.student.department ?? qrState?.student.branch ?? 'Department not set'}
                     </p>
                   </div>

                   <div className="space-y-3 border-t pt-4">
                     <div className="grid grid-cols-2 gap-4 text-sm">
                       <div>
                         <p className="text-gray-500" style={{ color: '#6b7280' }}>Student ID</p>
                         <p className="font-medium text-gray-900" style={{ color: '#111827' }}>
                           {qrState?.student.studentId ?? '—'}
                         </p>
                       </div>
                       <div>
                         <p className="text-gray-500" style={{ color: '#6b7280' }}>Year</p>
                         <p className="font-medium text-gray-900" style={{ color: '#111827' }}>
                           {qrState?.student.yearOfStudy ? `Year ${qrState.student.yearOfStudy}` : '—'}
                         </p>
                       </div>
                       <div>
                         <p className="text-gray-500" style={{ color: '#6b7280' }}>Semester</p>
                         <p className="font-medium text-gray-900" style={{ color: '#111827' }}>
                           {qrState?.student.semester ? `Sem ${qrState.student.semester}` : '—'}
                         </p>
                       </div>
                       <div>
                         <p className="text-gray-500" style={{ color: '#6b7280' }}>Status</p>
                         <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                           ACTIVE
                         </span>
                       </div>
                     </div>

                     <div className="space-y-2 text-sm">
                       <div>
                         <p className="text-gray-500" style={{ color: '#6b7280' }}>Email</p>
                         <p className="font-medium text-gray-900" style={{ color: '#111827' }}>
                           {qrState?.student.email ?? 'Not provided'}
                         </p>
                       </div>
                       <div>
                         <p className="text-gray-500" style={{ color: '#6b7280' }}>Phone</p>
                         <p className="font-medium text-gray-900" style={{ color: '#111827' }}>
                           {qrState?.student.phone ?? 'Not provided'}
                         </p>
                       </div>
                       <div>
                         <p className="text-gray-500" style={{ color: '#6b7280' }}>Joined</p>
                         <p className="font-medium text-gray-900" style={{ color: '#111827' }}>
                           {joinedAt ? joinedAt.toLocaleDateString() : '—'}
                         </p>
                       </div>
                     </div>

                     <div className="border-t pt-3">
                       <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-600" style={{ color: '#4b5563' }}>
                           Library Access
                         </span>
                         <div className="flex items-center space-x-2">
                           {hasActiveAccess ? (
                             <>
                               <CheckCircle className="h-4 w-4 text-green-500" />
                               <span className="text-sm text-green-600" style={{ color: '#059669' }}>
                                 Enabled
                               </span>
                             </>
                           ) : (
                             <>
                               <AlertCircle className="h-4 w-4 text-red-500" />
                               <span className="text-sm text-red-600" style={{ color: '#dc2626' }}>
                                 Disabled
                               </span>
                             </>
                           )}
                         </div>
                       </div>
                     </div>
                   </div>
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
                   A snapshot of your most recent library movements
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 {loading && (
                   <div className="space-y-3">
                     {[...Array(3)].map((_, idx) => (
                       <div key={idx} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                     ))}
                   </div>
                 )}

                 {!loading && formattedRecentEntries.length === 0 && (
                   <div className="text-center py-8 text-sm text-gray-500">
                     No entry records yet. Scan your QR to create your first visit log.
                   </div>
                 )}

                 {!loading && formattedRecentEntries.length > 0 && (
                   <div className="space-y-3">
                     {formattedRecentEntries.map((entry) => (
                       <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                         <div className="flex items-center space-x-3">
                           <div
                             className={`w-3 h-3 rounded-full ${
                               entry.type === 'entry' ? 'bg-green-500' : 'bg-red-500'
                             }`}
                           />
                           <div>
                             <div className="flex items-center space-x-2">
                               <span
                                 className={`px-2 py-1 rounded text-xs font-medium ${
                                   entry.type === 'entry'
                                     ? 'bg-green-100 text-green-800'
                                     : 'bg-red-100 text-red-800'
                                 }`}
                               >
                                 {entry.type.toUpperCase()}
                               </span>
                               <span className="text-sm text-gray-900" style={{ color: '#111827' }}>
                                 {entry.type === 'entry' ? 'Entered library' : 'Exited library'}
                               </span>
                             </div>
                             <p className="text-xs text-gray-500" style={{ color: '#6b7280' }}>
                               Entry: {entry.entryTime.toLocaleTimeString()} | Exit:{' '}
                               {entry.exitTime ? entry.exitTime.toLocaleTimeString() : '—'}
                             </p>
                             {entry.durationMinutes && (
                               <p className="text-xs text-gray-500">
                                 Duration: {entry.durationMinutes} mins
                               </p>
                             )}
                           </div>
                         </div>
                         <div className="text-right text-sm text-gray-600" style={{ color: '#4b5563' }}>
                           <p>{entry.timestamp.toLocaleTimeString()}</p>
                           <p>{entry.timestamp.toLocaleDateString()}</p>
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
