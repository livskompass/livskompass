import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

// Route imports
import { pagesRoutes } from './routes/pages'
import { postsRoutes } from './routes/posts'
import { coursesRoutes } from './routes/courses'
import { bookingsRoutes } from './routes/bookings'
import { productsRoutes } from './routes/products'
import { contactRoutes } from './routes/contact'
import { authRoutes } from './routes/auth'
import { adminRoutes } from './routes/admin'
import { webhookRoutes } from './routes/webhooks'

// Types
export type Bindings = {
  DB: D1Database
  MEDIA: R2Bucket
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  SITE_URL: string
  ADMIN_URL: string
  CORS_ORIGIN: string
  // Google OAuth
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  INITIAL_ADMIN_EMAIL: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Stripe webhook route - mounted BEFORE CORS middleware (Stripe doesn't send Origin headers)
app.route('/api/webhooks/stripe', webhookRoutes)

// Middleware
app.use('*', logger())

// Security headers
app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
})

app.use('*', cors({
  origin: (origin, c) => {
    const allowed = c.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3001'
    return allowed.split(',').includes(origin) ? origin : allowed.split(',')[0]
  },
  credentials: true,
}))

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'livskompass-api' }))

// Public media serving route — serves files directly from R2
app.get('/media/*', async (c) => {
  const key = c.req.path.replace(/^\/media\//, '')
  if (!key) {
    return c.json({ error: 'Not found' }, 404)
  }

  const object = await c.env.MEDIA.get(key)
  if (!object) {
    return c.json({ error: 'Not found' }, 404)
  }

  // Determine content type from R2 metadata or guess from extension
  let contentType = object.httpMetadata?.contentType
  if (!contentType) {
    const ext = key.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      pdf: 'application/pdf',
      mp3: 'audio/mpeg',
      mp4: 'video/mp4',
      css: 'text/css',
      js: 'application/javascript',
    }
    contentType = (ext && mimeTypes[ext]) || 'application/octet-stream'
  }

  c.header('Content-Type', contentType)
  c.header('Cache-Control', 'public, max-age=86400')

  return c.body(object.body as ReadableStream)
})

// Public site-settings endpoint (header/footer JSON, cached)
app.get('/api/site-settings', async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT key, value FROM settings WHERE key IN ('site_header', 'site_footer', 'homepage_slug')`
  ).all()

  const settings: Record<string, any> = {}
  result.results?.forEach((row: any) => {
    try { settings[row.key] = JSON.parse(row.value) } catch { settings[row.key] = row.value }
  })

  c.header('Cache-Control', 'public, max-age=120, stale-while-revalidate=600')
  return c.json({
    header: settings.site_header || null,
    footer: settings.site_footer || null,
    homepage_slug: settings.homepage_slug || 'home-2',
  })
})

// Public UI strings endpoint (customizable labels, cached)
app.get('/api/site-settings/ui-strings', async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT value FROM settings WHERE key = 'ui_strings'`
  ).first<{ value: string }>()

  let strings = {}
  if (result?.value) {
    try { strings = JSON.parse(result.value) } catch { /* use empty */ }
  }

  c.header('Cache-Control', 'public, max-age=60')
  return c.json({ strings })
})

// Sitemap.xml — auto-generated from published pages and posts
app.get('/api/sitemap.xml', async (c) => {
  const baseUrl = c.env.SITE_URL || 'https://livskompass.se'

  const [pagesResult, postsResult, coursesResult] = await c.env.DB.batch([
    c.env.DB.prepare(`SELECT slug, updated_at FROM pages WHERE status = 'published'`),
    c.env.DB.prepare(`SELECT slug, updated_at FROM posts WHERE status = 'published'`),
    c.env.DB.prepare(`SELECT slug, created_at as updated_at FROM courses WHERE status IN ('active', 'full')`),
  ])

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`

  // Homepage
  xml += `  <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`

  const toDate = (dt: string) => dt ? dt.split(/[T ]/)[0] : ''

  // Pages
  for (const page of (pagesResult.results || []) as { slug: string; updated_at: string }[]) {
    const d = toDate(page.updated_at)
    const lastmod = d ? `<lastmod>${d}</lastmod>` : ''
    xml += `  <url><loc>${baseUrl}/${page.slug}</loc>${lastmod}<changefreq>weekly</changefreq><priority>0.8</priority></url>\n`
  }

  // Posts
  for (const post of (postsResult.results || []) as { slug: string; updated_at: string }[]) {
    const d = toDate(post.updated_at)
    const lastmod = d ? `<lastmod>${d}</lastmod>` : ''
    xml += `  <url><loc>${baseUrl}/nyhet/${post.slug}</loc>${lastmod}<changefreq>monthly</changefreq><priority>0.6</priority></url>\n`
  }

  // Courses
  for (const course of (coursesResult.results || []) as { slug: string; updated_at: string }[]) {
    const d = toDate(course.updated_at)
    const lastmod = d ? `<lastmod>${d}</lastmod>` : ''
    xml += `  <url><loc>${baseUrl}/utbildningar/${course.slug}</loc>${lastmod}<changefreq>weekly</changefreq><priority>0.7</priority></url>\n`
  }

  xml += `</urlset>`

  c.header('Content-Type', 'application/xml')
  c.header('Cache-Control', 'public, max-age=3600')
  return c.body(xml)
})

// Public routes
app.route('/api/pages', pagesRoutes)
app.route('/api/posts', postsRoutes)
app.route('/api/courses', coursesRoutes)
app.route('/api/bookings', bookingsRoutes)
app.route('/api/products', productsRoutes)
app.route('/api/contact', contactRoutes)

// Auth routes
app.route('/api/auth', authRoutes)

// Admin routes (protected, includes media)
app.route('/api/admin', adminRoutes)

// 404 handler
app.notFound((c) => c.json({ error: 'Not found' }, 404))

// Error handler
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    // Clean up abandoned bookings: pending bookings older than 30 min with no Stripe session
    const result = await env.DB.prepare(`
      SELECT id, course_id, participants FROM bookings
      WHERE payment_status = 'pending'
        AND stripe_session_id IS NULL
        AND created_at < datetime('now', '-30 minutes')
    `).all()

    for (const booking of result.results) {
      // Release reserved spots
      await env.DB.prepare(`
        UPDATE courses
        SET current_participants = MAX(0, current_participants - ?),
            status = CASE
              WHEN status = 'full' THEN 'active'
              ELSE status
            END
        WHERE id = ?
      `).bind(booking.participants, booking.course_id).run()

      // Delete the abandoned booking
      await env.DB.prepare(`DELETE FROM bookings WHERE id = ?`).bind(booking.id).run()
    }

    if (result.results.length > 0) {
      console.log(`Cleaned up ${result.results.length} abandoned bookings`)
    }

    // Clean up expired sessions
    await env.DB.prepare(`
      DELETE FROM sessions WHERE expires_at < datetime('now')
    `).run()
  }
}
