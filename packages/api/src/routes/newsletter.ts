import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import type { Bindings } from '../index'
import { rateLimit } from '../middleware/rate-limit'
import { sendOwnerEmail } from '../lib/owner-email'

export const newsletterRoutes = new Hono<{ Bindings: Bindings }>()

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Lazy migration: the deploy pipeline's Cloudflare token has no D1 edit
 * permission, so schema.sql can't be applied remotely from CI. The worker
 * itself has full D1 access via its binding — create the table on first use.
 */
export async function ensureNewsletterTable(db: D1Database) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS newsletter_signups (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      source TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`
  ).run()
}

/** Run a D1 op, creating the newsletter table and retrying once if missing. */
export async function withNewsletterTable<T>(db: D1Database, op: () => Promise<T>): Promise<T> {
  try {
    return await op()
  } catch (err) {
    if (String((err as Error)?.message ?? err).includes('no such table')) {
      await ensureNewsletterTable(db)
      return await op()
    }
    throw err
  }
}

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
  const result = await withNewsletterTable(c.env.DB, () =>
    c.env.DB.prepare(
      `INSERT OR IGNORE INTO newsletter_signups (id, email, source) VALUES (?, ?, ?)`
    ).bind(nanoid(), email, source).run()
  )

  // Notify the owner about genuinely new signups only (an ignored duplicate
  // writes no rows), so the mailing list can be updated without checking admin.
  const isNew = (result.meta?.changes ?? result.meta?.rows_written ?? 0) > 0
  if (isNew) {
    c.executionCtx.waitUntil(
      sendOwnerEmail(c.env, {
        subject: `Ny prenumerant på nyhetsbrevet: ${email}`,
        text: [
          `Ny anmälan till nyhetsbrevet via ${source === 'popup' ? 'popupen' : source === 'footer' ? 'sidfoten' : 'webbplatsen'}:`,
          '',
          email,
          '',
          '—',
          'Hela listan finns i admin under Newsletter (med kopiera/exportera).',
        ].join('\n'),
      })
    )
  }

  return c.json({
    success: true,
    message: 'Tack! Du är nu anmäld till nyhetsbrevet.',
  }, 201)
})
