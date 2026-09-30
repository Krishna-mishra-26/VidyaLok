'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { useEffect } from 'react'
import { AlertTriangle, KeyRound, Loader2, RefreshCw, Search, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { UserAccountStatus, UserRole } from '@/types'

type AdminUserRecord = {
  id: string
  name: string
  email: string
  studentId: string
  phone: string | null
  role: UserRole
  accountStatus: UserAccountStatus
  branch: string | null
  department: string | null
  designation: string | null
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  isActive: boolean
  loginCount: number
  borrowingSummary: {
    total: number
    active: number
    overdue: number
    outstandingFines: number
  }
}

type UsersApiResponse = {
  data: AdminUserRecord[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats?: {
    accountStatus: Record<string, number>
    roles: Record<string, number>
  }
}

type DeleteResult = {
  message: string
}

type LoadState = 'idle' | 'loading' | 'error'

const generateSecurePassword = (length = 12) => {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*'
  const charsetLength = charset.length
  const randomValues = new Uint32Array(length)

  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(randomValues)
  } else {
    for (let index = 0; index < length; index += 1) {
      randomValues[index] = Math.floor(Math.random() * charsetLength)
    }
  }

  return Array.from(randomValues, (value) => charset[value % charsetLength]).join('')
}

const formatDateTime = (value: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)

const formatStatus = (status: UserAccountStatus) =>
  status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export default function UserManagementPanel() {
  const [users, setUsers] = useState<AdminUserRecord[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<UsersApiResponse['stats']>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [resettingId, setResettingId] = useState<string | null>(null)

  const fetchUsers = useCallback(
    async (options: { page?: number; query?: string } = {}) => {
      const nextPage = options.page ?? pagination.page
      const query = options.query ?? search

      setLoadState('loading')
      setError(null)
  setSuccess(null)

      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          limit: String(pagination.limit),
          includeStats: 'true',
        })

        if (query.trim()) {
          params.set('q', query.trim())
        }

        const response = await fetch(`/api/admin/users?${params.toString()}`, {
          cache: 'no-store',
        })

        const payload: UsersApiResponse | { message?: string } = await response.json()

        if (!response.ok) {
          throw new Error('Unable to load users right now')
        }

        if (!('data' in payload)) {
          throw new Error('Unexpected response from users endpoint')
        }

        setUsers(payload.data)
        setPagination(payload.pagination)
        setStats(payload.stats)
      } catch (fetchError) {
        console.error('[USER_MANAGEMENT_PANEL]', fetchError)
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load users')
      } finally {
        setLoadState('idle')
      }
    },
    [pagination.limit, pagination.page, search],
  )

  useEffect(() => {
    void fetchUsers({ page: 1 })
  }, [fetchUsers])

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value)
      void fetchUsers({ page: 1, query: value })
    },
    [fetchUsers],
  )

  const handleDelete = useCallback(
    async (user: AdminUserRecord) => {
      if (user.role !== 'STUDENT') {
        setError('Only student accounts can be deleted from this console.')
        return
      }

      const confirmation = window.confirm(
        `Delete ${user.name} (${user.studentId})? This action will permanently remove their account and related records.`,
      )

      if (!confirmation) {
        return
      }

      try {
        setDeletingId(user.id)
        setSuccess(null)
        const response = await fetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, {
          method: 'DELETE',
        })

        const payload: DeleteResult | { message?: string } = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error('message' in payload && payload.message ? payload.message : 'Failed to delete user')
        }

        await fetchUsers({ page: 1, query: search })
      } catch (deleteError) {
        console.error('[USER_DELETE]', deleteError)
        setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete user')
      } finally {
        setDeletingId(null)
      }
    },
    [fetchUsers, search],
  )

  const handleResetPassword = useCallback(
    async (user: AdminUserRecord) => {
      const confirmation = window.confirm(
        `Reset password for ${user.name} (${user.studentId || user.email})? A temporary password will be generated and the user will be prompted to change it on next login.`,
      )

      if (!confirmation) {
        return
      }

      try {
        setResettingId(user.id)
        setError(null)
        setSuccess(null)

        const tempPassword = generateSecurePassword()

        const response = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: user.id, password: tempPassword }),
        })

        const payload: { message?: string } = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(payload.message ?? 'Failed to reset password')
        }

        const clipboardMessage = `Temporary password for ${user.name} (${user.studentId || user.email}) is ${tempPassword}`

        try {
          await navigator.clipboard.writeText(tempPassword)
          setSuccess(`${clipboardMessage}. It has been copied to your clipboard.`)
        } catch {
          setSuccess(`${clipboardMessage}. Please copy and share securely.`)
        }

        await fetchUsers({ page: pagination.page, query: search })
      } catch (resetError) {
        console.error('[USER_RESET_PASSWORD]', resetError)
        setError(resetError instanceof Error ? resetError.message : 'Failed to reset password')
      } finally {
        setResettingId(null)
      }
    },
    [fetchUsers, pagination.page, search],
  )

  const filteredUsers = useMemo(() => users, [users])

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">User Management</CardTitle>
          <p className="text-sm text-gray-500">
            Manage student accounts, monitor borrowing obligations, and deactivate users in real time.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-72">
            <Search className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search by name, ID, or email"
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <RefreshCw className={`h-3.5 w-3.5 ${loadState === 'loading' ? 'animate-spin' : ''}`} />
            {loadState === 'loading' ? 'Syncing directory…' : `Showing ${filteredUsers.length} users`}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase text-gray-500">Active Accounts</div>
              <div className="text-2xl font-semibold text-emerald-600 mt-1">
                {(stats.accountStatus?.active ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase text-gray-500">Inactive</div>
              <div className="text-2xl font-semibold text-amber-600 mt-1">
                {(stats.accountStatus?.inactive ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase text-gray-500">Suspended</div>
              <div className="text-2xl font-semibold text-red-600 mt-1">
                {(stats.accountStatus?.suspended ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase text-gray-500">Students</div>
              <div className="text-2xl font-semibold text-blue-600 mt-1">
                {(stats.roles?.students ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        <div className="min-w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Borrowings</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Fines</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Last Login</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loadState === 'loading' && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Fetching users…
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                    No users match your filters yet.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const outstanding = user.borrowingSummary.outstandingFines ?? 0
                  const deleteDisabled = user.role !== 'STUDENT'
                  const deleting = deletingId === user.id
                  const resetting = resettingId === user.id

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-700">
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">ID: {user.studentId}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 capitalize">{user.role.toLowerCase()}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                          user.accountStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : user.accountStatus === 'SUSPENDED'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {formatStatus(user.accountStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {user.borrowingSummary.active.toLocaleString()} active /{' '}
                        {user.borrowingSummary.total.toLocaleString()} total
                        {user.borrowingSummary.overdue > 0 && (
                          <span className="ml-2 text-xs text-red-600">
                            {user.borrowingSummary.overdue.toLocaleString()} overdue
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {outstanding > 0 ? (
                          <span className="font-semibold text-red-600">{formatCurrency(outstanding)}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{formatDateTime(user.lastLoginAt)}</td>
                      <td className="px-4 py-4 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            disabled={resetting || loadState === 'loading'}
                            onClick={() => handleResetPassword(user)}
                            title="Generate a temporary password for this account"
                          >
                            {resetting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <KeyRound className="h-3.5 w-3.5" />
                            )}
                            Reset Password
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            disabled={deleteDisabled || deleting || resetting}
                            onClick={() => handleDelete(user)}
                            title={deleteDisabled ? 'Only student accounts can be deleted' : 'Delete user'}
                          >
                            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
            <div>
              Page {pagination.page} of {pagination.totalPages} · {pagination.total.toLocaleString()} users total
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchUsers({ page: Math.max(1, pagination.page - 1), query: search })}
                disabled={pagination.page <= 1 || loadState === 'loading'}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchUsers({ page: Math.min(pagination.totalPages, pagination.page + 1), query: search })}
                disabled={pagination.page >= pagination.totalPages || loadState === 'loading'}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
