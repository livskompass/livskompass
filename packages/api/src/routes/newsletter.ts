import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import type { Bindings } from '../index'
import { rateLimit } from '../middleware/rate-limit'

export const newsletterRoutes = new Hono<{ Bindings: Bindings }>()

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Subscribe to the newsletter — rate limited to 5 per minute per IP.
// Emails are stored in D1 (newsletter_signups) and read out in the admin
// "Newsletter" page for manual mailing-list updates.
newsletterRoutes.post('/', rateLimit(60_000, 5), async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const source = typeof body.source === 'string' ? body.source.slice(0, 40) : null

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return c.json({ error: 'Ogiltig e-postadress' }, 400)
  }

  // INSERT OR IGNORE keeps resubscribes idempotent and avoids leaking
  // whether an address is already on the list.
  await c.env.DB.prepare(
    `INSERT OR IGNORE INTO newsletter_signups (id, email, source) VALUES (?, ?, ?)`
  ).bind(nanoid(), email, source).run()

  return c.json({
    success: true,
    message: 'Tack! Du är nu anmäld till nyhetsbrevet.',
  }, 201)
})
