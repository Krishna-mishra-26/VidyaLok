import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      studentId: string
      branch?: string | null
      department?: string | null
      loginCount?: number
      lastLoginAt?: string | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: string
    studentId: string
    branch?: string | null
    department?: string | null
    loginCount?: number
    lastLoginAt?: Date | string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    studentId?: string
    branch?: string | null
    department?: string | null
    loginCount?: number
    lastLoginAt?: string | null
  }
}

export {}
