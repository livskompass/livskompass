import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import type { Bindings } from '../index'
import { rateLimit } from '../middleware/rate-limit'
import { sendOwnerEmail } from '../lib/owner-email'

export const contactRoutes = new Hono<{ Bindings: Bindings }>()

/** Email a contact submission to the site owner. Reply-To is the visitor. */
function contactNotification(data: { name: string; email: string; phone?: string; subject?: string; message: string }) {
  const subject = data.subject
    ? `Nytt meddelande via fredriklivheim.se: ${data.subject}`
    : `Nytt meddelande via fredriklivheim.se från ${data.name}`

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
    'Skickat via kontaktformuläret på fredriklivheim.se.',
    'Svara direkt på detta mail för att svara avsändaren.',
  ].filter((l) => l !== null).join('\n')

  return { subject, text, replyTo: data.email }
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
    sendOwnerEmail(c.env, contactNotification({ name, email, phone, subject, message }))
  )

  return c.json({
    success: true,
    message: 'Tack för ditt meddelande! Vi återkommer så snart vi kan.'
  }, 201)
})
