// Analytics API functions
// Replace these with actual API calls when backend is ready

export interface AnalyticsApiResponse {
  dailyUsage: DailyUsageData[]
  categories: CategoryData[]
  monthlyTrends: MonthlyTrendsData[]
  peakHours: PeakHoursData[]
  departmentStats: DepartmentStats[]
  keyMetrics: KeyMetrics
}

export interface DailyUsageData {
  date: string
  users: number
  books: number
  entries: number
}

export interface CategoryData {
  name: string
  value: number
  color: string
}

export interface MonthlyTrendsData {
  month: string
  borrowings: number
  returns: number
  newBooks: number
}

export interface PeakHoursData {
  hour: string
  users: number
}

export interface DepartmentStats {
  department: string
  students: number
  avgBorrowings: number
  engagementRate: number
}

export interface KeyMetrics {
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

/**
 * Fetch analytics data from the backend
 * @param days Number of days to fetch data for
 * @returns Promise<AnalyticsApiResponse>
 */
export async function fetchAnalyticsData(days: string): Promise<AnalyticsApiResponse> {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch(`/api/admin/analytics?days=${days}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers here
        // 'Authorization': `Bearer ${token}`
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    throw error
  }
}

/**
 * Fetch key metrics from the backend
 * @returns Promise<KeyMetrics>
 */
export async function fetchKeyMetrics(): Promise<KeyMetrics> {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch('/api/admin/analytics/metrics', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching key metrics:', error)
    throw error
  }
}

/**
 * Fetch daily usage statistics
 * @param days Number of days to fetch
 * @returns Promise<DailyUsageData[]>
 */
export async function fetchDailyUsage(days: string): Promise<DailyUsageData[]> {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch(`/api/admin/analytics/daily-usage?days=${days}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching daily usage:', error)
    throw error
  }
}

/**
 * Fetch book category distribution
 * @returns Promise<CategoryData[]>
 */
export async function fetchCategoryDistribution(): Promise<CategoryData[]> {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch('/api/admin/analytics/categories')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching category distribution:', error)
    throw error
  }
}

/**
 * Fetch monthly trends data
 * @param months Number of months to fetch
 * @returns Promise<MonthlyTrendsData[]>
 */
export async function fetchMonthlyTrends(months: number = 6): Promise<MonthlyTrendsData[]> {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch(`/api/admin/analytics/monthly-trends?months=${months}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching monthly trends:', error)
    throw error
  }
}

/**
 * Fetch peak hours data
 * @returns Promise<PeakHoursData[]>
 */
export async function fetchPeakHours(): Promise<PeakHoursData[]> {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch('/api/admin/analytics/peak-hours')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching peak hours:', error)
    throw error
  }
}

/**
 * Fetch department statistics
 * @returns Promise<DepartmentStats[]>
 */
export async function fetchDepartmentStats(): Promise<DepartmentStats[]> {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch('/api/admin/analytics/departments')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching department stats:', error)
    throw error
  }
}

/**
 * Export analytics data
 * @param data Analytics data to export
 * @param filename Optional filename
 */
export function exportAnalyticsToJSON(data: AnalyticsApiResponse, filename?: string) {
  const dataStr = JSON.stringify(data, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const exportFileDefaultName = filename || `library_analytics_${new Date().toISOString().split('T')[0]}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

/**
 * Export analytics data as CSV
 * @param data Analytics data to export
 * @param filename Optional filename
 */
export function exportAnalyticsToCSV(data: AnalyticsApiResponse, filename?: string) {
  // Convert analytics data to CSV format
  const csvContent = [
    // Key Metrics
    ['Metric', 'Value'],
    ['Total Users', data.keyMetrics.totalUsers.toString()],
    ['Active Users', data.keyMetrics.activeUsers.toString()],
    ['Total Books', data.keyMetrics.totalBooks.toString()],
    ['Borrowed Books', data.keyMetrics.borrowedBooks.toString()],
    ['Overdue Books', data.keyMetrics.overdueBooks.toString()],
    ['New Registrations', data.keyMetrics.newRegistrations.toString()],
    ['Daily Entries', data.keyMetrics.dailyEntries.toString()],
    ['Popular Book', data.keyMetrics.popularBook],
    ['Busy Hour', data.keyMetrics.busyHour],
    ['Satisfaction', data.keyMetrics.satisfaction.toString()],
    [''], // Empty row
    
    // Daily Usage
    ['Date', 'Users', 'Books', 'Entries'],
    ...data.dailyUsage.map(row => [row.date, row.users.toString(), row.books.toString(), row.entries.toString()]),
    [''], // Empty row
    
    // Categories
    ['Category', 'Percentage'],
    ...data.categories.map(row => [row.name, row.value.toString()]),
    [''], // Empty row
    
    // Department Stats
    ['Department', 'Students', 'Avg Borrowings', 'Engagement Rate'],
    ...data.departmentStats.map(row => [
      row.department, 
      row.students.toString(), 
      row.avgBorrowings.toString(), 
      row.engagementRate.toString()
    ])
  ].map(row => row.join(',')).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  
  const exportFileDefaultName = filename || `library_analytics_${new Date().toISOString().split('T')[0]}.csv`
  
  const a = document.createElement('a')
  a.href = url
  a.download = exportFileDefaultName
  a.click()
  URL.revokeObjectURL(url)
}
