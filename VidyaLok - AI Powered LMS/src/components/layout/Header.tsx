'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Users, BarChart3, Settings, LogOut, Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface HeaderProps {
  user?: {
    name: string
    role: string
    studentId: string
  }
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname()

  const studentNavItems = [
    { label: 'Dashboard', href: '/student', icon: BarChart3 },
    { label: 'Books', href: '/student/books', icon: BookOpen },
    { label: 'My Borrowings', href: '/student/borrowings', icon: Users },
    { label: 'Feedback', href: '/student/feedback', icon: Settings },
  ]

  const adminNavItems = [
    { label: 'Dashboard', href: '/admin', icon: BarChart3 },
    { label: 'Books', href: '/admin/books', icon: BookOpen },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const navItems = user?.role === 'ADMIN' ? adminNavItems : studentNavItems

  return (
    <header className="premium-header-enhanced">
      <nav className="premium-nav-enhanced">
        {/* Logo Section */}
        <Link href="/" className="premium-logo-enhanced">
          <div className="logo-container">
            <div className="logo-icon">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div className="logo-glow"></div>
          </div>
          <div className="logo-text-container">
            <span className="premium-logo-text-enhanced">VidyaLok</span>
            <span className="logo-subtitle">Smart Library</span>
          </div>
        </Link>

        {/* Navigation Menu */}
        {user && (
          <div className="nav-menu-container">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`premium-nav-link-enhanced ${isActive ? 'active' : ''}`}
                >
                  <div className="nav-link-content">
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  <div className="nav-link-indicator"></div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Right Section: Search + User Menu */}
        {user && (
          <div className="navbar-right-section">
            {/* Enhanced Search Bar */}
            <div className="search-container-enhanced">
              <div className="search-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search everything..."
                  className="search-input-enhanced"
                />
                <div className="search-highlight"></div>
              </div>
            </div>

            {/* Enhanced User Menu */}
            <div className="user-menu-enhanced">
              <button className="notification-btn">
                <Bell className="h-5 w-5" />
                <div className="notification-badge">3</div>
              </button>
              
              <div className="user-profile-section">
                <div className="user-avatar">
                  <span className="avatar-text">{user.name.charAt(0)}</span>
                  <div className="avatar-ring"></div>
                </div>
                <div className="user-info">
                  <p className="user-name">{user.name}</p>
                  <p className="user-id">{user.studentId}</p>
                </div>
                
                <button className="logout-btn">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
