'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus_Jakarta_Sans } from 'next/font/google'
import {
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  User,
  Mail,
  Phone,
  Key,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  BarChart3,
  Users,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CANONICAL_DEPARTMENTS } from '@/constants/departments'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
})

export default function AdminRegisterPage() {
  const [formData, setFormData] = useState({
    adminId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    password: '',
    confirmPassword: '',
    adminCode: '' // Special code for admin registration
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const departments = CANONICAL_DEPARTMENTS

  const designations = [
    'Chief Librarian',
    'Assistant Librarian',
    'Library Assistant',
    'Department Head',
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Administrative Officer'
  ]

  const featureHighlights = [
    {
      icon: ShieldCheck,
      title: 'Zero-trust onboarding',
      description: 'Hardware-bound MFA and privileged access reviews baked into every admin account.',
      accent: 'text-emerald-200'
    },
    {
      icon: BarChart3,
      title: 'Operational visibility',
      description: 'Unified dashboards for inventory, space telemetry, and compliance KPIs in one console.',
      accent: 'text-sky-200'
    },
    {
      icon: Users,
      title: 'Role-aligned controls',
      description: 'Granular scopes with approval workflows so the right teams get the right access.',
      accent: 'text-violet-200'
    },
    {
      icon: Sparkles,
      title: 'AI-assisted automations',
      description: 'Smart alerts and templated broadcast messages accelerate response to campus events.',
      accent: 'text-amber-200'
    }
  ]

  const onboardingSteps = [
    'Verify institutional email and registration code to unlock the enrollment form.',
    'Submit identity details for IT desk validation and automated background checks.',
    'Activate multi-factor authentication and finalize your administrative scope.'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!formData.adminId.match(/^ADM\d{4}$/)) {
      setError('Admin ID must be in format: ADM1234')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    // Check admin code (in production, this should be validated against a secure list)
    if (formData.adminCode !== 'APSIT2025') {
      setError('Invalid admin registration code. Contact IT department.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminId: formData.adminId.trim().toUpperCase(),
          name: formData.name,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone,
          department: formData.department,
          designation: formData.designation,
          password: formData.password,
          adminCode: formData.adminCode
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      setSuccess('Admin registration successful! Redirecting to sign in...')

      setFormData({
        adminId: '',
        name: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        password: '',
        confirmPassword: '',
        adminCode: '',
      })

      setTimeout(() => {
        router.push('/admin/login')
      }, 1500)
    } catch (err) {
      console.error('Admin registration failed:', err)
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className={`${jakarta.className} relative min-h-screen overflow-hidden bg-slate-950 text-white`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.22),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(8,145,178,0.18),_transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.08]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="admin-register-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#admin-register-grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex min-h-screen items-center">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 lg:px-12">
          <div className="grid gap-16 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <div className="space-y-10 text-white/90">
              <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.35em] text-white/60">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Shield className="h-5 w-5" />
                </span>
                VidyaLok Admin Onboarding
              </div>

              <div className="space-y-6">
                <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                  Launch your command center credentials
                </h1>
                <p className="max-w-xl text-base text-white/75 md:text-lg">
                  Establish a verified administrative identity to orchestrate library operations, automate campus communications, and unlock real-time analytics for every resource.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {featureHighlights.map(({ icon: Icon, title, description, accent }) => (
                  <div key={title} className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
                    <Icon className={`mt-1 h-5 w-5 ${accent}`} />
                    <div>
                      <h3 className="text-sm font-semibold text-white/95">{title}</h3>
                      <p className="text-sm text-white/70">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Enrollment checklist</h3>
                <ul className="mt-4 space-y-3 text-sm text-white/75">
                  {onboardingSteps.map((step) => (
                    <li key={step} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-300" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-1 backdrop-blur">
                <div className="rounded-[28px] border border-slate-200/70 bg-white p-8 text-slate-900 shadow-2xl">
                  <div className="mb-8 space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
                      <Shield className="h-4 w-4 text-indigo-500" />
                      Verified access setup
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-900">Create your admin credentials</h2>
                      <p className="text-sm text-slate-500">Complete the secure enrollment workflow to manage VidyaLok operations across every campus library.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                        <AlertCircle className="mt-1 h-5 w-5" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">We couldn&apos;t create your account</p>
                          <p className="text-sm leading-snug">{error}</p>
                        </div>
                      </div>
                    )}

                    {success && (
                      <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                        <CheckCircle className="mt-1 h-5 w-5" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">Registration successful</p>
                          <p className="text-sm leading-snug">{success}</p>
                        </div>
                      </div>
                    )}

                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-slate-700">
                      <div className="space-y-2">
                        <label htmlFor="adminCode" className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                          <Key className="h-4 w-4 text-indigo-500" />
                          Admin registration code
                        </label>
                        <Input
                          id="adminCode"
                          name="adminCode"
                          type="password"
                          autoComplete="off"
                          placeholder="Enter secure admin code"
                          value={formData.adminCode}
                          onChange={handleChange}
                          required
                          className="h-12 w-full rounded-xl border border-indigo-200 bg-white px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                        <p className="text-xs text-indigo-600">Contact the IT governance team for your unique code. Demo sandbox code: APSIT2025.</p>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="adminId" className="text-sm font-semibold text-slate-700">Admin ID</label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <User className="h-4 w-4" />
                          </div>
                          <Input
                            id="adminId"
                            name="adminId"
                            type="text"
                            inputMode="text"
                            placeholder="ADM1234"
                            value={formData.adminId}
                            onChange={handleChange}
                            required
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                        <p className="text-xs text-slate-500">Use the institution-issued administrator identifier (format ADM1234).</p>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-semibold text-slate-700">Full name</label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold text-slate-700">Institutional email</label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Mail className="h-4 w-4" />
                          </div>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="admin@vidyalok.edu"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-semibold text-slate-700">Contact number</label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Phone className="h-4 w-4" />
                          </div>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                        <p className="text-xs text-slate-500">We&apos;ll use this for escalation alerts and multi-factor prompts.</p>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="department" className="text-sm font-semibold text-slate-700">Department</label>
                        <select
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          required
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                          <option value="" className="text-slate-400">Select department</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept} className="text-slate-900">
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="designation" className="text-sm font-semibold text-slate-700">Designation</label>
                        <select
                          id="designation"
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          required
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                          <option value="" className="text-slate-400">Select designation</option>
                          {designations.map((designation) => (
                            <option key={designation} value={designation} className="text-slate-900">
                              {designation}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Create a secure password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition-colors hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">Use 8+ characters with uppercase, lowercase, number, and symbol.</p>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirm password</label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Re-enter your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition-colors hover:text-slate-600"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                      <p>By creating an account you acknowledge SOC2-aligned monitoring and accept VidyaLok&apos;s administrator usage policies. Activity is continuously audited.</p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-base font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-[1.01] disabled:cursor-not-allowed"
                    >
                      <span className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{
                        background: 'linear-gradient(90deg, rgba(255,255,255,0.2), rgba(59,130,246,0.18))'
                      }} />
                      <span className="relative flex items-center gap-2">
                        {isLoading ? (
                          <>
                            <span className="inline-flex h-5 w-5 items-center justify-center">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                            </span>
                            Provisioning access...
                          </>
                        ) : (
                          <>
                            Complete secure enrollment
                            <ArrowRight className="h-4 w-4 transition-all duration-200 group-hover:translate-x-1" />
                          </>
                        )}
                      </span>
                    </Button>
                  </form>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-4 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
                <Link href="/admin/login" className="inline-flex items-center gap-2 text-white/75 transition-colors hover:text-white">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Already verified? Sign in
                </Link>
                <Link href="/" className="inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white">
                  Explore platform overview
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
