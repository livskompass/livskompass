import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import type { Bindings } from '../index'

export const authRoutes = new Hono<{ Bindings: Bindings }>()

// Google OAuth URLs
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

// Helper to verify session token
export async function verifySession(db: D1Database, token: string) {
  const session = await db.prepare(
    `SELECT s.*, u.id as user_id, u.email, u.name, u.role, u.avatar_url
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = ? AND s.expires_at > datetime('now')`
  ).bind(token).first() as {
    user_id: string
    email: string
    name: string
    role: string
    avatar_url: string
  } | null

  return session
}

// Start Google OAuth flow
authRoutes.get('/google', async (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID
  const redirectUri = `${c.env.SITE_URL}/api/auth/google/callback`

  // Allow admin to pass its origin so callback redirects back to the right place (e.g. localhost:3001)
  const adminOrigin = c.req.query('admin_origin')
  const state = adminOrigin ? JSON.stringify({ admin_origin: adminOrigin }) : undefined

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
  })

  if (state) params.set('state', state)

  return c.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`)
})

// Google OAuth callback
authRoutes.get('/google/callback', async (c) => {
  const code = c.req.query('code')
  const error = c.req.query('error')

  // Check if admin origin was passed via OAuth state parameter
  let adminUrl = c.env.ADMIN_URL || c.env.SITE_URL
  const stateParam = c.req.query('state')
  if (stateParam) {
    try {
      const state = JSON.parse(stateParam)
      if (state.admin_origin) {
        adminUrl = state.admin_origin
      }
    } catch {}
  }

  if (error || !code) {
    return c.redirect(`${adminUrl}/login?error=oauth_failed`)
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${c.env.SITE_URL}/api/auth/google/callback`,
      }),
    })

    const tokens = await tokenResponse.json() as { access_token?: string; error?: string }

    if (!tokens.access_token) {
      console.error('Token exchange failed:', tokens)
      return c.redirect(`${adminUrl}/login?error=token_failed`)
    }

    // Get user info from Google
    const userResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    const googleUser = await userResponse.json() as {
      id: string
      email: string
      name: string
      picture: string
    }

    if (!googleUser.email) {
      return c.redirect(`${adminUrl}/login?error=no_email`)
    }

    // Check if user exists in database
    let user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(googleUser.email).first() as {
      id: string
      email: string
      name: string
      role: string
      google_id: string
      avatar_url: string
    } | null

    // Count existing users
    const userCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first() as { count: number }

    if (!user) {
      // Check if this is the initial admin or if no users exist yet
      const isInitialAdmin =
        googleUser.email === c.env.INITIAL_ADMIN_EMAIL ||
        userCount.count === 0

      if (!isInitialAdmin) {
        return c.redirect(`${adminUrl}/login?error=not_authorized`)
      }

      // Create new admin user
      const userId = nanoid()
      await c.env.DB.prepare(
        `INSERT INTO users (id, email, name, role, google_id, avatar_url, created_at)
         VALUES (?, ?, ?, 'admin', ?, ?, datetime('now'))`
      ).bind(userId, googleUser.email, googleUser.name, googleUser.id, googleUser.picture).run()

      user = {
        id: userId,
        email: googleUser.email,
        name: googleUser.name,
        role: 'admin',
        google_id: googleUser.id,
        avatar_url: googleUser.picture,
      }
    } else {
      // Update existing user's Google info
      await c.env.DB.prepare(
        `UPDATE users SET google_id = ?, avatar_url = ?, name = ? WHERE id = ?`
      ).bind(googleUser.id, googleUser.picture, googleUser.name, user.id).run()
    }

    // Create session token
    const sessionToken = nanoid(32)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await c.env.DB.prepare(
      `INSERT INTO sessions (id, user_id, expires_at, created_at)
       VALUES (?, ?, ?, datetime('now'))`
    ).bind(sessionToken, user.id, expiresAt.toISOString()).run()

    // Redirect to admin with session token
    return c.redirect(`${adminUrl}/auth/callback?token=${sessionToken}`)

  } catch (err) {
    console.error('OAuth error:', err)
    return c.redirect(`${adminUrl}/login?error=oauth_error`)
  }
})

// Get current user
authRoutes.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.substring(7)
  const session = await verifySession(c.env.DB, token)

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  return c.json({
    user: {
      id: session.user_id,
      email: session.email,
      name: session.name,
      role: session.role,
      avatar_url: session.avatar_url,
    },
  })
})

// Logout
authRoutes.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    await c.env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run()
  }

  return c.json({ success: true })
})

// Admin: List all users
authRoutes.get('/users', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.substring(7)
  const session = await verifySession(c.env.DB, token)

  if (!session || session.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const { results } = await c.env.DB.prepare(
    `SELECT id, email, name, role, avatar_url, created_at FROM users ORDER BY created_at DESC`
  ).all()

  return c.json({ users: results })
})

// Admin: Add user by email (pre-authorize for Google login)
authRoutes.post('/users', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.substring(7)
  const session = await verifySession(c.env.DB, token)

  if (!session || session.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const body = await c.req.json() as { email: string; name?: string; role?: string }

  if (!body.email) {
    return c.json({ error: 'Email is required' }, 400)
  }

  // Check if user already exists
  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(body.email).first()

  if (existing) {
    return c.json({ error: 'User already exists' }, 400)
  }

  const userId = nanoid()
  const role = body.role || 'editor'

  await c.env.DB.prepare(
    `INSERT INTO users (id, email, name, role, created_at)
     VALUES (?, ?, ?, ?, datetime('now'))`
  ).bind(userId, body.email, body.name || '', role).run()

  return c.json({
    user: {
      id: userId,
      email: body.email,
      name: body.name || '',
      role: role,
    },
  })
})

// Admin: Update user role
authRoutes.put('/users/:id', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.substring(7)
  const session = await verifySession(c.env.DB, token)

  if (!session || session.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const userId = c.req.param('id')
  const body = await c.req.json() as { role?: string; name?: string }

  // Prevent removing own admin role
  if (userId === session.user_id && body.role && body.role !== 'admin') {
    return c.json({ error: 'Cannot remove your own admin role' }, 400)
  }

  const updates: string[] = []
  const values: string[] = []

  if (body.role) {
    updates.push('role = ?')
    values.push(body.role)
  }
  if (body.name !== undefined) {
    updates.push('name = ?')
    values.push(body.name)
  }

  if (updates.length > 0) {
    values.push(userId)
    await c.env.DB.prepare(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run()
  }

  return c.json({ success: true })
})

// Admin: Delete user
authRoutes.delete('/users/:id', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.substring(7)
  const session = await verifySession(c.env.DB, token)

  if (!session || session.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const userId = c.req.param('id')

  // Prevent self-deletion
  if (userId === session.user_id) {
    return c.json({ error: 'Cannot delete yourself' }, 400)
  }

  // Delete user's sessions first
  await c.env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run()
  await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run()

  return c.json({ success: true })
})
