import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { getPrismaClient, prisma } from './prisma'
import { loginRateLimiter } from './rate-limiter'
import { UserRole } from '@/types'

type UserUpdateInput = Parameters<typeof prisma.user.update>[0]['data']

type SupportedUserType = 'STUDENT' | 'ADMIN'

const CREDENTIAL_ERRORS = {
  invalid: 'Invalid credentials. Double-check your ID/email and password.',
  inactive: 'Your account has been disabled. Please contact support.',
  rateLimited: 'Too many failed login attempts. Please try again later.',
} as const

type SessionUser = {
  id: string
  name: string
  email: string
  role: UserRole
  studentId: string
  branch: string | null
  department: string | null
  loginCount: number
  lastLoginAt: string | null
}

const AUTH_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  password: true,
  role: true,
  studentId: true,
  branch: true,
  department: true,
  isActive: true,
  loginCount: true,
  lastLoginAt: true,
} as const

type AuthUserRecord = {
  id: string
  name: string
  email: string
  password: string
  role: string
  studentId: string
  branch: string | null
  department: string | null
  isActive: boolean
  loginCount: number
  lastLoginAt: Date | null
}

const mapRoleToUserRole = (role: string): UserRole => {
  switch (role) {
    case UserRole.ADMIN:
      return UserRole.ADMIN
    case UserRole.LIBRARIAN:
      return UserRole.LIBRARIAN
    case UserRole.STUDENT:
      return UserRole.STUDENT
    default:
      return UserRole.STUDENT
  }
}

const prismaClient = getPrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prismaClient),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Identifier', type: 'text' },
        password: { label: 'Password', type: 'password' },
        userType: { label: 'User Type', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials.password || !credentials.userType) {
          throw new Error(CREDENTIAL_ERRORS.invalid)
        }

        const userType = credentials.userType.toUpperCase() as SupportedUserType
        const identifier = credentials.identifier.trim()
        const normalizedIdentifier = identifier.toLowerCase()
        const rateLimiterKey = `${userType}:${normalizedIdentifier}`

        if (loginRateLimiter.isBlocked(rateLimiterKey)) {
          const retryAfterMs = loginRateLimiter.getRetryAfterMs(rateLimiterKey)
          const retryAfterMinutes = Math.max(1, Math.ceil(retryAfterMs / 60000))
          throw new Error(
            retryAfterMs
              ? `Too many failed login attempts. Please try again in ${retryAfterMinutes} minute${retryAfterMinutes === 1 ? '' : 's'}.`
              : CREDENTIAL_ERRORS.rateLimited,
          )
        }

        let user: AuthUserRecord | null = null

        if (userType === 'STUDENT') {
          const found = await prisma.user.findFirst({
            where: {
              studentId: identifier,
              role: UserRole.STUDENT,
            },
            select: AUTH_USER_SELECT,
          })
          if (found) {
            user = {
              ...found,
              role: String(found.role),
            }
          }
        } else if (userType === 'ADMIN') {
          const found = await prisma.user.findFirst({
            where: {
              email: normalizedIdentifier,
              role: {
                in: [UserRole.ADMIN, UserRole.LIBRARIAN],
              },
            },
            select: AUTH_USER_SELECT,
          })
          if (found) {
            user = {
              ...found,
              role: String(found.role),
            }
          }
        } else {
          throw new Error(CREDENTIAL_ERRORS.invalid)
        }

        if (!user) {
          loginRateLimiter.recordFailure(rateLimiterKey)
          throw new Error(CREDENTIAL_ERRORS.invalid)
        }

        if (!user.isActive) {
          loginRateLimiter.recordFailure(rateLimiterKey)
          throw new Error(CREDENTIAL_ERRORS.inactive)
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          loginRateLimiter.recordFailure(rateLimiterKey)
          throw new Error(CREDENTIAL_ERRORS.invalid)
        }

        const loginTimestamp = new Date()
        let loginMetadata: { loginCount: number; lastLoginAt: Date | null } = {
          loginCount: user.loginCount,
          lastLoginAt: user.lastLoginAt,
        }

        try {
          const loginUpdate = {
            lastLoginAt: loginTimestamp,
            loginCount: { increment: 1 },
          } as UserUpdateInput

          await prisma.user.update({
            where: { id: user.id },
            data: loginUpdate,
          })

          loginMetadata = {
            loginCount: user.loginCount + 1,
            lastLoginAt: loginTimestamp,
          }
        } catch (updateError) {
          console.error('Failed to update login metadata', updateError)
        }

        loginRateLimiter.reset(rateLimiterKey)

        const sessionUser: SessionUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: mapRoleToUserRole(user.role),
          studentId: user.studentId,
          branch: user.branch,
          department: user.department,
          loginCount: loginMetadata.loginCount ?? user.loginCount,
          lastLoginAt: loginMetadata.lastLoginAt?.toISOString() ?? user.lastLoginAt?.toISOString() ?? null,
        }

        return sessionUser
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 12,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const sessionUser = user as SessionUser
        token.role = sessionUser.role
        token.studentId = sessionUser.studentId
        token.branch = sessionUser.branch
        token.department = sessionUser.department
        token.loginCount = sessionUser.loginCount
        token.lastLoginAt = sessionUser.lastLoginAt
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ''
        session.user.role = (token.role as string) ?? 'STUDENT'
        session.user.studentId = (token.studentId as string) ?? ''
        session.user.branch = (token.branch as string | undefined) ?? undefined
        session.user.department = (token.department as string | undefined) ?? undefined
        session.user.loginCount = (token.loginCount as number | undefined) ?? undefined
        session.user.lastLoginAt = (token.lastLoginAt as string | undefined) ?? undefined
      }
      return session
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
}
