# Livskompass.se - Project Guidelines

## Project Overview
WordPress to Cloudflare migration for livskompass.se (Swedish ACT/mindfulness training site).

## Tech Stack
- **Frontend**: React 18 + Vite 5 + Tailwind CSS 3.4
- **Backend**: Cloudflare Workers + Hono
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Payments**: Stripe
- **Auth**: Google OAuth 2.0
- **Monorepo**: Turborepo (npm workspaces)
- **Language**: Admin UI in English, public-facing content in Swedish

## Project Structure
```
packages/web/    → Public frontend (React + Vite + Tailwind)
packages/admin/  → CMS admin panel (React + Vite + Puck visual editor)
packages/api/    → Cloudflare Workers backend (Hono)
packages/shared/ → Shared Puck block components + config (used by admin + web)
```

## Key Files
- `PLAN.md` - Full migration plan with phases, schema, endpoints
- `README.md` - Setup instructions, auth flow, environment variables
- `old_sitemap.md` - Current WordPress site structure (72 pages, 11 posts, 609 media)
- `packages/api/schema.sql` - D1 database schema
- `packages/api/wrangler.toml` - Cloudflare config

## Current Status (updated 2026-02-15)
- Phase 1 (Setup): DONE
- Phase 2 (Backend API): DONE + bug fixes applied
- Phase 3 (Booking/Payments): DONE (webhook, refund, race condition all fixed)
- Phase 4 (Admin CMS): DONE — Puck visual editor for ALL content types (pages, posts, courses, products)
- Phase 5 (Public Frontend): DONE + shadcn/ui redesign
- Phase 6 (WordPress Migration): DONE (72 pages, 10 posts, ~534 media, 7 courses, 6 products)
- Phase 7 (Launch): IN PROGRESS (CI/CD done, domain setup TODO)

## CMS Architecture (Puck Visual Editor)

All four content types (pages, posts, courses, products) use the **Puck** (`@puckeditor/core` v0.21.1) drag-and-drop visual page builder. Legacy TipTap editor is removed for pages/posts; courses/products upgraded from form-based editing to Puck.

### How it works
- **Shared blocks** in `packages/shared/src/puck-config.tsx` — 16 block components in 6 categories
- **Admin editors** use `<Puck>` component: `PageBuilder.tsx`, `PostBuilder.tsx`, `CourseBuilder.tsx`, `ProductBuilder.tsx`
- **Public rendering** via `<Render>` from `@puckeditor/core` in `BlockRenderer.tsx`
- Content stored as JSON in `content_blocks` column, `editor_version` = `'puck'`
- Metadata (title, slug, status, dates, prices) edited via **settings dropdown** (gear icon) in the Puck header bar

### Block categories
| Category | Blocks |
|---|---|
| Layout | Columns, Separator |
| Content | Hero, Rich Text, Image, Accordion/FAQ |
| Marketing | CTA Banner, Card Grid, Testimonial, Buttons |
| Dynamic Content | Post Grid, Page Cards, Navigation Menu |
| Media | Image Gallery, Video |
| Advanced | Contact Form |

### Key files
- `packages/shared/src/puck-config.tsx` — All block definitions, root.render with site chrome
- `packages/shared/src/types.ts` — Block prop interfaces
- `packages/admin/src/components/PageBuilder.tsx` — Page editor (Puck)
- `packages/admin/src/components/PostBuilder.tsx` — Post editor (Puck)
- `packages/admin/src/components/CourseBuilder.tsx` — Course editor (Puck)
- `packages/admin/src/components/ProductBuilder.tsx` — Product editor (Puck)
- `packages/web/src/components/BlockRenderer.tsx` — Public Puck block renderer
- `packages/admin/src/index.css` — Puck CSS overrides (icons, floating panel)

## Deployment

### URLs
- **Web**: https://livskompass-web.pages.dev
- **Admin**: https://livskompass-admin.pages.dev
- **API**: https://livskompass-api.livskompass-config.workers.dev
- **GitHub**: https://github.com/livskompass/livskompass

### CI/CD
**IMPORTANT: Always deploy by pushing to git. Never use `wrangler pages deploy` directly.**
GitHub Actions auto-deploys all three services on push to `main`:
- `.github/workflows/deploy.yml` — 3 parallel jobs (api, web, admin)
- GitHub Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- Build env vars: `VITE_API_URL` set in `.env.production` files

### Local Development
```bash
npm install
npm run dev -w packages/web    # http://localhost:3000 (proxies to production API)
npm run dev -w packages/admin  # http://localhost:3001 (proxies to production API)

# To develop against a local API instead:
API_TARGET=http://localhost:8787 npm run dev -w packages/web
```

## UI System
Both frontends use **shadcn/ui** as the UI component library foundation:
- `packages/web/src/components/ui/` — button, card, badge, input, textarea, label, separator, skeleton
- `packages/admin/src/components/ui/` — button, card, badge, input, textarea, label, table, separator, skeleton, dialog, select
- Utility: `cn()` from `lib/utils.ts` (clsx + tailwind-merge)

---

## SESSION HANDOFF - 2026-02-15 (Evening) — Puck CMS Visual Editor

### What was done this session

**Puck Visual Editor — Unified CMS for ALL Content Types:**

The entire admin CMS was transformed from a mix of form-based editors (TipTap + static forms) into a unified drag-and-drop visual page builder using Puck. Every content type now uses the same visual editing experience.

#### 1. Collapsible Admin Sidebar
- `AdminLayout.tsx`: Sidebar toggles between `w-64` (expanded) and `w-16` (collapsed) via ChevronsLeft/ChevronsRight button
- State persists in localStorage (`sidebar_collapsed`)
- Auto-collapses on all editor pages (`/sidor/`, `/nyheter/`, `/utbildningar/`, `/material/` + ID)
- Editor pages get minimal `p-2` padding for maximum Puck space

#### 2. Pages & Posts → Puck Visual Editor
- `PageBuilder.tsx` and `PostBuilder.tsx` — Full Puck integration replacing the old header-bar form
- All metadata (title, slug, status, excerpt, featured image, etc.) moved to a **settings dropdown** triggered by a gear icon in the Puck header
- Status badge (Draft=yellow, Published=green) shown in header
- Delete button with confirmation dialog inside settings dropdown
- `onPublish` handler gathers all metadata + serialized Puck JSON and saves via API
- `PageEditor.tsx` and `PostEditor.tsx` simplified to just data-fetching wrappers

#### 3. Courses & Products → Puck Visual Editor (NEW)
- **CourseBuilder.tsx** (new file) — Full Puck editor with course-specific settings dropdown:
  - Title, Slug, Status (active/full/completed/cancelled), Location, Start date, End date, Registration deadline, Price (SEK), Max participants, Description
  - Status badge: active=green, full=blue, completed=gray, cancelled=red
- **ProductBuilder.tsx** (new file) — Full Puck editor with product-specific settings dropdown:
  - Title, Slug, Status (active/inactive), Type (book/cd/cards/app/download), Price, In stock, External URL, Image URL (with preview), Description
- `CourseEditor.tsx` and `ProductEditor.tsx` rewritten as data-fetching wrappers (same pattern as PageEditor/PostEditor)
- **Database migration**: `ALTER TABLE courses/products ADD COLUMN content_blocks TEXT, editor_version TEXT` — executed on production D1

#### 4. API Updated for Puck Content Blocks
- `admin.ts`: Course and product create/update endpoints now handle `content_blocks` and `editor_version`
- Both camelCase and snake_case field names accepted via nullish coalescing (`body.startDate ?? body.start_date`)
- `schema.sql` updated with new columns and migration ALTER TABLE statements

#### 5. CSS Injection for Production-Matching Preview
- Puck renders content in an iframe. CSS was NOT injected initially → content looked unstyled
- **Fix**: `document.styleSheets` API extracts all CSS rules from parent window and injects as `<style>` into iframe
- Cross-origin stylesheets (Google Fonts) injected as `<link>` elements
- Google Fonts Inter loaded in iframe body
- This runs via `overrides.iframe` callback in all 4 builder components

#### 6. Site Chrome in Puck Preview
- `puck-config.tsx` `root.render` detects editor context via `window.frameElement !== null`
- In editor: renders full site header (Livskompass logo + nav links) and footer (contact info, links, copyright)
- On public site: only renders the `max-w-4xl` content container (Layout.tsx provides the real chrome)
- Nav links match production: ACT, Utbildningar, Material, Mindfulness, Forskning, Om Fredrik, Kontakt, Nyheter

#### 7. Floating Right Panel
- Puck's default right sidebar (field editor) was taking space from the preview
- CSS override: `--puck-right-side-bar-width: 0px !important` + `position: absolute` on right panel
- Right panel now floats as an overlay with shadow, preview gets full width
- Resize handle hidden

#### 8. Consistent Icon Sizing
- All Puck panel icons and admin sidebar icons forced to 18px via CSS:
  ```css
  [class*="SidebarSection"] svg, [class*="Nav_"] svg { width: 18px !important; height: 18px !important; }
  ```

#### 9. Custom Select Component
- Native `<select>` dropdown chevron fixed with `appearance-none` + custom SVG chevron-down icon

#### 10. Dynamic Content Blocks (Composable CMS)
New blocks added to `puck-config.tsx` for embedding live data:
- **PostGrid** — Fetches latest N posts from API, displays as card grid with image, date, excerpt. Configurable columns, count, show/hide toggles.
- **PageCards** — Shows pages as linked cards. Auto-fetches child pages by `parentSlug` or manual entry. Three styles: card, list, minimal pills.
- **NavigationMenu** — Build visual nav menus with label+link items. Four styles: pills, underline, buttons, minimal. Horizontal/vertical layout.
- **CardGrid extended** — Now supports `source: "posts"` and `source: "pages"` in addition to manual/courses/products. Auto-fetches data from API.
- **API connectivity**: `window.__PUCK_API_BASE__` set in both admin and web `main.tsx`. Shared `useFetchJson` hook in puck-config.tsx handles data fetching with loading states and cleanup.

#### 11. BlogPost.tsx Double-Wrapping Fix
- Post chrome (back button, date, title, image) separated into its own container
- BlockRenderer renders Puck blocks separately (root.render handles its own container)
- Prevents double max-w-4xl wrapping

### Commits (chronological)
1. `c6d59a2` — Improve CMS editor UX: collapsible sidebar, settings dropdown, delete
2. `1ea0ca1` — Fix CMS editor: proper CSS injection, auto-collapse sidebar, consistent icons
3. `55906b6` — Make right sidebar a floating overlay for full-width preview
4. `a95a051` — Add dynamic content blocks: PostGrid, PageCards, NavigationMenu
5. `d8b0149` — Convert courses and products to Puck visual editor, add site chrome to preview

### Files modified/created this session
```
NEW:  packages/admin/src/components/CourseBuilder.tsx
NEW:  packages/admin/src/components/ProductBuilder.tsx
MOD:  packages/admin/src/components/PageBuilder.tsx     (rewritten for Puck)
MOD:  packages/admin/src/components/PostBuilder.tsx     (rewritten for Puck)
MOD:  packages/admin/src/components/AdminLayout.tsx     (collapsible sidebar)
MOD:  packages/admin/src/components/ui/select.tsx       (custom chevron)
MOD:  packages/admin/src/pages/PageEditor.tsx           (simplified wrapper)
MOD:  packages/admin/src/pages/PostEditor.tsx           (simplified wrapper)
MOD:  packages/admin/src/pages/CourseEditor.tsx          (rewritten for Puck)
MOD:  packages/admin/src/pages/ProductEditor.tsx         (rewritten for Puck)
MOD:  packages/admin/src/main.tsx                       (window.__PUCK_API_BASE__)
MOD:  packages/admin/src/index.css                      (Puck CSS overrides)
MOD:  packages/web/src/main.tsx                         (window.__PUCK_API_BASE__)
MOD:  packages/web/src/pages/BlogPost.tsx               (fix double-wrapping)
MOD:  packages/web/src/components/BlockRenderer.tsx      (transparent pass-through)
MOD:  packages/shared/src/puck-config.tsx               (site chrome, dynamic blocks, API helpers)
MOD:  packages/shared/src/types.ts                      (new block prop interfaces)
MOD:  packages/api/src/routes/admin.ts                  (content_blocks for courses/products)
MOD:  packages/api/schema.sql                           (content_blocks + editor_version columns)
```

### What still needs to be done

**Before launch (blockers):**
1. Domain setup — livskompass.se not connected to Cloudflare yet
2. Stripe configuration — STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET not set
3. Google OAuth production test — redirect URIs added but login not verified on production
4. WordPress redirect mapping (301s for old URLs)
5. Content quality — 4 empty/placeholder pages need content or deletion

**CMS improvements:**
- Verify CSS injection works on production (Tailwind classes rendering in Puck iframe)
- Puck inline editing (editing directly on components instead of sidebar) — Puck v0.21 limitation
- Media picker integration (browse R2 media from within Puck field editors)
- Undo/redo verification in Puck
- Mobile editor responsiveness

**Should fix before launch:**
- Email notifications (booking confirmation, contact form alerts)
- File upload type/size validation
- Admin CRUD input validation
- Brand alignment (colors, fonts, logo)

**Post-launch:**
- Rate limiting, session cleanup, security headers
- Blog pagination, search, accessibility
- Google Analytics integration, sitemap.xml, robots.txt
- Abandoned booking cleanup (Cron Trigger)

---

## SESSION HANDOFF - 2026-02-15 (Morning)

### What was done this session

**WordPress Migration (Phase 6 COMPLETE):**
1. Migrated all 72 pages from WordPress XML export to D1
2. Migrated all 10 blog posts with featured images
3. Migrated ~534 media files from WordPress to R2 (via Worker endpoint that downloads from WP and uploads to R2)
4. Extracted 7 courses from WordPress page content into courses table
5. Extracted 6 products from WordPress page content into products table
6. Set `parent_slug` relationships for page hierarchy (WordPress parent-child structure)
7. Fixed internal links in migrated content

**Media URL System:**
- Problem: Media URLs stored as `/media/...` resolve to wrong domain (Pages vs Workers)
- Solution: `getMediaUrl()` helper derives `MEDIA_BASE` from `API_BASE` by stripping `/api` suffix
- `rewriteMediaUrls()` rewrites relative `/media/` paths in HTML content (dangerouslySetInnerHTML)
- API upload endpoints now store absolute URLs using SITE_URL
- Files: `packages/web/src/lib/api.ts`, `packages/admin/src/lib/api.ts`

**shadcn/ui Redesign:**
- Redesigned all 11 web pages and all 17 admin pages with shadcn/ui components
- Created UI component libraries in both packages
- Dependencies added: class-variance-authority, clsx, tailwind-merge, lucide-react

**Navigation Fix:**
- `Layout.tsx`: Correct Swedish labels, dynamic dropdown menus
- Dropdowns fetch child pages from API via `parent_slug` matching
- Desktop: hover-to-open dropdowns with chevron indicators
- Mobile: expandable child lists with separate chevron button
- Nav items: ACT, Utbildningar, Material, Mindfulness, Forskning på metoden, Om Fredrik Livheim, Kontakt, Nyheter

**Hub Pages with Child Page Cards:**
- API `GET /api/pages/:slug` now returns `children` array (pages where parent_slug = slug)
- `Page.tsx` renders child pages as clickable card grid with ChevronRight icons
- Smart content detection: hides bare link-list content when child cards are shown
- Hub pages affected: forskning-pa-metoden, act, mindfulness, material, utbildningar

**CI/CD Pipeline:**
- `.github/workflows/deploy.yml` — auto-deploys on push to main
- Three parallel jobs: Deploy API Worker, Deploy Web, Deploy Admin
- GitHub Secrets configured: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- `.env.production` files set `VITE_API_URL` for both frontends

**Local Dev → Production:**
- Vite proxy targets changed from `localhost:8787` to production API
- Both web and admin dev servers proxy `/api` and `/media` to production Worker
- Override with `API_TARGET=http://localhost:8787` for local API development

### What still needs to be done

**Before launch (blockers):**
1. Domain setup — livskompass.se not connected to Cloudflare yet
2. Stripe configuration — STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET not set
3. Google OAuth production test — redirect URIs added but login not verified on production
4. WordPress redirect mapping (301s for old URLs)
5. Content quality — 4 empty/placeholder pages need content or deletion

**Should fix before launch:**
- Email notifications (booking confirmation, contact form alerts)
- File upload type/size validation
- Admin CRUD input validation
- Brand alignment (colors, fonts, logo)

**Post-launch:**
- Rate limiting, session cleanup, security headers
- Blog pagination, search, accessibility
- Google Analytics integration, sitemap.xml, robots.txt
- Abandoned booking cleanup (Cron Trigger)

---

## SESSION HANDOFF - 2026-02-12

### What was done this session (2026-02-12)

**Backend (ALL COMPLETE - validated by ux_reviewer):**
1. Stripe webhook handler (`webhooks.ts`) - signature verification, idempotent, handles completed/expired/failed
2. Admin refund endpoint - full Stripe refund, updates booking + course status
3. Admin GET-by-ID endpoints - pages, posts, courses, products (editors were broken without these)
4. Media routes secured - moved under admin auth
5. Course detail status filter - hides cancelled/draft from public
6. Booking validation + cancel_url slug fix + price null guard
7. Contact form Swedish text fixed
8. Minor: settings admin-only, CORS localhost:3001, course delete protection, batch settings
9. Booking race condition fixed - atomic UPDATE for spot reservation

**Frontend (ALL COMPLETE):**
- [x] BookingConfirmation param fix (booking_id → booking)
- [x] @tailwindcss/typography plugin added to both packages
- [x] Mobile hamburger navigation added to public site
- [x] "Nyheter" nav link added
- [x] Slug generation Swedish char mapping (å→a, ä→a, ö→o) in all 4 editors
- [x] Dashboard uses /admin/stats endpoint
- [x] Scroll-to-top on route change
- [x] Removed unused @stripe/stripe-js
- [x] Removed unused useEffect from BookingConfirmation
- [x] Web dev server port (was already 3000)
- [x] Swedish diacritical marks (å, ä, ö) fixed across ALL .tsx files (both packages)
- [x] Active nav link highlighting (desktop + mobile)
- [x] Dynamic page titles (useDocumentTitle hook) on every route
- [x] Parent_slug/sort_order fields added to PageEditor
- [x] HTML sanitization with DOMPurify on all dangerouslySetInnerHTML (Page, BlogPost, CourseDetail)

### What still needs to be done

**Before launch (blockers):**
1. WordPress migration script (Phase 6) - 72 pages, 11 posts, 609 media
2. WordPress redirect mapping (301s for old URLs)

**Should fix before launch:**
- Email notifications (booking confirmation, contact form alerts)
- File upload type/size validation
- Admin CRUD input validation

**Post-launch:**
- Rate limiting, session cleanup, security headers
- Blog pagination, search, accessibility
- Google Analytics integration, sitemap.xml, robots.txt
- Abandoned booking cleanup (Cron Trigger)

### Full audit findings
See ux_reviewer section below for all 43 findings (14 security, 12 UX, 12 architecture, 11 completeness).

---

## Team Roles
- **frontend_dev**: Works exclusively on `packages/web/` and `packages/admin/`. Must get plan approved before writing code.
- **backend_dev**: Works exclusively on `packages/api/`. Must get plan approved before writing code.
- **ux_reviewer**: UX researcher, security auditor, and devil's advocate. Reviews all work. Writes ONLY documentation - no code. Validates decisions, finds flaws, questions assumptions.

## Rules
1. All teammates MUST document their work, decisions, and findings in this file under the Activity Log section below.
2. Frontend and backend devs MUST get plan approval before writing any code.
3. The ux_reviewer validates all plans and implementations - look for security holes, UX issues, accessibility gaps, and architectural risks.
4. Read PLAN.md and README.md before starting any work.
5. Admin UI text in English; public-facing content in Swedish.
6. Follow existing code patterns and conventions.

## Activity Log
<!-- All team members: document your work, decisions, findings, and reviews below -->

### frontend_dev

#### All Frontend Tasks Complete - 2026-02-12

**P0 (Critical bug):**
- Fixed BookingConfirmation.tsx: `searchParams.get('booking_id')` changed to `searchParams.get('booking')` to match API query param
- Removed unused `useEffect` import

**P1 (Critical fixes):**
- Fixed ALL Swedish diacritical marks (å, ä, ö) across every .tsx file in both packages/web and packages/admin (35+ files touched)
- @tailwindcss/typography plugin installed in both packages, added to tailwind.config.js plugins arrays
- Mobile hamburger navigation added to Layout.tsx with slide-down menu, X/hamburger toggle, aria attributes
- Web dev server port was already 3000 (no change needed)

**P2 (Important improvements):**
- Added "Nyheter" nav link to navigation array in Layout.tsx
- Fixed slug generation in all 4 editors (PageEditor, PostEditor, CourseEditor, ProductEditor) - maps å→a, ä→a, ö→o before regex strip
- Active nav link highlighting using `useLocation().pathname` - both desktop and mobile nav
- Scroll-to-top on route change via `useEffect` in Layout.tsx
- Dashboard.tsx refactored to use `/admin/stats` endpoint instead of fetching all records
- Added parent_slug and sort_order fields to PageEditor sidebar (Hierarki section)
- Dynamic page titles via `useDocumentTitle` hook on every route

**P3 (Cleanup):**
- Removed unused @stripe/stripe-js from web package.json
- Removed unused useEffect import from BookingConfirmation.tsx

**Additional (done by frontend_helper):**
- HTML sanitization with DOMPurify added to all 3 `dangerouslySetInnerHTML` locations (Page.tsx, BlogPost.tsx, CourseDetail.tsx)
- Created `lib/sanitize.ts` utility with DOMPurify
- Created `hooks/useDocumentTitle.ts` hook

### backend_dev

#### Backend API Full Review - 2026-02-12

**Files reviewed**: All 10 source files in `packages/api/src/` (~1,039 lines total), plus schema.sql, wrangler.toml, package.json, tsconfig.json.

**What's complete**: Public routes (pages, posts, courses, products), contact form, Google OAuth + session auth, user management, admin CRUD for all entities, dashboard stats, booking creation + Stripe checkout, media upload/list/delete.

**Critical issues found & planned fixes**:
1. **No Stripe webhook handler** - `POST /api/webhooks/stripe` missing entirely. Payments complete on Stripe but booking status never updates. Will create `routes/webhooks.ts`.
2. **No admin refund endpoint** - `POST /api/admin/bookings/:id/refund` missing. Will add to `admin.ts`.
3. **Media routes unauthenticated** - Upload/delete at `/api/media` have zero auth. Will move under `/api/admin/media`.
4. **Course detail exposes all statuses** - `GET /api/courses/:slug` returns cancelled/draft courses. Will add status filter.
5. **Minor**: No booking field validation, broken Swedish chars in contact response, no session cleanup, sequential settings DB calls.

**Plan approved by team lead. Beginning implementation.**

#### Implementation Complete - 2026-02-12

All 8 tasks implemented. TypeScript compiles clean (`tsc --noEmit` passes). Summary:

**Task 1 - Stripe Webhook Handler** (`webhooks.ts`): Already existed from previous session. Mounted in `index.ts` at `/api/webhooks/stripe` BEFORE CORS middleware. Handles `checkout.session.completed` (idempotent), `checkout.session.expired`, `payment_intent.payment_failed`.

**Task 2 - Admin Booking Refund** (`admin.ts:260-324`): `POST /bookings/:id/refund`. Verifies payment_status='paid', calls `stripe.refunds.create()`, updates booking to refunded/cancelled, decrements `current_participants` (with `MAX(0,...)` guard), reactivates course from 'full' to 'active' if space opens up.

**Task 3 - Admin GET-by-ID Endpoints** (`admin.ts`): Added `GET /pages/:id` (line 46), `GET /posts/:id` (line 103), `GET /courses/:id` (line 157), `GET /products/:id` (line 334). All placed before PUT/DELETE routes.

**Task 4 - Secure Media Routes** (`admin.ts:399-483`, `index.ts`): Removed `app.route('/api/media', mediaRoutes)` from index.ts. Moved all media handlers (upload, list, delete) into admin.ts under `/media/*`. Inherits admin auth middleware. Admin frontend already called `/admin/media/*` so no frontend changes needed.

**Task 5 - Course Detail Status Filter** (`courses.ts:24`): Added `AND status IN ('active', 'full')` to `GET /:slug` query.

**Task 6 - Booking Validation + cancel_url Fix** (`bookings.ts`):
- Added validation for customerName, customerEmail, courseId, participants
- Fixed cancel_url: JOINs courses to get slug, uses `course_slug` instead of `course_id`
- Added null/zero check on `total_price_sek` before Stripe calculation
- Extracted `totalPriceSek` variable to avoid `as number * 100` precedence ambiguity

**Task 7 - Contact Swedish Text** (`contact.ts:31`): Fixed to `'Tack för ditt meddelande! Vi återkommer så snart vi kan.'`

**Task 8 - Minor Fixes** (`admin.ts`, `index.ts`):
- Settings PUT: Added `role === 'admin'` check (line 498), editors get 403
- CORS: Default allowed origins now includes `http://localhost:3001` for admin dev
- Course deletion: Checks for associated bookings before delete (line 201-217)
- Settings: Uses `c.env.DB.batch()` for batch updates (line 504-509)

#### ARCH-02 Fix: Booking Race Condition - 2026-02-12

**Problem**: SELECT-then-INSERT pattern in bookings.ts allowed concurrent requests to overbook a course.

**Fix** (`bookings.ts`): Replaced the separate availability check + insert with an atomic `UPDATE courses SET current_participants = current_participants + ? WHERE ... AND current_participants + ? <= max_participants`. If `rows_written` is 0, the course is full (return 400). Spots are now reserved at booking creation time.

**Consequence for webhooks** (`webhooks.ts`): Since spots are reserved at booking creation (not at payment), the webhook was updated:
- `checkout.session.completed`: Only updates booking payment_status/booking_status. No participant increment (already done).
- `checkout.session.expired` / `payment_intent.payment_failed`: Now RELEASES reserved spots by decrementing `current_participants` and reactivating course from 'full' if space opens.

TypeScript compiles clean.

### ux_reviewer

#### FULL CODEBASE AUDIT - 2026-02-12

Audited every source file in packages/web, packages/admin, and packages/api. Findings organized by severity and category below.

---

## SECURITY FINDINGS

### CRITICAL

**SEC-01: XSS via dangerouslySetInnerHTML (3 locations)**
- `packages/web/src/pages/Page.tsx:41` - `dangerouslySetInnerHTML={{ __html: page.content }}`
- `packages/web/src/pages/BlogPost.tsx:68` - `dangerouslySetInnerHTML={{ __html: post.content }}`
- `packages/web/src/pages/CourseDetail.tsx:85` - `dangerouslySetInnerHTML={{ __html: course.content }}`
- Content comes from the database and is authored via TipTap, but there is NO server-side HTML sanitization anywhere. If an admin account is compromised, or if content is imported from WordPress without sanitization, stored XSS is trivially possible. Even the WordPress migration (Phase 6) will import raw HTML content.
- **Fix required**: Add server-side HTML sanitization (e.g., DOMPurify on the server or a sanitize library in the API) before storing content, and/or sanitize on output.

**SEC-02: No Stripe webhook signature verification**
- There is NO webhook handler at all. The PLAN.md specifies `POST /api/webhooks/stripe` but no route file implements it. The bookings route at `packages/api/src/routes/bookings.ts` creates Stripe Checkout Sessions but there is no code to handle `checkout.session.completed` events.
- This means: (1) Payment status is NEVER updated after checkout. The booking stays "pending" forever. (2) `current_participants` on courses is NEVER incremented. (3) Any attacker could fake a successful payment by simply navigating to the success URL.
- **This is a showstopper for going live.**

**SEC-03: Booking status endpoint exposes data without authentication**
- `packages/api/src/routes/bookings.ts:94-106` - `GET /api/bookings/:id/status` returns booking payment/status info with NO authentication. Anyone who guesses or brute-forces a nanoid booking ID can check its status.
- While nanoid IDs are hard to guess (21 chars by default), this is still an Insecure Direct Object Reference (IDOR). Combined with the checkout flow returning the booking ID in the URL, this leaks data.

**SEC-04: Media routes have NO authentication**
- `packages/api/src/routes/media.ts` - The upload (`POST /upload`), list (`GET /`), and delete (`DELETE /:id`) endpoints have NO auth middleware. Anyone on the internet can upload files to R2, list all media, and delete files.
- The media routes are mounted at `/api/media` (line 61 in index.ts), completely separate from `/api/admin`. The admin routes have auth middleware, but media routes do not.

**SEC-05: No CSRF protection on state-changing operations**
- The contact form (`POST /api/contact`) and booking creation (`POST /api/bookings`) are public endpoints with no CSRF tokens. An attacker could create fake bookings or spam the contact form from any website.

### HIGH

**SEC-06: Session token passed in URL during OAuth callback**
- `packages/api/src/routes/auth.ts:151` - The session token is passed as a URL query parameter: `?token=${sessionToken}`. URL parameters are logged in browser history, server logs, and can leak via Referer headers. Session tokens should be passed via HTTP-only cookies or at minimum via a POST body / fragment identifier.

**SEC-07: No rate limiting anywhere**
- No rate limiting on: login attempts, contact form submissions, booking creation, media upload, admin API calls. This allows brute-force attacks, DoS via large uploads, and contact form spam.

**SEC-08: No input validation on admin CRUD operations**
- `packages/api/src/routes/admin.ts` - All create/update endpoints accept `body` from `c.req.json()` with zero validation. No checks for:
  - Required fields (slug, title)
  - Slug format (could contain special characters, SQL-relevant characters, or path traversal)
  - Content length limits
  - Price being negative
  - max_participants being zero or negative
  - Date format validation

**SEC-09: No file type/size validation on media upload**
- `packages/api/src/routes/media.ts:8-46` - The upload accepts ANY file with no size limit and no real content-type verification (it trusts the browser-reported `file.type`). An attacker could upload:
  - Executable files (.exe, .sh)
  - HTML files that execute JavaScript when opened
  - Extremely large files to exhaust R2 storage
  - Files with path-traversal names

**SEC-10: Admin GET endpoints for single items missing**
- `GET /api/admin/pages/:id` is not implemented. The admin frontend calls `getPage(id!)` which hits this endpoint, but the admin routes only have `GET /pages` (list all), not `GET /pages/:id`. Same issue for `GET /admin/posts/:id`, `GET /admin/courses/:id`, `GET /admin/products/:id`. The editors will fail when trying to load an existing item.

### MEDIUM

**SEC-11: No session cleanup / expired session pruning**
- Sessions expire after 7 days but expired sessions are never deleted from the database. Over time, the sessions table will grow indefinitely. There is no cleanup mechanism.

**SEC-12: Settings endpoint has no role-based restrictions**
- `packages/api/src/routes/admin.ts:290-300` - `PUT /admin/settings` allows any authenticated user (including editors) to modify ALL site settings. Settings could include sensitive keys like `stripe_publishable_key`. Only admins should be able to modify settings.

**SEC-13: No Content-Security-Policy headers**
- The API returns no security headers (CSP, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security). The public frontend renders user-generated HTML, making CSP especially important.

**SEC-14: Hardcoded media URL**
- `packages/api/src/routes/media.ts:35` - `const url = \`https://media.livskompass.se/${r2Key}\`` is hardcoded. If the R2 bucket is not configured with this custom domain, all media URLs will be broken.

---

## UX FINDINGS

### CRITICAL

**UX-01: BookingConfirmation reads wrong URL parameter**
- `packages/web/src/pages/BookingConfirmation.tsx:8` reads `booking_id` from search params, but `packages/api/src/routes/bookings.ts:77` generates the success URL with `?booking=${bookingId}` (param named `booking`, not `booking_id`). **The confirmation page will NEVER find the booking.**

**UX-02: No mobile hamburger menu**
- `packages/web/src/components/Layout.tsx:24` - Navigation links are `hidden md:flex`. On mobile, there are no nav links at all - the hamburger menu button is completely missing. Users on mobile devices cannot navigate the site.

### HIGH

**UX-03: Missing Swedish characters (a, a, o)**
- Multiple instances of ASCII approximations instead of proper Swedish characters throughout the codebase:
  - Layout.tsx: "rattigheter forbehallna" should be "rattigheter forbehallna" (though actually should use proper a/o characters)
  - Contact.tsx:61: "Vi aterkommit till dig" - grammatically wrong, should be "Vi aterkommer till dig"
  - Many instances: "ar", "for", "aterbetalning" etc. missing umlauts
- Note: Some files correctly use Swedish characters (e.g. UsersList.tsx uses "Andra", "behorighet") while others do not. This inconsistency suggests some files were written with different locale settings.

**UX-04: No page title/meta updates per route**
- The HTML title is always "Livskompass - ACT & Mindfulness" regardless of which page is shown. No `<title>` or `<meta>` tag updates happen on route change. This is terrible for SEO and usability. React Helmet or similar is needed.

**UX-05: No pagination on blog listing**
- `packages/web/src/pages/Blog.tsx:8` - Hardcodes `getPosts(20)` with no pagination UI. If there are more than 20 posts, users cannot see them. The API supports `offset` but the frontend does not use it.

**UX-06: No "Nyhet" (blog) link in navigation**
- `packages/web/src/components/Layout.tsx:3-11` - Navigation includes "Mindfulness", "Utbildningar", "Material", "ACT", "Forskning", "Kontakt" but NOT "Nyhet" (blog). Users cannot discover the blog section from the nav.
- Wait - actually "Nyhet" is not there, but it links to `/nyhet`. The blog is unreachable from navigation.

**UX-07: No skip navigation / a11y landmarks**
- No skip-to-content link, no ARIA landmarks (`<nav>`, `<main>`, `<aside>` are present but not labeled), no focus management on route change. Keyboard users and screen reader users will have poor experience.

**UX-08: Forms lack proper error feedback**
- Contact form and booking form show error messages but do not scroll to the error, do not set focus on the first invalid field, and do not use `aria-invalid` or `aria-describedby` for form validation.

### MEDIUM

**UX-09: No loading/empty state for generic pages**
- When visiting `/mindfulness` or `/act` or `/forskning` via the navigation, these hit the generic `Page.tsx` component which fetches `/api/pages/:slug`. If no page exists with that slug in the database, users see the 404 page, which is confusing because the link is in the nav.

**UX-10: Course detail shows course content for all statuses**
- `packages/api/src/routes/courses.ts:20-32` - The `GET /api/courses/:slug` endpoint does NOT filter by status. It returns cancelled, completed, and draft courses to the public. Users can view draft courses if they guess the slug.

**UX-11: No confirmation email implementation**
- `packages/web/src/pages/BookingConfirmation.tsx:122` says "Du kommer att fa en bekraftelse via e-post" but there is NO email sending anywhere in the codebase. This is a broken promise to the user.

**UX-12: Dashboard loads all data instead of using stats endpoint**
- `packages/admin/src/pages/Dashboard.tsx:3-25` - Fetches ALL pages, ALL posts, ALL courses, ALL bookings, ALL contacts just to count them. The API has a `/admin/stats` endpoint that does this efficiently, but the dashboard does not use it.

---

## ARCHITECTURE FINDINGS

### CRITICAL

**ARCH-01: No Stripe webhook handler - payments will never complete**
- As noted in SEC-02, there is no webhook route. Without it, the entire payment flow is broken:
  1. User creates booking (status: pending)
  2. User pays on Stripe
  3. Stripe sends webhook (nowhere to receive it)
  4. Booking stays pending forever
  5. current_participants never updates
  6. Course never becomes "full"

**ARCH-02: Race condition in booking creation**
- `packages/api/src/routes/bookings.ts:14-34` - The available spots check (`max_participants - current_participants`) and the booking insert are NOT atomic. Two concurrent booking requests could both pass the check and overbook the course. This needs a transaction or an atomic `UPDATE courses SET current_participants = current_participants + ? WHERE current_participants + ? <= max_participants`.

**ARCH-03: Refund endpoint referenced but not implemented**
- `packages/admin/src/pages/BookingDetail.tsx` calls `refundBooking(id!)` which hits `POST /admin/bookings/:id/refund`. But `packages/api/src/routes/admin.ts` has NO refund endpoint. The button will fail with a 404.

### HIGH

**ARCH-04: Admin single-item GET endpoints missing**
- As noted in SEC-10, the admin page/post/course/product editors call `getPage(id!)`, `getPost(id!)`, etc., which send `GET /admin/pages/:id`, `GET /admin/posts/:id`, etc. But these routes DO NOT EXIST in admin.ts. Only list endpoints (`GET /admin/pages`) exist. All editor pages will fail to load existing items.

**ARCH-05: Price unit confusion (SEK vs ore)**
- PLAN.md comments say `price_sek INTEGER -- Price in SEK (ore)` suggesting prices in ore (1/100 of SEK). But the Stripe integration at `bookings.ts:72` does `unit_amount: booking.total_price_sek as number * 100` converting to ore, meaning `total_price_sek` is stored in whole SEK. The field name and PLAN.md comment contradict each other. The frontend displays `price_sek` as-is with " kr" suffix, which is correct if stored in whole SEK. But this confusion could cause 100x overcharging or undercharging.

**ARCH-06: Operator precedence bug in Stripe price calculation**
- `packages/api/src/routes/bookings.ts:72` - `unit_amount: booking.total_price_sek as number * 100` - The `as number` type assertion binds before `* 100`, so this works, BUT if `total_price_sek` is null/undefined (which it can be - the schema allows NULL), this will be `NaN * 100 = NaN`, which Stripe will reject.

**ARCH-07: CORS origin matching is fragile**
- `packages/api/src/index.ts:36-41` - CORS origin validation splits by comma and does exact match. If the request origin has a trailing slash or different casing, it will fail. Also, during development, the default is `http://localhost:5173` which is the web port, but the admin is on port 3001 - admin requests in development will be CORS-blocked.

### MEDIUM

**ARCH-08: No database migrations strategy**
- The project uses a single `schema.sql` file. There is no migration system. When the schema needs to change (add columns, modify tables), there is no safe way to apply changes without data loss.

**ARCH-09: No error logging / monitoring**
- All errors are `console.error` which disappears into Cloudflare Workers logs. No structured logging, no error tracking (Sentry, etc.), no alerting.

**ARCH-10: Slug generation strips Swedish characters**
- `PageEditor.tsx:58-63`, `PostEditor.tsx:70-75`, `CourseEditor.tsx:70-75` - `generateSlug` uses `/[^a-z0-9]+/g` which strips all Swedish characters (a, a, o). A page titled "Ovningar" becomes "vningar". This produces broken and confusing URLs.

**ARCH-11: No cascade delete protection**
- Deleting a course (`DELETE /admin/courses/:id`) does not check for or delete associated bookings. The foreign key constraint exists in the schema but SQLite does not enforce foreign keys by default. Orphaned bookings will remain.

**ARCH-12: No index on media.r2_key**
- Media deletion looks up by ID (indexed) but the r2_key is stored as the R2 object key. If cleanup or reconciliation is ever needed, there is no index on r2_key.

---

## COMPLETENESS FINDINGS

### CRITICAL

**COMP-01: WordPress has 72 pages - none migrated yet**
- The old_sitemap.md shows 72 pages, 11 blog posts, and 609 media files. Phase 6 (WordPress Migration) is TODO. Without migration, the site launches empty.

**COMP-02: Missing pages from WordPress structure**
- The following major WordPress pages have NO corresponding route in the new frontend:
  - `/om-fredrik-livheim/` (About page - no route)
  - `/forskning-pa-metoden/` and subpages (Research has nav link but no dedicated component)
  - `/act/` subpages like `/vad-ar-act/`, `/om-detta-gruppformat-av-act/`
  - `/mindfulness/` subpages (12 pages with CD ordering, exercises, apps)
  - `/norge/` (Norwegian page)
  - `/pressbilder/` (Press photos)
  - All these rely on the generic `Page.tsx` which requires database content

**COMP-03: No WordPress redirect mapping**
- Old URLs like `/act-samtalskort/`, `/actonline/`, `/infor-gruppledarutbildning/` need 301 redirects to their new locations. Without redirects, all existing backlinks, Google rankings, and bookmarks will break.

### HIGH

**COMP-04: No search functionality**
- The WordPress site is content-heavy (72 pages + 11 posts). There is no search feature in the new site. Users cannot find specific content.

**COMP-05: No email notifications**
- PLAN.md mentions "Email notifications (optional: Resend/Mailgun)" but no email is implemented. Critical use cases missing:
  - Booking confirmation to customer
  - New booking notification to admin
  - Contact form notification to admin
  - Payment receipt

**COMP-06: No product purchase flow**
- Products page shows products with "Kop" (Buy) buttons that link to `external_url`. There is no checkout flow for products (books, CDs, etc.) within the site. If `external_url` is not set, there is no way to buy the product.

**COMP-07: Missing WordPress migration script**
- `scripts/migrate-wordpress.ts` is referenced in PLAN.md but does not exist. The WordPress export file location is noted in README.md but no migration tooling exists.

### MEDIUM

**COMP-08: No Google Analytics integration**
- Settings page has a field for Google Analytics ID, but there is no script tag or integration code anywhere in the frontend to actually load Google Analytics.

**COMP-09: No sitemap.xml or robots.txt**
- Essential for SEO. The WordPress site presumably had these, but the new site has neither.

**COMP-10: No favicon**
- `index.html` references `/favicon.svg` but this file likely does not exist (not in the file list). The browser will show a default icon.

**COMP-11: No print styles**
- Course details and booking confirmations may be printed. No print-specific CSS exists.

---

## SUMMARY BY PRIORITY

**Must fix before launch (blockers):**
1. SEC-02/ARCH-01: Implement Stripe webhook handler
2. UX-01: Fix BookingConfirmation URL parameter mismatch (`booking` vs `booking_id`)
3. SEC-04: Add auth to media routes
4. ARCH-04/SEC-10: Add admin single-item GET endpoints
5. ARCH-03: Implement refund endpoint
6. ARCH-02: Fix booking race condition
7. UX-02: Add mobile navigation menu
8. COMP-03: WordPress redirect mapping

**Should fix before launch:**
1. SEC-01: Sanitize HTML content
2. SEC-06: Fix session token in URL
3. SEC-08: Add input validation
4. SEC-09: File upload validation
5. UX-03: Fix Swedish character issues
6. UX-04: Per-route page titles
7. UX-10: Filter draft/cancelled courses from public API
8. ARCH-05: Clarify price unit (SEK vs ore)
9. ARCH-07: Fix CORS for development
10. COMP-05: Email notifications

**Should fix post-launch:**
1. SEC-07: Rate limiting
2. SEC-11: Session cleanup
3. SEC-13: Security headers
4. UX-05: Blog pagination
5. UX-07: Accessibility improvements
6. ARCH-08: Database migrations
7. ARCH-09: Error monitoring
8. COMP-04: Search
9. COMP-08: Google Analytics
10. COMP-09: Sitemap/robots.txt

---

#### BACKEND IMPLEMENTATION REVIEW - 2026-02-12

Spot-check of backend_dev's 8-task implementation. Reviewed all 5 files requested by team-lead.

**VERDICT: PASS with 3 remaining concerns (1 medium, 2 low)**

##### 1. webhooks.ts -- PASS

- Signature verification: Uses `c.req.text()` for raw body (correct, not parsed JSON). Calls `stripe.webhooks.constructEvent(rawBody, signature, secret)`. Returns 400 on missing/invalid signature.
- Event handling: Covers `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed` -- the three essential events.
- Idempotency: On `checkout.session.completed`, checks `booking.payment_status === 'paid'` before processing -- prevents double-incrementing participants. On expired/failed, uses `WHERE payment_status = 'pending'` to avoid overwriting already-processed bookings.
- Participant count: Correctly increments `current_participants` and auto-sets course to 'full' when capacity reached via `CASE WHEN current_participants + ? >= max_participants`.
- No issues found.

##### 2. admin.ts -- PASS

- **GET-by-ID endpoints**: All 4 added (pages/:id line 46, posts/:id line 103, courses/:id line 157, products/:id line 334). All return 404 when not found. Bookings/:id (line 231) also added with course_title JOIN.
- **Refund endpoint** (line 260): Validates `payment_status === 'paid'` and `stripe_payment_intent` exists. Calls `stripe.refunds.create()` with try/catch. Updates booking to `refunded/cancelled`. Decrements participants with `MAX(0, ...)` guard. Reactivates course from 'full' to 'active' when space opens. Solid implementation.
- **Media routes** (line 399): Moved under admin routes, inherits auth middleware. Upload, list (with type filter + pagination), and delete all present. Delete removes from both R2 and DB.
- **Settings admin check** (line 497): `role !== 'admin'` returns 403. Uses `DB.batch()` for atomic updates.
- **Course delete protection** (line 202): Checks for associated bookings before deleting, returns Swedish error message with count.
- No issues found.

##### 3. bookings.ts -- PASS (with 1 remaining concern)

- **Input validation**: Checks required fields (customerName, customerEmail, courseId, participants), validates email contains '@', validates participants >= 1.
- **cancel_url fix**: JOINs courses table to get `slug as course_slug` (line 60), uses it in cancel_url (line 96). Correct.
- **Price null check**: `if (!totalPriceSek || totalPriceSek <= 0)` guard at line 75 before Stripe call. Prevents NaN issue from ARCH-06.
- **Price variable extraction**: `totalPriceSek * 100` at line 90 is clear. No more `as number * 100` precedence ambiguity.
- ~~**REMAINING CONCERN (MEDIUM) - ARCH-02 NOT FIXED**~~ **NOW FIXED** -- see ARCH-02 fix review below.

##### 4. courses.ts -- PASS

- **Status filter on GET /:slug** (line 24): `WHERE slug = ? AND status IN ('active', 'full')`. Draft, cancelled, and completed courses are now hidden from the public. Matches the list endpoint filter at line 12. UX-10 resolved.
- No issues found.

##### 5. index.ts -- PASS

- **Webhook before CORS** (line 34): `app.route('/api/webhooks/stripe', webhookRoutes)` is mounted BEFORE the CORS middleware block (line 38). Stripe webhook calls do not send Origin headers, so this is correct.
- **CORS localhost:3001** (line 40): Default allowed origins now `'http://localhost:5173,http://localhost:3001'`. Admin dev server will no longer be CORS-blocked. ARCH-07 resolved.
- **Public media route removed**: `app.route('/api/media', mediaRoutes)` is gone. Media is now only accessible via `/api/admin/media/*` with auth. SEC-04 resolved.
- No issues found.

##### Issues resolved by this implementation

From the original audit, the following are now FIXED:
- SEC-02/ARCH-01: Stripe webhook handler -- FIXED
- SEC-04: Media routes auth -- FIXED
- SEC-10/ARCH-04: Admin GET-by-ID endpoints -- FIXED
- SEC-12: Settings admin-only -- FIXED
- ARCH-03: Refund endpoint -- FIXED
- ARCH-06: Price NaN guard -- FIXED
- ARCH-07: CORS for admin dev -- FIXED
- ARCH-11: Cascade delete protection (courses) -- FIXED
- UX-10: Course status filter -- FIXED

##### Issues still open from original audit

- ~~**ARCH-02 (MEDIUM)**: Booking race condition~~ -- NOW FIXED (see ARCH-02 fix review below)
- **SEC-01 (HIGH)**: XSS via dangerouslySetInnerHTML -- not in backend scope
- **SEC-03 (HIGH)**: Booking status IDOR -- not addressed
- **SEC-05 (HIGH)**: No CSRF -- not addressed
- **SEC-06 (HIGH)**: Session token in URL -- not addressed
- **SEC-08 (HIGH)**: No admin CRUD validation -- not addressed (only public booking validation added)
- **SEC-09 (HIGH)**: No file upload size/type validation -- not addressed
- **SEC-14 (MEDIUM)**: Hardcoded media URL -- not addressed (still `https://media.livskompass.se/` at admin.ts:429)

---

#### ARCH-02 FIX REVIEW (Booking Race Condition) - 2026-02-12

**VERDICT: PASS -- correct approach, with 2 edge cases noted (1 medium, 1 low)**

##### What changed

**bookings.ts** (lines 35-49): The old SELECT-then-INSERT is replaced with an atomic UPDATE:
```sql
UPDATE courses
SET current_participants = current_participants + ?,
    status = CASE WHEN current_participants + ? >= max_participants THEN 'full' ELSE status END
WHERE id = ? AND status = 'active' AND current_participants + ? <= max_participants
```
Checks `reserveResult.meta.rows_written` -- if 0, no spots were reserved and booking is rejected. This is the correct pattern. Two concurrent requests cannot both succeed if they would exceed capacity because the UPDATE is atomic at the SQLite/D1 level.

**webhooks.ts** (lines 57-64): `checkout.session.completed` no longer increments participants. It only updates the booking to `paid/confirmed`. Correct -- spots were already reserved at booking creation.

**webhooks.ts** (lines 69-96, 101-128): `checkout.session.expired` and `payment_intent.payment_failed` now fetch the pending booking, update to 'failed', then RELEASE the reserved spots via:
```sql
UPDATE courses SET current_participants = MAX(0, current_participants - ?), ...
```
Correct -- if a user creates a booking (reserving spots) but never pays or payment fails, the spots are freed.

**admin.ts refund** (lines 303-321): Refund still decrements `current_participants`. Correct -- refund releases the spots that were reserved at booking creation and confirmed at payment.

##### Flow analysis

The full lifecycle is now consistent:

| Event | current_participants | booking status |
|---|---|---|
| Booking created | +N (atomic reserve) | pending |
| Payment succeeds | unchanged | paid/confirmed |
| Checkout expires | -N (release) | failed |
| Payment fails | -N (release) | failed |
| Admin refund | -N (release) | refunded/cancelled |

This is sound. Spots are reserved optimistically and released on failure/cancellation.

##### Edge case 1 (MEDIUM): Abandoned bookings without Stripe session

A user calls `POST /api/bookings` (spots reserved) but NEVER calls `POST /api/bookings/:id/checkout` (never starts Stripe checkout). No Stripe session is created, so Stripe never fires `checkout.session.expired`. The spots remain reserved indefinitely and the booking stays `pending` forever.

**Impact**: A malicious or confused user can "lock up" all course spots by creating bookings without paying. There is no expiry mechanism for bookings that never enter Stripe checkout.

**Recommended fix**: Either (a) add a scheduled cleanup job (Cloudflare Cron Trigger) that releases spots for bookings older than e.g. 30 minutes that have no `stripe_session_id`, or (b) defer spot reservation to checkout initiation rather than booking creation (but this reintroduces a smaller race window). Option (a) is simpler and safer.

##### Edge case 2 (LOW): payment_intent.payment_failed metadata

The `payment_intent.payment_failed` handler reads `paymentIntent.metadata?.booking_id` (webhooks.ts:103). But the booking_id metadata is set on the **Checkout Session** (bookings.ts:110), not directly on the PaymentIntent. Stripe automatically copies session metadata to the payment intent in most cases, but this is not guaranteed for all payment flows. If the metadata is missing, the handler silently skips with `if (!bookingId) break` -- the spots are never released.

**Impact**: Low -- in the standard Checkout Session flow, metadata is reliably copied. But if this ever breaks or a different integration path is used, spots leak silently.

**Recommended fix**: Consider also handling this via the Checkout Session object. Or, rely solely on `checkout.session.expired` for cleanup (which IS guaranteed to have the metadata since it fires on the session itself), and remove the `payment_intent.payment_failed` handler.

##### Conclusion

ARCH-02 is resolved. The atomic UPDATE approach is correct and the reserve-on-create / release-on-failure model is consistent across all code paths. The abandoned-booking edge case (medium) should be addressed before production but is not a blocker for development.
