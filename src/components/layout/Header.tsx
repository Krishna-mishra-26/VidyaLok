'use client'

import React, { useState, useRef, KeyboardEvent, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { BookOpen, Users, BarChart3, Settings, LogOut, Bell, Search, Menu, X, Phone, Mail, ListChecks, ChevronDown } from 'lucide-react'

/**
 * Header / Global Navigation Bar (Navbar 2.0)
 * - High performance, accessible, role-aware navigation.
 * - Uses design tokens defined in navbar-modern.css.
 * - Automatically adapts for homepage (marketing) vs authenticated areas.
 */
interface HeaderProps {
  user?: {
    name: string
    role: string
    studentId: string
  }
}

export default function Header({ user }: HeaderProps) {
  // Session fallback ensures consistent navbar user cluster across admin routes
  const { data: session } = useSession()
  const sessionUser = session?.user
  const pathname = usePathname()
  const router = useRouter()
  // Mobile menu removed for minimalist homepage spec
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [currentSection, setCurrentSection] = useState<string>('home')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isHomepage = pathname === '/'
  const isAdminRoute = pathname.startsWith('/admin')
  const isStudentRoute = pathname.startsWith('/student')

  const rawRole = (user?.role || sessionUser?.role)?.toUpperCase?.() ?? (isAdminRoute ? 'ADMIN' : isStudentRoute ? 'STUDENT' : 'GENERAL')
  const derivedRole: 'ADMIN' | 'STUDENT' | 'GENERAL' = rawRole === 'ADMIN' ? 'ADMIN' : rawRole === 'STUDENT' ? 'STUDENT' : 'GENERAL'

  // Refs for keyboard navigation across nav links
  const navContainerRef = useRef<HTMLDivElement | null>(null)
  const navLinkRefs = useRef<HTMLAnchorElement[]>([])

  const studentNavItems = [
    { label: 'Dashboard', href: '/student', icon: BarChart3 },
    { label: 'Books', href: '/student/books', icon: BookOpen },
    { label: 'My Borrowings', href: '/student/borrowings', icon: Users },
    { label: 'Feedback', href: '/student/feedback', icon: Settings },
  ]

  const adminNavItems = [
    { label: 'Dashboard', href: '/admin', icon: BarChart3 },
    { label: 'Books', href: '/admin/books', icon: BookOpen },
    { label: 'Requests', href: '/admin/requests', icon: ListChecks },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]
  // Quick actions removed for consistency across admin pages

  // Remove command palette (requested) – retained quick actions only
  // Removed command palette & quick menu key handling

  const navItems = derivedRole === 'ADMIN' ? adminNavItems : derivedRole === 'STUDENT' ? studentNavItems : []

  // Homepage navigation items (marketing site) - dynamic active via scroll spy
  const homepageNavItems: { label: string; href: string }[] = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'Developer', href: '/developer' },
    { label: 'Contact', href: '#footer' },
  ]

  // Scroll spy & shrink header on scroll (homepage only)
  useEffect(() => {
    if (!isHomepage) return
    const sectionIds = ['home','features','about','footer']
    const options: IntersectionObserverInit = { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0.2 }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id')
            ?.replace(/^#/, '')
          if (id) setCurrentSection(id)
        }
      })
    }, options)
    sectionIds.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    const onScroll = () => {
      setIsScrolled(window.scrollY > 12)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [isHomepage])

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
      setIsMobileNavOpen(false)
    }
  }

  useEffect(() => {
    if (!isMobileNavOpen) return
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileNavOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isMobileNavOpen])

  useEffect(() => {
    setIsMobileNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleSidebarStateChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ open: boolean }>
      setIsSidebarOpen(Boolean(customEvent.detail?.open))
    }
    window.addEventListener('app-sidebar-state-change', handleSidebarStateChange as EventListener)
    return () => window.removeEventListener('app-sidebar-state-change', handleSidebarStateChange as EventListener)
  }, [])

  const handleSidebarToggle = () => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('app-sidebar-toggle'))
  }

  const handleNavKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return
    const focusable = navLinkRefs.current
    if (!focusable.length) return
    const activeIndex = focusable.findIndex((el) => el === document.activeElement)

    let nextIndex = activeIndex
    if (e.key === 'ArrowRight') nextIndex = (activeIndex + 1) % focusable.length
    if (e.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + focusable.length) % focusable.length
    if (e.key === 'Home') nextIndex = 0
    if (e.key === 'End') nextIndex = focusable.length - 1

    e.preventDefault()
    focusable[nextIndex]?.focus()
  }

  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      const result = await signOut({ redirect: false, callbackUrl: '/login?signedOut=1' })
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      } catch (cookieError) {
        console.error('Failed to clear residual auth cookies', cookieError)
      }
      const targetUrl = typeof result === 'object' && result?.url ? result.url : '/login?signedOut=1'
      router.replace(targetUrl)
      router.refresh()
    } catch (error) {
      console.error('Sign out failed', error)
      router.replace('/login?signOutError=1')
    } finally {
      setIsSigningOut(false)
    }
  }

  // HOMEPAGE (unauthenticated) minimalist header
  if (isHomepage && !user) {
    const currentPath = String(pathname || '/')
    const headerOffset = isScrolled ? 66 : 72
    const mobileNavId = 'homepage-mobile-nav'
    const closeMobileNav = () => setIsMobileNavOpen(false)
    const computeActive = (href: string) => {
      if (href === '/developer') return currentPath.startsWith('/developer')
      if (href === '#home') return currentPath === '/'
      if (href.startsWith('#')) return currentSection === href.slice(1)
      return false
    }
    return (
      <header className={`app-header homepage ${isScrolled ? 'scrolled' : ''}`}>
        <a href="#main" className="skip-nav-link">Skip to content</a>
        <nav className="nav-shell gap-6" aria-label="Primary">
          {/* Brand */}
          <Link href="/" className="brand-link" aria-label="VidyaLok Home">
            <div className="brand-emblem">
              <div className="brand-gem"><BookOpen className="h-6 w-6" /></div>
              <div className="brand-glow" />
            </div>
            <div className="brand-texts">
              <span className="brand-title">VidyaLok</span>
              <span className="brand-sub">Smart Library</span>
            </div>
          </Link>

          {/* Primary marketing nav */}
          <div className="hidden md:flex primary-nav" role="menubar" aria-label="Marketing navigation">
            {homepageNavItems.map(item => {
              const active = computeActive(item.href)
              const isAnchor = item.href.startsWith('#')
              const baseClass = 'nav-link' + (active ? ' active' : '')
              if (isAnchor) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                    className={baseClass}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                    <span className="focus-ring" />
                    {active && item.href !== '#home' && <span className="active-bar" aria-hidden="true" />}
                  </a>
                )
              }
              return (
                <Link key={item.href} href={item.href} className={baseClass} aria-current={active ? 'page' : undefined}>
                  {item.label}
                  <span className="focus-ring" />
                  {active && item.href !== '#home' && <span className="active-bar" aria-hidden="true" />}
                </Link>
              )
            })}
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-600 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
              aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileNavOpen}
              aria-controls={mobileNavId}
              onClick={() => setIsMobileNavOpen(open => !open)}
            >
              {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="hidden lg:flex items-center gap-6 text-[13px] font-semibold text-slate-600 tracking-wide">
              <span className="hidden md:inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-500" />+91 84520 42331</span>
              <span className="hidden md:inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-500" />info@vidyalok.edu</span>
            </div>
          </div>
        </nav>
        {isMobileNavOpen && (
          <>
            <div
              className="fixed inset-x-0 bottom-0 bg-slate-900/30 backdrop-blur-sm md:hidden"
              style={{ top: `${headerOffset}px`, zIndex: 55 }}
              onClick={closeMobileNav}
              aria-hidden="true"
            />
            <div
              className="md:hidden fixed inset-x-0 px-4 pb-6"
              style={{ top: `${headerOffset}px`, zIndex: 60 }}
            >
              <div className="rounded-2xl border border-slate-200/70 bg-white/95 shadow-xl backdrop-blur-xl">
                <nav id={mobileNavId} aria-label="Mobile navigation" className="flex flex-col py-2">
                  {homepageNavItems.map(item => {
                    const active = computeActive(item.href)
                    const isAnchor = item.href.startsWith('#')
                    const itemClass = `flex items-center justify-between px-5 py-3 text-[15px] font-semibold tracking-wide transition-colors ${active ? 'bg-slate-100/90 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}`
                    const indicator = (
                      <span
                        className={`h-2 w-2 rounded-full transition ${active ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-pink-500 shadow' : 'bg-transparent'}`}
                        aria-hidden="true"
                      />
                    )
                    if (isAnchor) {
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={(e) => handleSmoothScroll(e, item.href)}
                          className={itemClass}
                          aria-current={active ? 'page' : undefined}
                        >
                          <span>{item.label}</span>
                          {indicator}
                        </a>
                      )
                    }
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={itemClass}
                        aria-current={active ? 'page' : undefined}
                        onClick={closeMobileNav}
                      >
                        <span>{item.label}</span>
                        {indicator}
                      </Link>
                    )
                  })}
                </nav>
                <div className="border-t border-slate-200/70 px-5 py-4 text-sm font-semibold text-slate-600">
                  <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-500" />+91 84520 42331</span>
                  <span className="mt-2 flex items-center gap-2"><Mail className="h-4 w-4 text-slate-500" />info@vidyalok.edu</span>
                </div>
              </div>
            </div>
          </>
        )}
      </header>
    )
  }

  // Derive a unified user object (prop > session > null)
  const resolvedUser = user || (sessionUser ? {
    name: sessionUser.name || (derivedRole === 'ADMIN' ? 'Admin' : 'User'),
    role: sessionUser.role || derivedRole,
    studentId: sessionUser.studentId || sessionUser.id || (derivedRole === 'ADMIN' ? 'ADMIN' : 'USER')
  } : null)

  // AUTHENTICATED HEADER (student/admin)
  const headerRoleClass = derivedRole === 'ADMIN' ? 'admin' : derivedRole === 'STUDENT' ? 'student' : ''

  return (
    <header className={`app-header ${headerRoleClass}`}>      
      <a href="#main" className="skip-nav-link">Skip to content</a>
      <nav className="nav-shell" aria-label="Application">
        {/* Brand & mobile toggle */}
        <div className="flex items-center gap-3">
          {(derivedRole === 'ADMIN' || derivedRole === 'STUDENT') && (
            <button
              type="button"
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white/85 text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-blue-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isSidebarOpen}
              aria-controls="app-mobile-sidebar"
              onClick={handleSidebarToggle}
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
          <Link href={derivedRole === 'ADMIN' ? '/admin' : derivedRole === 'STUDENT' ? '/student' : '/'} className="brand-link" aria-label="VidyaLok Dashboard">
            <div className="brand-emblem">
              <div className="brand-gem"><BookOpen className="h-6 w-6" /></div>
              <div className="brand-glow" />
            </div>
            <div className="brand-texts">
              <span className="brand-title">VidyaLok</span>
              <span className="brand-sub">Smart Library</span>
            </div>
          </Link>
        </div>

        {/* Primary Nav */}
        {navItems.length > 0 && (
          <div
            className="primary-nav"
            role="menubar"
            aria-label={derivedRole === 'ADMIN' ? 'Admin navigation' : 'Student navigation'}
            ref={navContainerRef}
            onKeyDown={handleNavKeyDown}
          >
            {navItems.map((item, idx) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  ref={(el) => { if (el) navLinkRefs.current[idx] = el }}
                  className={`nav-link${isActive ? ' active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  role="menuitem"
                >
                  <Icon />
                  <span>{item.label}</span>
                  <span className="focus-ring" />
                  {isActive && <span className="active-bar" aria-hidden="true" />}
                </Link>
              )
            })}
          </div>
        )}

        {/* Right cluster */}
        {(derivedRole === 'ADMIN' || derivedRole === 'STUDENT') && (
          <div className="right-cluster">
            {/* Quick actions removed for consistent static layout */}
            {derivedRole !== 'ADMIN' && (
              <div className="search-box">
                <input aria-label="Search" placeholder="Search everything..." />
                <Search />
              </div>
            )}
            <button className="notice-btn" aria-label="Notifications" type="button">
              <Bell />
              <span className="notice-badge">3</span>
            </button>
            {derivedRole === 'ADMIN' ? (
              resolvedUser ? (
                <div className="user-card" aria-label="User menu">
                  <div className="avatar" aria-hidden="true">{resolvedUser.name.charAt(0)}</div>
                  <div className="user-meta">
                    <span className="user-name">{resolvedUser.name}</span>
                    <span className="user-id">{resolvedUser.studentId}</span>
                  </div>
                  <button
                    className="logout-btn-modern"
                    type="button"
                    aria-label="Sign out"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="user-card opacity-90" aria-label="Loading user">
                  <div className="avatar animate-pulse bg-slate-300/40 text-transparent">A</div>
                  <div className="user-meta w-24">
                    <span className="user-name block h-3 w-20 rounded bg-slate-300/60" />
                    <span className="user-id mt-1 block h-2 w-12 rounded bg-slate-300/50" />
                  </div>
                  <button className="logout-btn-modern" type="button" aria-label="Sign out" disabled>
                    <LogOut className="h-5 w-5 opacity-40" />
                  </button>
                </div>
              )
            ) : (
              resolvedUser ? (
                <UserDropdown name={resolvedUser.name} idCode={resolvedUser.studentId} onLogout={handleSignOut} isLoading={isSigningOut} />
              ) : (
                <div className="user-card opacity-90" aria-label="Loading user">
                  <div className="avatar animate-pulse bg-slate-300/40 text-transparent">S</div>
                  <div className="user-meta w-24">
                    <span className="user-name block h-3 w-20 rounded bg-slate-300/60" />
                    <span className="user-id mt-1 block h-2 w-12 rounded bg-slate-300/50" />
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

/**
 * Lightweight user dropdown component for clarity & separation.
 */
function UserDropdown({ name, idCode, onLogout, isLoading }: { name: string; idCode: string; onLogout: () => void; isLoading: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current) return; if (!ref.current.contains(e.target as Node)) setOpen(false) }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="user-card px-3 py-2 gap-3"
      >
        <div className="avatar" aria-hidden="true">{name.charAt(0)}</div>
        <div className="user-meta text-left">
          <span className="user-name leading-none">{name}</span>
          <span className="user-id text-[11px]">{idCode}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur-sm"
        >
          <div className="px-2 py-2 text-xs font-medium text-slate-500">Signed in as<br /><span className="text-slate-900 text-sm font-semibold">{name}</span></div>
          <div className="my-1 h-px bg-slate-100" />
          <button
            onClick={() => { setOpen(false); onLogout() }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
            disabled={isLoading}
            role="menuitem"
          >
            <LogOut className="h-4 w-4 text-slate-500" />
            {isLoading ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  )
}
