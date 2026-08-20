import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import type { Bindings } from '../index'
import { rateLimit } from '../middleware/rate-limit'

export const contactRoutes = new Hono<{ Bindings: Bindings }>()

/**
 * Email each contact submission to the site owner via Resend.
 *
 * Recipient: the "Contact details" email in admin General Settings
 * (settings.contact_email), falling back to the CONTACT_NOTIFY_EMAIL env var.
 * Requires the RESEND_API_KEY secret — without it, sending is skipped and
 * logged. Failures never affect the visitor's response: the submission is
 * already stored in D1 and shown in the admin Messages page.
 */
async function sendContactNotification(
  env: Bindings,
  data: { name: string; email: string; phone?: string; subject?: string; message: string },
) {
  if (!env.RESEND_API_KEY) {
    console.error('Contact email skipped: RESEND_API_KEY is not set')
    return
  }

  const setting = await env.DB.prepare(
    `SELECT value FROM settings WHERE key = 'contact_email'`
  ).first<{ value: string }>().catch(() => null)
  const to = setting?.value || env.CONTACT_NOTIFY_EMAIL
  if (!to || !to.includes('@')) {
    console.error('Contact email skipped: no recipient (set Contact details email in admin Settings, or CONTACT_NOTIFY_EMAIL)')
    return
  }

  const subjectLine = data.subject
    ? `Nytt meddelande via livskompass.se: ${data.subject}`
    : `Nytt meddelande via livskompass.se från ${data.name}`

  const text = [
    `Namn: ${data.name}`,
    `E-post: ${data.email}`,
    data.phone ? `Telefon: ${data.phone}` : null,
    data.subject ? `Ämne: ${data.subject}` : null,
    '',
    'Meddelande:',
    data.message,
    '',
    '—',
    'Skickat via kontaktformuläret på livskompass.se.',
    'Svara direkt på detta mail för att svara avsändaren.',
  ].filter((l) => l !== null).join('\n')

  try {
    const res = await fetch(env.RESEND_API_URL || 'https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL || 'Livskompass kontaktformulär <onboarding@resend.dev>',
        to: [to],
        reply_to: [data.email],
        subject: subjectLine,
        text,
      }),
    })
    if (!res.ok) {
      console.error(`Contact email failed: ${res.status} ${await res.text().catch(() => '')}`)
    }
  } catch (err) {
    console.error('Contact email failed:', err)
  }
}

// Submit contact form — rate limited to 5 per minute per IP
contactRoutes.post('/', rateLimit(60_000, 5), async (c) => {
  const body = await c.req.json()
  const { name, email, phone, subject, message } = body

  // Validate required fields
  if (!name || !email || !message) {
    return c.json({ error: 'Name, email, and message are required' }, 400)
  }

  // Basic email validation
  if (!email.includes('@')) {
    return c.json({ error: 'Invalid email address' }, 400)
  }

  const id = nanoid()

  await c.env.DB.prepare(`
    INSERT INTO contacts (id, name, email, phone, subject, message)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, name, email, phone || null, subject || null, message).run()

  // Email notification runs after the response is sent — a mail outage must
  // never turn a stored submission into a visitor-facing error.
  c.executionCtx.waitUntil(
    sendContactNotification(c.env, { name, email, phone, subject, message })
  )

  return c.json({
    success: true,
    message: 'Tack för ditt meddelande! Vi återkommer så snart vi kan.'
  }, 201)
})
