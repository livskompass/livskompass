import { Hono } from 'hono'
import type { Bindings } from '../index'

export const coursesRoutes = new Hono<{ Bindings: Bindings }>()

// Get all active courses
coursesRoutes.get('/', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT id, slug, title, description, location, start_date, end_date,
           price_sek, max_participants, current_participants, registration_deadline, status
    FROM courses
    WHERE status IN ('active', 'full')
    ORDER BY start_date ASC
  `).all()

  return c.json({ courses: result.results })
})

// Get course by slug (only active/full courses visible to public)
coursesRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug')

  const result = await c.env.DB.prepare(`
    SELECT * FROM courses WHERE slug = ? AND status IN ('active', 'full')
  `).bind(slug).first()

  if (!result) {
    return c.json({ error: 'Course not found' }, 404)
  }

  return c.json({ course: result })
})
