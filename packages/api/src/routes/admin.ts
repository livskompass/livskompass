import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import Stripe from 'stripe'
import { verifySession } from './auth'
import type { Bindings } from '../index'

type Variables = {
  userId: string
  userRole: string
}

export const adminRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Auth middleware for admin routes
adminRoutes.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  const token = authHeader.substring(7)
  const session = await verifySession(c.env.DB, token)

  if (!session) {
    return c.json({ error: 'Invalid session' }, 401)
  }

  // Store user info for later use
  c.set('userId', session.user_id)
  c.set('userRole', session.role)
  await next()
})

// ============ PAGES ============

// List all pages
adminRoutes.get('/pages', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT * FROM pages ORDER BY sort_order ASC
  `).all()
  return c.json({ pages: result.results })
})

// Get single page
adminRoutes.get('/pages/:id', async (c) => {
  const id = c.req.param('id')
  const result = await c.env.DB.prepare(`SELECT * FROM pages WHERE id = ?`).bind(id).first()
  if (!result) {
    return c.json({ error: 'Page not found' }, 404)
  }
  return c.json({ page: result })
})

// Create page
adminRoutes.post('/pages', async (c) => {
  const body = await c.req.json()
  const { slug, title, content, status } = body
  const contentBlocks = body.contentBlocks ?? body.content_blocks
  const editorVersion = body.editorVersion ?? body.editor_version
  const metaDescription = body.metaDescription ?? body.meta_description
  const parentSlug = body.parentSlug ?? body.parent_slug
  const sortOrder = body.sortOrder ?? body.sort_order

  const id = nanoid()

  await c.env.DB.prepare(`
    INSERT INTO pages (id, slug, title, content, content_blocks, editor_version, meta_description, parent_slug, sort_order, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, slug, title, content || null, contentBlocks || null, editorVersion || 'legacy', metaDescription || null, parentSlug || null, sortOrder || 0, status || 'draft').run()

  return c.json({ page: { id, slug, title } }, 201)
})

// Update page
adminRoutes.put('/pages/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { slug, title, content, status } = body
  const contentBlocks = body.contentBlocks ?? body.content_blocks
  const editorVersion = body.editorVersion ?? body.editor_version
  const metaDescription = body.metaDescription ?? body.meta_description
  const parentSlug = body.parentSlug ?? body.parent_slug
  const sortOrder = body.sortOrder ?? body.sort_order

  await c.env.DB.prepare(`
    UPDATE pages
    SET slug = ?, title = ?, content = ?, content_blocks = ?, editor_version = ?,
        meta_description = ?, parent_slug = ?, sort_order = ?, status = ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(slug, title, content || null, contentBlocks || null, editorVersion || 'legacy', metaDescription || null, parentSlug || null, sortOrder || 0, status, id).run()

  return c.json({ success: true })
})

// Partial update page (for inline editing)
adminRoutes.patch('/pages/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const contentBlocks = body.contentBlocks ?? body.content_blocks
  const updatedAt = body.updatedAt ?? body.updated_at

  // Conflict detection: compare updated_at timestamp
  if (updatedAt) {
    const existing = await c.env.DB.prepare(
      `SELECT updated_at FROM pages WHERE id = ?`
    ).bind(id).first<{ updated_at: string }>()

    if (existing && existing.updated_at !== updatedAt) {
      return c.json({ error: 'conflict', message: 'Page was modified by another user' }, 409)
    }
  }

  if (contentBlocks !== undefined) {
    await c.env.DB.prepare(`
      UPDATE pages SET content_blocks = ?, editor_version = 'puck', updated_at = datetime('now')
      WHERE id = ?
    `).bind(contentBlocks, id).run()
  }

  const page = await c.env.DB.prepare(`SELECT * FROM pages WHERE id = ?`).bind(id).first()
  return c.json({ success: true, page })
})

// Delete page
adminRoutes.delete('/pages/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare(`DELETE FROM pages WHERE id = ?`).bind(id).run()
  return c.json({ success: true })
})

// ============ POSTS ============

adminRoutes.get('/posts', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT * FROM posts ORDER BY created_at DESC
  `).all()
  return c.json({ posts: result.results })
})

// Get single post
adminRoutes.get('/posts/:id', async (c) => {
  const id = c.req.param('id')
  const result = await c.env.DB.prepare(`SELECT * FROM posts WHERE id = ?`).bind(id).first()
  if (!result) {
    return c.json({ error: 'Post not found' }, 404)
  }
  return c.json({ post: result })
})

adminRoutes.post('/posts', async (c) => {
  const body = await c.req.json()
  const { slug, title, content, excerpt, status } = body
  const contentBlocks = body.contentBlocks ?? body.content_blocks
  const editorVersion = body.editorVersion ?? body.editor_version
  const featuredImage = body.featuredImage ?? body.featured_image
  const publishedAt = body.publishedAt ?? body.published_at

  const id = nanoid()

  await c.env.DB.prepare(`
    INSERT INTO posts (id, slug, title, content, content_blocks, editor_version, excerpt, featured_image, status, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, slug, title, content || null, contentBlocks || null, editorVersion || 'legacy', excerpt || null, featuredImage || null, status || 'draft', publishedAt || null).run()

  return c.json({ post: { id, slug, title } }, 201)
})

adminRoutes.put('/posts/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { slug, title, content, excerpt, status } = body
  const contentBlocks = body.contentBlocks ?? body.content_blocks
  const editorVersion = body.editorVersion ?? body.editor_version
  const featuredImage = body.featuredImage ?? body.featured_image
  const publishedAt = body.publishedAt ?? body.published_at

  await c.env.DB.prepare(`
    UPDATE posts
    SET slug = ?, title = ?, content = ?, content_blocks = ?, editor_version = ?,
        excerpt = ?, featured_image = ?, status = ?, published_at = ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(slug, title, content || null, contentBlocks || null, editorVersion || 'legacy', excerpt || null, featuredImage || null, status, publishedAt || null, id).run()

  return c.json({ success: true })
})

adminRoutes.delete('/posts/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare(`DELETE FROM posts WHERE id = ?`).bind(id).run()
  return c.json({ success: true })
})

// ============ COURSES ============

adminRoutes.get('/courses', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT * FROM courses ORDER BY start_date DESC
  `).all()
  return c.json({ courses: result.results })
})

// Get single course
adminRoutes.get('/courses/:id', async (c) => {
  const id = c.req.param('id')
  const result = await c.env.DB.prepare(`SELECT * FROM courses WHERE id = ?`).bind(id).first()
  if (!result) {
    return c.json({ error: 'Course not found' }, 404)
  }
  return c.json({ course: result })
})

adminRoutes.post('/courses', async (c) => {
  const body = await c.req.json()
  const { slug, title, description, content, status } = body
  const contentBlocks = body.contentBlocks ?? body.content_blocks
  const editorVersion = body.editorVersion ?? body.editor_version
  const location = body.location
  const startDate = body.startDate ?? body.start_date
  const endDate = body.endDate ?? body.end_date
  const priceSek = body.priceSek ?? body.price_sek
  const maxParticipants = body.maxParticipants ?? body.max_participants
  const registrationDeadline = body.registrationDeadline ?? body.registration_deadline

  const id = nanoid()

  await c.env.DB.prepare(`
    INSERT INTO courses (id, slug, title, description, content, content_blocks, editor_version,
                        location, start_date, end_date, price_sek, max_participants,
                        registration_deadline, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, slug, title, description, content || null, contentBlocks || null,
          editorVersion || 'legacy', location || null, startDate || null, endDate || null,
          priceSek || null, maxParticipants || null, registrationDeadline || null,
          status || 'active').run()

  return c.json({ course: { id, slug, title } }, 201)
})

adminRoutes.put('/courses/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { slug, title, description, content, status } = body
  const contentBlocks = body.contentBlocks ?? body.content_blocks
  const editorVersion = body.editorVersion ?? body.editor_version
  const location = body.location
  const startDate = body.startDate ?? body.start_date
  const endDate = body.endDate ?? body.end_date
  const priceSek = body.priceSek ?? body.price_sek
  const maxParticipants = body.maxParticipants ?? body.max_participants
  const registrationDeadline = body.registrationDeadline ?? body.registration_deadline

  await c.env.DB.prepare(`
    UPDATE courses
    SET slug = ?, title = ?, description = ?, content = ?, content_blocks = ?,
        editor_version = ?, location = ?, start_date = ?, end_date = ?,
        price_sek = ?, max_participants = ?, registration_deadline = ?, status = ?
    WHERE id = ?
  `).bind(slug, title, description, content || null, contentBlocks || null,
          editorVersion || 'legacy', location || null, startDate || null, endDate || null,
          priceSek || null, maxParticipants || null, registrationDeadline || null,
          status, id).run()

  return c.json({ success: true })
})

// Delete course (check for associated bookings first)
adminRoutes.delete('/courses/:id', async (c) => {
  const id = c.req.param('id')

  const bookingCount = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM bookings WHERE course_id = ?`
  ).bind(id).first() as { count: number } | null

  if (bookingCount && bookingCount.count > 0) {
    return c.json({
      error: `Kan inte ta bort kurs med ${bookingCount.count} bokningar. Avboka eller ta bort bokningarna först.`
    }, 400)
  }

  await c.env.DB.prepare(`DELETE FROM courses WHERE id = ?`).bind(id).run()
  return c.json({ success: true })
})

// ============ BOOKINGS ============

adminRoutes.get('/bookings', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT b.*, c.title as course_title
    FROM bookings b
    JOIN courses c ON b.course_id = c.id
    ORDER BY b.created_at DESC
  `).all()
  return c.json({ bookings: result.results })
})

adminRoutes.get('/bookings/:id', async (c) => {
  const id = c.req.param('id')
  const result = await c.env.DB.prepare(`
    SELECT b.*, c.title as course_title
    FROM bookings b
    JOIN courses c ON b.course_id = c.id
    WHERE b.id = ?
  `).bind(id).first()

  if (!result) {
    return c.json({ error: 'Booking not found' }, 404)
  }

  return c.json({ booking: result })
})

adminRoutes.put('/bookings/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { bookingStatus, notes } = body

  await c.env.DB.prepare(`
    UPDATE bookings SET booking_status = ?, notes = ? WHERE id = ?
  `).bind(bookingStatus, notes, id).run()

  return c.json({ success: true })
})

// Refund booking (Task 2)
adminRoutes.post('/bookings/:id/refund', async (c) => {
  const id = c.req.param('id')

  const booking = await c.env.DB.prepare(`
    SELECT b.*, c.current_participants, c.max_participants, c.status as course_status
    FROM bookings b
    JOIN courses c ON b.course_id = c.id
    WHERE b.id = ?
  `).bind(id).first() as {
    id: string
    course_id: string
    participants: number
    payment_status: string
    stripe_payment_intent: string | null
    current_participants: number
    max_participants: number
    course_status: string
  } | null

  if (!booking) {
    return c.json({ error: 'Booking not found' }, 404)
  }

  if (booking.payment_status !== 'paid') {
    return c.json({ error: 'Booking is not paid, cannot refund' }, 400)
  }

  if (!booking.stripe_payment_intent) {
    return c.json({ error: 'No payment intent found for this booking' }, 400)
  }

  // Process Stripe refund
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

  try {
    await stripe.refunds.create({
      payment_intent: booking.stripe_payment_intent,
    })
  } catch (err) {
    console.error('Stripe refund failed:', err)
    return c.json({ error: 'Refund failed on Stripe' }, 500)
  }

  // Update booking status
  await c.env.DB.prepare(`
    UPDATE bookings
    SET payment_status = 'refunded', booking_status = 'cancelled'
    WHERE id = ?
  `).bind(id).run()

  // Decrement course participants (prevent negative with MAX)
  // and reactivate course if it was full
  const wasFull = booking.course_status === 'full'
  await c.env.DB.prepare(`
    UPDATE courses
    SET current_participants = MAX(0, current_participants - ?),
        status = CASE
          WHEN status = 'full' AND (current_participants - ?) < max_participants THEN 'active'
          ELSE status
        END
    WHERE id = ?
  `).bind(booking.participants, booking.participants, booking.course_id).run()

  return c.json({ success: true })
})

// ============ PRODUCTS ============

adminRoutes.get('/products', async (c) => {
  const result = await c.env.DB.prepare(`SELECT * FROM products ORDER BY title`).all()
  return c.json({ products: result.results })
})

// Get single product
adminRoutes.get('/products/:id', async (c) => {
  const id = c.req.param('id')
  const result = await c.env.DB.prepare(`SELECT * FROM products WHERE id = ?`).bind(id).first()
  if (!result) {
    return c.json({ error: 'Product not found' }, 404)
  }
  return c.json({ product: result })
})

adminRoutes.post('/products', async (c) => {
  const body = await c.req.json()
  const { slug, title, description, type, status } = body
  const contentBlocks = body.contentBlocks ?? body.content_blocks
  const editorVersion = body.editorVersion ?? body.editor_version
  const priceSek = body.priceSek ?? body.price_sek
  const externalUrl = body.externalUrl ?? body.external_url
  const imageUrl = body.imageUrl ?? body.image_url
  const inStock = body.inStock ?? body.in_stock

  const id = nanoid()

  await c.env.DB.prepare(`
    INSERT INTO products (id, slug, title, description, content_blocks, editor_version,
                         type, price_sek, external_url, image_url, in_stock, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, slug, title, description, contentBlocks || null, editorVersion || 'legacy',
          type, priceSek, externalUrl, imageUrl, inStock ?? 1, status || 'active').run()

  return c.json({ product: { id, slug, title } }, 201)
})

adminRoutes.put('/products/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { slug, title, description, type, status } = body
  const contentBlocks = body.contentBlocks ?? body.content_blocks
  const editorVersion = body.editorVersion ?? body.editor_version
  const priceSek = body.priceSek ?? body.price_sek
  const externalUrl = body.externalUrl ?? body.external_url
  const imageUrl = body.imageUrl ?? body.image_url
  const inStock = body.inStock ?? body.in_stock

  await c.env.DB.prepare(`
    UPDATE products
    SET slug = ?, title = ?, description = ?, content_blocks = ?, editor_version = ?,
        type = ?, price_sek = ?, external_url = ?, image_url = ?, in_stock = ?, status = ?
    WHERE id = ?
  `).bind(slug, title, description, contentBlocks || null, editorVersion || 'legacy',
          type, priceSek, externalUrl, imageUrl, inStock, status, id).run()

  return c.json({ success: true })
})

adminRoutes.delete('/products/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare(`DELETE FROM products WHERE id = ?`).bind(id).run()
  return c.json({ success: true })
})

// ============ CONTACTS ============

adminRoutes.get('/contacts', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT * FROM contacts ORDER BY created_at DESC
  `).all()
  return c.json({ contacts: result.results })
})

adminRoutes.put('/contacts/:id/read', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare(`UPDATE contacts SET read = 1 WHERE id = ?`).bind(id).run()
  return c.json({ success: true })
})

adminRoutes.delete('/contacts/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare(`DELETE FROM contacts WHERE id = ?`).bind(id).run()
  return c.json({ success: true })
})

// ============ MEDIA (Task 4 - moved from public routes, now auth-protected) ============

// Upload media
adminRoutes.post('/media/upload', async (c) => {
  const formData = await c.req.formData()
  const fileEntry = formData.get('file')

  if (!fileEntry || typeof fileEntry === 'string') {
    return c.json({ error: 'No file provided' }, 400)
  }

  const file = fileEntry as File

  const id = nanoid()
  const ext = file.name.split('.').pop() || ''
  const r2Key = `${id}.${ext}`

  // Determine type
  let type = 'other'
  if (file.type.startsWith('image/')) type = 'image'
  else if (file.type === 'application/pdf') type = 'pdf'
  else if (file.type.startsWith('audio/')) type = 'audio'
  else if (file.type.startsWith('video/')) type = 'video'

  // Upload to R2
  await c.env.MEDIA.put(r2Key, file.stream(), {
    httpMetadata: { contentType: file.type }
  })

  // Generate absolute public URL via the Worker's /media/ route
  const siteUrl = c.env.SITE_URL.replace(/\/$/, '')
  const url = `${siteUrl}/media/${r2Key}`

  // Save to database
  await c.env.DB.prepare(`
    INSERT INTO media (id, filename, r2_key, url, type, size_bytes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, file.name, r2Key, url, type, file.size).run()

  return c.json({
    media: { id, filename: file.name, url, type, size: file.size }
  }, 201)
})

// List media
adminRoutes.get('/media', async (c) => {
  const type = c.req.query('type')
  const limit = parseInt(c.req.query('limit') || '50')
  const offset = parseInt(c.req.query('offset') || '0')

  let query = `SELECT * FROM media`
  const params: (string | number)[] = []

  if (type) {
    query += ` WHERE type = ?`
    params.push(type)
  }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
  params.push(limit, offset)

  const result = await c.env.DB.prepare(query).bind(...params).all()

  // Ensure all media URLs are absolute (DB may contain relative URLs from older uploads)
  const siteUrl = c.env.SITE_URL.replace(/\/$/, '')
  const media = result.results.map((item: any) => ({
    ...item,
    url: item.url && !item.url.startsWith('http') ? `${siteUrl}${item.url}` : item.url,
  }))

  return c.json({ media })
})

// Delete media
adminRoutes.delete('/media/:id', async (c) => {
  const id = c.req.param('id')

  const media = await c.env.DB.prepare(`
    SELECT r2_key FROM media WHERE id = ?
  `).bind(id).first()

  if (!media) {
    return c.json({ error: 'Media not found' }, 404)
  }

  // Delete from R2
  await c.env.MEDIA.delete(media.r2_key as string)

  // Delete from database
  await c.env.DB.prepare(`DELETE FROM media WHERE id = ?`).bind(id).run()

  return c.json({ success: true })
})

// ============ SETTINGS (Task 8 - admin role check + batch updates) ============

adminRoutes.get('/settings', async (c) => {
  const result = await c.env.DB.prepare(`SELECT * FROM settings`).all()
  const settings: Record<string, string> = {}
  result.results?.forEach((row: any) => {
    settings[row.key] = row.value
  })
  return c.json({ settings })
})

adminRoutes.put('/settings', async (c) => {
  const role = c.get('userRole')
  if (role !== 'admin') {
    return c.json({ error: 'Only admins can modify settings' }, 403)
  }

  const body = await c.req.json()

  const statements = Object.entries(body).map(([key, value]) =>
    c.env.DB.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`).bind(key, value as string)
  )

  if (statements.length > 0) {
    await c.env.DB.batch(statements)
  }

  return c.json({ success: true })
})

// ============ SITE SETTINGS (header/footer) ============

adminRoutes.get('/site-settings', async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT key, value FROM settings WHERE key IN ('site_header', 'site_footer')`
  ).all()

  const settings: Record<string, any> = {}
  result.results?.forEach((row: any) => {
    try { settings[row.key] = JSON.parse(row.value) } catch { settings[row.key] = null }
  })

  return c.json({
    header: settings.site_header || null,
    footer: settings.site_footer || null,
  })
})

adminRoutes.put('/site-settings', async (c) => {
  const role = c.get('userRole')
  if (role !== 'admin') {
    return c.json({ error: 'Only admins can modify site settings' }, 403)
  }

  const body = await c.req.json()
  const { header, footer } = body

  const statements: any[] = []
  if (header !== undefined) {
    statements.push(
      c.env.DB.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`)
        .bind('site_header', JSON.stringify(header))
    )
  }
  if (footer !== undefined) {
    statements.push(
      c.env.DB.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`)
        .bind('site_footer', JSON.stringify(footer))
    )
  }

  if (statements.length > 0) {
    await c.env.DB.batch(statements)
  }

  return c.json({ success: true })
})

// ============ DASHBOARD STATS ============

adminRoutes.get('/stats', async (c) => {
  const [pages, posts, courses, bookings, contacts] = await Promise.all([
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM pages WHERE status = 'published'`).first(),
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM posts WHERE status = 'published'`).first(),
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM courses WHERE status = 'active'`).first(),
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM bookings WHERE payment_status = 'paid'`).first(),
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM contacts WHERE read = 0`).first(),
  ])

  return c.json({
    stats: {
      publishedPages: pages?.count || 0,
      publishedPosts: posts?.count || 0,
      activeCourses: courses?.count || 0,
      paidBookings: bookings?.count || 0,
      unreadContacts: contacts?.count || 0,
    }
  })
})
