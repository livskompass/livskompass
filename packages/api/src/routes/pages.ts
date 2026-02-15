import { Hono } from 'hono'
import type { Bindings } from '../index'

export const pagesRoutes = new Hono<{ Bindings: Bindings }>()

// Get all published pages
pagesRoutes.get('/', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT id, slug, title, meta_description, parent_slug, sort_order
    FROM pages
    WHERE status = 'published'
    ORDER BY sort_order ASC
  `).all()

  return c.json({ pages: result.results })
})

// Get page by slug (includes child pages)
pagesRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug')

  const [pageResult, childrenResult] = await c.env.DB.batch([
    c.env.DB.prepare(`
      SELECT * FROM pages WHERE slug = ? AND status = 'published'
    `).bind(slug),
    c.env.DB.prepare(`
      SELECT id, slug, title, meta_description, parent_slug, sort_order
      FROM pages
      WHERE parent_slug = ? AND status = 'published'
      ORDER BY sort_order ASC, title ASC
    `).bind(slug),
  ])

  const page = pageResult.results?.[0]
  if (!page) {
    return c.json({ error: 'Page not found' }, 404)
  }

  return c.json({ page, children: childrenResult.results || [] })
})
