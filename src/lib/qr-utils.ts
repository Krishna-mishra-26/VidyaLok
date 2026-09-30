import crypto from 'node:crypto'
import QRCode from 'qrcode'

const DEFAULT_TTL_MINUTES = 5
const QR_TOKEN_VERSION = 1

const getSecret = () => {
  const secret =
    process.env.QR_CODE_SECRET ||
    process.env.ENCRYPTION_KEY ||
    process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('QR_CODE_SECRET, ENCRYPTION_KEY, or NEXTAUTH_SECRET must be configured')
  }
  return secret
}

const base64UrlEncode = (buffer: Buffer) =>
  buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

const base64UrlDecode = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const pad = normalized.length % 4
  const padded = pad ? normalized + '='.repeat(4 - pad) : normalized
  return Buffer.from(padded, 'base64').toString('utf8')
}

const sign = (payload: string) => {
  const secret = getSecret()
  return base64UrlEncode(crypto.createHmac('sha256', secret).update(payload).digest())
}

const timingSafeCompare = (a: string, b: string) => {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) {
    return false
  }
  return crypto.timingSafeEqual(bufferA, bufferB)
}

export interface QRTokenPayload {
  version: number
  studentId: string
  studentName: string
  department: string | null
  issuedAt: number
  expiresAt: number
  nonce: string
}

export interface SignedQRToken {
  token: string
  payload: QRTokenPayload
}

export function createSignedQRToken(
  studentId: string,
  studentName: string,
  department: string | null,
  ttlMinutes: number = Number(process.env.QR_TOKEN_TTL_MINUTES ?? DEFAULT_TTL_MINUTES)
): SignedQRToken {
  const issuedAt = Date.now()
  const expiresAt = issuedAt + ttlMinutes * 60 * 1000
  const payload: QRTokenPayload = {
    version: QR_TOKEN_VERSION,
    studentId,
    studentName,
    department,
    issuedAt,
    expiresAt,
    nonce: crypto.randomUUID(),
  }

  const payloadBase64 = base64UrlEncode(Buffer.from(JSON.stringify(payload)))
  const signature = sign(payloadBase64)

  return {
    token: `${payloadBase64}.${signature}`,
    payload,
  }
}

export function verifySignedQRToken(token: string): QRTokenPayload {
  const parts = token.split('.')
  if (parts.length !== 2) {
    throw new Error('Malformed QR token payload')
  }

  const [payloadBase64, signature] = parts
  const expectedSignature = sign(payloadBase64)

  if (!timingSafeCompare(signature, expectedSignature)) {
    throw new Error('Invalid QR token signature')
  }

  const payload = JSON.parse(base64UrlDecode(payloadBase64)) as QRTokenPayload

  if (payload.version !== QR_TOKEN_VERSION) {
    throw new Error('Unsupported QR token version')
  }

  if (Date.now() > payload.expiresAt) {
    throw new Error('QR token expired')
  }

  return payload
}

export async function generateQRCodeImage(token: string): Promise<string> {
  return QRCode.toDataURL(token, { margin: 2, scale: 6 })
}

export const isTokenExpiringSoon = (payload: QRTokenPayload, thresholdSeconds: number = 60) => {
  const remaining = payload.expiresAt - Date.now()
  return remaining <= thresholdSeconds * 1000
}
