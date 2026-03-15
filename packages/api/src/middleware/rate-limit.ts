import type { Context, Next } from 'hono'

/**
 * Simple in-memory rate limiter for Cloudflare Workers.
 * Per-isolate, resets on cold start — provides soft abuse prevention.
 */
const counters = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(windowMs: number, max: number) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const key = `${ip}:${c.req.path}`

    const entry = counters.get(key)
    if (entry && now < entry.resetAt) {
      if (entry.count >= max) {
        return c.json({ error: 'Too many requests. Please try again later.' }, 429)
      }
      entry.count++
    } else {
      counters.set(key, { count: 1, resetAt: now + windowMs })
    }

    // Periodic cleanup to avoid memory growth
    if (counters.size > 10000) {
      for (const [k, v] of counters) {
        if (now > v.resetAt) counters.delete(k)
      }
    }

    await next()
  }
}
