-- Livskompass Database Schema
-- Run: wrangler d1 execute livskompass --file=schema.sql

-- Pages (static content)
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  content_blocks TEXT,
  editor_version TEXT DEFAULT 'legacy',
  meta_description TEXT,
  parent_slug TEXT,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Blog posts (nyheter)
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  content_blocks TEXT,
  editor_version TEXT DEFAULT 'legacy',
  excerpt TEXT,
  featured_image TEXT,
  status TEXT DEFAULT 'draft',
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Courses (utbildningar)
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  content_blocks TEXT,
  editor_version TEXT DEFAULT 'legacy',
  location TEXT,
  start_date TEXT,
  end_date TEXT,
  price_sek INTEGER,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  registration_deadline TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Course bookings
CREATE TABLE IF NOT EXISTS bookings (
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
  payment_status TEXT DEFAULT 'pending',
  booking_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Products (material)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_blocks TEXT,
  editor_version TEXT DEFAULT 'legacy',
  type TEXT,
  price_sek INTEGER,
  external_url TEXT,
  image_url TEXT,
  in_stock INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Media library
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT,
  size_bytes INTEGER,
  alt_text TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contacts (
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
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'editor',
  google_id TEXT,
  avatar_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- User sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Site settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Migrations: add content_blocks and editor_version to courses and products
-- (safe to re-run: ALTER TABLE ADD COLUMN is a no-op if column already exists in D1)
ALTER TABLE courses ADD COLUMN content_blocks TEXT;
ALTER TABLE courses ADD COLUMN editor_version TEXT DEFAULT 'legacy';
ALTER TABLE products ADD COLUMN content_blocks TEXT;
ALTER TABLE products ADD COLUMN editor_version TEXT DEFAULT 'legacy';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_parent_slug ON pages(parent_slug);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_bookings_course ON bookings(course_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_media_r2_key ON media(r2_key);
CREATE INDEX IF NOT EXISTS idx_contacts_read ON contacts(read);
