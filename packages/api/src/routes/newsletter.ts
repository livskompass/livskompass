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

// Public archive of sent newsletters — proxies Get a Newsletter's sent-mails
// list so the site can render an auto-updating archive. The API token stays
// server-side; responses are cached for an hour via the Cache API.
newsletterRoutes.get('/archive', async (c) => {
  const token = c.env.GAN_API_TOKEN
  if (!token) return c.json({ issues: [] })

  const cache = caches.default
  // v2: response shape gained `id` — new key so stale cached lists are skipped
  const cacheKey = new Request('https://internal.livskompass.cache/newsletter-archive-v2')
  const hit = await cache.match(cacheKey)
  if (hit) return new Response(hit.body, hit)

  const base = c.env.GAN_API_URL || 'https://api.getanewsletter.com'
  try {
    const res = await fetch(`${base}/v3/mails/sent/?page_size=100`, {
      headers: { Authorization: `Token ${token}`, Accept: 'application/json' },
    })
    if (!res.ok) return c.json({ issues: [] })
    const data = (await res.json()) as { results?: unknown[] }
    const results = Array.isArray(data.results) ? data.results : Array.isArray(data) ? (data as unknown[]) : []
    const issues = (results as Record<string, any>[])
      .filter((m) => !m.test && (m.preview_url || m.share_url) && m.subject)
      .map((m) => ({
        id: m.id ?? null,
        subject: String(m.subject),
        date: m.time_to_send || m.updated || null,
        url: String(m.preview_url || m.share_url),
      }))
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))

    const response = c.json({ issues })
    response.headers.set('Cache-Control', 'public, max-age=3600')
    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()))
    return response
  } catch {
    return c.json({ issues: [] })
  }
})

// One newsletter, rendered — fetches the mail's public preview page (the
// only place Get a Newsletter exposes the rendered HTML for block-editor
// mails) so the site can show newsletters without sending visitors away.
// The HTML is script-free email markup; the web app additionally renders it
// inside a sandboxed iframe with scripts disabled.
newsletterRoutes.get('/archive/:id', async (c) => {
  const token = c.env.GAN_API_TOKEN
  const id = c.req.param('id')
  if (!token || !/^\d+$/.test(id)) return c.json({ error: 'Not found' }, 404)

  const cache = caches.default
  const cacheKey = new Request(`https://internal.livskompass.cache/newsletter-issue/${id}`)
  const hit = await cache.match(cacheKey)
  if (hit) return new Response(hit.body, hit)

  const base = c.env.GAN_API_URL || 'https://api.getanewsletter.com'
  try {
    const res = await fetch(`${base}/v3/mails/sent/${id}/`, {
      headers: { Authorization: `Token ${token}`, Accept: 'application/json' },
    })
    if (!res.ok) return c.json({ error: 'Not found' }, 404)
    const m = (await res.json()) as Record<string, any>
    if (m.test || !m.preview_url) return c.json({ error: 'Not found' }, 404)

    const pres = await fetch(String(m.preview_url))
    if (!pres.ok) return c.json({ error: 'Not found' }, 404)
    const html = await pres.text()

    const response = c.json({
      subject: String(m.subject || ''),
      date: m.time_to_send || m.updated || null,
      html,
    })
    response.headers.set('Cache-Control', 'public, max-age=21600')
    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()))
    return response
  } catch {
    return c.json({ error: 'Not found' }, 404)
  }
})

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
