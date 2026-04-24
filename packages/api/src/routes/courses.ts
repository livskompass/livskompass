import { Hono } from 'hono'
import type { Bindings } from '../index'

export const coursesRoutes = new Hono<{ Bindings: Bindings }>()

// Get all active courses
coursesRoutes.get('/', async (c) => {
  // `content_blocks` is included so cards on the public list (CourseList,
  // CardGrid) can extract the course's banner image without a second round
  // trip per course. It adds ~1-2KB per row; for a small catalogue this is
  // a better trade-off than N+1 fetches from the client.
  const result = await c.env.DB.prepare(`
    SELECT id, slug, title, description, content_blocks, location, start_date, end_date,
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
