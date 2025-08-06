'use client'

import React, { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Clock, 
  Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
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

export default function AdminAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  // Mock analytics data
  const dailyUsageData = [
    { day: 'Mon', visitors: 45, borrowings: 12, returns: 8 },
    { day: 'Tue', visitors: 52, borrowings: 15, returns: 10 },
    { day: 'Wed', visitors: 38, borrowings: 9, returns: 13 },
    { day: 'Thu', visitors: 61, borrowings: 18, returns: 11 },
    { day: 'Fri', visitors: 73, borrowings: 22, returns: 15 },
    { day: 'Sat', visitors: 29, borrowings: 7, returns: 9 },
    { day: 'Sun', visitors: 24, borrowings: 5, returns: 6 }
  ]

  const monthlyTrendData = [
    { month: 'Jan', borrowings: 245, visitors: 1250, returns: 238 },
    { month: 'Feb', borrowings: 278, visitors: 1380, returns: 265 },
    { month: 'Mar', borrowings: 312, visitors: 1520, returns: 298 },
    { month: 'Apr', borrowings: 289, visitors: 1420, returns: 301 },
    { month: 'May', borrowings: 334, visitors: 1680, returns: 315 },
    { month: 'Jun', borrowings: 298, visitors: 1540, returns: 289 },
    { month: 'Jul', borrowings: 356, visitors: 1820, returns: 342 },
    { month: 'Aug', borrowings: 289, visitors: 1450, returns: 298 },
    { month: 'Sep', borrowings: 378, visitors: 1920, returns: 365 },
    { month: 'Oct', borrowings: 345, visitors: 1750, returns: 334 },
    { month: 'Nov', borrowings: 298, visitors: 1580, returns: 312 },
    { month: 'Dec', borrowings: 267, visitors: 1340, returns: 278 }
  ]

  const categoryData = [
    { name: 'Computer Science', value: 35, count: 156 },
    { name: 'Electronics', value: 25, count: 112 },
    { name: 'Mechanical', value: 20, count: 89 },
    { name: 'Mathematics', value: 12, count: 54 },
    { name: 'Physics', value: 8, count: 36 }
  ]

  const peakHoursData = [
    { hour: '9AM', usage: 15 },
    { hour: '10AM', usage: 32 },
    { hour: '11AM', usage: 45 },
    { hour: '12PM', usage: 38 },
    { hour: '1PM', usage: 28 },
    { hour: '2PM', usage: 52 },
    { hour: '3PM', usage: 68 },
    { hour: '4PM', usage: 55 },
    { hour: '5PM', usage: 42 },
    { hour: '6PM', usage: 25 }
  ]

  const departmentStats = [
    { department: 'Computer Science', students: 120, borrowings: 45, avgBooks: 2.3 },
    { department: 'Electronics', students: 95, borrowings: 32, avgBooks: 1.8 },
    { department: 'Mechanical', students: 110, borrowings: 28, avgBooks: 1.5 },
    { department: 'Civil', students: 85, borrowings: 18, avgBooks: 1.2 },
    { department: 'Information Technology', students: 75, borrowings: 25, avgBooks: 2.1 }
  ]

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  const overallStats = {
    totalVisitors: 1580,
    totalBorrowings: 298,
    totalReturns: 312,
    totalFines: 2450,
    growthRate: 12.5,
    mostBorrowedCategory: 'Computer Science',
    peakHour: '3PM',
    activeDepartment: 'Computer Science'
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
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-1">Monitor library usage and performance metrics</p>
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.totalVisitors.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{overallStats.growthRate}% from last period
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Books Borrowed</CardTitle>
                  <BookOpen className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.totalBorrowings}</div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.2% from last period
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Books Returned</CardTitle>
                  <BookOpen className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.totalReturns}</div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +4.7% from last period
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fines Collected</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{overallStats.totalFines.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-red-600">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -2.1% from last period
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Usage Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Library Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dailyUsageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="visitors" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="borrowings" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Popular Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="borrowings" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="visitors" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Peak Hours */}
              <Card>
                <CardHeader>
                  <CardTitle>Peak Usage Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={peakHoursData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="usage" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Department Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Department</th>
                        <th className="text-left p-3">Total Students</th>
                        <th className="text-left p-3">Active Borrowings</th>
                        <th className="text-left p-3">Avg Books/Student</th>
                        <th className="text-left p-3">Engagement Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentStats.map((dept) => (
                        <tr key={dept.department} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{dept.department}</td>
                          <td className="p-3">{dept.students}</td>
                          <td className="p-3">{dept.borrowings}</td>
                          <td className="p-3">{dept.avgBooks}</td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${(dept.borrowings / dept.students) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm">
                                {Math.round((dept.borrowings / dept.students) * 100)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>Library usage increased by {overallStats.growthRate}% this period</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span>{overallStats.mostBorrowedCategory} is the most popular category</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span>Peak usage time is {overallStats.peakHour}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>{overallStats.activeDepartment} students are most active</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>• Consider extending operating hours during 3-4 PM peak period</div>
                  <div>• Increase Computer Science book inventory based on high demand</div>
                  <div>• Implement promotional activities for underperforming departments</div>
                  <div>• Review fine policies to improve return rates</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <Clock className="h-4 w-4" />
                    <span>5 books overdue by more than 7 days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-yellow-600">
                    <BookOpen className="h-4 w-4" />
                    <span>3 book categories running low on stock</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Users className="h-4 w-4" />
                    <span>12 new user registrations pending approval</span>
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
