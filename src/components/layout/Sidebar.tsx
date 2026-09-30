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
  History,
  QrCode,
  Scan,
  Megaphone,
} from 'lucide-react'

interface SidebarProps {
  userRole?: 'STUDENT' | 'ADMIN'
}

export default function Sidebar({ userRole = 'STUDENT' }: SidebarProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const handleToggle = () => setIsMobileMenuOpen(prev => !prev)
    const handleClose = () => setIsMobileMenuOpen(false)

    window.addEventListener('app-sidebar-toggle', handleToggle)
    window.addEventListener('app-sidebar-close', handleClose)

    return () => {
      window.removeEventListener('app-sidebar-toggle', handleToggle)
      window.removeEventListener('app-sidebar-close', handleClose)
    }
  }, [])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('app-sidebar-state-change', { detail: { open: isMobileMenuOpen } }))
    if (typeof document !== 'undefined') {
      document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isMobileMenuOpen])

  const studentMenuItems = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', href: '/student', icon: BarChart3 },
        { label: 'Seat Availability', href: '/student/seats', icon: Armchair },
      ]
    },
    {
      title: 'Updates',
      items: [
        { label: 'Broadcasts', href: '/student/broadcasts', icon: Megaphone },
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
        { label: 'My QR Code', href: '/student/qr-code', icon: QrCode },
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
        { label: 'QR Entry System', href: '/admin/qr-entry', icon: Scan },
        { label: 'Seat Management', href: '/admin/seats', icon: Armchair },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
      ]
    }
  ]

  const menuItems = userRole === 'ADMIN' ? adminMenuItems : studentMenuItems
  
  // Handle mobile view toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Close sidebar on item click in mobile view
  const handleMobileLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <>
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[1200] bg-slate-900/35 backdrop-blur-sm md:hidden"
          onClick={toggleMobileMenu}
          aria-label="Close navigation overlay"
        />
      )}

      {/* Sidebar - Desktop (fixed) and Mobile (slide-in) */}
      <aside
        id="app-mobile-sidebar"
        className={`fixed left-0 top-[70px] z-[1400] flex h-[calc(100vh-70px)] w-full max-w-xs transform border-r border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-xl transition-transform duration-300 ease-in-out md:w-64 md:max-w-none md:shadow-none ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        role="navigation"
        aria-label={userRole === 'ADMIN' ? 'Admin sidebar' : 'Student sidebar'}
        data-mobile-nav-panel={isMobileMenuOpen || undefined}
      >
        <div className="h-full w-full overflow-y-auto px-4 py-6 md:px-3 md:py-4">
          <nav className="space-y-6">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
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
                        onClick={handleMobileLinkClick}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600/90 to-blue-500/90 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                        } font-medium`}
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
    </>
  )
}
