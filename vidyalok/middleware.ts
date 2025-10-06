import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

const PUBLIC_ADMIN_ROUTES = ['/admin/login', '/admin/register']
const PUBLIC_STUDENT_ROUTES = ['/login', '/register']

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    if (!token) {
      return NextResponse.next()
    }

    if (pathname.startsWith('/admin') && !['ADMIN', 'LIBRARIAN'].includes(String(token.role))) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (pathname.startsWith('/student') && token.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    if (pathname === '/login' && token.role === 'STUDENT') {
      return NextResponse.redirect(new URL('/student', req.url))
    }

    if (pathname === '/admin/login' && ['ADMIN', 'LIBRARIAN'].includes(String(token.role))) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        if (PUBLIC_ADMIN_ROUTES.includes(path) || PUBLIC_STUDENT_ROUTES.includes(path)) {
          return true
        }

        if (path.startsWith('/admin')) {
          return !!token
        }

        if (path.startsWith('/student')) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/student/:path*', '/login', '/register'],
}
