import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import type { Bindings } from '../index'

export const contactRoutes = new Hono<{ Bindings: Bindings }>()

// Submit contact form
contactRoutes.post('/', async (c) => {
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

  return c.json({
    success: true,
    message: 'Tack för ditt meddelande! Vi återkommer så snart vi kan.'
  }, 201)
})
