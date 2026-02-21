# Livskompass Redesign — Architecture & Implementation Plan

## Executive Summary

Transform Livskompass from a semi-hardcoded React site into a fully modular, block-based system with a distinctive visual identity, pixel-identical CMS preview, and inline editing. Every page — including Home, Courses, Blog, Contact, and Products — will be assembled from reusable blocks. No page has its own bespoke layout.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Block System Design](#2-block-system-design)
3. [Page Routing & Templates](#3-page-routing--templates)
4. [Design System & Visual Identity](#4-design-system--visual-identity)
5. [CMS 1:1 Preview](#5-cms-11-preview)
6. [Inline Editing](#6-inline-editing)
7. [File Changes](#7-file-changes)
8. [Implementation Order](#8-implementation-order)
9. [Task Breakdown](#9-task-breakdown)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                    PUBLIC SITE                        │
│                                                      │
│  Router ──→ UniversalPage ──→ PuckRenderer           │
│         ──→ CourseDetail  ──→ PuckRenderer + Context  │
│         ──→ PostDetail    ──→ PuckRenderer + Context  │
│         ──→ BookingPage   ──→ BookingForm  + Context  │
│         ──→ Confirmation  ──→ (kept as component)     │
│         ──→ NotFound      ──→ (kept as component)     │
│                                                      │
│  Layout.tsx wraps ALL routes (nav + footer)           │
│  Nav/footer: site-level, settings-driven              │
│  Edit toolbar: shown when admin session detected      │
│                                                      │
├──────────────────────────────────────────────────────┤
│                 SHARED PACKAGE                        │
│                                                      │
│  blocks/           ← 28 block components              │
│  puck-config.ts    ← thin config assembler            │
│  design-tokens.ts  ← colors, fonts, spacing           │
│  context.ts        ← CourseContext, PostContext         │
│  helpers.ts        ← API helpers, media URLs           │
│  tailwind-preset.ts← shared Tailwind config            │
│                                                      │
├──────────────────────────────────────────────────────┤
│                  ADMIN CMS                            │
│                                                      │
│  Puck editor (unchanged architecture)                 │
│  Settings dropdown in header (unchanged)              │
│  Iframe preview loads web CSS for 1:1 match           │
│  "View on site" button per page                       │
│                                                      │
├──────────────────────────────────────────────────────┤
│                    API                                │
│                                                      │
│  Existing endpoints (unchanged)                       │
│  + PATCH /admin/pages/:id/block/:index (inline edit)  │
│  + GET /api/site-config (nav, footer, settings)       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Key Principles

1. **Every page is blocks.** No hardcoded page layouts. Home, Courses, Blog, Contact, Products — all stored as `content_blocks` JSON in the pages table.
2. **Detail pages use context.** `/utbildningar/:slug` wraps rendering in `CourseContext`. Blocks like `CourseInfo` and `BookingCTA` read from context. Each course/post stores its own `content_blocks`.
3. **Site chrome is NOT a block.** Nav and footer are rendered by Layout.tsx. They appear in the Puck preview via `root.render` but are not stored as blocks.
4. **One Tailwind config rules all.** Shared preset in `packages/shared` ensures identical rendering across web, admin, and Puck iframe.
5. **Blocks are individual files.** No more 1400-line monolith. Each block = one file (50–150 lines).

---

## 2. Block System Design

### 2.1 Block Organization

Replace the monolithic `puck-config.tsx` with individual block files:

```
packages/shared/src/
├── blocks/
│   ├── index.ts              ← re-exports all block definitions
│   │
│   │  ── LAYOUT ──
│   ├── Columns.tsx            (existing, extract)
│   ├── SeparatorBlock.tsx     (existing, extract)
│   ├── Spacer.tsx             ★ NEW
│   │
│   │  ── CONTENT ──
│   ├── Hero.tsx               (existing file, already extracted)
│   ├── RichText.tsx           (existing file, already extracted)
│   ├── ImageBlock.tsx         (existing file, already extracted)
│   ├── Accordion.tsx          (existing file, already extracted)
│   ├── PageHeader.tsx         ★ NEW
│   ├── PersonCard.tsx         ★ NEW
│   ├── FeatureGrid.tsx        ★ NEW
│   ├── StatsCounter.tsx       ★ NEW
│   │
│   │  ── MARKETING ──
│   ├── CTABanner.tsx          (existing, extract)
│   ├── CardGrid.tsx           (existing file, already extracted)
│   ├── Testimonial.tsx        (existing, extract)
│   ├── ButtonGroup.tsx        (existing file, already extracted)
│   ├── PricingTable.tsx       ★ NEW
│   │
│   │  ── MEDIA ──
│   ├── ImageGallery.tsx       (existing, extract)
│   ├── VideoEmbed.tsx         (existing, extract)
│   │
│   │  ── DYNAMIC CONTENT ──
│   ├── PostGrid.tsx           (existing, extract)
│   ├── PageCards.tsx          (existing, extract)
│   ├── NavigationMenu.tsx     (existing, extract)
│   ├── CourseList.tsx         ★ NEW
│   ├── ProductList.tsx        ★ NEW
│   │
│   │  ── INTERACTIVE ──
│   ├── ContactForm.tsx        ★ NEW (replaces placeholder)
│   ├── BookingForm.tsx        ★ NEW
│   │
│   │  ── DATA-BOUND ──
│   ├── CourseInfo.tsx         ★ NEW
│   ├── BookingCTA.tsx         ★ NEW
│   ├── PostHeader.tsx         ★ NEW
│
├── puck-config.ts             ← thin config assembler (~200 lines)
├── design-tokens.ts           ← exported color/font/spacing constants
├── context.ts                 ← CourseContext, PostContext
├── helpers.ts                 ← getApiBase, resolveMediaUrl, useFetchJson
├── tailwind-preset.ts         ← shared Tailwind preset
├── inject-preview-css.ts      (existing, improved)
├── types.ts                   (existing, expanded)
└── index.ts                   (existing, expanded)
```

### 2.2 Block Definition Pattern

Each block file exports a complete block definition object:

```tsx
// blocks/PageHeader.tsx
import React from 'react'

export interface PageHeaderProps {
  heading: string
  subheading: string
  alignment: 'left' | 'center'
  size: 'small' | 'large'
  showDivider: boolean
}

function PageHeaderRender({ heading, subheading, alignment, size, showDivider }: PageHeaderProps) {
  // ... component JSX
}

export const PageHeaderBlock = {
  label: 'Page Header',
  defaultProps: { heading: 'Rubrik', subheading: '', alignment: 'left', size: 'large', showDivider: false },
  fields: {
    heading: { type: 'text' },
    subheading: { type: 'textarea' },
    alignment: { type: 'radio', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }] },
    size: { type: 'radio', options: [{ label: 'Small', value: 'small' }, { label: 'Large', value: 'large' }] },
    showDivider: { type: 'radio', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
  },
  render: PageHeaderRender,
}
```

The `puck-config.ts` then assembles:

```ts
import { PageHeaderBlock } from './blocks/PageHeader'
import { HeroBlock } from './blocks/Hero'
// ...28 imports

export const puckConfig: Config = {
  root: { render: RootWrapper },
  categories: {
    layout:    { title: 'Layout',    components: ['Columns', 'SeparatorBlock', 'Spacer'] },
    content:   { title: 'Content',   components: ['Hero', 'RichText', 'ImageBlock', 'Accordion', 'PageHeader', 'PersonCard', 'FeatureGrid', 'StatsCounter'] },
    marketing: { title: 'Marketing', components: ['CTABanner', 'CardGrid', 'Testimonial', 'ButtonGroup', 'PricingTable'] },
    media:     { title: 'Media',     components: ['ImageGallery', 'VideoEmbed'] },
    dynamic:   { title: 'Dynamic',   components: ['CourseList', 'ProductList', 'PostGrid', 'PageCards', 'NavigationMenu'] },
    interactive: { title: 'Interactive', components: ['ContactForm', 'BookingForm'] },
    data:      { title: 'Data-bound', components: ['CourseInfo', 'BookingCTA', 'PostHeader'] },
  },
  components: {
    Hero: HeroBlock,
    PageHeader: PageHeaderBlock,
    // ... all 28
  },
}
```

### 2.3 Complete Block Catalog

#### EXISTING BLOCKS (16) — extract from puck-config.tsx to individual files

| Block | File | Lines | Changes |
|-------|------|-------|---------|
| Hero | `Hero.tsx` | ~150 | Already extracted. Update colors to new palette. |
| RichText | `RichText.tsx` | ~40 | Extract. Keep as-is. |
| ImageBlock | `ImageBlock.tsx` | ~60 | Already extracted. Keep as-is. |
| Accordion | `Accordion.tsx` | ~80 | Already extracted. Add smooth CSS transitions. |
| CTABanner | `CTABanner.tsx` | ~60 | Extract. Update colors. |
| CardGrid | `CardGrid.tsx` | ~120 | Already extracted. Keep as-is. |
| Testimonial | `Testimonial.tsx` | ~60 | Extract. Add "featured" style with large quote marks. |
| ButtonGroup | `ButtonGroup.tsx` | ~60 | Already extracted. Update button styles. |
| Columns | `Columns.tsx` | ~60 | Already extracted. Keep as-is. |
| SeparatorBlock | `SeparatorBlock.tsx` | ~40 | Already extracted. Keep as-is. |
| ImageGallery | `ImageGallery.tsx` | ~80 | Extract. Add lightbox option (CSS only). |
| VideoEmbed | `VideoEmbed.tsx` | ~50 | Extract. Keep as-is. |
| PostGrid | `PostGrid.tsx` | ~100 | Extract. Already functional. |
| PageCards | `PageCards.tsx` | ~120 | Extract. Already functional. |
| NavigationMenu | `NavigationMenu.tsx` | ~60 | Extract. Keep as-is. |
| ContactFormBlock | `ContactForm.tsx` | ~60 | **REWRITE** — make functional (see below). |

#### NEW BLOCKS (12)

**1. PageHeader** — Page title + subtitle section
```
Category: Content
Props:
  heading: string           — "Utbildningar"
  subheading: string        — "ACT och mindfulness med Fredrik Livheim"
  alignment: left | center
  size: small | large       — small: text-3xl, large: text-4xl md:text-5xl
  showDivider: boolean      — thin accent-colored line below
Render: max-w-7xl container, heading + subheading + optional divider
Used by: Every listing page (courses, blog, products, contact)
Replaces: The hardcoded <h1>+<p> at the top of Courses.tsx, Blog.tsx, Products.tsx, Contact.tsx
```

**2. CourseList** — Full course listing with rich cards
```
Category: Dynamic
Props:
  heading: string            — optional section heading
  maxItems: number           — 0 = show all (default 0)
  columns: 2 | 3            — default 2
  showBookButton: boolean    — default true
  compactMode: boolean       — false = full cards (listing page), true = smaller cards (homepage)
Data: Fetches GET /api/courses, renders all active/full courses
Render: Grid of course cards with:
  - Status badge (Platser kvar / Fullbokad)
  - Title
  - Description (line-clamp-2)
  - Location icon + text
  - Date range
  - Price
  - "Läs mer" + "Boka plats" buttons
  - Skeleton loading state
  - Empty state: "Det finns inga utbildningar planerade just nu."
Replaces: Courses.tsx lines 48-136 (the entire course grid)
```

**3. ProductList** — Products grouped by type
```
Category: Dynamic
Props:
  heading: string
  filterType: string         — empty = all types, or "book", "cd", etc.
  columns: 2 | 3            — default 3
Data: Fetches GET /api/products
Render: Groups products by type with section headings (Böcker, CD-skivor, etc.)
  Each product card:
  - Image thumbnail
  - Type badge
  - Title
  - Description (line-clamp-3)
  - Price or "Gratis" badge
  - Buy button (if external_url set)
  - Out of stock badge
Replaces: Products.tsx lines 52-117 (the entire product grid)
```

**4. CourseInfo** — Course detail metadata card
```
Category: Data-bound
Context: CourseContext (reads course data from React context)
Props:
  showDeadline: boolean      — default true
  layout: grid | stacked     — default grid
Render: Card with 4-column grid:
  - Plats (MapPin icon + location)
  - Datum (Calendar icon + date range)
  - Pris (CreditCard icon + price in SEK)
  - Platser (Users icon + current/max participants)
  - Optional: registration deadline
  Note: In Puck editor, shows placeholder data (not real course data)
Replaces: CourseDetail.tsx lines 74-127 (the metadata card)
```

**5. BookingCTA** — Status-aware booking prompt
```
Category: Data-bound
Context: CourseContext
Props:
  style: card | inline       — card: full-width card, inline: just a button
Render:
  If course.status === 'active':
    Card with "Intresserad av att delta?" + "Boka plats" button
  If course.status === 'full':
    Yellow card with "Denna utbildning är fullbokad. Kontakta oss för kö."
  If course.status === 'completed':
    Gray card with "Denna utbildning har genomförts."
  Note: In Puck editor, shows the "active" variant with placeholder
Replaces: CourseDetail.tsx lines 134-157 (the CTA section)
```

**6. BookingForm** — Full booking form with Stripe
```
Category: Interactive
Context: CourseContext (reads course price, available spots)
Props:
  showOrganization: boolean  — default true
  showNotes: boolean         — default true
Render: Full booking form:
  - Course summary card (date, location, price/person)
  - Name, Email, Phone, Organization, Participants (dropdown), Notes
  - Total price calculation (price × participants)
  - "Gå till betalning" submit button
  - Stripe redirect on submit
  - Error display
  - Blocked state (full/completed course)
  Note: In Puck editor, renders a visual mockup (non-functional)
Replaces: Booking.tsx (entire 259-line component)
```

**7. PostHeader** — Blog post header
```
Category: Data-bound
Context: PostContext (reads post title, date, featured image)
Props:
  showBackLink: boolean      — default true
  backLinkText: string       — default "Alla inlägg"
  backLinkUrl: string        — default "/nyhet"
Render:
  - Back button ("← Alla inlägg")
  - Date badge (formatted Swedish locale)
  - Post title (text-4xl)
  - Featured image (if present, full-width, rounded)
  Note: In Puck editor, shows placeholder data
Replaces: BlogPost.tsx lines 49-77 (the post chrome)
```

**8. ContactForm** — Functional contact form
```
Category: Interactive
Props:
  heading: string            — "Kontakta oss"
  description: string        — help text
  showPhone: boolean         — default true
  showSubject: boolean       — default true
  layout: full | split       — full: just the form, split: contact info + form side by side
  contactName: string        — "Fredrik Livheim"
  contactTitle: string       — "Legitimerad psykolog och ACT-utbildare"
  contactEmail: string       — "livheim@gmail.com"
  contactPhone: string       — "070-694 03 64"
Render:
  If layout === 'split': Two columns — contact info cards (left) + form (right)
  If layout === 'full': Just the form
  Form is FUNCTIONAL: submits to POST /api/contact
  Success state: green checkmark + "Tack för ditt meddelande!"
  Error state: red alert
  Note: In Puck editor, form renders but submits are disabled
Replaces: Contact.tsx (entire 225-line component) AND the old placeholder ContactFormBlock
```

**9. PersonCard** — Profile/about card
```
Category: Content
Props:
  name: string               — "Fredrik Livheim"
  title: string              — "Legitimerad psykolog"
  bio: string (textarea)     — short biography
  image: string              — photo URL
  email: string              — optional
  phone: string              — optional
  style: card | horizontal   — card: stacked, horizontal: image left + text right
Render: Professional profile card with photo, name, title, bio, contact links
Used by: "Om Fredrik Livheim" page, Contact page
```

**10. FeatureGrid** — Icon/title/description grid
```
Category: Content
Props:
  heading: string
  subheading: string
  columns: 2 | 3 | 4        — default 3
  items: Array<{ icon: string, title: string, description: string }>
  style: cards | minimal     — cards: bordered cards, minimal: just icon + text
Render: Grid of feature items, each with icon + title + short text
Used by: Home page (e.g., "Varför ACT?"), about pages
```

**11. StatsCounter** — Animated statistics
```
Category: Content
Props:
  items: Array<{ value: string, label: string, prefix: string, suffix: string }>
  columns: 2 | 3 | 4        — default 4
  style: default | bordered
Render: Row of statistics (e.g., "150+ utbildade", "12 år", "15+ organisationer")
  Numbers are large text, labels are smaller
  Value is a string (not number) so "150+" or "12" both work
Used by: Home page, about page
```

**12. PricingTable** — Price comparison
```
Category: Marketing
Props:
  heading: string
  items: Array<{ name: string, price: string, description: string, features: string[], highlighted: boolean, ctaText: string, ctaLink: string }>
  columns: 2 | 3
Render: Side-by-side pricing cards, one can be "highlighted" (accent border)
Used by: Courses/products comparison pages
```

### 2.4 Data-Bound Block Architecture

Data-bound blocks (`CourseInfo`, `BookingCTA`, `BookingForm`, `PostHeader`) need data from their parent route. This uses React Context:

```tsx
// packages/shared/src/context.ts

import { createContext, useContext } from 'react'

export interface CourseContextValue {
  id: number
  slug: string
  title: string
  description: string
  location: string
  start_date: string
  end_date: string
  price_sek: number
  max_participants: number
  current_participants: number
  registration_deadline: string | null
  status: 'active' | 'full' | 'completed' | 'cancelled'
  content: string
}

export interface PostContextValue {
  id: number
  slug: string
  title: string
  excerpt: string
  featured_image: string | null
  published_at: string
  content: string
}

export const CourseContext = createContext<CourseContextValue | null>(null)
export const PostContext = createContext<PostContextValue | null>(null)

export function useCourseData(): CourseContextValue | null {
  return useContext(CourseContext)
}

export function usePostData(): PostContextValue | null {
  return useContext(PostContext)
}
```

In block components:
```tsx
// blocks/CourseInfo.tsx
function CourseInfoRender({ showDeadline, layout }: CourseInfoProps) {
  const course = useCourseData()

  // In Puck editor: show placeholder when no context
  if (!course) {
    return <CourseInfoPlaceholder />
  }

  return (
    <Card>
      {/* Real course data */}
      <div>{course.location}</div>
      <div>{course.price_sek} kr</div>
      {/* ... */}
    </Card>
  )
}
```

### 2.5 Block Category Visibility

Not all blocks make sense in all editors:
- **Page editor:** All blocks EXCEPT data-bound (CourseInfo, BookingCTA, PostHeader, BookingForm)
- **Course editor:** All blocks INCLUDING CourseInfo, BookingCTA (auto-shows course data in preview)
- **Post editor:** All blocks INCLUDING PostHeader
- **Product editor:** All blocks EXCEPT course/post-specific

This is configured per builder by filtering the puck config categories.

---

## 3. Page Routing & Templates

### 3.1 Route Structure

```tsx
// packages/web/src/App.tsx

<Routes>
  <Route path="/" element={<Layout />}>
    {/* Home: loads page with slug "hem" or is_homepage flag */}
    <Route index element={<UniversalPage slug="hem" />} />

    {/* Listing pages: regular pages with dynamic blocks */}
    <Route path="utbildningar" element={<UniversalPage slug="utbildningar" />} />
    <Route path="nyhet" element={<UniversalPage slug="nyhet" />} />
    <Route path="kontakt" element={<UniversalPage slug="kontakt" />} />

    {/* Detail pages: context-wrapped renderers */}
    <Route path="utbildningar/:slug" element={<CourseDetail />} />
    <Route path="utbildningar/:slug/boka" element={<BookingPage />} />
    <Route path="nyhet/:slug" element={<PostDetail />} />

    {/* Transactional (kept as components) */}
    <Route path="utbildningar/bekraftelse" element={<BookingConfirmation />} />

    {/* Catch-all: generic page */}
    <Route path=":slug" element={<UniversalPage />} />

    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
```

### 3.2 UniversalPage Component

Replaces the current `Page.tsx`. Handles ALL slug-based pages:

```tsx
// packages/web/src/pages/UniversalPage.tsx

export default function UniversalPage({ slug: propSlug }: { slug?: string }) {
  const { slug: paramSlug } = useParams()
  const slug = propSlug || paramSlug

  const { data, isLoading, error } = useQuery({
    queryKey: ['page', slug],
    queryFn: () => getPage(slug!),
    enabled: !!slug,
  })

  useDocumentTitle(data?.page?.title)

  if (isLoading) return <PageSkeleton />
  if (error || !data?.page) return <NotFound />

  const page = data.page

  // ALL pages render through PuckRenderer
  if (page.content_blocks) {
    return <BlockRenderer data={page.content_blocks} />
  }

  // Legacy fallback: old HTML content (will be phased out)
  return <LegacyContent page={page} children={data.children} />
}
```

### 3.3 Detail Page Components

These are thin wrappers that provide context + render blocks:

```tsx
// packages/web/src/pages/CourseDetail.tsx (simplified)

export default function CourseDetail() {
  const { slug } = useParams()
  const { data, isLoading } = useQuery(['course', slug], () => getCourse(slug!))

  if (isLoading) return <PageSkeleton />
  if (!data?.course) return <NotFound />

  const course = data.course

  // Use course's content_blocks if set, otherwise default template
  const blocks = course.content_blocks || defaultCourseTemplate

  return (
    <CourseContext.Provider value={course}>
      <BlockRenderer data={blocks} />
    </CourseContext.Provider>
  )
}
```

### 3.4 Default Templates

When a course/post/product has no custom `content_blocks`, use a sensible default:

```ts
// packages/shared/src/templates.ts

export const defaultCourseTemplate = JSON.stringify({
  content: [
    { type: 'CourseInfo', props: { id: 'course-info', showDeadline: true, layout: 'grid' } },
    { type: 'SeparatorBlock', props: { id: 'sep-1', variant: 'space-only', spacing: 'small' } },
    // Legacy HTML content renders here via a special LegacyContent block
    { type: 'RichText', props: { id: 'content', content: '__LEGACY_CONTENT__', maxWidth: 'medium' } },
    { type: 'SeparatorBlock', props: { id: 'sep-2', variant: 'space-only', spacing: 'medium' } },
    { type: 'BookingCTA', props: { id: 'booking-cta', style: 'card' } },
  ],
  root: { props: {} },
  zones: {},
})

export const defaultPostTemplate = JSON.stringify({
  content: [
    { type: 'PostHeader', props: { id: 'post-header', showBackLink: true } },
    // Post content blocks go here (or legacy HTML)
    { type: 'RichText', props: { id: 'content', content: '__LEGACY_CONTENT__', maxWidth: 'medium' } },
  ],
  root: { props: {} },
  zones: {},
})
```

### 3.5 Migration: Convert Hardcoded Pages to Database Blocks

The current hardcoded pages need to be migrated to block-based layouts stored in the pages table. This is a one-time data migration:

| Current Component | New Page Slug | Blocks |
|-------------------|---------------|--------|
| Home.tsx | `hem` | Hero + CourseList(compact,max:3) + SeparatorBlock + PostGrid(count:3) + CTABanner |
| Courses.tsx | `utbildningar` | PageHeader("Utbildningar") + CourseList(all,2-col) |
| Blog.tsx | `nyhet` | PageHeader("Nyheter") + PostGrid(count:20) |
| Products.tsx | `material` | PageHeader("Material") + ProductList(all,3-col) |
| Contact.tsx | `kontakt` | PageHeader("Kontakt") + ContactForm(split) |

A migration script creates these page records with the appropriate `content_blocks` JSON.

---

## 4. Design System & Visual Identity

### 4.1 Typography

**Heading font: Fraunces (variable, optical)**
- A warm, distinctive serif with personality. Not cold or corporate.
- Optical size axis makes it sharp at large sizes, smooth at small.
- Communicates: literary, thoughtful, grounded — perfect for a psychology practice.
- Weights: 600 (section headings), 700 (page titles)

**Body font: Inter (current, keep)**
- Excellent readability at all sizes. Already in use.
- Weight: 400 (body), 500 (labels/emphasized), 600 (buttons/strong)

**Quote/accent: Fraunces Italic**
- For testimonials, pull quotes, and emphasis.

**Font loading:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Type scale:**
```
text-xs:   0.75rem / 1rem      — captions, badges
text-sm:   0.875rem / 1.25rem  — labels, small text
text-base: 1rem / 1.5rem       — body text
text-lg:   1.125rem / 1.75rem  — larger body
text-xl:   1.25rem / 1.75rem   — card titles
text-2xl:  1.5rem / 2rem       — section titles (Fraunces)
text-3xl:  1.875rem / 2.25rem  — major headings (Fraunces)
text-4xl:  2.25rem / 2.5rem    — page titles mobile (Fraunces)
text-5xl:  3rem / 1.1          — page titles desktop (Fraunces)
text-6xl:  3.75rem / 1.05      — hero headings (Fraunces)
```

### 4.2 Color Palette

**Primary — Sage Green** (grounding, natural, growth)
```
50:  #F2F7F4
100: #E0EDE5
200: #C1DBC9
300: #95C2A4
400: #66A67B
500: #3D6B50    ← default
600: #325843
700: #284636
800: #1E352A
900: #15261E
```

**Accent — Warm Amber** (warmth, invitation, action)
```
50:  #FEF6EE
100: #FCEBD6
200: #F8D3AC
300: #F2B476
400: #E99544
500: #C77E3F    ← default
600: #A66733
700: #854F28
800: #653C1E
900: #482B16
```

**Neutral — Warm Stone** (not blue-gray, warm undertone)
```
50:  #FAFAF7    ← page background
100: #F5F3EE    ← card/section backgrounds
200: #EBE8E0    ← borders, dividers
300: #DDD8CD    ← muted elements
400: #B8B1A4    ← placeholder text
500: #8D867A    ← secondary text
600: #6B655B    ← body text (secondary)
700: #504B43    ← body text (primary)
800: #38342E    ← headings
900: #231F1B    ← near-black
```

**Semantic colors:**
```
Success: #3D8B52 / bg: #F0F7F2
Warning: #C89828 / bg: #FEF9EE
Error:   #C4463A / bg: #FEF2F1
Info:    #3B6FA0 / bg: #F0F5FA
```

### 4.3 Tailwind Configuration

```ts
// packages/shared/src/tailwind-preset.ts

export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          50: '#F2F7F4', 100: '#E0EDE5', 200: '#C1DBC9', 300: '#95C2A4',
          400: '#66A67B', 500: '#3D6B50', 600: '#325843', 700: '#284636',
          800: '#1E352A', 900: '#15261E',
        },
        accent: {
          50: '#FEF6EE', 100: '#FCEBD6', 200: '#F8D3AC', 300: '#F2B476',
          400: '#E99544', 500: '#C77E3F', 600: '#A66733', 700: '#854F28',
          800: '#653C1E', 900: '#482B16',
        },
        neutral: {
          50: '#FAFAF7', 100: '#F5F3EE', 200: '#EBE8E0', 300: '#DDD8CD',
          400: '#B8B1A4', 500: '#8D867A', 600: '#6B655B', 700: '#504B43',
          800: '#38342E', 900: '#231F1B',
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
```

Both `packages/web/tailwind.config.js` and `packages/admin/tailwind.config.js` will use this preset:

```js
import preset from '../shared/src/tailwind-preset'

export default {
  presets: [preset],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/src/**/*.{js,ts,jsx,tsx}",
  ],
}
```

### 4.4 Component Styling Patterns

**Page background:** `bg-neutral-50` (warm off-white, not pure white)

**Cards:**
```css
/* Default card */
bg-white rounded-xl border border-neutral-200 shadow-sm

/* Card hover */
hover:shadow-md hover:-translate-y-0.5 transition-all duration-200

/* Accent card (CTA, highlighted) */
bg-primary-50 border-primary-200 rounded-xl
```

**Buttons:**
```css
/* Primary (sage green) */
bg-primary-500 text-white hover:bg-primary-600
font-semibold rounded-lg px-6 h-11 transition-colors

/* Accent (warm amber, for CTAs) */
bg-accent-500 text-white hover:bg-accent-600

/* Secondary */
bg-neutral-100 text-neutral-800 hover:bg-neutral-200

/* Ghost */
text-primary-600 hover:bg-primary-50

/* Outline */
border border-neutral-300 bg-white hover:bg-neutral-50
```

**Headings (Fraunces):**
```css
font-heading font-bold tracking-tight text-neutral-900
```

**Body text:**
```css
text-neutral-700 leading-relaxed
```

**Section spacing:**
```css
/* Section vertical padding */
py-20 md:py-28

/* Section max-width */
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### 4.5 Micro-Interactions

**Card hover:** Lift + shadow
```css
.card-hover {
  @apply transition-all duration-200;
}
.card-hover:hover {
  @apply shadow-md -translate-y-0.5;
}
```

**Image zoom on card hover:**
```css
.card-hover:hover img {
  @apply scale-[1.03];
  transition: transform 500ms ease;
}
```

**Button press:**
```css
button:active {
  @apply scale-[0.98];
}
```

**Link underline animation:**
```css
.link-animated {
  @apply underline decoration-primary-300/0 underline-offset-4 decoration-2
         hover:decoration-primary-500 transition-colors;
}
```

**Page entrance:**
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.page-enter {
  animation: fadeInUp 0.3s ease-out;
}
```

**Accordion open/close:** CSS `transition: grid-template-rows 300ms ease` on a grid wrapper.

**Skeleton pulse:** Use neutral-100 to neutral-200 (warm tones, not gray).

### 4.6 Responsive Reflow Rules

| Block | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| Hero | text-3xl, CTAs stacked, py-16 | text-5xl, CTAs row | text-6xl, CTAs row, py-32 |
| CardGrid | 1 column | 2 columns | 3-4 columns |
| CourseList | 1 column, compact cards | 2 columns | 2 columns, full cards |
| ProductList | 1 column per type | 2 columns | 3 columns |
| ContactForm split | Stacked (info then form) | Side by side | Side by side |
| Columns | Always stacked | 2-col layouts | Full layout |
| StatsCounter | 2 columns | 3-4 columns | 4 columns |
| FeatureGrid | 1 column | 2 columns | 3 columns |
| PersonCard horizontal | Stacked (image above text) | Horizontal | Horizontal |
| PageHeader | text-3xl | text-4xl | text-5xl |
| Navigation (layout) | Hamburger | Hamburger | Full nav bar |
| Footer | Single column | 2 columns | 3 columns |

---

## 5. CMS 1:1 Preview

### 5.1 Current Problem

The Puck editor renders content in an iframe. CSS is injected by scraping `document.styleSheets` from the admin window and copying rules. This is fragile:

1. Admin-specific CSS can leak into preview
2. Tailwind classes present in admin may differ from web
3. Font loading is duplicated and inconsistent
4. No guarantee of identical rendering

### 5.2 Solution: Shared Tailwind Preset + Direct CSS Loading

**Step 1:** Both web and admin use the same `tailwind-preset.ts` (section 4.3 above).

**Step 2:** The preview CSS injection loads a known CSS file instead of scraping:

```ts
// packages/shared/src/inject-preview-css.ts (updated)

export function injectPreviewCSS(iframeDoc: Document) {
  // 1. Load the shared design system CSS
  //    In dev: served from web dev server via proxy
  //    In prod: from the web CDN
  const cssUrl = getPreviewCssUrl()
  if (cssUrl) {
    const link = iframeDoc.createElement('link')
    link.rel = 'stylesheet'
    link.href = cssUrl
    iframeDoc.head.appendChild(link)
  } else {
    // Fallback: scrape current page CSS (existing behavior)
    injectScrapedCSS(iframeDoc)
  }

  // 2. Load fonts
  const fontLink = iframeDoc.createElement('link')
  fontLink.rel = 'stylesheet'
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap'
  iframeDoc.head.appendChild(fontLink)

  // 3. Set base styles
  iframeDoc.body.style.backgroundColor = '#FAFAF7' // neutral-50
  iframeDoc.body.style.fontFamily = "'Inter', system-ui, sans-serif"
}
```

**Step 3:** Since both web and admin share the same Tailwind preset (identical config), and the shared blocks are in the content paths of both, all Tailwind classes used in blocks are generated in both CSS bundles. The iframe preview is identical to production.

**Step 4:** `root.render` in puck-config.ts continues to render site chrome (header/footer) in the editor. This is correct — the preview shows the full page as it will appear.

### 5.3 Remaining Improvements

- **Viewport switching** already works (360px, 768px, 1280px viewport presets in all builders)
- **Font matching** guaranteed by loading the same Google Fonts URL
- **Background color** set to `neutral-50` to match production `bg-neutral-50` body
- **Prose styling** identical because both use same `@tailwindcss/typography` config

---

## 6. Inline Editing

### 6.1 Three Phases

**Phase 1 (Immediate): "View on Site" Button**
- Add a "View on site" button to each builder's header actions
- Opens the public URL in a new tab: `${SITE_URL}/${page.slug}`
- No auth needed on the public site — this is just a link

**Phase 2 (Post-domain-setup): Edit Toolbar**
Requires: `livskompass.se` domain active, shared auth cookie on `.livskompass.se`

- When admin visits the public site, the site checks for a valid session cookie
- If authenticated as admin, show a floating toolbar at the bottom:

```
┌─────────────────────────────────────────────────────┐
│  ✏️ Edit mode   │   📝 Open in CMS   │   👁 Preview  │
└─────────────────────────────────────────────────────┘
```

- The toolbar is a fixed-position bar at bottom center, translucent background
- "Open in CMS" links to `${ADMIN_URL}/sidor/${page.id}` (or course/post equivalent)
- "Edit mode" toggles inline editing
- "Preview" hides the toolbar temporarily

**Phase 3 (Future): Click-to-Edit Text**
When edit mode is active:

1. RichText blocks gain a `contenteditable` attribute
2. A subtle outline appears on hover over editable blocks
3. Click to focus → cursor appears in text
4. Edit text directly on the page
5. Blur → save via `PATCH /api/admin/pages/:id`
6. Escape → cancel edits (restore original)
7. Optimistic UI: show change immediately, revert on API error
8. Conflict check: compare `updated_at` timestamp before saving

### 6.2 Auth Flow for Inline Editing

```
Admin logs in (Google OAuth)
  → API creates session, sets cookie on .livskompass.se
  → Cookie: livskompass_session=<token>; Domain=.livskompass.se; HttpOnly; SameSite=Lax

Public site loads
  → Checks for livskompass_session cookie
  → Calls GET /api/auth/me with credentials: 'include'
  → If valid admin → InlineEditProvider renders toolbar
  → If not → normal visitor experience
```

### 6.3 API Endpoint for Inline Saves

```
PATCH /api/admin/pages/:id
Body: {
  content_blocks: "<full JSON>"  // Updated block data
  updated_at: "2026-02-21T..."   // For conflict detection
}
Response: { success: true, page: { ... } }
  or: { error: "conflict", message: "Page was modified by another user" }
```

### 6.4 State Machine

```
VIEWING
  │ (admin detected + toolbar shown)
  ▼
TOOLBAR_VISIBLE
  │ (click "Edit mode")
  ▼
EDIT_MODE ─────────────────────────┐
  │ (hover over editable block)    │
  ▼                                │
BLOCK_HOVER ───────────────────────┤
  │ (click)                        │
  ▼                                │
EDITING_TEXT                       │
  │ (blur)    (escape)             │
  ▼             │                  │
SAVING ─────────┘──────────────────┘
  │ (success)
  ▼
EDIT_MODE (back to browsing)
```

---

## 7. File Changes

### 7.1 Files to CREATE

```
packages/shared/src/
  tailwind-preset.ts                    — Shared Tailwind config preset
  design-tokens.ts                      — Color, font, spacing constants
  context.ts                            — CourseContext, PostContext
  helpers.ts                            — Extract from puck-config.tsx
  templates.ts                          — Default block templates for course/post/product

  blocks/PageHeader.tsx                 — ★ NEW BLOCK
  blocks/CourseList.tsx                 — ★ NEW BLOCK
  blocks/ProductList.tsx                — ★ NEW BLOCK
  blocks/CourseInfo.tsx                 — ★ NEW BLOCK
  blocks/BookingCTA.tsx                 — ★ NEW BLOCK
  blocks/BookingForm.tsx                — ★ NEW BLOCK
  blocks/PostHeader.tsx                 — ★ NEW BLOCK
  blocks/ContactForm.tsx                — ★ NEW BLOCK (replaces placeholder)
  blocks/PersonCard.tsx                 — ★ NEW BLOCK
  blocks/FeatureGrid.tsx                — ★ NEW BLOCK
  blocks/StatsCounter.tsx               — ★ NEW BLOCK
  blocks/PricingTable.tsx               — ★ NEW BLOCK
  blocks/Spacer.tsx                     — ★ NEW BLOCK

packages/web/src/
  pages/UniversalPage.tsx               — New universal page renderer
  components/InlineEditProvider.tsx      — Phase 2: edit toolbar + inline editing
  components/EditToolbar.tsx            — Phase 2: floating toolbar component

scripts/
  migrate-pages-to-blocks.ts           — Migration script for hardcoded pages
```

### 7.2 Files to MODIFY

```
packages/shared/src/
  puck-config.tsx → puck-config.ts      — Rewrite as thin config assembler (~200 lines)
  types.ts                              — Add new block prop interfaces
  index.ts                              — Add new exports
  inject-preview-css.ts                 — Improved CSS loading
  blocks/Hero.tsx                       — Update colors from sky-blue to sage-green
  blocks/Accordion.tsx                  — Add smooth CSS transition
  blocks/CardGrid.tsx                   — Update colors
  blocks/CTABanner.tsx                  — Extract from puck-config, update colors
  blocks/Testimonial.tsx                — Extract from puck-config, update colors
  blocks/ButtonGroup.tsx                — Update colors
  blocks/SeparatorBlock.tsx             — Update colors
  blocks/ImageBlock.tsx                 — Keep as-is
  blocks/RichText.tsx                   — Already extracted, keep as-is
  blocks/index.ts                       — Re-export all 28 blocks

packages/web/src/
  App.tsx                               — Update routes to use UniversalPage
  components/Layout.tsx                 — Update colors, fonts, add edit toolbar slot
  components/PuckRenderer.tsx           — Add context support for data-bound blocks
  index.css                             — Update with new design tokens, fonts
  lib/api.ts                            — Add inline edit API calls (Phase 2)

packages/web/tailwind.config.js         — Use shared preset
packages/admin/tailwind.config.js       — Use shared preset
packages/admin/src/index.css            — Update with new design tokens

packages/admin/src/components/
  PageBuilder.tsx                       — Add "View on site" button
  PostBuilder.tsx                       — Add "View on site" button
  CourseBuilder.tsx                     — Add "View on site" button, filter block categories
  ProductBuilder.tsx                    — Add "View on site" button, filter block categories
```

### 7.3 Files to DELETE

```
packages/web/src/pages/
  Home.tsx                              — Replaced by UniversalPage + blocks
  Courses.tsx                           — Replaced by UniversalPage + CourseList block
  Blog.tsx                              — Replaced by UniversalPage + PostGrid block
  Products.tsx                          — Replaced by UniversalPage + ProductList block
  Contact.tsx                           — Replaced by UniversalPage + ContactForm block
  Booking.tsx                           — Replaced by BookingPage + BookingForm block
  Page.tsx                              — Replaced by UniversalPage

packages/api/src/routes/
  media.ts                              — Already unused (dead code from SEC-04 fix)
```

### 7.4 Files to KEEP (unchanged)

```
packages/web/src/pages/
  BookingConfirmation.tsx               — Transactional page, keep as component
  NotFound.tsx                          — System page, keep as component
  BlogPost.tsx → PostDetail.tsx         — Rename, simplify to context wrapper
  CourseDetail.tsx                       — Simplify to context wrapper

packages/admin/src/                     — All admin pages/components unchanged
  (except builders get "View on site" button and category filtering)

packages/api/src/                       — All API routes unchanged
  (except one new PATCH endpoint for inline editing in Phase 2)
```

---

## 8. Implementation Order

```
Phase 1: Foundation (blocks first, no visual changes yet)
═══════════════════════════════════════════════════════════
  1.1  Create shared tailwind-preset.ts and apply to both packages
  1.2  Create context.ts, helpers.ts, templates.ts, design-tokens.ts
  1.3  Extract all 16 existing blocks from puck-config.tsx to individual files
  1.4  Rewrite puck-config.ts as thin assembler importing from blocks/
  1.5  Verify: admin Puck editor still works with extracted blocks
  1.6  Verify: public PuckRenderer still works with extracted blocks

Phase 2: New Blocks
═══════════════════════════════════════════════════════════
  2.1  Build PageHeader block
  2.2  Build CourseList block (port Courses.tsx logic)
  2.3  Build ProductList block (port Products.tsx logic)
  2.4  Build CourseInfo block (port CourseDetail.tsx metadata card)
  2.5  Build BookingCTA block (port CourseDetail.tsx CTA section)
  2.6  Build PostHeader block (port BlogPost.tsx header section)
  2.7  Build ContactForm block (functional, replaces placeholder)
  2.8  Build BookingForm block (port Booking.tsx form)
  2.9  Build PersonCard, FeatureGrid, StatsCounter, PricingTable, Spacer blocks
  2.10 Update puck-config.ts with all new blocks in categories

Phase 3: Route Migration
═══════════════════════════════════════════════════════════
  3.1  Create UniversalPage.tsx
  3.2  Update PuckRenderer.tsx to support context providers
  3.3  Simplify CourseDetail.tsx to context wrapper
  3.4  Create BookingPage.tsx as context wrapper for BookingForm
  3.5  Simplify BlogPost.tsx to PostDetail.tsx context wrapper
  3.6  Update App.tsx routes
  3.7  Write migration script to create block-based page records
  3.8  Run migration: create "hem", "utbildningar", "nyhet", "kontakt", "material" pages
  3.9  Delete old hardcoded page components (Home, Courses, Blog, Products, Contact, Booking, Page)
  3.10 Verify: all routes work with block rendering

Phase 4: Visual Redesign
═══════════════════════════════════════════════════════════
  4.1  Update tailwind-preset.ts with new color palette (sage green, warm amber, warm stone)
  4.2  Add Fraunces font loading to index.html (web + admin)
  4.3  Update all block render functions with new colors and typography
  4.4  Update Layout.tsx (nav + footer) with new design
  4.5  Update all shadcn/ui components with new theme tokens
  4.6  Add micro-interactions (card hover, button press, link animation)
  4.7  Add page entrance animation
  4.8  Update Puck preview CSS injection for new fonts/colors
  4.9  Update admin sidebar/theme to match new brand

Phase 5: CMS Improvements
═══════════════════════════════════════════════════════════
  5.1  Add "View on site" button to all 4 builders
  5.2  Filter block categories per editor type (hide CourseInfo from page editor, etc.)
  5.3  Update root.render site chrome to match new Layout.tsx design
  5.4  Verify Puck preview is pixel-identical to production

Phase 6: Inline Editing (post-domain-setup)
═══════════════════════════════════════════════════════════
  6.1  Add session cookie on parent domain in auth flow
  6.2  Create InlineEditProvider + EditToolbar components
  6.3  Add edit mode detection to public site
  6.4  Implement click-to-edit for RichText blocks
  6.5  Add PATCH endpoint for inline saves
  6.6  Add conflict detection
```

**Dependency graph:**
```
Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4
                                  ──→ Phase 5
                                  ──→ Phase 6 (independent, needs domain)

Phase 2 + 3 can partially overlap:
  - New blocks (Phase 2) can be built while route migration (Phase 3) starts
  - But all new blocks must exist before migration script runs

Phase 4 is independent of Phase 5 and 6.
Phase 5 can run in parallel with Phase 4.
Phase 6 requires domain setup (outside our control).
```

---

## 9. Task Breakdown

### Task #2: Build Design System + New Block Components (frontend-dev)

**Deliverables:** All files in `packages/shared/src/` listed in Phase 1 + Phase 2.

**Steps:**

1. **Foundation files** (~2 hours)
   - Create `tailwind-preset.ts` with the complete color/font config
   - Create `design-tokens.ts` exporting color values as JS constants
   - Create `context.ts` with CourseContext + PostContext
   - Create `helpers.ts` — move getApiBase, resolveMediaUrl, useFetchJson from puck-config
   - Create `templates.ts` with default course/post/product templates
   - Update both `tailwind.config.js` to use the shared preset
   - Add Fraunces font to both `index.html` files

2. **Extract existing blocks** (~3 hours)
   - Move CTABanner from puck-config.tsx to `blocks/CTABanner.tsx`
   - Move Testimonial to `blocks/Testimonial.tsx`
   - Move ImageGallery to `blocks/ImageGallery.tsx`
   - Move VideoEmbed to `blocks/VideoEmbed.tsx`
   - Move PostGrid to `blocks/PostGrid.tsx`
   - Move PageCards to `blocks/PageCards.tsx`
   - Move NavigationMenu to `blocks/NavigationMenu.tsx`
   - Move ContactFormBlock placeholder to `blocks/ContactForm.tsx` (will be rewritten)
   - Update `blocks/index.ts` to re-export all
   - Each file exports `{ label, defaultProps, fields, render }` as a named export
   - Rewrite `puck-config.ts` to import from all block files (~200 lines)
   - Verify admin editor still works
   - Verify public site PuckRenderer still works

3. **Build new blocks** (~6 hours)
   - `PageHeader.tsx` — heading + subheading + optional divider
   - `CourseList.tsx` — fetch courses, render as cards with status/dates/price/buttons
   - `ProductList.tsx` — fetch products, group by type, render with thumbnails
   - `CourseInfo.tsx` — context-bound course metadata card
   - `BookingCTA.tsx` — context-bound status-aware CTA
   - `PostHeader.tsx` — context-bound post header with date/title/image
   - `ContactForm.tsx` — functional form with API submission, success/error states
   - `BookingForm.tsx` — context-bound booking form with Stripe checkout
   - `PersonCard.tsx` — profile card with photo/name/bio
   - `FeatureGrid.tsx` — icon + title + description grid
   - `StatsCounter.tsx` — large numbers with labels
   - `PricingTable.tsx` — pricing comparison cards
   - `Spacer.tsx` — configurable vertical space

4. **Visual redesign of existing blocks** (~3 hours)
   - Update Hero with new palette: `from-primary-600` → sage green gradient
   - Update all `text-primary-*` references to new primary palette
   - Update all `bg-primary-*` references
   - Add `font-heading` to all heading elements in blocks
   - Update card styles: `rounded-xl border-neutral-200 shadow-sm`
   - Add micro-interactions: card hover lift, image zoom
   - Update button styles with new primary/accent colors

5. **Update Layout.tsx** (~2 hours)
   - Swap `text-primary-600` logo to sage green
   - Use `font-heading` for brand name
   - Set page background to `bg-neutral-50`
   - Update nav link hover colors
   - Update footer background and text colors
   - Add warm tones to mobile menu
   - Update dropdown styles

6. **Update shadcn/ui components** (~1 hour)
   - Update button variants (primary → sage green, add accent variant)
   - Update card default styles
   - Update badge color variants
   - Update input focus ring colors

### Task #3: CMS 1:1 Preview + Route Migration + Inline Editing (cms-dev)

**Deliverables:** All files in Phase 3 + Phase 5 + Phase 6.

**Steps:**

1. **Universal page renderer** (~2 hours)
   - Create `UniversalPage.tsx` — fetches page by slug, renders blocks
   - Update `PuckRenderer.tsx` to detect and provide context (CourseContext, PostContext)
   - Handle both `content_blocks` pages and legacy HTML fallback

2. **Detail page wrappers** (~2 hours)
   - Simplify `CourseDetail.tsx`: fetch course → wrap in CourseContext → render blocks
   - Create `BookingPage.tsx`: fetch course → wrap in CourseContext → render BookingForm
   - Simplify `BlogPost.tsx` → rename to `PostDetail.tsx`: fetch post → wrap in PostContext → render blocks

3. **Route updates** (~1 hour)
   - Update `App.tsx` with new routes (section 3.1)
   - Add `slug` prop support to UniversalPage for named routes

4. **Migration script** (~2 hours)
   - `scripts/migrate-pages-to-blocks.ts`
   - Creates/updates these page records in D1:
     - `hem` (homepage) with Hero + CourseList + PostGrid + CTABanner blocks
     - `utbildningar` with PageHeader + CourseList blocks
     - `nyhet` with PageHeader + PostGrid blocks
     - `kontakt` with PageHeader + ContactForm blocks
     - `material` with PageHeader + ProductList blocks
   - Uses D1 HTTP API or wrangler d1 execute

5. **Delete old components** (~30 min)
   - Remove Home.tsx, Courses.tsx, Blog.tsx, Products.tsx, Contact.tsx, Booking.tsx, Page.tsx
   - Clean up imports in App.tsx

6. **CMS improvements** (~2 hours)
   - Add "View on site" button to PageBuilder, PostBuilder, CourseBuilder, ProductBuilder header actions
   - Filter puck-config categories per editor (hide data-bound blocks where inappropriate)
   - Update inject-preview-css.ts with improved CSS loading
   - Update root.render site chrome to match new Layout.tsx design

7. **Inline editing — Phase 1** (~1 hour)
   - "View on site" button in CMS opens public URL (already done in step 6)

8. **Inline editing — Phase 2** (~4 hours, post-domain-setup)
   - Create `InlineEditProvider.tsx` — checks auth, manages edit mode state
   - Create `EditToolbar.tsx` — floating bar with Edit mode / Open in CMS / Preview
   - Update auth routes to set cross-domain session cookie
   - Add `PATCH /api/admin/pages/:id` endpoint for inline saves
   - Wire up contentEditable on RichText blocks in edit mode
   - Add conflict detection via updated_at comparison

---

## Appendix A: Current vs. New Page Mapping

| Current | Route | Current Component | New Approach |
|---------|-------|-------------------|--------------|
| Home | `/` | Home.tsx (hardcoded) | UniversalPage slug="hem" → blocks |
| Courses | `/utbildningar` | Courses.tsx (hardcoded) | UniversalPage slug="utbildningar" → blocks |
| Course detail | `/utbildningar/:slug` | CourseDetail.tsx (hardcoded) | CourseDetail.tsx → context + blocks |
| Booking | `/utbildningar/:slug/boka` | Booking.tsx (hardcoded) | BookingPage.tsx → context + BookingForm block |
| Confirmation | `/utbildningar/bekraftelse` | BookingConfirmation.tsx | **KEEP** (transactional) |
| Blog | `/nyhet` | Blog.tsx (hardcoded) | UniversalPage slug="nyhet" → blocks |
| Blog post | `/nyhet/:slug` | BlogPost.tsx (partial blocks) | PostDetail.tsx → context + blocks |
| Contact | `/kontakt` | Contact.tsx (hardcoded) | UniversalPage slug="kontakt" → blocks |
| Generic page | `/:slug` | Page.tsx (partial blocks) | UniversalPage → blocks |
| 404 | `*` | NotFound.tsx | **KEEP** (system page) |

## Appendix B: Block Data Flow

```
Static blocks (Hero, RichText, etc.)
  └─ Props come from content_blocks JSON → rendered as-is

Dynamic blocks (CourseList, PostGrid, etc.)
  └─ Self-fetch from API using useFetchJson/useQuery → render data

Data-bound blocks (CourseInfo, BookingCTA, PostHeader, BookingForm)
  └─ Read from React Context → render context data
  └─ In Puck editor (no context): render placeholder/sample data

Interactive blocks (ContactForm, BookingForm)
  └─ Have internal state (form fields)
  └─ Submit to API endpoints
  └─ Handle success/error/loading states
  └─ In Puck editor: render visual mockup (forms disabled)
```

## Appendix C: Bundle Size Considerations

The public site (`packages/web`) must stay light. Key decisions:

1. **PuckRenderer (custom, ~50 lines)** is used instead of `@puckeditor/core`'s `<Render>`. This saves ~300-400KB from the public bundle. Keep this.

2. **New blocks add code to the shared package.** Since PuckRenderer only imports the `render` functions from puck-config, and blocks are tree-shaken, only blocks actually used on a page are included. However, all render functions ARE imported in puck-config.ts. This means all 28 block render functions are in the bundle.

   **Mitigation:** Keep block render functions small (<100 lines each). Avoid heavy dependencies per block. Total shared block code: ~3000 lines ≈ ~60KB minified ≈ ~15KB gzipped. Acceptable.

3. **React Query** is already in the bundle and used extensively. No new data-fetching library needed.

4. **Fraunces font** adds ~30KB (WOFF2, variable, 2 weights). Worth it for the distinctive heading look.

5. **Lucide icons** are tree-shaken per icon. Adding a few more icons for new blocks is negligible.

---

*Plan authored by: architect agent*
*Date: 2026-02-21*
*Status: Awaiting team lead approval*
