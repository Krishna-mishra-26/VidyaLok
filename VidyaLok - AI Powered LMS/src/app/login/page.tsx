'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    studentId: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // TODO: Implement actual authentication
      console.log('Login attempt:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, accept any valid student ID format
      if (formData.studentId.match(/^STU\d{6}$/)) {
        router.push('/student')
      } else {
        setError('Invalid student ID format. Please use format: STU123456')
      }
    } catch {
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
    <div className="min-h-screen hero-modern flex items-center justify-center p-4">
      <div className="login-card">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <BookOpen className="h-8 w-8" />
            <span className="heading-tertiary">VidyaLok</span>
          </Link>
          <h1 className="heading-secondary">Student Login</h1>
          <p className="text-secondary">Access your library account</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in with your student credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="studentId" className="text-sm font-medium">
                  Student ID
                </label>
                <Input
                  id="studentId"
                  name="studentId"
                  type="text"
                  placeholder="STU123456"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                  className="uppercase"
                />
                <p className="text-xs text-gray-500">
                  Enter your student ID (e.g., STU123456)
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Demo Credentials</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-600 mb-2">
                  <strong>Demo Student:</strong>
                </p>
                <p className="text-xs text-gray-600">
                  Student ID: STU240001<br />
                  Password: demo123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Need an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Contact Administrator
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            Are you an admin?{' '}
            <Link href="/admin/login" className="text-primary hover:underline">
              Admin Login
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            <Link href="/" className="text-primary hover:underline">
              ← Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
