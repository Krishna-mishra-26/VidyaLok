'use client'

import React, { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus_Jakarta_Sans } from 'next/font/google'
import {
  BookOpen,
  Eye,
  EyeOff,
  AlertCircle,
  GraduationCap,
  ArrowRight,
  Users,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signIn } from 'next-auth/react'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
})

function LoginPageContent() {
  const [formData, setFormData] = useState({
    studentId: '',
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
      setError('Your session expired. Please sign in again.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!formData.studentId.match(/^\d{8}$/)) {
        setError('Student ID must be 8 digits (e.g., 20241234).')
        return
      }

      const result = await signIn('credentials', {
        redirect: false,
        identifier: formData.studentId.trim(),
        password: formData.password,
        userType: 'STUDENT',
        callbackUrl: '/student'
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      router.push('/student')
      router.refresh()
    } catch (err) {
      console.error('Student login error:', err)
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
    <div className={`${jakarta.className} relative min-h-screen overflow-hidden bg-slate-950`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),_transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.08]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 flex min-h-screen items-center">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:px-12">
          <div className="grid gap-16 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div className="space-y-10 text-white/90">
              <div className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.35em] text-white/70">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                  <BookOpen className="h-5 w-5" />
                </span>
                VidyaLok Library Cloud
              </div>

              <div className="space-y-6">
                <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                  Smarter access to your campus knowledge ecosystem
                </h1>
                <p className="max-w-xl text-base text-white/80 md:text-lg">
                  Sign in to manage your study resources, monitor borrowing, and tap into real-time insights that keep you ahead in every semester.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
                  <ShieldCheck className="mt-1 h-7 w-7 text-emerald-200" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/95">Secure entry</h3>
                    <p className="text-sm text-white/75">Single sign-on with multi-layer campus encryption.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
                  <Clock className="mt-1 h-7 w-7 text-sky-200" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/95">Always available</h3>
                    <p className="text-sm text-white/75">24/7 digital self-service with instant circulation updates.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
                  <GraduationCap className="mt-1 h-7 w-7 text-violet-200" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/95">Designed for scholars</h3>
                    <p className="text-sm text-white/75">Curated recommendations tailored to your program.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
                  <Sparkles className="mt-1 h-7 w-7 text-amber-200" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/95">AI-powered guidance</h3>
                    <p className="text-sm text-white/75">Personal library concierge, chatbot, and smart alerts.</p>
                  </div>
                </div>
              </div>

              <dl className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-1">
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/60">Active scholars</dt>
                  <dd className="text-2xl font-semibold text-white/95">28k+</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/60">Titles managed</dt>
                  <dd className="text-2xl font-semibold text-white/95">180k</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs uppercase tracking-[0.2em] text-white/60">Live seat data</dt>
                  <dd className="text-2xl font-semibold text-white/95">Campus-wide</dd>
                </div>
              </dl>
            </div>

            <div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-1 backdrop-blur">
                <div className="rounded-[26px] border border-slate-200/60 bg-white/95 p-8 shadow-2xl">
                  <div className="mb-10 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        <Users className="h-4 w-4" />
                      </span>
                      Student Sign-in Portal
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-900">Welcome back to VidyaLok</h2>
                      <p className="text-sm text-slate-500">Authenticate with your university credentials to continue.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                        <AlertCircle className="mt-1 h-5 w-5" />
                        <span className="text-sm font-medium leading-snug">{error}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label htmlFor="studentId" className="text-sm font-semibold text-slate-800">
                        University Student ID
                      </label>
                      <div className="relative">
                        <Input
                          id="studentId"
                          name="studentId"
                          type="text"
                          inputMode="numeric"
                          placeholder="20241234"
                          value={formData.studentId}
                          onChange={handleChange}
                          required
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium tracking-[0.18em] text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                      </div>
                      <p className="text-xs text-slate-500">Eight-digit ID from your student card. Numbers only.</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-semibold text-slate-800">
                        Password
                      </label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Use 8+ characters with at least one number.</span>
                        <Link href="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">
                          Forgot password?
                        </Link>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-base font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-[1.01] disabled:cursor-not-allowed"
                    >
                      <span className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{
                        background: 'linear-gradient(90deg, rgba(255,255,255,0.22), rgba(59,130,246,0.15))'
                      }} />
                      <span className="relative flex items-center gap-2">
                        {isLoading ? (
                          <>
                            <span className="inline-flex h-5 w-5 items-center justify-center">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                            </span>
                            Signing you in...
                          </>
                        ) : (
                          <>
                            Access dashboard
                            <ArrowRight className="h-4 w-4 transition-all duration-200 group-hover:translate-x-1" />
                          </>
                        )}
                      </span>
                    </Button>
                  </form>

                  <div className="mt-10 space-y-6">
                    <div className="text-center mt-10 text-sm text-slate-500">
                      Don&apos;t have access yet?{' '}
                      <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                        Sign Up Here
                      </Link>
                    </div>

                    <div className="text-center text-xs text-slate-500">
                      Looking for administrative tools?{' '}
                      <Link href="/admin/login" className="font-semibold text-slate-500 hover:text-slate-700">
                        Admin Login
                      </Link>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                      <ArrowRight className="h-3 w-3 rotate-180" />
                      <Link href="/" className="font-semibold text-slate-500 hover:text-slate-700">
                        Back to homepage
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <LoginPageContent />
    </Suspense>
  )
}
