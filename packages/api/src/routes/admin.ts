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

/**
 * Public URL prefix per content type. The empty prefix for pages means a page
 * with slug "about" lives at `/about`; posts at `/nyhet/<slug>`, etc.
 */
const URL_PREFIX: Record<'page' | 'post' | 'course' | 'product', string> = {
  page: '',
  post: '/nyhet',
  course: '/utbildningar',
  product: '/material',
}

/**
 * When a slug changes, rewrite every reference to the old URL in stored
 * block JSON and in known settings. Matches `/old-url` inside JSON strings
 * bounded by `"`, `\`, `/`, `?`, `#`, so we don't maul free text.
 */
async function cascadeSlugRename(
  db: any,
  contentType: 'page' | 'post' | 'course' | 'product',
  oldSlug: string,
  newSlug: string,
) {
  if (!oldSlug || !newSlug || oldSlug === newSlug) return

  const prefix = URL_PREFIX[contentType]
  const oldUrl = `${prefix}/${oldSlug}`
  const newUrl = `${prefix}/${newSlug}`

  const escaped = oldUrl.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
  // Preceded by `"` or `\` (JSON string / HTML-escaped href); followed by a
  // URL terminator so `/old` doesn't match `/old-other`.
  const re = new RegExp(`(?<=["\\\\])${escaped}(?=["/?#\\\\])`, 'g')

  const rewrite = (text: string | null): string | null => {
    if (!text) return null
    const replaced = text.replace(re, newUrl)
    return replaced !== text ? replaced : null
  }

  const statements: any[] = []
  const likePattern = `%${oldUrl}%`

  for (const table of ['pages', 'posts', 'courses', 'products'] as const) {
    const rows = await db.prepare(
      `SELECT id, content_blocks, draft FROM ${table} WHERE content_blocks LIKE ? OR draft LIKE ?`,
    ).bind(likePattern, likePattern).all()

    for (const row of rows.results || []) {
      const r = row as { id: string; content_blocks: string | null; draft: string | null }
      const newCB = rewrite(r.content_blocks)
      const newDraft = rewrite(r.draft)

      if (newCB !== null && newDraft !== null) {
        statements.push(
          db.prepare(`UPDATE ${table} SET content_blocks = ?, draft = ? WHERE id = ?`).bind(newCB, newDraft, r.id),
        )
      } else if (newCB !== null) {
        statements.push(
          db.prepare(`UPDATE ${table} SET content_blocks = ? WHERE id = ?`).bind(newCB, r.id),
        )
      } else if (newDraft !== null) {
        statements.push(
          db.prepare(`UPDATE ${table} SET draft = ? WHERE id = ?`).bind(newDraft, r.id),
        )
      }
    }
  }

  // Page-only: parent_slug column and homepage_slug setting store bare slugs
  if (contentType === 'page') {
    statements.push(
      db.prepare(`UPDATE pages SET parent_slug = ? WHERE parent_slug = ?`).bind(newSlug, oldSlug),
    )
    const hp = await db.prepare(`SELECT value FROM settings WHERE key = 'homepage_slug'`).first() as { value: string } | null
    if (hp && hp.value === oldSlug) {
      statements.push(
        db.prepare(`UPDATE settings SET value = ? WHERE key = 'homepage_slug'`).bind(newSlug),
      )
    }
  }

  // Site-wide settings that store JSON with links (site_header, site_footer, etc.)
  const settingRows = await db.prepare(
    `SELECT key, value FROM settings WHERE value LIKE ?`,
  ).bind(likePattern).all()
  for (const row of settingRows.results || []) {
    const r = row as { key: string; value: string }
    const newValue = rewrite(r.value)
    if (newValue !== null) {
      statements.push(
        db.prepare(`UPDATE settings SET value = ? WHERE key = ?`).bind(newValue, r.key),
      )
    }
  }

  if (statements.length > 0) {
    await db.batch(statements)
  }
}

/** Snapshot the current state of a content entity before overwriting (publish) */
async function snapshotBeforePublish(
  db: any,
  table: string,
  contentType: string,
  entityId: string,
  userId: string,
) {
  const current = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(entityId).first()
  if (!current || !current.content_blocks) return // Nothing to snapshot if no blocks yet

  const versionId = nanoid()
  await db.prepare(`
    INSERT INTO content_versions (id, content_type, entity_id, title, content_blocks, snapshot, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    versionId,
    contentType,
    entityId,
    current.title || 'Untitled',
    current.content_blocks,
    JSON.stringify(current),
    userId,
  ).run()
}

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
    SELECT * FROM pages WHERE status != 'archived' ORDER BY sort_order ASC
  `).all()
  return c.json({ pages: result.results })
})

// Get single page
adminRoutes.get('/pages/:id', async (c) => {
  const id = c.req.param('id')
  // Support both ID and slug lookup
  let result = await c.env.DB.prepare(`SELECT * FROM pages WHERE id = ?`).bind(id).first()
  if (!result) {
    result = await c.env.DB.prepare(`SELECT * FROM pages WHERE slug = ?`).bind(id).first()
  }
  if (!result) {
    return c.json({ error: 'Page not found' }, 404)
  }
  return c.json({ page: result })
})

// Save page draft (auto-save — does NOT touch live columns)
adminRoutes.patch('/pages/:id/draft', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const draftValue = body ? JSON.stringify(body) : null
  await c.env.DB.prepare('UPDATE pages SET draft = ? WHERE id = ?')
    .bind(draftValue, id).run()
  return c.json({ success: true })
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
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { slug, title, content, status } = body
    const contentBlocks = body.contentBlocks ?? body.content_blocks
    const editorVersion = body.editorVersion ?? body.editor_version
    const metaDescription = body.metaDescription ?? body.meta_description
    const parentSlug = body.parentSlug ?? body.parent_slug
    const sortOrder = body.sortOrder ?? body.sort_order

    if (!slug || !title) {
      return c.json({ error: 'Missing required fields: slug and title' }, 400)
    }

    const previous = await c.env.DB.prepare(`SELECT slug FROM pages WHERE id = ?`).bind(id).first() as { slug: string } | null

    // Auto-snapshot before publish
    await snapshotBeforePublish(c.env.DB, 'pages', 'page', id, c.get('userId'))

    await c.env.DB.prepare(`
      UPDATE pages
      SET slug = ?, title = ?, content = ?, content_blocks = ?, editor_version = ?,
          meta_description = ?, parent_slug = ?, sort_order = ?, status = ?, draft = NULL, updated_at = datetime('now')
      WHERE id = ?
    `).bind(slug || '', title || '', content || null, contentBlocks || null, editorVersion || 'legacy', metaDescription || null, parentSlug || null, sortOrder || 0, status || 'published', id).run()

    if (previous && previous.slug && previous.slug !== slug) {
      await cascadeSlugRename(c.env.DB, 'page', previous.slug, slug)
    }

    return c.json({ success: true })
  } catch (err: any) {
    console.error('Page publish error:', err?.message || err)
    return c.json({ error: err?.message || 'Internal server error' }, 500)
  }
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
    SELECT * FROM posts WHERE status != 'archived' ORDER BY created_at DESC
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

// Save post draft (auto-save)
adminRoutes.patch('/posts/:id/draft', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const draftValue = body ? JSON.stringify(body) : null
  await c.env.DB.prepare('UPDATE posts SET draft = ? WHERE id = ?')
    .bind(draftValue, id).run()
  return c.json({ success: true })
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

// Inline-edit: update only content_blocks for a post
adminRoutes.patch('/posts/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const contentBlocks = body.contentBlocks ?? body.content_blocks
  const updatedAt = body.updatedAt ?? body.updated_at

  if (updatedAt) {
    const existing = await c.env.DB.prepare(
      `SELECT updated_at FROM posts WHERE id = ?`
    ).bind(id).first<{ updated_at: string }>()

    if (existing && existing.updated_at !== updatedAt) {
      return c.json({ error: 'conflict', message: 'Post was modified by another user' }, 409)
    }
  }

  if (contentBlocks !== undefined) {
    await c.env.DB.prepare(`
      UPDATE posts SET content_blocks = ?, editor_version = 'puck', updated_at = datetime('now')
      WHERE id = ?
    `).bind(contentBlocks, id).run()
  }

  const post = await c.env.DB.prepare(`SELECT * FROM posts WHERE id = ?`).bind(id).first()
  return c.json({ success: true, post })
})

adminRoutes.put('/posts/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { slug, title, content, excerpt, status } = body
  const contentBlocks = body.contentBlocks ?? body.content_blocks
  const editorVersion = body.editorVersion ?? body.editor_version
  const featuredImage = body.featuredImage ?? body.featured_image
  const publishedAt = body.publishedAt ?? body.published_at

  const previous = await c.env.DB.prepare(`SELECT slug FROM posts WHERE id = ?`).bind(id).first() as { slug: string } | null

  // Auto-snapshot before publish
  await snapshotBeforePublish(c.env.DB, 'posts', 'post', id, c.get('userId'))

  await c.env.DB.prepare(`
    UPDATE posts
    SET slug = ?, title = ?, content = ?, content_blocks = ?, editor_version = ?,
        excerpt = ?, featured_image = ?, status = ?, published_at = ?, draft = NULL, updated_at = datetime('now')
    WHERE id = ?
  `).bind(slug, title, content || null, contentBlocks || null, editorVersion || 'legacy', excerpt || null, featuredImage || null, status, publishedAt || null, id).run()

  if (previous && previous.slug && previous.slug !== slug) {
    await cascadeSlugRename(c.env.DB, 'post', previous.slug, slug)
  }

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
    SELECT * FROM courses WHERE status != 'archived' ORDER BY start_date DESC
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

// Save course draft (auto-save)
adminRoutes.patch('/courses/:id/draft', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const draftValue = body ? JSON.stringify(body) : null
  await c.env.DB.prepare('UPDATE courses SET draft = ? WHERE id = ?')
    .bind(draftValue, id).run()
  return c.json({ success: true })
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
          status || 'draft').run()

  return c.json({ course: { id, slug, title } }, 201)
})

// Inline-edit: update only content_blocks for a course
adminRoutes.patch('/courses/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const contentBlocks = body.contentBlocks ?? body.content_blocks
  const updatedAt = body.updatedAt ?? body.updated_at

  if (updatedAt) {
    const existing = await c.env.DB.prepare(
      `SELECT updated_at FROM courses WHERE id = ?`
    ).bind(id).first<{ updated_at: string }>()

    if (existing && existing.updated_at !== updatedAt) {
      return c.json({ error: 'conflict', message: 'Course was modified by another user' }, 409)
    }
  }

  if (contentBlocks !== undefined) {
    await c.env.DB.prepare(`
      UPDATE courses SET content_blocks = ?, editor_version = 'puck', updated_at = datetime('now')
      WHERE id = ?
    `).bind(contentBlocks, id).run()
  }

  const course = await c.env.DB.prepare(`SELECT * FROM courses WHERE id = ?`).bind(id).first()
  return c.json({ success: true, course })
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

  const previous = await c.env.DB.prepare(`SELECT slug FROM courses WHERE id = ?`).bind(id).first() as { slug: string } | null

  // Auto-snapshot before publish
  await snapshotBeforePublish(c.env.DB, 'courses', 'course', id, c.get('userId'))

  await c.env.DB.prepare(`
    UPDATE courses
    SET slug = ?, title = ?, description = ?, content = ?, content_blocks = ?,
        editor_version = ?, location = ?, start_date = ?, end_date = ?,
        price_sek = ?, max_participants = ?, registration_deadline = ?, status = ?, draft = NULL
    WHERE id = ?
  `).bind(slug, title, description, content || null, contentBlocks || null,
          editorVersion || 'legacy', location || null, startDate || null, endDate || null,
          priceSek || null, maxParticipants || null, registrationDeadline || null,
          status, id).run()

  if (previous && previous.slug && previous.slug !== slug) {
    await cascadeSlugRename(c.env.DB, 'course', previous.slug, slug)
  }

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
      error: `Cannot delete course with ${bookingCount.count} bookings. Cancel or remove the bookings first.`
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
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' as any })

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
          WHEN status = 'full' AND (current_participants - ?) < max_participants THEN 'published'
          ELSE status
        END
    WHERE id = ?
  `).bind(booking.participants, booking.participants, booking.course_id).run()

  return c.json({ success: true })
})

// ============ PRODUCTS ============

adminRoutes.get('/products', async (c) => {
  const result = await c.env.DB.prepare(`SELECT * FROM products WHERE status != 'archived' ORDER BY title`).all()
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

// Save product draft (auto-save)
adminRoutes.patch('/products/:id/draft', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const draftValue = body ? JSON.stringify(body) : null
  await c.env.DB.prepare('UPDATE products SET draft = ? WHERE id = ?')
    .bind(draftValue, id).run()
  return c.json({ success: true })
})

// Inline-edit: update only content_blocks for a product
adminRoutes.patch('/products/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const contentBlocks = body.contentBlocks ?? body.content_blocks
  const updatedAt = body.updatedAt ?? body.updated_at

  if (updatedAt) {
    const existing = await c.env.DB.prepare(
      `SELECT updated_at FROM products WHERE id = ?`
    ).bind(id).first<{ updated_at: string }>()

    if (existing && existing.updated_at !== updatedAt) {
      return c.json({ error: 'conflict', message: 'Product was modified by another user' }, 409)
    }
  }

  if (contentBlocks !== undefined) {
    await c.env.DB.prepare(`
      UPDATE products SET content_blocks = ?, editor_version = 'puck', updated_at = datetime('now')
      WHERE id = ?
    `).bind(contentBlocks, id).run()
  }

  const product = await c.env.DB.prepare(`SELECT * FROM products WHERE id = ?`).bind(id).first()
  return c.json({ success: true, product })
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
          type, priceSek, externalUrl, imageUrl, inStock ?? 1, status || 'draft').run()

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

  const previous = await c.env.DB.prepare(`SELECT slug FROM products WHERE id = ?`).bind(id).first() as { slug: string } | null

  // Auto-snapshot before publish
  await snapshotBeforePublish(c.env.DB, 'products', 'product', id, c.get('userId'))

  await c.env.DB.prepare(`
    UPDATE products
    SET slug = ?, title = ?, description = ?, content_blocks = ?, editor_version = ?,
        type = ?, price_sek = ?, external_url = ?, image_url = ?, in_stock = ?, status = ?, draft = NULL
    WHERE id = ?
  `).bind(slug, title, description, contentBlocks || null, editorVersion || 'legacy',
          type, priceSek, externalUrl, imageUrl, inStock, status, id).run()

  if (previous && previous.slug && previous.slug !== slug) {
    await cascadeSlugRename(c.env.DB, 'product', previous.slug, slug)
  }

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

  // Store relative /media/ path — resolveMediaUrl() on the frontend
  // will prepend the correct API domain at render time
  const url = `/media/${r2Key}`

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

// ============ UI STRINGS ============

adminRoutes.get('/settings/ui-strings', async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT value FROM settings WHERE key = 'ui_strings'`
  ).first<{ value: string }>()

  let strings = {}
  if (result?.value) {
    try { strings = JSON.parse(result.value) } catch { /* use empty */ }
  }

  return c.json({ strings })
})

adminRoutes.put('/settings/ui-strings', async (c) => {
  const role = c.get('userRole')
  if (role !== 'admin') {
    return c.json({ error: 'Only admins can modify UI strings' }, 403)
  }

  const body = await c.req.json()
  const { strings } = body

  await c.env.DB.prepare(
    `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`
  ).bind('ui_strings', JSON.stringify(strings || {})).run()

  return c.json({ success: true })
})

// ============ HOMEPAGE SLUG ============

adminRoutes.put('/settings/homepage-slug', async (c) => {
  const role = c.get('userRole')
  if (role !== 'admin') {
    return c.json({ error: 'Only admins can modify homepage slug' }, 403)
  }

  const body = await c.req.json()
  const { slug } = body

  await c.env.DB.prepare(
    `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`
  ).bind('homepage_slug', slug || 'home-2').run()

  return c.json({ success: true })
})

// ============ ARCHIVE ============

// Get all archived items across all content types
adminRoutes.get('/archive', async (c) => {
  const [pages, posts, courses, products] = await c.env.DB.batch([
    c.env.DB.prepare(`SELECT id, slug, title, status, created_at, updated_at, 'page' as content_type FROM pages WHERE status = 'archived' ORDER BY updated_at DESC`),
    c.env.DB.prepare(`SELECT id, slug, title, status, created_at, updated_at, 'post' as content_type FROM posts WHERE status = 'archived' ORDER BY updated_at DESC`),
    c.env.DB.prepare(`SELECT id, slug, title, status, created_at, 'course' as content_type FROM courses WHERE status = 'archived' ORDER BY created_at DESC`),
    c.env.DB.prepare(`SELECT id, slug, title, status, created_at, 'product' as content_type FROM products WHERE status = 'archived' ORDER BY created_at DESC`),
  ])

  return c.json({
    items: [
      ...(pages.results || []),
      ...(posts.results || []),
      ...(courses.results || []),
      ...(products.results || []),
    ]
  })
})

// Archive an item (only if not active)
adminRoutes.post('/archive/:contentType/:id', async (c) => {
  const contentType = c.req.param('contentType')
  const id = c.req.param('id')
  const table = CONTENT_TYPE_TABLES[contentType]

  if (!table) {
    return c.json({ error: 'Invalid content type' }, 400)
  }

  const item = await c.env.DB.prepare(`SELECT status FROM ${table} WHERE id = ?`).bind(id).first<{ status: string }>()
  if (!item) {
    return c.json({ error: 'Item not found' }, 404)
  }

  // Only allow archiving non-active items
  const activeStatuses: Record<string, string[]> = {
    page: ['published'],
    post: ['published'],
    course: ['published', 'full'],
    product: ['published'],
  }

  if (activeStatuses[contentType]?.includes(item.status)) {
    return c.json({ error: 'Cannot archive an active item. Set it to draft/inactive first.' }, 400)
  }

  if (item.status === 'archived') {
    return c.json({ error: 'Item is already archived' }, 400)
  }

  const hasUpdatedAt = contentType === 'page' || contentType === 'post'
  const updateSql = hasUpdatedAt
    ? `UPDATE ${table} SET status = 'archived', updated_at = datetime('now') WHERE id = ?`
    : `UPDATE ${table} SET status = 'archived' WHERE id = ?`

  await c.env.DB.prepare(updateSql).bind(id).run()
  return c.json({ success: true })
})

// Unarchive an item (restore to default inactive status)
adminRoutes.post('/unarchive/:contentType/:id', async (c) => {
  const contentType = c.req.param('contentType')
  const id = c.req.param('id')
  const table = CONTENT_TYPE_TABLES[contentType]

  if (!table) {
    return c.json({ error: 'Invalid content type' }, 400)
  }

  const item = await c.env.DB.prepare(`SELECT status FROM ${table} WHERE id = ?`).bind(id).first<{ status: string }>()
  if (!item) {
    return c.json({ error: 'Item not found' }, 404)
  }

  if (item.status !== 'archived') {
    return c.json({ error: 'Item is not archived' }, 400)
  }

  // Restore to default inactive status per content type
  const restoreStatus: Record<string, string> = {
    page: 'draft',
    post: 'draft',
    course: 'draft',
    product: 'draft',
  }

  const newStatus = restoreStatus[contentType]
  const hasUpdatedAt = contentType === 'page' || contentType === 'post'
  const updateSql = hasUpdatedAt
    ? `UPDATE ${table} SET status = ?, updated_at = datetime('now') WHERE id = ?`
    : `UPDATE ${table} SET status = ? WHERE id = ?`

  await c.env.DB.prepare(updateSql).bind(newStatus, id).run()
  return c.json({ success: true, status: newStatus })
})

// ============ DASHBOARD STATS ============

adminRoutes.get('/stats', async (c) => {
  const results = await c.env.DB.batch([
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM pages WHERE status = 'published'`),
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM posts WHERE status = 'published'`),
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM courses WHERE status IN ('published', 'full')`),
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM bookings WHERE payment_status = 'paid'`),
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM contacts WHERE read = 0`),
  ])

  return c.json({
    stats: {
      publishedPages: (results[0].results?.[0] as { count: number } | undefined)?.count ?? 0,
      publishedPosts: (results[1].results?.[0] as { count: number } | undefined)?.count ?? 0,
      activeCourses: (results[2].results?.[0] as { count: number } | undefined)?.count ?? 0,
      paidBookings: (results[3].results?.[0] as { count: number } | undefined)?.count ?? 0,
      unreadContacts: (results[4].results?.[0] as { count: number } | undefined)?.count ?? 0,
    }
  })
})

// ============ CONTENT VERSIONS ============

const VALID_CONTENT_TYPES = ['page', 'post', 'course', 'product'] as const
const CONTENT_TYPE_TABLES: Record<string, string> = {
  page: 'pages',
  post: 'posts',
  course: 'courses',
  product: 'products',
}

// List versions for a content entity
adminRoutes.get('/versions/:contentType/:entityId', async (c) => {
  const contentType = c.req.param('contentType')
  const entityId = c.req.param('entityId')

  if (!VALID_CONTENT_TYPES.includes(contentType as any)) {
    return c.json({ error: 'Invalid content type' }, 400)
  }

  const result = await c.env.DB.prepare(`
    SELECT id, content_type, entity_id, title, created_by, created_at
    FROM content_versions
    WHERE content_type = ? AND entity_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).bind(contentType, entityId).all()

  return c.json({ versions: result.results })
})

// Get a specific version (full snapshot)
adminRoutes.get('/versions/:versionId', async (c) => {
  const versionId = c.req.param('versionId')

  const version = await c.env.DB.prepare(`
    SELECT * FROM content_versions WHERE id = ?
  `).bind(versionId).first()

  if (!version) {
    return c.json({ error: 'Version not found' }, 404)
  }

  return c.json({ version })
})

// Restore a version — overwrites the entity's content_blocks with the version's snapshot
adminRoutes.post('/versions/:versionId/restore', async (c) => {
  const versionId = c.req.param('versionId')
  const userId = c.get('userId')

  const version = await c.env.DB.prepare(`
    SELECT * FROM content_versions WHERE id = ?
  `).bind(versionId).first<{
    id: string
    content_type: string
    entity_id: string
    title: string
    content_blocks: string | null
    snapshot: string | null
  }>()

  if (!version) {
    return c.json({ error: 'Version not found' }, 404)
  }

  const table = CONTENT_TYPE_TABLES[version.content_type]
  if (!table) {
    return c.json({ error: 'Invalid content type in version' }, 400)
  }

  // Snapshot current state before restoring (so restore is reversible)
  const current = await c.env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`)
    .bind(version.entity_id).first()

  if (!current) {
    return c.json({ error: 'Entity not found' }, 404)
  }

  const preRestoreId = nanoid()
  await c.env.DB.prepare(`
    INSERT INTO content_versions (id, content_type, entity_id, title, content_blocks, snapshot, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    preRestoreId,
    version.content_type,
    version.entity_id,
    `Before restore: ${(current as any).title || 'Untitled'}`,
    (current as any).content_blocks || null,
    JSON.stringify(current),
    userId,
  ).run()

  // Restore the version's content_blocks
  await c.env.DB.prepare(`
    UPDATE ${table}
    SET content_blocks = ?, editor_version = 'puck', draft = NULL, updated_at = datetime('now')
    WHERE id = ?
  `).bind(version.content_blocks || null, version.entity_id).run()

  // Re-fetch the updated entity
  const updated = await c.env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`)
    .bind(version.entity_id).first()

  return c.json({ success: true, entity: updated })
})
