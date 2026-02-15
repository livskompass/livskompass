# Livskompass.se - Full Migration Plan

## Tech Stack
| Component | Technology |
|-----------|------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 (media files) |
| Payments | Stripe |
| Hosting | Cloudflare Pages |
| Version Control | GitHub |
| Language | Swedish only |

---

## Project Structure

```
livskompass/
├── packages/
│   ├── web/                    # Public frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── App.tsx
│   │   ├── index.html
│   │   └── vite.config.ts
│   │
│   ├── admin/                  # CMS Admin panel
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── Editor.tsx  # WYSIWYG (TipTap)
│   │   │   ├── pages/
│   │   │   └── App.tsx
│   │   └── vite.config.ts
│   │
│   └── api/                    # Cloudflare Workers
│       ├── src/
│       │   ├── routes/
│       │   │   ├── pages.ts
│       │   │   ├── posts.ts
│       │   │   ├── courses.ts
│       │   │   ├── bookings.ts
│       │   │   ├── payments.ts
│       │   │   ├── media.ts
│       │   │   └── auth.ts
│       │   ├── middleware/
│       │   └── index.ts
│       ├── schema.sql
│       └── wrangler.toml
│
├── scripts/
│   └── migrate-wordpress.ts
│
├── package.json
└── turbo.json                  # Monorepo config
```

---

## Database Schema (D1)

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

-- Blog posts
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
  price_sek INTEGER,         -- Price in SEK (öre)
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

-- Admin users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'editor', -- admin, editor
  created_at TEXT DEFAULT (datetime('now'))
);

-- Settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Indexes
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_bookings_course ON bookings(course_id);
CREATE INDEX idx_bookings_email ON bookings(customer_email);
```

---

## API Endpoints

### Public
```
GET  /api/pages                    # List published pages
GET  /api/pages/:slug              # Get page by slug
GET  /api/posts                    # List published posts
GET  /api/posts/:slug              # Get post
GET  /api/courses                  # List active courses
GET  /api/courses/:slug            # Get course details
GET  /api/products                 # List products
POST /api/contact                  # Submit contact form
POST /api/bookings                 # Create booking
POST /api/bookings/:id/checkout    # Start Stripe checkout
GET  /api/bookings/:id/status      # Check booking status
```

### Stripe Webhooks
```
POST /api/webhooks/stripe          # Handle payment events
```

### Admin (authenticated)
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/admin/pages
POST   /api/admin/pages
PUT    /api/admin/pages/:id
DELETE /api/admin/pages/:id

GET    /api/admin/posts
POST   /api/admin/posts
PUT    /api/admin/posts/:id
DELETE /api/admin/posts/:id

GET    /api/admin/courses
POST   /api/admin/courses
PUT    /api/admin/courses/:id
DELETE /api/admin/courses/:id

GET    /api/admin/bookings
GET    /api/admin/bookings/:id
PUT    /api/admin/bookings/:id
POST   /api/admin/bookings/:id/refund

GET    /api/admin/products
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id

POST   /api/admin/media/upload
GET    /api/admin/media
DELETE /api/admin/media/:id

GET    /api/admin/contacts
PUT    /api/admin/contacts/:id/read
DELETE /api/admin/contacts/:id

GET    /api/admin/settings
PUT    /api/admin/settings
```

---

## Frontend Pages

### Public Site (packages/web)
| Route | Page |
|-------|------|
| `/` | Home |
| `/mindfulness` | Mindfulness overview |
| `/mindfulness/:slug` | Mindfulness subpages |
| `/utbildningar` | Course listing |
| `/utbildningar/:slug` | Course detail + booking |
| `/utbildningar/:slug/boka` | Booking form |
| `/utbildningar/:slug/bekraftelse` | Booking confirmation |
| `/material` | Products listing |
| `/act` | About ACT |
| `/act/:slug` | ACT subpages |
| `/forskning` | Research |
| `/kontakt` | Contact form |
| `/nyhet` | Blog listing |
| `/nyhet/:slug` | Blog post |

### Admin CMS (packages/admin)
| Route | Page |
|-------|------|
| `/admin` | Login |
| `/admin/dashboard` | Dashboard |
| `/admin/sidor` | Pages list |
| `/admin/sidor/ny` | New page |
| `/admin/sidor/:id` | Edit page |
| `/admin/nyheter` | Posts list |
| `/admin/nyheter/ny` | New post |
| `/admin/nyheter/:id` | Edit post |
| `/admin/utbildningar` | Courses list |
| `/admin/utbildningar/ny` | New course |
| `/admin/utbildningar/:id` | Edit course |
| `/admin/bokningar` | Bookings list |
| `/admin/bokningar/:id` | Booking detail |
| `/admin/material` | Products list |
| `/admin/media` | Media library |
| `/admin/meddelanden` | Contact messages |
| `/admin/installningar` | Settings |

---

## Key Dependencies

### Frontend (both web & admin)
- `react` + `react-dom`
- `react-router-dom` - Routing
- `@tanstack/react-query` - Data fetching
- `tailwindcss` - Styling
- `@tiptap/react` - WYSIWYG editor (admin only)
- `@stripe/stripe-js` - Stripe checkout

### Backend
- `hono` - Lightweight web framework for Workers
- `drizzle-orm` - TypeScript ORM for D1
- `stripe` - Stripe SDK
- `jose` - JWT handling
- `nanoid` - ID generation

---

## Implementation Phases

### Phase 1: Setup (Day 1)
- [ ] Create GitHub repository
- [ ] Set up monorepo with Turborepo
- [ ] Initialize packages/web (Vite + React + Tailwind)
- [ ] Initialize packages/admin (Vite + React + Tailwind)
- [ ] Initialize packages/api (Cloudflare Workers)
- [ ] Create D1 database
- [ ] Create R2 bucket
- [ ] Configure wrangler.toml
- [ ] Set up Cloudflare Pages deployment

### Phase 2: Backend API (Days 2-3)
- [ ] Apply database schema to D1
- [ ] Implement authentication (JWT)
- [ ] Implement pages CRUD
- [ ] Implement posts CRUD
- [ ] Implement courses CRUD
- [ ] Implement products CRUD
- [ ] Implement media upload to R2
- [ ] Implement contact form
- [ ] Test all endpoints

### Phase 3: Booking & Payments (Day 4)
- [ ] Configure Stripe account
- [ ] Implement booking creation
- [ ] Implement Stripe Checkout Session
- [ ] Implement Stripe webhooks
- [ ] Handle payment success/failure
- [ ] Implement refunds
- [ ] Email notifications (optional: Resend/Mailgun)

### Phase 4: Admin CMS (Days 5-7)
- [ ] Admin layout & navigation
- [ ] Login page & auth flow
- [ ] Dashboard with stats
- [ ] WYSIWYG page editor (TipTap)
- [ ] Post editor
- [ ] Course manager with booking view
- [ ] Product manager
- [ ] Media library with R2 upload
- [ ] Contact messages inbox
- [ ] Settings page

### Phase 5: Public Frontend (Days 8-10)
- [ ] Design system & components
- [ ] Header & footer
- [ ] Home page
- [ ] Page template
- [ ] Blog listing & detail
- [ ] Course listing & detail
- [ ] Booking flow with Stripe
- [ ] Product listing
- [ ] Contact page
- [ ] Mobile responsive
- [ ] SEO meta tags

### Phase 6: WordPress Migration (Day 11)
- [ ] Parse XML export
- [ ] Import pages to D1
- [ ] Import posts to D1
- [ ] Create courses from old data
- [ ] Upload media to R2
- [ ] Verify content

### Phase 7: Launch (Day 12)
- [ ] Configure livskompass.se DNS to Cloudflare
- [ ] Test all functionality
- [ ] Performance optimization
- [ ] Go live!

---

## Cloudflare Configuration

### wrangler.toml
```toml
name = "livskompass-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "livskompass"
database_id = "<your-d1-id>"

[[r2_buckets]]
binding = "MEDIA"
bucket_name = "livskompass-media"

[vars]
STRIPE_PUBLISHABLE_KEY = "pk_live_..."
SITE_URL = "https://livskompass.se"

# Secrets (set via wrangler secret put)
# STRIPE_SECRET_KEY
# STRIPE_WEBHOOK_SECRET
# JWT_SECRET
```

---

## Ready to Build?

This plan covers:
- Full CMS with WYSIWYG editor
- Course booking with Stripe payments
- Media library with R2 storage
- WordPress content migration
- Modern React frontend

**Estimated timeline: ~12 days**

Approve to start implementation?
