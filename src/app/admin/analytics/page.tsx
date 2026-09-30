'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Clock, 
  Download,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import Header from '../../../components/layout/Header'
import Sidebar from '../../../components/layout/Sidebar'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'

// Types for analytics data
interface DailyUsageData {
  date: string
  users: number
  books: number
  entries: number
}

interface CategoryData {
  name: string
  value: number
  color: string
}

interface MonthlyTrendsData {
  month: string
  borrowings: number
  returns: number
  newBooks: number
}

interface PeakHoursData {
  hour: string
  users: number
}

interface DepartmentStats {
  department: string
  students: number
  avgBorrowings: number
  engagementRate: number
}

interface KeyMetrics {
  totalUsers: number
  activeUsers: number
  totalBooks: number
  borrowedBooks: number
  overdueBooks: number
  newRegistrations: number
  dailyEntries: number
  popularBook: string
  busyHour: string
  satisfaction: number
}

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30')
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  
  // State for analytics data
  const [dailyUsageData, setDailyUsageData] = useState<DailyUsageData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [monthlyTrendsData, setMonthlyTrendsData] = useState<MonthlyTrendsData[]>([])
  const [peakHoursData, setPeakHoursData] = useState<PeakHoursData[]>([])
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([])
  const [keyMetrics, setKeyMetrics] = useState<KeyMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalBooks: 0,
    borrowedBooks: 0,
    overdueBooks: 0,
    newRegistrations: 0,
    dailyEntries: 0,
    popularBook: '',
    busyHour: '',
    satisfaction: 0
  })

  // Mock user data
  const user = {
    name: "Library Admin",
    role: "ADMIN" as const,
    studentId: "ADMIN001"
  }

  const loadMockData = useCallback(async (days: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate data based on date range
    const daysCount = parseInt(days)
    const now = new Date()
    
    // Daily usage data
    const dailyData: DailyUsageData[] = []
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      dailyData.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 50) + 30,
        books: Math.floor(Math.random() * 40) + 40,
        entries: Math.floor(Math.random() * 60) + 60
      })
    }
    setDailyUsageData(dailyData)

    // Category data (could come from book categories in database)
    setCategoryData([
      { name: 'Computer Science', value: 35, color: '#3b82f6' },
      { name: 'Mathematics', value: 25, color: '#10b981' },
      { name: 'Physics', value: 20, color: '#f59e0b' },
      { name: 'Chemistry', value: 12, color: '#ef4444' },
      { name: 'Literature', value: 8, color: '#8b5cf6' }
    ])

    // Monthly trends (could come from transaction history)
    setMonthlyTrendsData([
      { month: 'Jan', borrowings: 234, returns: 198, newBooks: 45 },
      { month: 'Feb', borrowings: 267, returns: 245, newBooks: 38 },
      { month: 'Mar', borrowings: 298, returns: 276, newBooks: 52 },
      { month: 'Apr', borrowings: 321, returns: 298, newBooks: 41 },
      { month: 'May', borrowings: 289, returns: 267, newBooks: 47 },
      { month: 'Jun', borrowings: 356, returns: 334, newBooks: 59 }
    ])

    // Peak hours (could come from entry/exit logs)
    setPeakHoursData([
      { hour: '9 AM', users: 12 },
      { hour: '10 AM', users: 28 },
      { hour: '11 AM', users: 45 },
      { hour: '12 PM', users: 52 },
      { hour: '1 PM', users: 38 },
      { hour: '2 PM', users: 61 },
      { hour: '3 PM', users: 73 },
      { hour: '4 PM', users: 67 },
      { hour: '5 PM', users: 49 },
      { hour: '6 PM', users: 34 },
      { hour: '7 PM', users: 22 },
      { hour: '8 PM', users: 15 }
    ])

    // Department stats (could come from user departments)
    setDepartmentStats([
      { department: 'Computer Engineering', students: 156, avgBorrowings: 4.2, engagementRate: 78 },
      { department: 'Electronics Engineering', students: 142, avgBorrowings: 3.8, engagementRate: 72 },
      { department: 'Mechanical Engineering', students: 134, avgBorrowings: 3.5, engagementRate: 65 },
      { department: 'Civil Engineering', students: 128, avgBorrowings: 3.2, engagementRate: 62 },
      { department: 'Information Technology', students: 118, avgBorrowings: 4.5, engagementRate: 82 }
    ])

    // Key metrics (could come from various database queries)
    setKeyMetrics({
      totalUsers: 1247,
      activeUsers: 892,
      totalBooks: 15630,
      borrowedBooks: 3456,
      overdueBooks: 234,
      newRegistrations: 67,
      dailyEntries: 156,
      popularBook: "Data Structures and Algorithms",
      busyHour: "2-3 PM",
      satisfaction: 4.6
    })
  }, [])

  const fetchAnalyticsData = useCallback(async (days: string) => {
    setLoading(true)
    try {
      // TODO: Replace with actual API calls
      // const response = await fetch(`/api/analytics?days=${days}`)
      // const data = await response.json()
      
      // For now, use mock data but structure it like real API responses
      await loadMockData(days)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      setLoading(false)
    }
  }, [loadMockData])

  // Load data on component mount and when date range changes
  useEffect(() => {
    fetchAnalyticsData(dateRange)
  }, [dateRange, fetchAnalyticsData])

  const handleRefresh = () => {
    fetchAnalyticsData(dateRange)
  }

  const getCategoryColorClass = (color: string) => {
    switch (color) {
      case '#3b82f6': return 'chart-legend-blue'
      case '#10b981': return 'chart-legend-green'
      case '#f59e0b': return 'chart-legend-orange'
      case '#ef4444': return 'chart-legend-red'
      case '#8b5cf6': return 'chart-legend-purple'
      default: return 'chart-legend-blue'
    }
  }

  const exportAnalytics = () => {
    const analyticsData = {
      keyMetrics,
      dailyUsage: dailyUsageData,
      categoryDistribution: categoryData,
      monthlyTrends: monthlyTrendsData,
      peakHours: peakHoursData,
      departmentStats
    }

    const dataStr = JSON.stringify(analyticsData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `library_analytics_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ color: '#1f2937' }}>
      <Header user={user} />
      
      <div className="flex flex-1">
        <Sidebar userRole="ADMIN" />
        
  <main className="flex-1 w-full px-4 pt-24 pb-12 sm:px-6 md:ml-64 student-main admin-analytics-content">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900" style={{ color: '#111827' }}>
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600" style={{ color: '#4b5563' }}>
                  Comprehensive library usage insights and statistics
                </p>
                <p className="text-xs text-gray-500" style={{ color: '#6b7280' }}>
                  Last updated: {lastUpdated.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  disabled={loading}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:opacity-50"
                  style={{ color: '#111827' }}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 3 months</option>
                  <option value="365">Last year</option>
                </select>
                <Button 
                  onClick={handleRefresh} 
                  disabled={loading}
                  className="flex items-center space-x-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                </Button>
                <Button 
                  onClick={exportAnalytics} 
                  disabled={loading}
                  className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Data</span>
                </Button>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-5 w-5 text-blue-600" style={{ color: '#2563eb' }} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900" style={{ color: '#111827' }}>
                    {keyMetrics.activeUsers.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>
                    Active Users
                  </p>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+12%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BookOpen className="h-5 w-5 text-green-600" style={{ color: '#059669' }} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900" style={{ color: '#111827' }}>
                    {keyMetrics.borrowedBooks.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>
                    Books Borrowed
                  </p>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+8%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-orange-600" style={{ color: '#ea580c' }} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900" style={{ color: '#111827' }}>
                    {keyMetrics.overdueBooks}
                  </div>
                  <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>
                    Overdue Books
                  </p>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    <span className="text-xs text-red-600">-3%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-5 w-5 text-purple-600" style={{ color: '#9333ea' }} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900" style={{ color: '#111827' }}>
                    {keyMetrics.newRegistrations}
                  </div>
                  <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>
                    New Registrations
                  </p>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+15%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-indigo-600" style={{ color: '#4f46e5' }} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900" style={{ color: '#111827' }}>
                    {keyMetrics.dailyEntries}
                  </div>
                  <p className="text-sm text-gray-600" style={{ color: '#4b5563' }}>
                    Daily Entries
                  </p>
                  <div className="flex items-center justify-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+7%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Usage Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>Daily Usage Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-500">Loading chart data...</span>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyUsageData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#6b7280"
                            fontSize={12}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb', 
                              borderRadius: '8px',
                              color: '#111827'
                            }}
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="users" 
                            stackId="1"
                            stroke="#3b82f6" 
                            fill="#3b82f6" 
                            fillOpacity={0.7}
                            name="Users"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="entries" 
                            stackId="1"
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.7}
                            name="Entries"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <span>Popular Categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px',
                            color: '#111827'
                          }}
                          formatter={(value) => [`${value}%`, 'Percentage']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {categoryData.map((category, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div 
                          className={`chart-legend-indicator ${getCategoryColorClass(category.color)}`}
                        ></div>
                        <span className="text-sm text-gray-700" style={{ color: '#374151' }}>
                          {category.name} ({category.value}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span>Monthly Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px',
                            color: '#111827'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="borrowings" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                          name="Borrowings"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="returns" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                          name="Returns"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="newBooks" 
                          stroke="#f59e0b" 
                          strokeWidth={3}
                          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                          name="New Books"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Peak Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span>Peak Hours</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={peakHoursData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px',
                            color: '#111827'
                          }}
                        />
                        <Bar 
                          dataKey="users" 
                          fill="#f59e0b"
                          radius={[4, 4, 0, 0]}
                          name="Users"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Statistics Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2" style={{ color: '#1f2937' }}>
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span>Department Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead>
                      <tr style={{ backgroundColor: 'transparent' }}>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-2/5" style={{ color: '#374151' }}>
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/6" style={{ color: '#374151' }}>
                          Students
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/6" style={{ color: '#374151' }}>
                          Avg Borrowings
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/4" style={{ color: '#374151' }}>
                          Engagement Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200" style={{ backgroundColor: 'white' }}>
                      {departmentStats.map((dept, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#111827' }}>
                            {dept.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#374151' }}>
                            {dept.students}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#374151' }}>
                            {dept.avgBorrowings}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm w-1/4" style={{ color: '#374151' }}>
                            <div className="flex items-center w-full">
                              <div className="bg-gray-200 rounded-full h-2 mr-2" style={{ width: '100px' }}>
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${dept.engagementRate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-700">{dept.engagementRate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg" style={{ color: '#1f2937' }}>Quick Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#111827' }}>Most Popular Book</p>
                      <p className="text-xs text-gray-600" style={{ color: '#4b5563' }}>{keyMetrics.popularBook}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#111827' }}>Busiest Hour</p>
                      <p className="text-xs text-gray-600" style={{ color: '#4b5563' }}>{keyMetrics.busyHour}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#111827' }}>Satisfaction Rate</p>
                      <p className="text-xs text-gray-600" style={{ color: '#4b5563' }}>{keyMetrics.satisfaction}/5.0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg" style={{ color: '#1f2937' }}>System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#374151' }}>Database</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#374151' }}>API Response</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Fast</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#374151' }}>Storage</span>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">75% Used</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg" style={{ color: '#1f2937' }}>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium" style={{ color: '#111827' }}>New book added</p>
                    <p className="text-xs text-gray-600" style={{ color: '#4b5563' }}>5 minutes ago</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium" style={{ color: '#111827' }}>Student registered</p>
                    <p className="text-xs text-gray-600" style={{ color: '#4b5563' }}>12 minutes ago</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium" style={{ color: '#111827' }}>Overdue alert sent</p>
                    <p className="text-xs text-gray-600" style={{ color: '#4b5563' }}>1 hour ago</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
