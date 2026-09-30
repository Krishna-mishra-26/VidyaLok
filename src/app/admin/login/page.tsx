'use client'

import React, { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Server,
  Activity,
  UserPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signIn } from 'next-auth/react'

function AdminLoginPageContent() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const authError = searchParams.get('error')
    if (authError) {
      setError('Your session expired or you need additional permissions. Please sign in again.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        redirect: false,
        identifier: formData.email.trim().toLowerCase(),
        password: formData.password,
        userType: 'ADMIN',
        callbackUrl: '/admin'
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      router.push('/admin')
      router.refresh()
    } catch (err) {
      console.error('Admin login error:', err)
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white/90">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.25),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),_transparent_55%)]" />
      <div className="absolute inset-0 opacity-[0.08]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="admin-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#admin-grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex min-h-screen items-center">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:px-12">
          <div className="grid gap-16 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div className="space-y-12">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Shield className="h-5 w-5" />
                </span>
                VidyaLok Admin Control
              </div>

              <div className="space-y-6">
                <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                  Command center for smart library operations
                </h1>
                <p className="max-w-xl text-base text-white/75 md:text-lg">
                  Monitor circulation, orchestrate resources, and respond to incidents with enterprise-grade visibility across your entire campus library network.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
                  <ShieldCheck className="mt-1 h-5 w-5 text-emerald-200" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/95">Policy enforcement</h3>
                    <p className="text-sm text-white/75">Role-based controls with audit ready logging on every sensitive action.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
                  <BarChart3 className="mt-1 h-5 w-5 text-sky-200" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/95">Operational insights</h3>
                    <p className="text-sm text-white/75">Live dashboards covering usage, circulation, and space occupancy.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
                  <Server className="mt-1 h-5 w-5 text-violet-200" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/95">Unified control</h3>
                    <p className="text-sm text-white/75">Centralize catalog updates, seat management, and broadcast alerts.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
                  <Activity className="mt-1 h-5 w-5 text-amber-200" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/95">Real-time telemetry</h3>
                    <p className="text-sm text-white/75">Track entry logs, fines, and overdue escalations in the moment.</p>
                  </div>
                </div>
              </div>

              <dl className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-1">
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/55">Verified admins</dt>
                  <dd className="text-2xl font-semibold text-white/95">112</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/55">System availability</dt>
                  <dd className="text-2xl font-semibold text-white/95">99.98%</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/55">Audit readiness</dt>
                  <dd className="text-2xl font-semibold text-white/95">SOC2 aligned</dd>
                </div>
              </dl>
            </div>

            <div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-1 backdrop-blur">
                <div className="rounded-[26px] border border-slate-200/60 bg-white/95 p-8 shadow-2xl">
                  <div className="mb-8 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Administrator sign-in</span>
                    <h2 className="text-2xl font-semibold text-slate-900">Authenticate your session</h2>
                    <p className="text-sm text-slate-500">Use your VidyaLok admin credentials. Sessions expire after 30 minutes of inactivity for security.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                        <AlertCircle className="mt-1 h-5 w-5" />
                        <span className="text-sm font-medium leading-snug">{error}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Mail className="h-4 w-4 text-indigo-500" />
                        Work email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="admin@vidyalok.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Lock className="h-4 w-4 text-indigo-500" />
                        Admin passphrase
                      </label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-14 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-3 flex items-center justify-center rounded-lg px-2 text-slate-400 transition-colors hover:text-slate-600"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Multi-factor prompts follow on successful sign-in.</span>
                        <Link href="/helpcenter" className="font-semibold text-indigo-600 hover:text-indigo-500">
                          Need reset help?
                        </Link>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-base font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-[1.01] disabled:cursor-not-allowed"
                    >
                      <span className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{
                        background: 'linear-gradient(90deg, rgba(255,255,255,0.2), rgba(79,70,229,0.18))'
                      }} />
                      <span className="relative flex items-center gap-2">
                        {isLoading ? (
                          <>
                            <span className="inline-flex h-5 w-5 items-center justify-center">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                            </span>
                            Verifying access...
                          </>
                        ) : (
                          <>
                            Sign in securely
                            <ArrowRight className="h-4 w-4 transition-all duration-200 group-hover:translate-x-1" />
                          </>
                        )}
                      </span>
                    </Button>
                  </form>

                  <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                          <UserPlus className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">Need an administrator profile?</h3>
                        </div>
                      </div>
                      <Button
                        asChild
                        className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-6 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.01]"
                      >
                        <Link href="/admin/register">Start admin registration</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                      <div className="flex items-start gap-3">
                        <Shield className="mt-0.5 h-5 w-5 text-amber-600" />
                        <div>
                          <p>Administrative actions are fully audited. Use dedicated accounts only—shared credentials are prohibited.</p>
                          <p className="mt-2 text-xs text-amber-700">SOC2-aligned controls, GDPR compliant data handling.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-4 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
                <Link href="/" className="inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Back to platform overview
                </Link>
                <div className="space-x-2 text-center sm:text-right">
                  <span>Need student access instead?</span>
                  <Link href="/login" className="font-semibold text-sky-300 hover:text-sky-200">
                    Open student login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <AdminLoginPageContent />
    </Suspense>
  )
}
