import { Hono } from 'hono'
import type { Bindings } from '../index'

export const productsRoutes = new Hono<{ Bindings: Bindings }>()

// Get all active products
productsRoutes.get('/', async (c) => {
  const type = c.req.query('type')

  let query = `
    SELECT id, slug, title, description, type, price_sek, external_url, image_url, in_stock
    FROM products
    WHERE status = 'active'
  `

  if (type) {
    query += ` AND type = ?`
  }

  query += ` ORDER BY title ASC`

  const stmt = type
    ? c.env.DB.prepare(query).bind(type)
    : c.env.DB.prepare(query)

  const result = await stmt.all()

  return c.json({ products: result.results })
})

// Get product by slug
productsRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug')

  const result = await c.env.DB.prepare(`
    SELECT * FROM products WHERE slug = ? AND status = 'active'
  `).bind(slug).first()

  if (!result) {
    return c.json({ error: 'Product not found' }, 404)
  }

  return c.json({ product: result })
})
