import { Hono } from 'hono'
import type { Bindings } from '../index'

export const postsRoutes = new Hono<{ Bindings: Bindings }>()

// Get all published posts
postsRoutes.get('/', async (c) => {
  const limit = parseInt(c.req.query('limit') || '10')
  const offset = parseInt(c.req.query('offset') || '0')

  const result = await c.env.DB.prepare(`
    SELECT id, slug, title, excerpt, featured_image, published_at
    FROM posts
    WHERE status = 'published'
    ORDER BY published_at DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all()

  const countResult = await c.env.DB.prepare(`
    SELECT COUNT(*) as total FROM posts WHERE status = 'published'
  `).first()

  c.header('Cache-Control', 'public, max-age=300, s-maxage=600')
  return c.json({
    posts: result.results,
    total: countResult?.total || 0,
    limit,
    offset
  })
})

// Get post by slug
postsRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug')

  const result = await c.env.DB.prepare(`
    SELECT * FROM posts WHERE slug = ? AND status = 'published'
  `).bind(slug).first()

  if (!result) {
    return c.json({ error: 'Post not found' }, 404)
  }

  c.header('Cache-Control', 'public, max-age=300, s-maxage=600')
  return c.json({ post: result })
})
