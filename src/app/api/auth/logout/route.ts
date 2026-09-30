import { NextResponse } from 'next/server'

const SESSION_COOKIE_NAMES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
]

const AUXILIARY_COOKIE_NAMES = [
  'next-auth.callback-url',
  '__Secure-next-auth.callback-url',
  'next-auth.csrf-token',
  '__Secure-next-auth.csrf-token',
]

export async function POST() {
  const response = NextResponse.json({ success: true })

  const commonOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  }

  SESSION_COOKIE_NAMES.forEach((cookieName) => {
    response.cookies.set({
      name: cookieName,
      value: '',
      ...commonOptions,
    })
  })

  AUXILIARY_COOKIE_NAMES.forEach((cookieName) => {
    response.cookies.set({
      name: cookieName,
      value: '',
      path: '/',
      expires: new Date(0),
    })
  })

  return response
}
