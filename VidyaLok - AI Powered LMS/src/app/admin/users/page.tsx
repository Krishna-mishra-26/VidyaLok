'use client'

import React, { useState } from 'react'
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
  Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // Mock user data
  const users = [
    {
      id: '1',
      studentId: 'APSIT001',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@apsit.edu.in',
      phone: '+91 98765 43210',
      department: 'Computer Science',
      year: '3rd Year',
      section: 'A',
      status: 'active',
      joinedDate: '2024-07-15',
      totalBorrowings: 15,
      currentBorrowings: 2,
      overdueBooks: 0,
      finesDue: 0,
      lastActivity: '2024-12-28'
    },
    {
      id: '2',
      studentId: 'APSIT002',
      name: 'Priya Sharma',
      email: 'priya.sharma@apsit.edu.in',
      phone: '+91 87654 32109',
      department: 'Electronics',
      year: '2nd Year',
      section: 'B',
      status: 'active',
      joinedDate: '2024-08-01',
      totalBorrowings: 8,
      currentBorrowings: 1,
      overdueBooks: 0,
      finesDue: 0,
      lastActivity: '2024-12-27'
    },
    {
      id: '3',
      studentId: 'APSIT003',
      name: 'Amit Patel',
      email: 'amit.patel@apsit.edu.in',
      phone: '+91 76543 21098',
      department: 'Mechanical',
      year: '4th Year',
      section: 'A',
      status: 'suspended',
      joinedDate: '2024-06-20',
      totalBorrowings: 22,
      currentBorrowings: 0,
      overdueBooks: 2,
      finesDue: 150,
      lastActivity: '2024-12-20'
    },
    {
      id: '4',
      studentId: 'APSIT004',
      name: 'Sneha Verma',
      email: 'sneha.verma@apsit.edu.in',
      phone: '+91 65432 10987',
      department: 'Computer Science',
      year: '1st Year',
      section: 'C',
      status: 'active',
      joinedDate: '2024-09-01',
      totalBorrowings: 3,
      currentBorrowings: 1,
      overdueBooks: 0,
      finesDue: 0,
      lastActivity: '2024-12-28'
    },
    {
      id: '5',
      studentId: 'APSIT005',
      name: 'Arjun Singh',
      email: 'arjun.singh@apsit.edu.in',
      phone: '+91 54321 09876',
      department: 'Civil',
      year: '3rd Year',
      section: 'A',
      status: 'inactive',
      joinedDate: '2024-07-10',
      totalBorrowings: 12,
      currentBorrowings: 0,
      overdueBooks: 0,
      finesDue: 0,
      lastActivity: '2024-11-15'
    }
  ]

  const departments = ['all', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology']
  const statuses = ['all', 'active', 'inactive', 'suspended']

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50'
      case 'inactive': return 'text-gray-600 bg-gray-50'
      case 'suspended': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for users:`, selectedUsers)
    setSelectedUsers([])
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
  }

  const totalStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    suspendedUsers: users.filter(u => u.status === 'suspended').length,
    totalFines: users.reduce((sum, user) => sum + user.finesDue, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar userRole="ADMIN" />
        <main className="flex-1 p-6 ml-64 z-10" style={{marginTop: '80px'}}>
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-gray-600 mt-1">Manage student accounts and permissions</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Registered students</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{totalStats.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Suspended</CardTitle>
                  <UserX className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{totalStats.suspendedUsers}</div>
                  <p className="text-xs text-muted-foreground">Account suspended</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
                  <Award className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">₹{totalStats.totalFines}</div>
                  <p className="text-xs text-muted-foreground">Outstanding amount</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name, student ID, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>
                          {dept === 'all' ? 'All Departments' : dept}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-blue-700">
                      {selectedUsers.length} user(s) selected
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                        Activate
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('suspend')}>
                        Suspend
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                        Export
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Users ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            onChange={handleSelectAll}
                            className="rounded"
                          />
                        </th>
                        <th className="text-left p-3">Student Details</th>
                        <th className="text-left p-3">Contact Info</th>
                        <th className="text-left p-3">Academic Info</th>
                        <th className="text-left p-3">Library Stats</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Last Activity</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-600">ID: {user.studentId}</div>
                              <div className="text-xs text-gray-500">Joined: {new Date(user.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <div className="flex items-center gap-1 mb-1">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="text-xs">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-xs">{user.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <div>{user.department}</div>
                              <div className="text-gray-600">{user.year} - Section {user.section}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <div>Total: {user.totalBorrowings}</div>
                              <div className="text-blue-600">Current: {user.currentBorrowings}</div>
                              {user.overdueBooks > 0 && (
                                <div className="text-red-600">Overdue: {user.overdueBooks}</div>
                              )}
                              {user.finesDue > 0 && (
                                <div className="text-yellow-600">Fine: ₹{user.finesDue}</div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              {new Date(user.lastActivity).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Add User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add New User</h2>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                ×
              </Button>
            </div>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Student ID</label>
                  <Input placeholder="e.g., APSIT001" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <Input placeholder="Student full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input type="email" placeholder="student@apsit.edu.in" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select department</option>
                    {departments.slice(1).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Section</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select section</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Add User</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
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
