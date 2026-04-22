import { Hono } from 'hono'
import type { Bindings } from '../index'

export const coursesRoutes = new Hono<{ Bindings: Bindings }>()

// Get all active courses
coursesRoutes.get('/', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT id, slug, title, description, location, start_date, end_date,
           price_sek, max_participants, current_participants, registration_deadline, status
    FROM courses
    WHERE status IN ('published', 'full')
    -- Dated courses first by date (soonest at top), undated at bottom alphabetically.
    ORDER BY (start_date IS NULL) ASC, start_date ASC, title ASC
  `).all()

  c.header('Cache-Control', 'public, max-age=5, stale-while-revalidate=10')
  return c.json({ courses: result.results })
})

// Get course by slug (only active/full courses visible to public)
coursesRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug')

  const result = await c.env.DB.prepare(`
    SELECT id, slug, title, description, content, content_blocks, editor_version, location, start_date, end_date, price_sek, max_participants, current_participants, registration_deadline, status, created_at
    FROM courses WHERE slug = ? AND status IN ('published', 'full')
  `).bind(slug).first()

  if (!result) {
    return c.json({ error: 'Course not found' }, 404)
  }

  c.header('Cache-Control', 'public, max-age=5, stale-while-revalidate=10')
  return c.json({ course: result })
})
