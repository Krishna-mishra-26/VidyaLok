# Analytics Dashboard - Backend Integration Guide

This document explains how to integrate the Analytics Dashboard with your backend API.

## Overview

The analytics dashboard is currently using mock data but is structured to easily connect to real backend APIs. All the mock data functions need to be replaced with actual API calls.

## Required API Endpoints

### 1. Main Analytics Endpoint
```
GET /api/admin/analytics?days={number}
```
**Purpose**: Get all analytics data for the specified number of days
**Response**: 
```json
{
  "dailyUsage": [...],
  "categories": [...],
  "monthlyTrends": [...],
  "peakHours": [...],
  "departmentStats": [...],
  "keyMetrics": {...}
}
```

### 2. Key Metrics Endpoint
```
GET /api/admin/analytics/metrics
```
**Purpose**: Get key performance indicators
**Response**:
```json
{
  "totalUsers": 1247,
  "activeUsers": 892,
  "totalBooks": 15630,
  "borrowedBooks": 3456,
  "overdueBooks": 234,
  "newRegistrations": 67,
  "dailyEntries": 156,
  "popularBook": "Data Structures and Algorithms",
  "busyHour": "2-3 PM",
  "satisfaction": 4.6
}
```

### 3. Daily Usage Endpoint
```
GET /api/admin/analytics/daily-usage?days={number}
```
**Purpose**: Get daily usage statistics
**Response**:
```json
[
  {
    "date": "2025-01-01",
    "users": 45,
    "books": 67,
    "entries": 89
  },
  ...
]
```

### 4. Category Distribution Endpoint
```
GET /api/admin/analytics/categories
```
**Purpose**: Get book category distribution
**Response**:
```json
[
  {
    "name": "Computer Science",
    "value": 35,
    "color": "#3b82f6"
  },
  ...
]
```

### 5. Monthly Trends Endpoint
```
GET /api/admin/analytics/monthly-trends?months={number}
```
**Purpose**: Get monthly borrowing/return trends
**Response**:
```json
[
  {
    "month": "Jan",
    "borrowings": 234,
    "returns": 198,
    "newBooks": 45
  },
  ...
]
```

### 6. Peak Hours Endpoint
```
GET /api/admin/analytics/peak-hours
```
**Purpose**: Get library usage by hour
**Response**:
```json
[
  {
    "hour": "9 AM",
    "users": 12
  },
  ...
]
```

### 7. Department Statistics Endpoint
```
GET /api/admin/analytics/departments
```
**Purpose**: Get statistics by department
**Response**:
```json
[
  {
    "department": "Computer Engineering",
    "students": 156,
    "avgBorrowings": 4.2,
    "engagementRate": 78
  },
  ...
]
```

## Database Queries Needed

### For Key Metrics:
1. **Total Users**: `SELECT COUNT(*) FROM users`
2. **Active Users**: `SELECT COUNT(*) FROM users WHERE last_login > DATE_SUB(NOW(), INTERVAL 30 DAY)`
3. **Total Books**: `SELECT COUNT(*) FROM books`
4. **Borrowed Books**: `SELECT COUNT(*) FROM book_transactions WHERE status = 'borrowed'`
5. **Overdue Books**: `SELECT COUNT(*) FROM book_transactions WHERE due_date < NOW() AND status = 'borrowed'`
6. **New Registrations**: `SELECT COUNT(*) FROM users WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)`
7. **Daily Entries**: `SELECT COUNT(*) FROM entry_logs WHERE DATE(created_at) = CURDATE()`
8. **Popular Book**: `SELECT book_title, COUNT(*) as borrow_count FROM book_transactions GROUP BY book_id ORDER BY borrow_count DESC LIMIT 1`
9. **Busy Hour**: `SELECT HOUR(created_at) as hour, COUNT(*) as entries FROM entry_logs GROUP BY hour ORDER BY entries DESC LIMIT 1`

### For Daily Usage:
```sql
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT user_id) as users,
    COUNT(CASE WHEN action = 'borrow' THEN 1 END) as books,
    COUNT(*) as entries
FROM entry_logs 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
GROUP BY DATE(created_at)
ORDER BY date
```

### For Category Distribution:
```sql
SELECT 
    c.name,
    COUNT(bt.id) * 100.0 / (SELECT COUNT(*) FROM book_transactions) as value,
    c.color
FROM categories c
LEFT JOIN books b ON c.id = b.category_id
LEFT JOIN book_transactions bt ON b.id = bt.book_id
WHERE bt.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY c.id, c.name, c.color
ORDER BY value DESC
```

### For Peak Hours:
```sql
SELECT 
    CONCAT(HOUR(created_at), ' ', IF(HOUR(created_at) < 12, 'AM', 'PM')) as hour,
    COUNT(DISTINCT user_id) as users
FROM entry_logs 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY HOUR(created_at)
ORDER BY HOUR(created_at)
```

### For Department Stats:
```sql
SELECT 
    u.department,
    COUNT(DISTINCT u.id) as students,
    AVG(bt_count.borrow_count) as avgBorrowings,
    (COUNT(DISTINCT CASE WHEN el.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN u.id END) * 100.0 / COUNT(DISTINCT u.id)) as engagementRate
FROM users u
LEFT JOIN entry_logs el ON u.id = el.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as borrow_count 
    FROM book_transactions 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    GROUP BY user_id
) bt_count ON u.id = bt_count.user_id
WHERE u.role = 'STUDENT'
GROUP BY u.department
ORDER BY engagementRate DESC
```

## Implementation Steps

1. **Replace Mock Data Functions**: 
   - Update `fetchAnalyticsData()` in `analytics/page.tsx`
   - Use the functions from `lib/analytics-api.ts`

2. **Add Authentication**:
   - Include JWT tokens or session cookies in API requests
   - Verify admin permissions on backend

3. **Error Handling**:
   - Add proper error states in the UI
   - Handle network failures gracefully
   - Show user-friendly error messages

4. **Performance Optimization**:
   - Implement caching for analytics data
   - Add pagination for large datasets
   - Use database indexes on frequently queried columns

5. **Real-time Updates**:
   - Consider WebSocket connections for live data
   - Implement auto-refresh functionality
   - Add push notifications for important metrics

## Database Schema Requirements

Make sure your database has these tables:
- `users` (id, name, email, department, role, created_at, last_login)
- `books` (id, title, author, isbn, category_id, status)
- `categories` (id, name, color)
- `book_transactions` (id, user_id, book_id, action, status, due_date, created_at)
- `entry_logs` (id, user_id, action, created_at)

## Testing

1. Test each endpoint individually
2. Verify data accuracy with manual database queries
3. Test with different date ranges
4. Check performance with large datasets
5. Test error scenarios (network failures, invalid data)

## Security Considerations

1. Validate all input parameters
2. Implement rate limiting
3. Use prepared statements to prevent SQL injection
4. Require admin authentication for all analytics endpoints
5. Log access to sensitive analytics data

## Next.js API Route Example

```typescript
// pages/api/admin/analytics/metrics.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getKeyMetrics } from '@/lib/database'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Verify admin authentication
    // const user = await verifyAuth(req)
    // if (user.role !== 'ADMIN') {
    //   return res.status(403).json({ message: 'Forbidden' })
    // }

    const metrics = await getKeyMetrics()
    res.status(200).json(metrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
```
