'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  MoreHorizontal,
  Download,
  Upload,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Award,
  Loader2,
  AlertCircle,
} from 'lucide-react'

import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CANONICAL_DEPARTMENTS_WITH_ALL } from '@/constants/departments'
import { UserAccountStatus, UserRole } from '@/types'

type DepartmentFilterValue = (typeof CANONICAL_DEPARTMENTS_WITH_ALL)[number]
type StatusFilterValue = 'all' | UserAccountStatus

type BorrowingSummary = {
  total: number
  active: number
  overdue: number
  outstandingFines: number
}

type AdminUser = {
  id: string
  studentId: string
  name: string
  email: string
  phone: string | null
  branch: string | null
  department: string | null
  designation: string | null
  semester: number | null
  yearOfStudy: number | null
  role: UserRole
  accountStatus: UserAccountStatus
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  loginCount: number
  borrowingsCount: number
  borrowingSummary: BorrowingSummary
}

type AdminUsersResponse = {
  data: AdminUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats?: {
    accountStatus: {
      active: number
      inactive: number
      suspended: number
    }
    roles: {
      admins: number
      librarians: number
      students: number
    }
  }
}

type BannerState = { type: 'success' | 'error'; message: string }

type CreateUserForm = {
  studentId: string
  name: string
  email: string
  phone: string
  department: string
  branch: string
  semester: string
  yearOfStudy: string
  status: UserAccountStatus
  password: string
  confirmPassword: string
}

const STATUS_BADGE_CLASSES: Record<UserAccountStatus, string> = {
  [UserAccountStatus.ACTIVE]: 'text-green-600 bg-green-50',
  [UserAccountStatus.INACTIVE]: 'text-gray-600 bg-gray-100',
  [UserAccountStatus.SUSPENDED]: 'text-red-600 bg-red-50',
}

const STATUS_LABELS: Record<UserAccountStatus, string> = {
  [UserAccountStatus.ACTIVE]: 'Active',
  [UserAccountStatus.INACTIVE]: 'Inactive',
  [UserAccountStatus.SUSPENDED]: 'Suspended',
}

const STATUS_FILTER_OPTIONS: Array<{ value: StatusFilterValue; label: string }> = [
  { value: 'all', label: 'All Status' },
  { value: UserAccountStatus.ACTIVE, label: 'Active' },
  { value: UserAccountStatus.INACTIVE, label: 'Inactive' },
  { value: UserAccountStatus.SUSPENDED, label: 'Suspended' },
]

const INITIAL_FORM_STATE: CreateUserForm = {
  studentId: '',
  name: '',
  email: '',
  phone: '',
  department: '',
  branch: '',
  semester: '',
  yearOfStudy: '',
  status: UserAccountStatus.ACTIVE,
  password: '',
  confirmPassword: '',
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount ?? 0))

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

const ordinalSuffix = (value: number | null | undefined) => {
  if (!value) return null
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' }
  const remainder = value % 10
  const suffix = suffixes[remainder] ?? 'th'
  if (value % 100 >= 11 && value % 100 <= 13) {
    return `${value}th`
  }
  return `${value}${suffix}`
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentFilterValue>('all')
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterValue>('all')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const [users, setUsers] = useState<AdminUser[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, totalPages: 1 })
  const [stats, setStats] = useState<AdminUsersResponse['stats'] | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [banner, setBanner] = useState<BannerState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formState, setFormState] = useState<CreateUserForm>(INITIAL_FORM_STATE)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmittingUser, setIsSubmittingUser] = useState(false)
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null)
  const actionMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400)
    return () => window.clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, selectedDepartment, selectedStatus])

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
      includeStats: 'true',
    })

    if (debouncedSearch) params.set('q', debouncedSearch)
    if (selectedDepartment !== 'all') params.set('department', selectedDepartment)
    if (selectedStatus !== 'all') params.set('status', selectedStatus)

    try {
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        const fallback = await response.json().catch(() => ({}))
        throw new Error(fallback?.message ?? 'Failed to load users')
      }

      const payload: AdminUsersResponse = await response.json()
      setUsers(payload.data ?? [])
      setPagination(payload.pagination)
      setStats(payload.stats ?? null)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load users'
      setError(message)
      setUsers([])
      setPagination({ page: 1, limit: pageSize, total: 0, totalPages: 1 })
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, debouncedSearch, selectedDepartment, selectedStatus])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (!selectedUsers.length) return
    const validIds = new Set(users.map((user) => user.id))
    setSelectedUsers((prev) => prev.filter((id) => validIds.has(id)))
  }, [users, selectedUsers.length])

  useEffect(() => {
    if (!activeActionMenu) return

    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveActionMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeActionMenu])

  const totalStats = useMemo(() => {
    if (stats) {
      return {
        totalUsers: pagination.total,
        activeUsers: stats.accountStatus?.active ?? 0,
        suspendedUsers: stats.accountStatus?.suspended ?? 0,
        totalFines: stats.accountStatus
          ? null
          : users.reduce((sum, user) => sum + (user.borrowingSummary?.outstandingFines ?? 0), 0),
      }
    }

    return {
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.accountStatus === UserAccountStatus.ACTIVE).length,
      suspendedUsers: users.filter((user) => user.accountStatus === UserAccountStatus.SUSPENDED).length,
      totalFines: users.reduce((sum, user) => sum + (user.borrowingSummary?.outstandingFines ?? 0), 0),
    }
  }, [stats, pagination.total, users])

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    )
  }

  const handleSelectAll = () => {
    if (!users.length) {
      setSelectedUsers([])
      return
    }

    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((user) => user.id))
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    setPage(newPage)
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'suspend') => {
    if (!selectedUsers.length) return

    const targetStatus =
      action === 'activate'
        ? UserAccountStatus.ACTIVE
        : action === 'deactivate'
          ? UserAccountStatus.INACTIVE
          : UserAccountStatus.SUSPENDED

    setIsBulkUpdating(true)
    setBanner(null)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          accountStatus: targetStatus,
          isActive: action === 'activate' ? true : action === 'deactivate' ? false : undefined,
        }),
      })

      if (!response.ok) {
        const fallback = await response.json().catch(() => ({}))
        throw new Error(fallback?.message ?? 'Bulk update failed')
      }

      setBanner({
        type: 'success',
        message: `Updated ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} successfully`,
      })
      setSelectedUsers([])
      await fetchUsers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update users'
      setBanner({ type: 'error', message })
    } finally {
      setIsBulkUpdating(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    const params = new URLSearchParams({
      page: '1',
      limit: String(pageSize),
      export: 'csv',
    })

    if (debouncedSearch) params.set('q', debouncedSearch)
    if (selectedDepartment !== 'all') params.set('department', selectedDepartment)
    if (selectedStatus !== 'all') params.set('status', selectedStatus)

    try {
      const response = await fetch(`/api/admin/users?${params.toString()}`)
      if (!response.ok) {
        const fallback = await response.json().catch(() => ({}))
        throw new Error(fallback?.message ?? 'Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `vidyalok-users-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to export users'
      setBanner({ type: 'error', message })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportClick = () => {
    setBanner({ type: 'error', message: 'CSV import will be available soon.' })
  }

  const handleFormChange = (field: keyof CreateUserForm, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormState(INITIAL_FORM_STATE)
    setFormError(null)
  }

  const openCreateForm = () => {
    setEditingUser(null)
    resetForm()
    setShowAddForm(true)
  }

  const openEditForm = (user: AdminUser) => {
    setEditingUser(user)
    setFormState({
      studentId: user.studentId ?? '',
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      department: user.department ?? '',
      branch: user.branch ?? '',
      semester: user.semester ? String(user.semester) : '',
      yearOfStudy: user.yearOfStudy ? String(user.yearOfStudy) : '',
      status: user.accountStatus,
      password: '',
      confirmPassword: '',
    })
    setFormError(null)
    setShowAddForm(true)
  }

  const handleEmailUser = (email: string) => {
    if (!email) {
      setBanner({ type: 'error', message: 'Email address unavailable for this user.' })
      return
    }

    window.open(`mailto:${email}`, '_blank', 'noopener,noreferrer')
  }

  const handleSingleStatusUpdate = async (userId: string, action: 'activate' | 'deactivate' | 'suspend') => {
    const targetStatus =
      action === 'activate'
        ? UserAccountStatus.ACTIVE
        : action === 'deactivate'
          ? UserAccountStatus.INACTIVE
          : UserAccountStatus.SUSPENDED

    setIsBulkUpdating(true)
    setBanner(null)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: [userId],
          accountStatus: targetStatus,
          isActive: action === 'activate' ? true : action === 'deactivate' ? false : undefined,
        }),
      })

      if (!response.ok) {
        const fallback = await response.json().catch(() => ({}))
        throw new Error(fallback?.message ?? 'Failed to update user status')
      }

      setBanner({
        type: 'success',
        message: `User ${action === 'activate' ? 'activated' : action === 'deactivate' ? 'deactivated' : 'suspended'} successfully`,
      })
      await fetchUsers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update user status'
      setBanner({ type: 'error', message })
    } finally {
      setIsBulkUpdating(false)
      setActiveActionMenu(null)
    }
  }

  const handleCopyToClipboard = async (value: string, label: string) => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        throw new Error('Clipboard access is unavailable')
      }
      await navigator.clipboard.writeText(value)
      setBanner({ type: 'success', message: `${label} copied to clipboard` })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to copy to clipboard'
      setBanner({ type: 'error', message })
    } finally {
      setActiveActionMenu(null)
    }
  }
  const handleUserFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const isEditMode = Boolean(editingUser)
    const trimmedStudentId = formState.studentId.trim()
    const trimmedName = formState.name.trim()
    const trimmedEmail = formState.email.trim().toLowerCase()
    const trimmedPhone = formState.phone.trim()
    const trimmedDepartment = formState.department.trim()
    const trimmedBranch = formState.branch.trim()
    const hasPassword = Boolean(formState.password)
    const hasConfirmPassword = Boolean(formState.confirmPassword)

    if (!isEditMode && !hasPassword) {
      setFormError('Password is required for new users')
      return
    }

    if (hasPassword || hasConfirmPassword) {
      if (!formState.password || !formState.confirmPassword || formState.password !== formState.confirmPassword) {
        setFormError('Passwords do not match')
        return
      }
      if (formState.password.length < 8) {
        setFormError('Password must be at least 8 characters long')
        return
      }
    }

    setIsSubmittingUser(true)

    try {
      if (isEditMode && editingUser) {
        const payload: Record<string, unknown> = {
          id: editingUser.id,
          studentId: trimmedStudentId,
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          department: trimmedDepartment,
          branch: trimmedBranch,
          accountStatus: formState.status,
          semester: formState.semester ? Number(formState.semester) : null,
          yearOfStudy: formState.yearOfStudy ? Number(formState.yearOfStudy) : null,
        }

        if (!trimmedPhone) payload.phone = ''
        if (!trimmedDepartment) payload.department = ''
        if (!trimmedBranch) payload.branch = ''
        if (hasPassword) payload.password = formState.password

        const response = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const fallback = await response.json().catch(() => ({}))
          throw new Error(fallback?.message ?? 'Failed to update user')
        }

        setBanner({ type: 'success', message: 'User updated successfully' })
      } else {
        const payload = {
          studentId: trimmedStudentId,
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone || undefined,
          password: formState.password,
          department: trimmedDepartment || undefined,
          branch: trimmedBranch || undefined,
          accountStatus: formState.status,
          semester: formState.semester ? Number(formState.semester) : undefined,
          yearOfStudy: formState.yearOfStudy ? Number(formState.yearOfStudy) : undefined,
        }

        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const fallback = await response.json().catch(() => ({}))
          throw new Error(fallback?.message ?? 'Failed to create user')
        }

        setBanner({ type: 'success', message: 'User created successfully' })
        setPage(1)
      }

      setShowAddForm(false)
      setEditingUser(null)
      resetForm()
      await fetchUsers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save user'
      setFormError(message)
    } finally {
      setIsSubmittingUser(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="flex">
        <Sidebar userRole="ADMIN" />
        <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64 z-10">
          <div className="admin-users-content max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-gray-600 mt-1">Monitor, onboard, and moderate student accounts in real time.</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={isExporting || isLoading}
                  className="flex items-center gap-2 rounded-lg border-slate-200 bg-white/90 text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Export
                </Button>
                <Button
                  variant="outline"
                  onClick={handleImportClick}
                  className="flex items-center gap-2 rounded-lg border-slate-200 bg-white/90 text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <Button
                  onClick={openCreateForm}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-md transition-all hover:from-sky-500 hover:via-blue-500 hover:to-indigo-500"
                >
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </div>
            </div>

            {banner && (
              <div
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
                  banner.type === 'success'
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                <span>{banner.message}</span>
                <button
                  type="button"
                  className="ml-auto text-xs uppercase tracking-wide"
                  onClick={() => setBanner(null)}
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Currently listed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{totalStats.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">Logged in within policy</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Suspended</CardTitle>
                  <UserX className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{totalStats.suspendedUsers}</div>
                  <p className="text-xs text-muted-foreground">Action required</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outstanding Fines</CardTitle>
                  <Award className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">
                    {formatCurrency(totalStats.totalFines ?? 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Pending recoveries</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name, student ID, or email..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="pr-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedDepartment}
                      onChange={(event) => setSelectedDepartment(event.target.value as DepartmentFilterValue)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CANONICAL_DEPARTMENTS_WITH_ALL.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept === 'all' ? 'All Departments' : dept}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedStatus}
                      onChange={(event) => setSelectedStatus(event.target.value as StatusFilterValue)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {STATUS_FILTER_OPTIONS.map((statusOption) => (
                        <option key={statusOption.value} value={statusOption.value}>
                          {statusOption.label}
                        </option>
                      ))}
                    </select>
                    <Button variant="outline" size="icon" >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedUsers.length > 0 && (
                  <div className="mt-2 flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 md:flex-row md:items-center md:justify-between">
                    <span>
                      {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isBulkUpdating}
                        onClick={() => void handleBulkAction('activate')}
                      >
                        {isBulkUpdating ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                        Activate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isBulkUpdating}
                        onClick={() => void handleBulkAction('deactivate')}
                      >
                        Deactivate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isBulkUpdating}
                        onClick={() => void handleBulkAction('suspend')}
                      >
                        Suspend
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {error && !isLoading ? (
              <Card className="border border-red-200 bg-red-50">
                <CardContent className="flex items-center gap-3 p-6 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{error}</p>
                    <p className="text-xs text-red-600">
                      Please retry or adjust filters. If the problem persists contact the administrator.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="border border-slate-200 bg-white/95 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Users ({pagination.total})</CardTitle>
                  <span className="text-xs text-slate-500">
                    Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full divide-y divide-slate-200 text-slate-700">
                    <thead className="bg-slate-50/90 backdrop-blur-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <input
                            type="checkbox"
                            checked={users.length > 0 && selectedUsers.length === users.length}
                            onChange={handleSelectAll}
                            className="rounded"
                            aria-label="Select all users"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Student Details
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Contact Info
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Academic Info
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Library Stats
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Last Activity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white/95">
                      {isLoading ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                            <div className="flex flex-col items-center gap-3">
                              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                              <span>Loading users...</span>
                            </div>
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center gap-3 text-slate-500">
                              <Users className="h-10 w-10 text-slate-300" />
                              <p className="text-base font-medium">No users found</p>
                              <p className="text-sm">Try adjusting your filters or search term.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => {
                          const department = user.department ?? user.branch ?? '—'
                          const yearLabel = ordinalSuffix(user.yearOfStudy)
                          const academicLabel = yearLabel
                            ? `${yearLabel} Year`
                            : user.semester
                              ? `Semester ${user.semester}`
                              : '—'
                          const lastActivity = user.lastLoginAt ?? user.updatedAt ?? user.createdAt
                          const borrowing = user.borrowingSummary

                          return (
                            <tr
                              key={user.id}
                              className="transition-colors hover:bg-gradient-to-r hover:from-slate-50 hover:via-blue-50 hover:to-indigo-50"
                            >
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.includes(user.id)}
                                  onChange={() => handleSelectUser(user.id)}
                                  className="rounded"
                                  aria-label={`Select ${user.name}`}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="space-y-1">
                                  <div className="font-semibold text-slate-900">{user.name}</div>
                                  <div className="text-sm text-slate-600">ID: {user.studentId}</div>
                                  <div className="text-xs text-slate-500">Joined: {formatDate(user.createdAt)}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-slate-700">
                                  <div className="mb-1 flex items-center gap-1 text-xs text-slate-500">
                                    <Mail className="h-3 w-3 text-slate-400" />
                                    <span>{user.email}</span>
                                  </div>
                                  {user.phone ? (
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                      <Phone className="h-3 w-3 text-slate-400" />
                                      <span>{user.phone}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-xs text-slate-400">No phone</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-slate-700">
                                  <div className="font-medium text-slate-800">{department}</div>
                                  <div className="text-xs text-slate-500">{academicLabel}</div>
                                  {user.designation ? (
                                    <div className="text-xs text-blue-500">{user.designation}</div>
                                  ) : null}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-slate-700">
                                  <div>Total: {borrowing?.total ?? 0}</div>
                                  <div className="text-blue-600">Current: {borrowing?.active ?? 0}</div>
                                  {Number(borrowing?.overdue ?? 0) > 0 && (
                                    <div className="text-red-600">Overdue: {borrowing?.overdue}</div>
                                  )}
                                  {Number(borrowing?.outstandingFines ?? 0) > 0 && (
                                    <div className="text-amber-600">
                                      Fines: {formatCurrency(borrowing?.outstandingFines ?? 0)}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[user.accountStatus]}`}
                                >
                                  {STATUS_LABELS[user.accountStatus]}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                  <Calendar className="h-3 w-3 text-slate-400" />
                                  {formatDate(lastActivity)}
                                </div>
                              </td>
                              <td className="relative px-4 py-3">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditForm(user)}
                                    className="rounded-lg border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEmailUser(user.email)}
                                    className="rounded-lg border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                  >
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    aria-expanded={activeActionMenu === user.id}
                                    aria-haspopup="menu"
                                    onClick={() =>
                                      setActiveActionMenu((current) => (current === user.id ? null : user.id))
                                    }
                                    className="rounded-lg border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                                {activeActionMenu === user.id ? (
                                  <div
                                    ref={actionMenuRef}
                                    className="absolute right-0 top-11 z-20 w-48 rounded-lg border border-slate-200 bg-white py-2 text-sm shadow-xl"
                                    role="menu"
                                    aria-label="User quick actions"
                                  >
                                    <button
                                      type="button"
                                      className="block w-full px-4 py-2 text-left text-slate-600 transition hover:bg-slate-50"
                                      onClick={() => void handleCopyToClipboard(user.studentId, 'Student ID')}
                                    >
                                      Copy Student ID
                                    </button>
                                    <button
                                      type="button"
                                      className="block w-full px-4 py-2 text-left text-slate-600 transition hover:bg-slate-50"
                                      onClick={() => void handleCopyToClipboard(user.email, 'Email address')}
                                    >
                                      Copy Email
                                    </button>
                                    <div className="my-1 border-t border-slate-100" />
                                    <button
                                      type="button"
                                      className="block w-full px-4 py-2 text-left text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                      disabled={isBulkUpdating}
                                      onClick={() => void handleSingleStatusUpdate(user.id, 'activate')}
                                    >
                                      Mark as Active
                                    </button>
                                    <button
                                      type="button"
                                      className="block w-full px-4 py-2 text-left text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                      disabled={isBulkUpdating}
                                      onClick={() => void handleSingleStatusUpdate(user.id, 'deactivate')}
                                    >
                                      Mark as Inactive
                                    </button>
                                    <button
                                      type="button"
                                      className="block w-full px-4 py-2 text-left text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                      disabled={isBulkUpdating}
                                      onClick={() => void handleSingleStatusUpdate(user.id, 'suspend')}
                                    >
                                      Suspend User
                                    </button>
                                  </div>
                                ) : null}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 md:flex-row">
                  <span>
                    Showing {(pagination.page - 1) * pagination.limit + 1} -
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-xs uppercase tracking-wide text-slate-500">
                      Page {pagination.page} / {Math.max(pagination.totalPages, 1)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
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

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingUser(null)
                  resetForm()
                }}
              >
                ×
              </Button>
            </div>
            <form className="space-y-4" onSubmit={handleUserFormSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Student ID</label>
                  <Input
                    placeholder="e.g., APSIT001"
                    value={formState.studentId}
                    onChange={(event) => handleFormChange('studentId', event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Full Name</label>
                  <Input
                    placeholder="Student full name"
                    value={formState.name}
                    onChange={(event) => handleFormChange('name', event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="student@apsit.edu.in"
                    value={formState.email}
                    onChange={(event) => handleFormChange('email', event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Phone</label>
                  <Input
                    placeholder="Optional"
                    value={formState.phone}
                    onChange={(event) => handleFormChange('phone', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Department</label>
                  <select
                    value={formState.department}
                    onChange={(event) => handleFormChange('department', event.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select department</option>
                    {CANONICAL_DEPARTMENTS_WITH_ALL.filter((dept) => dept !== 'all').map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Branch</label>
                  <Input
                    placeholder="Optional specialization"
                    value={formState.branch}
                    onChange={(event) => handleFormChange('branch', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Semester</label>
                  <select
                    value={formState.semester}
                    onChange={(event) => handleFormChange('semester', event.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select semester</option>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <option key={index + 1} value={String(index + 1)}>
                        Semester {index + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Year of Study</label>
                  <select
                    value={formState.yearOfStudy}
                    onChange={(event) => handleFormChange('yearOfStudy', event.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select year</option>
                    {[1, 2, 3, 4, 5].map((year) => (
                      <option key={year} value={String(year)}>
                        {ordinalSuffix(year)} Year
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Account Status</label>
                  <select
                    value={formState.status}
                    onChange={(event) => handleFormChange('status', event.target.value as UserAccountStatus)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(UserAccountStatus).map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={formState.password}
                    onChange={(event) => handleFormChange('password', event.target.value)}
                    required={!editingUser}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="Re-enter password"
                    value={formState.confirmPassword}
                    onChange={(event) => handleFormChange('confirmPassword', event.target.value)}
                    required={!editingUser}
                  />
                </div>
              </div>

              {formError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              ) : null}

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1" disabled={isSubmittingUser}>
                  {isSubmittingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingUser ? 'Save Changes' : 'Add User'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingUser(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
