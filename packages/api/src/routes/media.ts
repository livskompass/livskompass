import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import type { Bindings } from '../index'

export const mediaRoutes = new Hono<{ Bindings: Bindings }>()

// Upload media
mediaRoutes.post('/upload', async (c) => {
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

  // Generate public URL (assuming R2 public access is enabled)
  const url = `https://media.livskompass.se/${r2Key}`

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
mediaRoutes.get('/', async (c) => {
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

  return c.json({ media: result.results })
})

// Delete media
mediaRoutes.delete('/:id', async (c) => {
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
