type RateLimiterOptions = {
  windowMs: number
  maxAttempts: number
}

type RateLimiterEntry = {
  count: number
  expiresAt: number
}

class SlidingWindowRateLimiter {
  private attempts = new Map<string, RateLimiterEntry>()

  constructor(private readonly options: RateLimiterOptions) {}

  isBlocked(key: string): boolean {
    this.evictExpired(key)
    const entry = this.attempts.get(key)
    return Boolean(entry && entry.count >= this.options.maxAttempts)
  }

  recordFailure(key: string) {
    const now = Date.now()
    const entry = this.attempts.get(key)

    if (!entry || entry.expiresAt <= now) {
      this.attempts.set(key, {
        count: 1,
        expiresAt: now + this.options.windowMs,
      })
      return
    }

    entry.count += 1
    this.attempts.set(key, entry)
  }

  reset(key: string) {
    this.attempts.delete(key)
  }

  getRetryAfterMs(key: string): number {
    this.evictExpired(key)
    const entry = this.attempts.get(key)
    if (!entry) {
      return 0
    }

    const remaining = entry.expiresAt - Date.now()
    return remaining > 0 ? remaining : 0
  }

  private evictExpired(key: string) {
    const entry = this.attempts.get(key)
    if (entry && entry.expiresAt <= Date.now()) {
      this.attempts.delete(key)
    }
  }
}

export const loginRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxAttempts: 5,
})
