'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
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
      console.log('Admin login attempt:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, accept specific admin credentials
      if (formData.email === 'admin@vidyalok.com' && formData.password === 'admin123') {
        console.log('Admin login successful, redirecting to /admin')
        // Set admin session in localStorage
        localStorage.setItem('vidyalok_user_role', 'ADMIN')
        localStorage.setItem('vidyalok_user_email', formData.email)
        // Use Next.js router for proper navigation
        router.push('/admin')
      } else {
        setError('Invalid credentials. Please check your email and password.')
      }
    } catch (err) {
      console.error('Login error:', err)
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
    <div className="admin-login">
      <div className="min-h-screen hero-modern flex items-center justify-center p-4">
        <div className="login-card">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <BookOpen className="h-8 w-8" />
              <span className="heading-tertiary">VidyaLok</span>
            </Link>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Shield className="h-6 w-6 text-yellow-300" />
              <h1 className="heading-secondary">Admin Portal</h1>
            </div>
            <p className="text-secondary">Secure access to library management</p>
          </div>

          {/* Login Form */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle>Administrator Login</CardTitle>
              <CardDescription>
                Sign in with your administrator credentials
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
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@vidyalok.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
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
                  {isLoading ? 'Signing in...' : 'Sign In as Admin'}
                </Button>
              </form>

              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <Link 
                    href="/admin/forgot-password" 
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
                  <p className="text-xs mb-2">
                    <strong>Demo Admin:</strong>
                  </p>
                  <p className="text-xs">
                    Email: admin@vidyalok.com<br />
                    Password: admin123
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm">
              Not an admin?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Student Login
              </Link>
            </p>
            <p className="text-sm">
              <Link href="/" className="text-primary hover:underline">
                ← Back to Home
              </Link>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-8 bg-gray-50 border border-gray-300 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">Security Notice</h3>
                <p className="text-xs mt-1">
                  Admin access is restricted and monitored. All actions are logged for security purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
