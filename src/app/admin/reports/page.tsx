'use client'

import React, { useState } from 'react'
import { 
  FileText, 
  Download,
  Filter,
  Search,
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  FileBarChart,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import Header from '../../../components/layout/Header'
import Sidebar from '../../../components/layout/Sidebar'

// Types for report data
interface ReportSummary {
  totalStudents: number
  totalBooks: number
  activeLoans: number
  overdueBooks: number
  dailyVisitors: number
  weeklyGrowth: number
}

interface UsageReport {
  id: string
  type: string
  title: string
  description: string
  lastGenerated: string
  downloadCount: number
  status: 'ready' | 'processing' | 'pending'
}

interface OverdueReport {
  studentId: string
  studentName: string
  bookTitle: string
  dueDate: string
  daysOverdue: number
  fineAmount: number
}

export default function AdminReportsPage() {
  const [selectedDateRange, setSelectedDateRange] = useState('7days')
  const [reportType, setReportType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Mock data
  const [reportSummary] = useState<ReportSummary>({
    totalStudents: 2847,
    totalBooks: 15420,
    activeLoans: 1256,
    overdueBooks: 127,
    dailyVisitors: 423,
    weeklyGrowth: 12.5
  })

  const [availableReports] = useState<UsageReport[]>([
    {
      id: '1',
      type: 'usage',
      title: 'Library Usage Report',
      description: 'Comprehensive analysis of library usage patterns and student activity',
      lastGenerated: '2024-01-15 14:30',
      downloadCount: 45,
      status: 'ready'
    },
    {
      id: '2',
      type: 'inventory',
      title: 'Book Inventory Report',
      description: 'Complete inventory status including available and borrowed books',
      lastGenerated: '2024-01-15 09:15',
      downloadCount: 32,
      status: 'ready'
    },
    {
      id: '3',
      type: 'overdue',
      title: 'Overdue Books Report',
      description: 'List of overdue books with student details and fine calculations',
      lastGenerated: '2024-01-15 11:45',
      downloadCount: 28,
      status: 'ready'
    },
    {
      id: '4',
      type: 'analytics',
      title: 'Monthly Analytics Report',
      description: 'Detailed analytics with charts and performance metrics',
      lastGenerated: '2024-01-14 16:20',
      downloadCount: 67,
      status: 'processing'
    },
    {
      id: '5',
      type: 'student',
      title: 'Student Activity Report',
      description: 'Individual student borrowing patterns and library usage',
      lastGenerated: '2024-01-15 08:30',
      downloadCount: 41,
      status: 'ready'
    },
    {
      id: '6',
      type: 'fines',
      title: 'Fines and Penalties Report',
      description: 'Outstanding fines, payment history, and penalty analysis',
      lastGenerated: '2024-01-15 13:10',
      downloadCount: 23,
      status: 'pending'
    }
  ])

  const [overdueBooks] = useState<OverdueReport[]>([
    {
      studentId: 'ST2024001',
      studentName: 'Rahul Sharma',
      bookTitle: 'Data Structures and Algorithms',
      dueDate: '2024-01-10',
      daysOverdue: 5,
      fineAmount: 50
    },
    {
      studentId: 'ST2024078',
      studentName: 'Priya Patel',
      bookTitle: 'Computer Networks',
      dueDate: '2024-01-08',
      daysOverdue: 7,
      fineAmount: 70
    },
    {
      studentId: 'ST2024156',
      studentName: 'Amit Kumar',
      bookTitle: 'Machine Learning Basics',
      dueDate: '2024-01-12',
      daysOverdue: 3,
      fineAmount: 30
    }
  ])

  const handleGenerateReport = async (reportId: string) => {
    setIsGenerating(true)
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
    alert(`Report ${reportId} generated successfully!`)
  }

  const handleDownloadReport = (reportId: string, title: string) => {
    // Simulate download
    alert(`Downloading ${title} (ID: ${reportId})...`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-yellow-600 bg-yellow-100'
      case 'pending': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'pending': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredReports = availableReports.filter(report =>
    (reportType === 'all' || report.type === reportType) &&
    (report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     report.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole="ADMIN" />
      
      <div className="flex-1 flex flex-col overflow-hidden w-full md:ml-64">
        <Header />
        
        <main className="flex-1 overflow-y-auto px-4 pt-24 pb-12 sm:px-6 md:px-8 admin-reports-content">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <FileBarChart className="h-8 w-8 text-blue-600" />
                    Reports & Analytics
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Generate and download comprehensive library reports and analytics
                  </p>
                </div>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Data
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Students</p>
                      <p className="text-3xl font-bold text-blue-900">{reportSummary.totalStudents.toLocaleString()}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Total Books</p>
                      <p className="text-3xl font-bold text-green-900">{reportSummary.totalBooks.toLocaleString()}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Active Loans</p>
                      <p className="text-3xl font-bold text-purple-900">{reportSummary.activeLoans.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-medium">Overdue Books</p>
                      <p className="text-3xl font-bold text-red-900">{reportSummary.overdueBooks}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Report Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Range
                    </label>
                    <select 
                      value={selectedDateRange} 
                      onChange={(e) => setSelectedDateRange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                      <option value="3months">Last 3 Months</option>
                      <option value="6months">Last 6 Months</option>
                      <option value="1year">Last Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Type
                    </label>
                    <select 
                      value={reportType} 
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Reports</option>
                      <option value="usage">Usage Reports</option>
                      <option value="inventory">Inventory Reports</option>
                      <option value="analytics">Analytics Reports</option>
                      <option value="student">Student Reports</option>
                      <option value="fines">Financial Reports</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Reports
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Available Reports ({filteredReports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{report.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(report.status)}`}>
                              {getStatusIcon(report.status)}
                              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{report.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Last generated: {report.lastGenerated}</span>
                            <span>Downloads: {report.downloadCount}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateReport(report.id)}
                            disabled={isGenerating || report.status === 'processing'}
                            className="flex items-center gap-2"
                          >
                            {isGenerating ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <BarChart3 className="h-4 w-4" />
                            )}
                            Generate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReport(report.id, report.title)}
                            disabled={report.status !== 'ready'}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Overdue Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Quick Overdue Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Student ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Book Title</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Days Overdue</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Fine Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overdueBooks.map((book, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-blue-600 font-medium">{book.studentId}</td>
                          <td className="py-3 px-4">{book.studentName}</td>
                          <td className="py-3 px-4">{book.bookTitle}</td>
                          <td className="py-3 px-4">
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                              {book.daysOverdue} days
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-red-600">₹{book.fineAmount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  )
}
