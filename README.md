# Livskompass.se - Website Migration Project

## Overview

This project migrates the livskompass.se website from WordPress to a modern custom stack built on Cloudflare infrastructure.

**Owner:** Fredrik Livheim
**Website:** livskompass.se
**Content:** ACT (Acceptance and Commitment Therapy) and mindfulness training courses
**Language:** Swedish only

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + Vite 5 + Tailwind CSS 3.4 |
| Backend | Cloudflare Workers + Hono |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 (media files) |
| Payments | Stripe |
| Hosting | Cloudflare Pages |
| Monorepo | Turborepo |
| CMS Editor | TipTap (WYSIWYG) |
| Authentication | Google OAuth 2.0 |

---

## Project Structure

```
livskompass/
├── packages/
│   ├── api/                    # Cloudflare Workers Backend
│   │   ├── src/
│   │   │   ├── index.ts        # Main Hono app with all routes
│   │   │   └── routes/
│   │   │       ├── pages.ts    # Public pages API
│   │   │       ├── posts.ts    # Blog posts API
│   │   │       ├── courses.ts  # Courses API
│   │   │       ├── bookings.ts # Booking + Stripe checkout
│   │   │       ├── products.ts # Products/material API
│   │   │       ├── contact.ts  # Contact form API
│   │   │       ├── auth.ts     # Google OAuth authentication
│   │   │       ├── media.ts    # R2 media upload
│   │   │       └── admin.ts    # Admin CRUD operations
│   │   ├── schema.sql          # D1 database schema
│   │   ├── wrangler.toml       # Cloudflare config
│   │   └── package.json
│   │
│   ├── web/                    # Public Frontend
│   │   ├── src/
│   │   │   ├── App.tsx         # Router setup
│   │   │   ├── main.tsx        # React entry point
│   │   │   ├── index.css       # Tailwind styles
│   │   │   ├── components/
│   │   │   │   └── Layout.tsx  # Header/footer navigation
│   │   │   ├── lib/
│   │   │   │   └── api.ts      # API client + TypeScript types
│   │   │   └── pages/
│   │   │       ├── Home.tsx
│   │   │       ├── Page.tsx           # Generic page template
│   │   │       ├── Courses.tsx        # Course listing
│   │   │       ├── CourseDetail.tsx   # Single course
│   │   │       ├── Booking.tsx        # Booking form
│   │   │       ├── BookingConfirmation.tsx
│   │   │       ├── Products.tsx       # Material listing
│   │   │       ├── Blog.tsx           # News listing
│   │   │       ├── BlogPost.tsx       # Single post
│   │   │       ├── Contact.tsx        # Contact form
│   │   │       └── NotFound.tsx       # 404 page
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   └── admin/                  # CMS Admin Panel
│       ├── src/
│       │   ├── App.tsx         # Admin router with auth
│       │   ├── main.tsx
│       │   ├── index.css       # Admin styles + TipTap
│       │   ├── components/
│       │   │   ├── AdminLayout.tsx  # Sidebar navigation
│       │   │   └── Editor.tsx       # TipTap WYSIWYG editor
│       │   ├── lib/
│       │   │   └── api.ts      # Admin API client
│       │   └── pages/
│       │       ├── Login.tsx        # Google OAuth login
│       │       ├── AuthCallback.tsx # OAuth callback handler
│       │       ├── Dashboard.tsx
│       │       ├── PagesList.tsx
│       │       ├── PageEditor.tsx
│       │       ├── PostsList.tsx
│       │       ├── PostEditor.tsx
│       │       ├── CoursesList.tsx
│       │       ├── CourseEditor.tsx
│       │       ├── BookingsList.tsx
│       │       ├── BookingDetail.tsx
│       │       ├── ProductsList.tsx
│       │       ├── ProductEditor.tsx
│       │       ├── MediaLibrary.tsx
│       │       ├── ContactsList.tsx
│       │       ├── UsersList.tsx    # Admin user management
│       │       └── Settings.tsx
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── package.json
│
├── PLAN.md                     # Detailed migration plan
├── README.md                   # This file
├── turbo.json                  # Turborepo config
├── package.json                # Root package.json
└── .gitignore
```

---

## Authentication System

### Google OAuth Flow

The admin panel uses Google OAuth 2.0 for secure authentication:

1. **Login Flow:**
   - User clicks "Logga in med Google" on `/login`
   - Redirected to Google OAuth consent screen
   - Google redirects back to `/api/auth/google/callback`
   - Backend verifies user, creates session token
   - User redirected to `/auth/callback?token=xxx`
   - Frontend stores token, redirects to dashboard

2. **Session Management:**
   - Sessions stored in D1 database (`sessions` table)
   - Session tokens are 32-character nanoid strings
   - Sessions expire after 7 days
   - Token sent as `Authorization: Bearer <token>` header

3. **User Authorization:**
   - First login: User with `INITIAL_ADMIN_EMAIL` becomes admin
   - Or if no users exist, first user becomes admin
   - Admins can pre-authorize other users by email
   - Pre-authorized users can then log in with Google

### User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access, can manage users |
| `editor` | Can edit content, cannot manage users |

### Auth API Endpoints

```
GET  /api/auth/google              # Start OAuth flow
GET  /api/auth/google/callback     # Handle OAuth callback
GET  /api/auth/me                  # Get current user
POST /api/auth/logout              # Logout (invalidate session)
GET  /api/auth/users               # List users (admin only)
POST /api/auth/users               # Add user (admin only)
PUT  /api/auth/users/:id           # Update user (admin only)
DELETE /api/auth/users/:id         # Delete user (admin only)
```

---

## Database Schema

### Tables

```sql
-- Pages (static content)
CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,              -- HTML from WYSIWYG
  meta_description TEXT,
  parent_slug TEXT,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, published
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Blog posts (nyheter)
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,       -- R2 URL
  status TEXT DEFAULT 'draft',
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Courses (utbildningar)
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  location TEXT,             -- Stockholm, Online, Norge, etc.
  start_date TEXT,
  end_date TEXT,
  price_sek INTEGER,         -- Price in SEK
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  registration_deadline TEXT,
  status TEXT DEFAULT 'active', -- active, full, completed, cancelled
  created_at TEXT DEFAULT (datetime('now'))
);

-- Course bookings
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_organization TEXT,
  participants INTEGER DEFAULT 1,
  total_price_sek INTEGER,
  stripe_payment_intent TEXT,
  stripe_session_id TEXT,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded, failed
  booking_status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Products (material)
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,                 -- book, cd, cards, app, download
  price_sek INTEGER,
  external_url TEXT,         -- For apps, external links
  image_url TEXT,            -- R2 URL
  in_stock INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Media library
CREATE TABLE media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  r2_key TEXT NOT NULL,      -- R2 object key
  url TEXT NOT NULL,         -- Public URL
  type TEXT,                 -- image, pdf, audio, video
  size_bytes INTEGER,
  alt_text TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Contact form submissions
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Admin users (Google OAuth)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'editor', -- admin, editor
  google_id TEXT,            -- Google user ID
  avatar_url TEXT,           -- Google profile picture
  created_at TEXT DEFAULT (datetime('now'))
);

-- User sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,       -- Session token (nanoid)
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Site settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

### Indexes

```sql
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_bookings_course ON bookings(course_id);
CREATE INDEX idx_bookings_email ON bookings(customer_email);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

---

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pages` | List published pages |
| GET | `/api/pages/:slug` | Get page by slug |
| GET | `/api/posts` | List published posts |
| GET | `/api/posts/:slug` | Get post by slug |
| GET | `/api/courses` | List active courses |
| GET | `/api/courses/:slug` | Get course details |
| GET | `/api/products` | List products |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/bookings` | Create booking |
| POST | `/api/bookings/:id/checkout` | Start Stripe checkout |
| GET | `/api/bookings/:id/status` | Check booking status |

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Start Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/users` | List users (admin) |
| POST | `/api/auth/users` | Add user (admin) |
| PUT | `/api/auth/users/:id` | Update user (admin) |
| DELETE | `/api/auth/users/:id` | Delete user (admin) |

### Admin Endpoints (requires authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/pages` | List all pages |
| POST | `/api/admin/pages` | Create page |
| PUT | `/api/admin/pages/:id` | Update page |
| DELETE | `/api/admin/pages/:id` | Delete page |
| GET | `/api/admin/posts` | List all posts |
| POST | `/api/admin/posts` | Create post |
| PUT | `/api/admin/posts/:id` | Update post |
| DELETE | `/api/admin/posts/:id` | Delete post |
| GET | `/api/admin/courses` | List all courses |
| POST | `/api/admin/courses` | Create course |
| PUT | `/api/admin/courses/:id` | Update course |
| DELETE | `/api/admin/courses/:id` | Delete course |
| GET | `/api/admin/bookings` | List bookings |
| GET | `/api/admin/bookings/:id` | Get booking |
| PUT | `/api/admin/bookings/:id` | Update booking |
| POST | `/api/admin/bookings/:id/refund` | Refund booking |
| GET | `/api/admin/products` | List products |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |
| GET | `/api/admin/media` | List media |
| POST | `/api/admin/media/upload` | Upload media |
| DELETE | `/api/admin/media/:id` | Delete media |
| GET | `/api/admin/contacts` | List contacts |
| PUT | `/api/admin/contacts/:id/read` | Mark as read |
| DELETE | `/api/admin/contacts/:id` | Delete contact |
| GET | `/api/admin/settings` | Get settings |
| PUT | `/api/admin/settings` | Update settings |

### Stripe Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/stripe` | Handle Stripe events |

---

## Frontend Routes

### Public Site (packages/web)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Homepage with courses & news |
| `/:slug` | Page | Generic page template |
| `/utbildningar` | Courses | Course listing |
| `/utbildningar/:slug` | CourseDetail | Course detail |
| `/utbildningar/:slug/boka` | Booking | Booking form |
| `/utbildningar/:slug/bekraftelse` | BookingConfirmation | Confirmation |
| `/material` | Products | Products listing |
| `/nyhet` | Blog | Blog listing |
| `/nyhet/:slug` | BlogPost | Single blog post |
| `/kontakt` | Contact | Contact form |
| `*` | NotFound | 404 page |

### Admin Panel (packages/admin)

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | Login | Google OAuth login |
| `/auth/callback` | AuthCallback | OAuth callback |
| `/dashboard` | Dashboard | Stats overview |
| `/sidor` | PagesList | Manage pages |
| `/sidor/ny` | PageEditor | Create page |
| `/sidor/:id` | PageEditor | Edit page |
| `/nyheter` | PostsList | Manage posts |
| `/nyheter/ny` | PostEditor | Create post |
| `/nyheter/:id` | PostEditor | Edit post |
| `/utbildningar` | CoursesList | Manage courses |
| `/utbildningar/ny` | CourseEditor | Create course |
| `/utbildningar/:id` | CourseEditor | Edit course |
| `/bokningar` | BookingsList | View bookings |
| `/bokningar/:id` | BookingDetail | Booking detail |
| `/material` | ProductsList | Manage products |
| `/material/ny` | ProductEditor | Create product |
| `/material/:id` | ProductEditor | Edit product |
| `/media` | MediaLibrary | Manage media |
| `/meddelanden` | ContactsList | Contact inbox |
| `/anvandare` | UsersList | Manage users (admin) |
| `/installningar` | Settings | Site settings |

---

## Environment Variables

### packages/api (Cloudflare Workers)

**wrangler.toml variables:**
```toml
[vars]
SITE_URL = "https://livskompass.se"
ADMIN_URL = "https://admin.livskompass.se"
CORS_ORIGIN = "https://livskompass.se,https://admin.livskompass.se"
```

**Secrets (set via `wrangler secret put`):**

| Secret | Description |
|--------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `INITIAL_ADMIN_EMAIL` | Email of first admin (e.g., livheim@gmail.com) |

### packages/web & packages/admin

API is proxied through Vite dev server - no environment variables needed in development.

---

## Setup Instructions

### Step 1: Set Up Cloudflare Resources

```bash
# Install Wrangler CLI
npm install -g wrangler
wrangler login

# Create D1 Database
cd packages/api
wrangler d1 create livskompass-db
# Copy the database_id from output

# Create R2 Bucket
wrangler r2 bucket create livskompass-media
```

### Step 2: Update wrangler.toml

Update `packages/api/wrangler.toml` with your database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "livskompass-db"
database_id = "YOUR_DATABASE_ID_HERE"  # <-- Replace this
```

### Step 3: Apply Database Schema

```bash
cd packages/api
wrangler d1 execute livskompass-db --file=schema.sql
```

### Step 4: Set Up Google OAuth

1. **Go to Google Cloud Console:** https://console.cloud.google.com/

2. **Create a new project** (or use existing)

3. **Enable OAuth consent screen:**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" user type
   - Fill in app name, support email, etc.
   - Add scopes: `email`, `profile`, `openid`

4. **Create OAuth credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://livskompass.se/api/auth/google/callback` (production)
     - `http://localhost:8787/api/auth/google/callback` (development)
   - Copy the Client ID and Client Secret

### Step 5: Set Up Secrets

```bash
cd packages/api

# Stripe keys (get from stripe.com/dashboard)
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET

# Google OAuth (get from Google Cloud Console)
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET

# Initial admin email
wrangler secret put INITIAL_ADMIN_EMAIL
# Enter: livheim@gmail.com
```

### Step 6: First Admin Login

1. The first user to log in with `INITIAL_ADMIN_EMAIL` becomes admin
2. Or if no users exist, first user becomes admin
3. Log in to admin panel with Google
4. Go to "Anvandare" (Users) in the sidebar
5. Add other admin/editor users by their email
6. They can then log in with Google using that email

### Step 7: Run Development Servers

```bash
# From project root
npm install
npm run dev
```

This starts:
- **API:** http://localhost:8787
- **Web:** http://localhost:3000
- **Admin:** http://localhost:3001

### Step 8: Configure Stripe Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://livskompass.se/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy the webhook secret and add it to Cloudflare secrets

### Step 9: Deploy to Production

```bash
# Deploy API
cd packages/api
wrangler deploy

# Deploy Web & Admin to Cloudflare Pages
# Connect GitHub repo to Cloudflare Pages
# Set build command: npm run build
# Set output directory: packages/web/dist (public site)
# Create separate project for admin: packages/admin/dist
```

### Step 10: Configure DNS

- Point livskompass.se to Cloudflare Pages (public site)
- Point admin.livskompass.se to Cloudflare Pages (admin panel)
- API is served from the same domain via Workers

### Step 11: Migrate WordPress Content

WordPress export file location:
`/Volumes/SPACE 2/Ints design AB /2026/livskompass/livskompassse.WordPress.2026-02-04.xml`

Create migration script at `scripts/migrate-wordpress.ts`:
1. Parse the WordPress XML export file
2. Import pages to D1
3. Import posts to D1
4. Upload media files to R2
5. Create courses from existing data

---

## Development Commands

```bash
# Install dependencies
npm install

# Run all packages in development
npm run dev

# Run specific package
npm run dev --filter=@livskompass/web
npm run dev --filter=@livskompass/admin
npm run dev --filter=@livskompass/api

# Build all packages
npm run build

# Type check
npm run typecheck

# Deploy API to Cloudflare
cd packages/api && wrangler deploy

# Execute D1 queries
wrangler d1 execute livskompass-db --command "SELECT * FROM users"
```

---

## Key Dependencies

### Frontend (web & admin)
- `react` + `react-dom` - UI framework
- `react-router-dom` - Routing
- `@tanstack/react-query` - Data fetching & caching
- `tailwindcss` - Utility-first CSS
- `@tiptap/react` - WYSIWYG editor (admin only)
- `@stripe/stripe-js` - Stripe checkout

### Backend (api)
- `hono` - Lightweight web framework for Workers
- `nanoid` - ID generation
- `stripe` - Stripe SDK

---

## What Has Been Completed

### Phase 1: Project Setup ✅
- [x] Created monorepo structure with Turborepo
- [x] Set up packages/api with Cloudflare Workers + Hono
- [x] Set up packages/web with React + Vite + Tailwind
- [x] Set up packages/admin with React + Vite + TipTap
- [x] Created D1 database schema (schema.sql)
- [x] Installed all npm dependencies

### Phase 2: Backend API ✅
- [x] Created all API routes (pages, posts, courses, bookings, products, media, contact)
- [x] Implemented Google OAuth authentication
- [x] Session-based auth with database storage
- [x] User management (admins can add/remove users)
- [x] Implemented admin CRUD operations
- [x] Stripe checkout integration code
- [x] R2 media upload endpoints

### Phase 3: Public Frontend ✅
- [x] Layout component with header/footer
- [x] Home page with courses and news
- [x] Course listing and detail pages
- [x] Booking flow with Stripe integration
- [x] Products/material page
- [x] Blog listing and post pages
- [x] Contact form
- [x] 404 page

### Phase 4: Admin CMS ✅
- [x] Login page with Google OAuth
- [x] OAuth callback handler
- [x] Dashboard with stats
- [x] Page editor with WYSIWYG (TipTap)
- [x] Post editor
- [x] Course manager
- [x] Booking viewer
- [x] Product manager
- [x] Media library with R2 upload
- [x] Contact messages inbox
- [x] User management page (admin only)
- [x] Settings page

---

## Useful Links

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Hono Framework](https://hono.dev/)
- [TipTap Editor](https://tiptap.dev/)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)

---

## Support

For questions about the codebase, refer to:
- This README file
- `PLAN.md` - Detailed migration plan
- Code comments in source files

---

*Project created: February 2026*
*Last updated: February 2026*
