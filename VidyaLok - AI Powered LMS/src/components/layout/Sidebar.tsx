'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  Users,
  BarChart3,
  Settings,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  FileText,
  Armchair,
  Clock,
  PlusCircle,
  History
} from 'lucide-react'

interface SidebarProps {
  userRole?: 'STUDENT' | 'ADMIN'
}

export default function Sidebar({ userRole = 'STUDENT' }: SidebarProps) {
  const pathname = usePathname()

  const studentMenuItems = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', href: '/student', icon: BarChart3 },
        { label: 'Seat Availability', href: '/student/seats', icon: Armchair },
      ]
    },
    {
      title: 'Books',
      items: [
        { label: 'Search Books', href: '/student/books', icon: BookOpen },
        { label: 'My Borrowings', href: '/student/borrowings', icon: CreditCard },
        { label: 'Borrowing History', href: '/student/history', icon: History },
        { label: 'Request Book', href: '/student/request', icon: PlusCircle },
      ]
    },
    {
      title: 'Profile',
      items: [
        { label: 'Entry/Exit Logs', href: '/student/logs', icon: Clock },
        { label: 'Feedback', href: '/student/feedback', icon: MessageSquare },
        { label: 'Settings', href: '/student/settings', icon: Settings },
      ]
    }
  ]

  const adminMenuItems = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', href: '/admin', icon: BarChart3 },
        { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
        { label: 'Reports', href: '/admin/reports', icon: FileText },
      ]
    },
    {
      title: 'Management',
      items: [
        { label: 'Book Inventory', href: '/admin/books', icon: BookOpen },
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Borrowings', href: '/admin/borrowings', icon: CreditCard },
        { label: 'Entry/Exit Logs', href: '/admin/logs', icon: Clock },
      ]
    },
    {
      title: 'Communication',
      items: [
        { label: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
        { label: 'Broadcasts', href: '/admin/broadcasts', icon: AlertTriangle },
        { label: 'Book Requests', href: '/admin/requests', icon: PlusCircle },
      ]
    },
    {
      title: 'System',
      items: [
        { label: 'Seat Management', href: '/admin/seats', icon: Armchair },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
      ]
    }
  ]

  const menuItems = userRole === 'ADMIN' ? adminMenuItems : studentMenuItems

  return (
    <aside className="fixed left-0 z-30 w-64 border-r" style={{top: '80px', height: 'calc(100vh - 80px)', background: 'rgba(255, 255, 255, 0.95)', borderRight: '1px solid rgba(0, 102, 204, 0.1)'}}>
      <div className="h-full px-3 py-4 overflow-y-auto">
        <nav className="space-y-6">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider" style={{color: '#4a5568'}}>
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-blue-50 ${
                          isActive
                            ? 'font-medium'
                            : ''
                        }`}
                        style={{
                          color: isActive ? '#0066cc' : '#4a5568',
                          background: isActive ? 'rgba(0, 102, 204, 0.1)' : 'transparent'
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
