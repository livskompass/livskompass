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

export default app
