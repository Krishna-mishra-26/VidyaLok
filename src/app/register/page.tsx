'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function StudentRegisterPage() {
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    phone: '',
    branch: '',
    semester: '',
    yearOfStudy: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const branches = [
    'Computer Engineering',
    'CSE (AIML)',
    'Information Technology',
    'Electronics & Telecommunication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!formData.studentId.match(/^\d{8}$/)) {
      setError('Student ID must be 8 digits')
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

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          studentId: formData.studentId.trim(),
          email: formData.email.trim().toLowerCase(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      setSuccess('Registration successful! Redirecting to sign in...')

      setFormData({
        studentId: '',
        name: '',
        email: '',
        phone: '',
        branch: '',
        semester: '',
        yearOfStudy: '',
        password: '',
        confirmPassword: '',
      })

      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (error) {
      console.error('Student registration failed:', error)
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.')
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-indigo-500/30 blur-[120px]" />
        <div className="absolute inset-0 opacity-40">
          <svg
            className="h-full w-full"
            viewBox="0 0 1024 1024"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 0H1024V1024H0z"
              fill="url(#grid-pattern)"
              fillOpacity="0.18"
            />
            <defs>
              <pattern
                id="grid-pattern"
                x="0"
                y="0"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <path d="M0 48V0h48" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="1" />
              </pattern>
            </defs>
          </svg>
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center">
        <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1fr] lg:items-start">
            <div className="max-w-xl space-y-8 text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-blue-200">
                <span className="h-2 w-2 rounded-full bg-blue-300" aria-hidden />
                Student onboarding
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                  Activate your VidyaLok student account
                </h1>
                <p className="text-base text-blue-100/90">
                  Designed for APSIT students to register quickly and access every smart library service from day one.
                </p>
              </div>
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-blue-100/90">
                <p className="font-semibold text-white">Registration checklist</p>
                <ul className="space-y-2">
                  {['8-digit APSIT student ID', 'APSIT email address for verification', 'Strong password that meets policy requirements'].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-300" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-blue-100/80">
                All registrations are auto-approved instantly—no manual follow-up required. Support is available via <a href="mailto:onboarding@vidyalok.ai" className="font-medium text-blue-200 underline decoration-blue-200/60">onboarding@vidyalok.ai</a> if you need assistance.
              </div>
            </div>

            <div>
              <div className="rounded-3xl bg-white p-8 shadow-[0_25px_50px_rgba(15,23,42,0.08)] sm:p-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-slate-900">Create your student account</h2>
                    <p className="text-sm text-slate-500">
                      Three quick sections: student profile, academic details, and account security.
                    </p>
                  </div>
                  <div className="hidden text-right text-sm text-slate-500 sm:block">
                    Need help?{' '}
                    <a href="mailto:onboarding@vidyalok.ai" className="font-medium text-blue-600">Contact onboarding</a>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                  {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-red-700">
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">We couldn&apos;t complete your registration</p>
                        <p className="text-sm text-red-600/80">{error}</p>
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-700">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">Registration successful</p>
                        <p className="text-sm text-emerald-700/80">{success}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Student profile</h3>
                      <p className="text-sm text-slate-500">Tell us who you are so we can sync your credentials with the VidyaLok registry.</p>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label htmlFor="studentId" className="mb-2 block text-sm font-medium text-slate-700">
                            Student ID <span className="text-blue-600">*</span>
                          </label>
                          <Input
                            id="studentId"
                            name="studentId"
                            type="text"
                            placeholder="12345678"
                            value={formData.studentId}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-slate-200 bg-white py-3 px-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                          <p className="mt-2 text-xs text-slate-500">Use your official 8-digit APSIT student identifier.</p>
                        </div>
                        <div>
                          <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                            Full name <span className="text-blue-600">*</span>
                          </label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-slate-200 bg-white py-3 px-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                            Email address <span className="text-blue-600">*</span>
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your.email@apsit.edu.in"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-slate-200 bg-white py-3 px-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
                            Phone number
                          </label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-200 bg-white py-3 px-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Academic details</h3>
                      <p className="text-sm text-slate-500">We tailor insights, reminders, and reserved resources to your academic journey.</p>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label htmlFor="branch" className="mb-2 block text-sm font-medium text-slate-700">
                            Branch <span className="text-blue-600">*</span>
                          </label>
                          <select
                            id="branch"
                            name="branch"
                            value={formData.branch}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-slate-200 bg-white py-3 px-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          >
                            <option value="">Select branch</option>
                            {branches.map((branch) => (
                              <option key={branch} value={branch}>
                                {branch}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="semester" className="mb-2 block text-sm font-medium text-slate-700">
                            Semester <span className="text-blue-600">*</span>
                          </label>
                          <select
                            id="semester"
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-slate-200 bg-white py-3 px-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          >
                            <option value="">Select</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                              <option key={sem} value={sem}>
                                Semester {sem}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="yearOfStudy" className="mb-2 block text-sm font-medium text-slate-700">
                            Year <span className="text-blue-600">*</span>
                          </label>
                          <select
                            id="yearOfStudy"
                            name="yearOfStudy"
                            value={formData.yearOfStudy}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-slate-200 bg-white py-3 px-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          >
                            <option value="">Select</option>
                            <option value="1">First Year</option>
                            <option value="2">Second Year</option>
                            <option value="3">Third Year</option>
                            <option value="4">Fourth Year</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Security</h3>
                      <p className="text-sm text-slate-500">Protect your learning hub with a strong password. You can enable SSO later from settings.</p>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                            Password <span className="text-blue-600">*</span>
                          </label>
                          <div className="relative">
                            <Input
                              id="password"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Create a password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                              className="w-full rounded-lg border border-slate-200 bg-white py-3 pr-11 pl-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
                            Confirm password <span className="text-blue-600">*</span>
                          </label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm your password"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              required
                              className="w-full rounded-lg border border-slate-200 bg-white py-3 pr-11 pl-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600"
                            >
                              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-500">
                        {["Minimum 6 characters — aim for 12+ for best protection.", 'Include a mix of letters and numbers to pass the APSIT security policy.', 'Never share this password; staff will never ask for it.'].map((hint) => (
                          <li key={hint} className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-500" />
                            <span>{hint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        required
                      />
                      <label htmlFor="terms" className="text-sm text-slate-600">
                        I agree to the{' '}
                        <Link href="/Termsofservice" className="font-medium text-blue-600 hover:text-blue-500">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacypolicies" className="font-medium text-blue-600 hover:text-blue-500">
                          Privacy Policy
                        </Link>{' '}
                        governing VidyaLok.
                      </label>
                    </div>

                    <div className="space-y-3">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-blue-400"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                            <span>Creating account…</span>
                          </div>
                        ) : (
                          <>
                            <span>Complete registration</span>
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                      <p className="text-center text-xs text-slate-500">
                        By continuing you consent to VidyaLok communications about due reminders, seat alerts, and new features. You can opt out anytime.
                      </p>
                      <p className="text-center text-sm text-slate-600">
                        Already registered?{' '}
                        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                          Sign in here
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}