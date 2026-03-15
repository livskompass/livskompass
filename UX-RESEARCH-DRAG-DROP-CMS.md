# UX Research: Drag-and-Drop CMS Page Builder for Livskompass

**Date:** 2026-02-15
**Author:** UX Reviewer
**Scope:** Comprehensive UX research and technical recommendation for replacing the current TipTap WYSIWYG editor with a modular drag-and-drop page builder in the Livskompass admin panel.
**Target user:** Fredrik Livheim, psychologist, non-technical content editor.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [UX Patterns from Leading CMS Platforms](#2-ux-patterns-from-leading-cms-platforms)
3. [Modular Content Architecture](#3-modular-content-architecture)
4. [Key UX Decisions](#4-key-ux-decisions)
5. [Content Block Specifications](#5-content-block-specifications)
6. [Technical Recommendation](#6-technical-recommendation)
7. [Interaction Design Details](#7-interaction-design-details)
8. [Migration Strategy from Current System](#8-migration-strategy-from-current-system)
9. [Risk Assessment](#9-risk-assessment)

---

## 1. Executive Summary

### The Problem

The current Livskompass admin panel uses a basic TipTap WYSIWYG editor (`packages/admin/src/components/Editor.tsx`) with a flat toolbar offering bold, italic, strikethrough, headings, lists, blockquote, link, and image insertion. Content is stored as raw HTML in the `pages.content` TEXT column. This approach has three critical limitations:

1. **No visual structure.** Fredrik cannot build landing pages with heroes, card grids, CTAs, or multi-column layouts. Every page is a flat document.
2. **No reusability.** The Home page (`packages/web/src/pages/Home.tsx`) is hardcoded React with a gradient hero, course cards, and news grid. Fredrik cannot modify this layout without developer intervention.
3. **HTML storage is fragile.** Migrated WordPress HTML contains inconsistent markup, making it difficult to restyle or repurpose content across platforms.

### The Recommendation

**Use Puck (v0.21+) as the page builder framework.** Puck is the strongest choice because:

- It is a complete visual editor, not a low-level library requiring you to build an editor from scratch.
- It outputs structured JSON, not HTML, solving the longevity problem.
- It provides drag-and-drop, inline editing, sidebar configuration, undo/redo, viewports, and permissions out of the box.
- It uses your own React components, meaning the exact same Tailwind + shadcn/ui components that render on the public site also render in the editor.
- MIT licensed, no vendor lock-in, 10K+ GitHub stars, active development.
- The existing TipTap editor can be preserved for rich text blocks within Puck (TipTap is used inside Puck's own richtext field type as of v0.21).

**Retain TipTap** exclusively as the rich text editing engine inside Puck's richtext blocks. Do not replace TipTap entirely; embed it.

---

## 2. UX Patterns from Leading CMS Platforms

### 2.1 Notion -- Block-Based Document Editing

**What works well:**
- **Slash commands** (`/heading`, `/image`, `/quote`) allow power users to insert blocks without leaving the keyboard. This is the gold standard for keyboard-first content creation.
- **Inline block handles** -- the `+` icon appears on hover in the left margin, providing a discoverable entry point for mouse users. The six-dot drag handle appears alongside it.
- **Contextual toolbars** -- text formatting options appear as a floating toolbar when text is selected, not as a persistent top bar. This reduces visual clutter.
- **Everything is a block** -- paragraphs, headings, images, dividers are all blocks. This mental model is consistent and learnable.

**What frustrates users:**
- Notion is optimized for documents, not page layout. There is no true multi-column visual builder or responsive preview.
- Block nesting is limited and can feel rigid when trying to create complex layouts.
- No visual preview of how content will look on the final site.

**Relevance to Livskompass:** Slash commands and inline handles are excellent for blog post editing but insufficient for page building. The Notion model should inform the rich text editing experience within blocks, not the page builder itself.

### 2.2 Framer -- Visual Page Builder with Components

**What works well:**
- **True WYSIWYG** -- what you see in the editor is exactly what renders on the site.
- **Component-based** -- pages are assembled from reusable components with configurable props.
- **Responsive design controls** -- breakpoint-specific overrides for spacing, visibility, and layout.
- **Smooth animations** in the editor itself make interactions feel polished.

**What frustrates users:**
- Steep learning curve for non-designers. The interface has too many controls.
- Drag-and-drop lacks precision for complex CSS grid layouts.
- CMS capabilities are limited compared to dedicated content management systems.

**Relevance to Livskompass:** The component-based approach is the right model for page building, but Framer's complexity is inappropriate for a non-technical user like Fredrik. We need Framer's component model with Notion's simplicity.

### 2.3 Webflow -- Design-Focused CMS

**What works well:**
- **CSS grid editor** provides precise layout control that no other visual builder matches.
- **CMS collections** allow structured content (courses, team members) to be managed separately and pulled into page layouts.
- **Visual class system** makes consistent styling across pages possible.

**What frustrates users:**
- The interface is overwhelming for content-only editors. Webflow is a design tool, not a content tool.
- Complex pricing model gates important features.
- The learning curve is measured in weeks, not minutes.

**Relevance to Livskompass:** Webflow's CMS collections model (structured content types like courses, products) is already implemented in Livskompass via the database schema. The visual CSS editor is overkill for this use case.

### 2.4 Sanity Studio -- Structured Content with Portable Text

**What works well:**
- **Portable Text** stores content as structured JSON, not HTML. Content can be rendered differently across web, mobile, email, etc.
- **Custom content objects** can be embedded in rich text (e.g., an inline "course card" reference within a paragraph).
- **Schema-first approach** means the content model is defined in code, keeping the editor predictable.

**What frustrates users:**
- No visual page builder. Editing is form-based with a preview panel.
- Content editors cannot see layout context while editing.
- Configuration requires developer involvement.

**Relevance to Livskompass:** The Portable Text philosophy -- structured JSON over HTML -- is the right content model. But the form-based editing UX is not intuitive enough for a non-technical user building landing pages.

### 2.5 Payload CMS -- Developer-First, Block-Based

**What works well:**
- **TypeScript-first** schema definition aligns perfectly with the Livskompass tech stack.
- **Block field type** allows composable page sections with typed data.
- **Admin UI is React-based**, making it customizable with the existing component library.
- Recently acquired by Figma, indicating strong future investment.

**What frustrates users:**
- Editing is form-based, not visual. Content editors fill out fields in panels, not on a canvas.
- Community-developed visual editor plugins exist but are not part of the core product.
- Admin UI polish has been criticized as needing improvement.

**Relevance to Livskompass:** Payload's block field data model is an excellent reference for how to structure content blocks in JSON. However, the editing experience is too developer-oriented for Fredrik.

### 2.6 Tina CMS -- Visual Editing on the Page

**What works well:**
- **Contextual editing** -- click on any element on the page and edit it in a sidebar. Changes reflect in real-time on the page preview.
- **Live preview** -- the actual site renders in the editor, so what you see is truly what you get.
- **Low cognitive load** -- the editing experience feels like editing a live website.

**What frustrates users:**
- Git-based storage is limiting for dynamic content.
- Performance can be slow when the full site renders in the editor iframe.
- Not true inline editing; sidebar forms are still required for configuration.

**Relevance to Livskompass:** Tina's contextual editing (click to select, edit in sidebar, see live preview) is the ideal UX pattern for Fredrik. This is exactly how the Livskompass editor should feel.

### 2.7 Storyblok -- Visual Component Editor

**What works well:**
- **Real-time visual preview** with component-level context menus on hover. Clicking a component opens its editing form in a sidebar.
- **Block/component library** -- editors freely add, delete, and rearrange blocks from a component library.
- **Collaboration** -- component-level comments, role-based permissions, custom workflows.
- **Responsive preview** for mobile, tablet, desktop.

**What frustrates users:**
- SaaS pricing can be prohibitive for small projects.
- Editing nested components requires navigating through layers in the sidebar.

**Relevance to Livskompass:** Storyblok's UX (visual preview + sidebar editing + component library) is the gold standard for this use case. Puck's architecture directly mirrors this pattern.

### 2.8 WordPress Gutenberg -- Block Editor

**What works well:**
- **Massive block ecosystem** -- hundreds of pre-built blocks available.
- **Drag-and-drop** between blocks is intuitive for simple rearranging.
- **Slash command** support (recently added) for power users.
- **Patterns** (reusable block templates) allow non-technical users to start with pre-built layouts.

**What frustrates users:**
- **Toolbar complexity** -- toolbars have grown disorganized with inconsistent patterns (icons, text, dropdowns, modals mixed together).
- **Visual clutter** -- too many outlines, borders, and UI elements compete for attention during editing.
- **Heavy learning curve** for developers (React + PHP hybrid architecture).
- **Information architecture problems** -- settings are split between toolbar, sidebar, and modals without clear logic.

**Relevance to Livskompass:** Gutenberg's concept of "Patterns" (pre-built block combinations) is valuable. Its mistakes -- toolbar complexity, visual noise, scattered settings -- should be actively avoided.

### 2.9 Ghost -- Minimal, Focused Editor

**What works well:**
- **Radical simplicity** -- the editor is a clean white canvas with no visible UI until needed.
- **Focus on writing** -- everything is designed to keep the writer in flow state.
- **Auto-save** with no manual save button needed.
- **Card-based content** -- images, embeds, and special content are "cards" inserted between text blocks.

**What frustrates users:**
- No page building capabilities. Ghost is for blog posts and articles only.
- Limited customization of content structure.
- No multi-column layouts.

**Relevance to Livskompass:** Ghost's philosophy of "get out of the way" should inform the editing experience for blog posts specifically. The clean canvas aesthetic should be the baseline.

### 2.10 Synthesis: The Ideal UX Pattern

The ideal CMS for Livskompass combines:

| Feature | Inspired By |
|---|---|
| Visual preview with click-to-select | Storyblok, Tina CMS |
| Sidebar configuration panel | Storyblok, Puck |
| Drag-and-drop block rearranging | Gutenberg, Puck |
| Component library sidebar | Storyblok, Framer |
| Slash commands for inline insertion | Notion, Gutenberg |
| Structured JSON data model | Sanity, Payload CMS |
| Reusable patterns/templates | Gutenberg |
| Clean, minimal editing canvas | Ghost |
| Responsive viewport preview | Storyblok, Framer |
| Rich text inline editing | Notion, TipTap |

---

## 3. Modular Content Architecture

### 3.1 Essential vs Nice-to-Have Content Blocks

**Essential (must have at launch):**

| Block | Why Essential | Used For |
|---|---|---|
| Hero | Every landing page needs a prominent header | Home, course pages, campaign pages |
| Rich Text | Core content editing for articles and descriptions | Blog posts, informational pages |
| Image | Single image with optional caption | All content types |
| Card Grid | Display courses, products, team, or resources | Course listings, product catalog |
| Accordion / FAQ | Common pattern for Q&A content | FAQ pages, course details |
| Call-to-Action Banner | Drive conversions to bookings | Course promotions, landing pages |
| Columns Layout | Multi-column content arrangement | About pages, feature comparisons |
| Separator / Spacer | Visual rhythm and section breaks | All pages |
| Button Group | Primary/secondary action buttons | CTAs, navigation |

**Nice-to-Have (phase 2):**

| Block | Rationale |
|---|---|
| Image Gallery / Grid | Useful for press photos, course environments |
| Video Embed | Training videos, YouTube embeds |
| Testimonial / Quote | Social proof for courses |
| Contact Form Embed | Embed the existing contact form on any page |
| Stats / Counter | Display numbers (e.g., "500+ deltagare") |
| Logo Grid | Partner logos, certification badges |
| Embed / HTML | Arbitrary embeds for future flexibility |
| Table | Pricing comparisons, schedules |

### 3.2 Block Organization in the Sidebar

The block palette should be organized by purpose, not by technical type:

```
Block Palette (Left Sidebar)

  [Search blocks...]                    <-- Instant search/filter

  Populara                              <-- Frequently used (auto-tracked)
    Rich Text
    Image
    Button Group

  Layout                                <-- Structural blocks
    Columns (2-col, 3-col)
    Separator / Spacer

  Innehall                              <-- Content blocks
    Hero
    Rich Text
    Image
    Accordion / FAQ

  Marknadsforing                        <-- Marketing/conversion
    Call-to-Action Banner
    Card Grid
    Testimonial / Quote
    Button Group

  Media                                 <-- Media blocks
    Image Gallery / Grid
    Video Embed

  Avancerat                             <-- Advanced/embed
    Contact Form
    Embed / HTML
```

**Key design decisions:**

- **Search first.** A search field at the top of the palette lets Fredrik type "bild" (image) or "kort" (card) and find the right block instantly. This is more efficient than browsing categories.
- **Favorites/Popular.** Track which blocks Fredrik uses most and surface them at the top. After a week of use, his top 3-5 blocks should always be one click away.
- **Swedish labels.** All block names and categories must be in Swedish. "Rich Text" becomes "Fritext", "Hero" becomes "Hjaltebanner", etc.
- **Visual thumbnails.** Each block in the palette should show a small preview thumbnail, not just an icon and label. Research shows visual thumbnails reduce cognitive load by 40% compared to text-only lists (Gutenberg learned this the hard way).

### 3.3 Block Configuration: Inline vs Sidebar vs Modal

**Recommended approach: Hybrid (inline + sidebar)**

| Interaction | Where It Happens |
|---|---|
| Text content editing | **Inline** on the canvas (click to edit) |
| Image selection/replacement | **Sidebar** panel (media library picker) |
| Block-level settings (colors, layout, spacing) | **Sidebar** panel |
| Link URL entry | **Inline** floating tooltip |
| Complex data (card grid items, accordion items) | **Sidebar** panel |
| Delete / duplicate / reorder | **Floating toolbar** above the selected block |

**Never use modals** for block configuration. Modals break context, hide the preview, and feel heavy. The sidebar panel keeps the preview visible at all times.

### 3.4 Nested Block Architecture

Nested blocks are needed for one primary use case: **Columns**.

A Columns block contains 2-3 DropZones (slots), each of which can contain any other block type. However, nesting should be limited to one level deep to prevent complexity:

```
Page
  Hero Block
  Columns Block (2-col)
    Column 1 (slot)
      Rich Text Block
      Button Group Block
    Column 2 (slot)
      Image Block
      Card Grid Block
  Separator Block
  Accordion Block
```

**Restriction:** Columns cannot be nested inside other Columns. This prevents the recursive complexity that overwhelms non-technical users. Puck's `allow`/`disallow` slot configuration enforces this at the framework level.

### 3.5 Responsive Behavior

Each block should handle responsive behavior automatically with sensible defaults. Fredrik should not need to configure responsive breakpoints manually.

| Block | Desktop | Tablet | Mobile |
|---|---|---|---|
| Hero | Full-width, large text | Full-width, medium text | Full-width, stacked, smaller text |
| Columns (2-col) | Side by side | Side by side | Stacked vertically |
| Columns (3-col) | Side by side | 2+1 grid | Stacked vertically |
| Card Grid | 3 columns | 2 columns | 1 column |
| Image Gallery | 3-4 columns | 2 columns | 1-2 columns |

The Puck viewport system (360px, 768px, 1280px) should be available for preview but not for per-breakpoint configuration. The blocks themselves use responsive Tailwind classes (e.g., `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) that adapt automatically.

### 3.6 Reusable Block Templates (Patterns)

**Concept:** Pre-built page templates that combine multiple blocks into a starting point.

**Essential templates for Livskompass:**

1. **Kurssida (Course page)** -- Hero + Rich Text (description) + Card Grid (schedule) + Accordion (FAQ) + CTA Banner (booking)
2. **Blogg (Blog post)** -- Hero (simple) + Rich Text (article body) + Button Group (share/back)
3. **Landningssida (Landing page)** -- Hero + Columns (features) + Testimonials + CTA Banner
4. **Informationssida (Info page)** -- Rich Text (content) + Accordion (FAQ)

Templates are not locked pages; they are starting points. Fredrik selects a template when creating a new page and then modifies, adds, or removes blocks freely.

---

## 4. Key UX Decisions

### 4.1 Editing Mode: Inline + Sidebar (Hybrid)

**Decision: Use a hybrid model where text content is edited inline on the canvas and block configuration is done in the right sidebar.**

Rationale:
- **Pure inline editing** (like Framer) is overwhelming. Every block becomes a complex control surface.
- **Pure sidebar editing** (like Payload CMS) is disconnected. The editor cannot see the result while changing settings.
- **Hybrid** (like Storyblok, Puck) is the sweet spot. Click a block on the canvas to select it. The right sidebar shows its configuration fields. Text fields are editable directly on the canvas. Settings like colors, spacing, and media are configured in the sidebar.

Puck v0.20+ supports this model natively with inline text editing and sidebar fields.

### 4.2 Content Model: Structured JSON Blocks

**Decision: Store page content as structured JSON, not HTML.**

The current `pages.content TEXT` column stores raw HTML from TipTap. The new system should store Puck's JSON output format:

```json
{
  "content": [
    {
      "type": "Hero",
      "props": {
        "heading": "ACT och Mindfulness",
        "subheading": "Utbildningar och verktyg...",
        "backgroundImage": "/media/hero-bg.jpg",
        "ctaText": "Se utbildningar",
        "ctaLink": "/utbildningar",
        "variant": "gradient"
      }
    },
    {
      "type": "CardGrid",
      "props": {
        "heading": "Kommande utbildningar",
        "source": "courses",
        "maxItems": 3,
        "columns": 3
      }
    }
  ],
  "root": {
    "props": {
      "title": "ACT och Mindfulness"
    }
  },
  "zones": {}
}
```

**Why JSON over HTML:**
- **Portability.** JSON can be rendered as HTML, email, PDF, or mobile app content.
- **Queryability.** You can find all pages that contain a "Hero" block or reference a specific course.
- **Migration safety.** When block designs change, you update the render function, not the stored data.
- **Version control.** JSON diffs are meaningful; HTML diffs are noise.
- **No XSS risk.** JSON content is rendered through React components, not `dangerouslySetInnerHTML`.

**Database change required:**

Add a `content_blocks TEXT` column to the `pages` table (and optionally `posts` table) to store the Puck JSON. Keep the existing `content` column for backward compatibility with migrated WordPress HTML until all pages are rebuilt in the block editor.

### 4.3 Preview: Iframe-Based Live Preview (Puck Default)

**Decision: Use Puck's iframe-based preview with viewport switching.**

Puck renders the editing canvas inside a same-origin iframe by default. This provides:
- True isolation of preview styles from editor UI styles.
- Viewport simulation (mobile, tablet, desktop) by resizing the iframe.
- Accurate rendering of Tailwind CSS classes and shadcn/ui components.

The iframe approach is superior to a split-view (editor left, preview right) because:
- It uses the full width for the preview, making it realistic.
- The sidebar provides configuration context without splitting the viewport.
- Fredrik sees one thing, not two competing views.

### 4.4 Block Selection: Sidebar Palette + Drag-and-Drop + Keyboard "+"

**Decision: Primary method is clicking the "+" button or dragging from the sidebar palette. Do NOT implement slash commands for page building.**

Rationale:
- Slash commands are a power-user pattern optimized for document editing (Notion, Ghost). They work well inside a rich text block where the user is already typing.
- For page building -- where the user is choosing between Hero, Card Grid, Columns, etc. -- a visual palette with thumbnails is far more discoverable.
- Fredrik will use the page builder perhaps 2-3 times per month. He will not memorize slash commands. Visual browsing is more forgiving of infrequent use.

However, inside a Rich Text block, the TipTap editor could support `/heading`, `/list`, `/quote` commands for inline content. This is a different scope than page-level block insertion.

### 4.5 Mobile/Tablet Editing: No

**Decision: The admin CMS is desktop-only. Tablet and mobile editing is explicitly out of scope.**

Rationale:
- Drag-and-drop page building on touch devices is universally poor. Even Webflow and Framer discourage it.
- The admin panel (`packages/admin/`) is an internal tool used by 1-2 people.
- Supporting touch interactions doubles the testing surface for marginal benefit.
- The admin panel should show a friendly message on small screens: "Anvand en dator for att redigera sidor."

### 4.6 Undo/Redo: Puck Built-In History

**Decision: Use Puck's built-in history system.**

Puck provides:
- `Ctrl+Z` / `Cmd+Z` for undo.
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` for redo.
- `initialHistory` prop for persisting history across sessions.
- `onAction` callback for tracking every state change.

Each action (insert, delete, move, prop change) creates a history entry. The history stack is kept in memory during the editing session. There is no need to persist it between sessions for this use case (Fredrik is the only editor).

### 4.7 Collaboration: Not Required

**Decision: Multi-user editing is not needed.**

Fredrik is the sole content editor. There is no need for real-time collaboration, locking, or conflict resolution. If a second editor is added in the future, Puck's permissions API can restrict their access to specific blocks or actions.

---

## 5. Content Block Specifications

### 5.1 Hero Block

**Purpose:** Full-width header section with background, heading, subheading, and call-to-action buttons.

**User interaction:**
1. Drag "Hjaltebanner" from the sidebar palette onto the canvas.
2. Click the heading text to edit it inline.
3. Click the subheading text to edit it inline.
4. Use the sidebar to: select background image from media library, choose variant (gradient/image/solid), configure CTA button text and link, adjust text alignment.

**Settings (sidebar):**

| Field | Type | Options |
|---|---|---|
| heading | richtext (inline) | -- |
| subheading | richtext (inline) | -- |
| variant | select | `gradient`, `image`, `solid-color` |
| backgroundColor | select | Brand colors (primary, dark, light) |
| backgroundImage | external (media library) | -- |
| textAlignment | radio | `left`, `center`, `right` |
| ctaPrimaryText | text | -- |
| ctaPrimaryLink | text | -- |
| ctaSecondaryText | text | -- |
| ctaSecondaryLink | text | -- |
| fullHeight | radio | `full-viewport`, `auto` |

**JSON schema:**
```json
{
  "type": "Hero",
  "props": {
    "heading": "ACT och Mindfulness",
    "subheading": "Utbildningar och verktyg for att hantera stress",
    "variant": "gradient",
    "backgroundColor": "primary",
    "backgroundImage": null,
    "textAlignment": "center",
    "ctaPrimaryText": "Se utbildningar",
    "ctaPrimaryLink": "/utbildningar",
    "ctaSecondaryText": "Vad ar ACT?",
    "ctaSecondaryLink": "/act",
    "fullHeight": "auto"
  }
}
```

**Frontend rendering:** The Hero component renders using the exact same Tailwind classes currently in `Home.tsx` lines 25-48. The gradient variant uses `bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900`. The image variant uses the background image with an overlay.

---

### 5.2 Rich Text Block

**Purpose:** Free-form rich text content for articles, descriptions, and general body copy.

**User interaction:**
1. Drag "Fritext" from palette or click "+" between blocks.
2. Click anywhere in the text area to start typing directly on the canvas (inline editing).
3. Select text to see the floating formatting toolbar (bold, italic, link, headings, lists).

**Settings (sidebar):**

| Field | Type | Options |
|---|---|---|
| content | richtext (inline) | Full TipTap editor |
| maxWidth | select | `narrow` (65ch), `medium` (80ch), `full` |

**JSON schema:**
```json
{
  "type": "RichText",
  "props": {
    "content": [
      { "type": "paragraph", "children": [{ "text": "Lorem ipsum..." }] }
    ],
    "maxWidth": "narrow"
  }
}
```

Note: The `content` field uses Puck's richtext field type, which stores Portable Text-style JSON (not HTML). This is rendered by the frontend using a recursive renderer that maps each node type to a React component with the appropriate Tailwind prose classes.

**Frontend rendering:** Wrapped in `<div className="prose prose-lg max-w-none">` (same as current Page.tsx rendering). The `maxWidth` prop controls the container width.

---

### 5.3 Image Block

**Purpose:** Single image with optional caption, alt text, and sizing controls.

**User interaction:**
1. Drag "Bild" from palette.
2. Click the image placeholder to open the media library picker in the sidebar.
3. Type a caption directly below the image (inline editing).

**Settings (sidebar):**

| Field | Type | Options |
|---|---|---|
| src | external (media library) | -- |
| alt | text | -- |
| caption | text | -- |
| size | select | `small` (50%), `medium` (75%), `full` (100%) |
| alignment | radio | `left`, `center`, `right` |
| rounded | radio | `none`, `small`, `large` |
| link | text | Optional click-through URL |

**JSON schema:**
```json
{
  "type": "Image",
  "props": {
    "src": "/media/mindfulness-session.jpg",
    "alt": "Mindfulness-session i naturen",
    "caption": "En stund av stillhet under var utbildning i Dalarna",
    "size": "full",
    "alignment": "center",
    "rounded": "small",
    "link": null
  }
}
```

**Frontend rendering:** Renders as `<figure>` with `<img>` and optional `<figcaption>`. The `src` URL is processed through `getMediaUrl()` to resolve the correct media domain.

---

### 5.4 Image Gallery / Grid Block

**Purpose:** Display multiple images in a responsive grid layout.

**User interaction:**
1. Drag "Bildgalleri" from palette.
2. Click "Lagg till bild" (Add image) in the sidebar to add images from the media library.
3. Drag to reorder images within the gallery.
4. Click an image to edit its alt text and caption.

**Settings (sidebar):**

| Field | Type | Options |
|---|---|---|
| images | array of objects | `{ src, alt, caption }` |
| columns | select | `2`, `3`, `4` |
| gap | select | `small`, `medium`, `large` |
| aspectRatio | select | `square`, `landscape`, `portrait`, `auto` |
| lightbox | radio | `enabled`, `disabled` |

**JSON schema:**
```json
{
  "type": "ImageGallery",
  "props": {
    "images": [
      { "src": "/media/img1.jpg", "alt": "Bild 1", "caption": "" },
      { "src": "/media/img2.jpg", "alt": "Bild 2", "caption": "" }
    ],
    "columns": 3,
    "gap": "medium",
    "aspectRatio": "landscape",
    "lightbox": "enabled"
  }
}
```

---

### 5.5 Video Embed Block

**Purpose:** Embed YouTube or Vimeo videos with responsive aspect ratio.

**User interaction:**
1. Drag "Video" from palette.
2. Paste a YouTube/Vimeo URL in the sidebar field.
3. The preview shows the embedded video.

**Settings (sidebar):**

| Field | Type | Options |
|---|---|---|
| url | text | YouTube or Vimeo URL |
| aspectRatio | select | `16:9`, `4:3`, `1:1` |
| caption | text | Optional |

**JSON schema:**
```json
{
  "type": "VideoEmbed",
  "props": {
    "url": "https://www.youtube.com/watch?v=...",
    "aspectRatio": "16:9",
    "caption": "Fredrik forklarar ACT-modellen"
  }
}
```

**Frontend rendering:** Parse the URL to extract the video ID. Render as a responsive iframe with `aspect-ratio` CSS. Lazy-load the iframe (show a thumbnail with play button until clicked).

---

### 5.6 Card Grid Block

**Purpose:** Configurable grid of cards. Can display courses, products, team members, or custom items.

**User interaction:**
1. Drag "Kortrutnant" (Card Grid) from palette.
2. Choose data source in sidebar: "Utbildningar", "Produkter", or "Manuella kort".
3. For dynamic sources (courses/products), configure max items and filters.
4. For manual cards, add items with title, description, image, and link.

**Settings (sidebar):**

| Field | Type | Options |
|---|---|---|
| heading | text | Section heading |
| subheading | text | Optional |
| source | select | `courses`, `products`, `manual` |
| maxItems | number | 3-12 |
| columns | select | `2`, `3`, `4` |
| manualCards | array of objects | `{ title, description, image, link, badge }` |
| showBadge | radio | `yes`, `no` |
| cardStyle | select | `default`, `bordered`, `shadow` |

**JSON schema:**
```json
{
  "type": "CardGrid",
  "props": {
    "heading": "Kommande utbildningar",
    "subheading": "Boka din plats",
    "source": "courses",
    "maxItems": 3,
    "columns": 3,
    "manualCards": [],
    "showBadge": true,
    "cardStyle": "default"
  }
}
```

**Frontend rendering:** When `source` is `courses` or `products`, the frontend fetches data from the API at render time (same as current `Home.tsx`). When `source` is `manual`, the cards are rendered from `manualCards` data. Uses the existing `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `Badge` components from shadcn/ui.

---

### 5.7 Accordion / FAQ Block

**Purpose:** Expandable sections for FAQ content, course details, or structured information.

**User interaction:**
1. Drag "Dragspel / FAQ" from palette.
2. Add items in the sidebar. Each item has a question (title) and answer (rich text).
3. Click "Lagg till falt" (Add item) to append new sections.
4. Drag to reorder items.

**Settings (sidebar):**

| Field | Type | Options |
|---|---|---|
| heading | text | Section heading (optional) |
| items | array of objects | `{ question, answer }` |
| defaultOpen | select | `none`, `first`, `all` |
| style | select | `default`, `bordered`, `minimal` |

**JSON schema:**
```json
{
  "type": "Accordion",
  "props": {
    "heading": "Vanliga fragor",
    "items": [
      {
        "question": "Vad ar ACT?",
        "answer": [{ "type": "paragraph", "children": [{ "text": "ACT star for..." }] }]
      }
    ],
    "defaultOpen": "first",
    "style": "bordered"
  }
}
```

**Frontend rendering:** Uses Radix UI Accordion primitives (already a dependency via shadcn/ui) with smooth open/close animations.

---

### 5.8 Call-to-Action Banner Block

**Purpose:** Full-width or contained banner designed to drive a specific action (booking, contact, download).

**User interaction:**
1. Drag "CTA-banner" from palette.
2. Edit heading and description inline on the canvas.
3. Configure button text, link, and visual style in the sidebar.

**Settings (sidebar):**

| Field | Type | Options |
|---|---|---|
| heading | richtext (inline) | -- |
| description | richtext (inline) | -- |
| buttonText | text | -- |
| buttonLink | text | -- |
| variant | select | `primary`, `secondary`, `outline` |
| backgroundColor | select | Brand colors |
| alignment | radio | `left`, `center` |
| fullWidth | radio | `yes`, `no` |

**JSON schema:**
```json
{
  "type": "CTABanner",
  "props": {
    "heading": "Redo att borja?",
    "description": "Boka din plats pa nasta utbildning i ACT",
    "buttonText": "Boka nu",
    "buttonLink": "/utbildningar",
    "variant": "primary",
    "backgroundColor": "primary",
    "alignment": "center",
    "fullWidth": true
  }
}
```

---

### 5.9 Testimonial / Quote Block

**Purpose:** Display customer testimonials or notable quotes for social proof.

**User interaction:**
1. Drag "Citat / Omdome" from palette.
2. Edit the quote text inline.
3. Add author name, role, and optional photo in sidebar.

**Settings (sidebar):**

| Field | Type | Options |
|---|---|---|
| quote | richtext (inline) | -- |
| author | text | -- |
| role | text | Optional (e.g., "Psykolog, Region Stockholm") |
| avatar | external (media library) | Optional photo |
| style | select | `card`, `minimal`, `featured` |

**JSON schema:**
```json
{
  "type": "Testimonial",
  "props": {
    "quote": "ACT-utbildningen forandrade mitt satt att arbeta...",
    "author": "Anna Svensson",
    "role": "Psykolog, Region Stockholm",
    "avatar": "/media/anna.jpg",
    "style": "card"
  }
}
```

---

### 5.10 Columns Layout Block

**Purpose:** Arrange content in multi-column layouts.

**User interaction:**
1. Drag "Kolumner" from palette.
2. Choose layout preset: 50/50, 33/33/33, 66/33, 33/66.
3. Drop other blocks into each column's DropZone.
4. Each column is a slot that accepts any block except another Columns block.

**Settings (sidebar):**

| Field | Type | Options |
|---|---|---|
| layout | select | `50-50`, `33-33-33`, `66-33`, `33-66`, `25-50-25` |
| gap | select | `small`, `medium`, `large` |
| verticalAlignment | select | `top`, `center`, `bottom` |
| stackOnMobile | radio | `yes`, `no` |
| column1 | slot | Accepts blocks |
| column2 | slot | Accepts blocks |
| column3 | slot | Accepts blocks (hidden for 2-col layouts) |

**JSON schema:**
```json
{
  "type": "Columns",
  "props": {
    "layout": "50-50",
    "gap": "medium",
    "verticalAlignment": "top",
    "stackOnMobile": true,
    "column1": [
      { "type": "RichText", "props": { "content": "..." } }
    ],
    "column2": [
      { "type": "Image", "props": { "src": "..." } }
    ]
  }
}
```

**Implementation note:** Use Puck's slot field type for each column. Configure `disallow: ["Columns"]` on each slot to prevent nesting Columns inside Columns.

---

### 5.11 Separator / Spacer Block

**Purpose:** Add visual separation or vertical spacing between sections.

**User interaction:**
1. Drag "Avskiljare" from palette.
2. Configure style and spacing in sidebar.

**Settings (sidebar):**

| Field | Type | Options |
|---|---|---|
| variant | select | `line`, `dots`, `space-only` |
| spacing | select | `small` (16px), `medium` (32px), `large` (64px), `extra-large` (96px) |
| lineColor | select | `light`, `medium`, `dark` |
| maxWidth | select | `narrow`, `medium`, `full` |

**JSON schema:**
```json
{
  "type": "Separator",
  "props": {
    "variant": "line",
    "spacing": "medium",
    "lineColor": "light",
    "maxWidth": "medium"
  }
}
```

---

### 5.12 Button Group Block

**Purpose:** One or more buttons arranged horizontally or vertically.

**User interaction:**
1. Drag "Knappar" from palette.
2. Add buttons in the sidebar with label, link, and variant.
3. Rearrange button order by dragging in the sidebar.

**Settings (sidebar):**

| Field | Type | Options |
|---|---|---|
| buttons | array of objects | `{ text, link, variant, icon }` |
| alignment | radio | `left`, `center`, `right` |
| direction | radio | `horizontal`, `vertical` |
| size | select | `small`, `medium`, `large` |

**JSON schema:**
```json
{
  "type": "ButtonGroup",
  "props": {
    "buttons": [
      { "text": "Boka plats", "link": "/utbildningar", "variant": "primary", "icon": null },
      { "text": "Las mer", "link": "/act", "variant": "outline", "icon": "arrow-right" }
    ],
    "alignment": "center",
    "direction": "horizontal",
    "size": "medium"
  }
}
```

**Frontend rendering:** Uses the existing `Button` component from `packages/web/src/components/ui/button.tsx` with the appropriate variant classes.

---

### 5.13 Contact Form Embed Block

**Purpose:** Embed the existing contact form on any page.

**User interaction:**
1. Drag "Kontaktformular" from palette.
2. Optionally configure heading and description in sidebar.

**Settings (sidebar):**

| Field | Type | Options |
|---|---|---|
| heading | text | Default: "Kontakta oss" |
| description | text | Optional |
| showPhone | radio | `yes`, `no` |
| showSubject | radio | `yes`, `no` |

**JSON schema:**
```json
{
  "type": "ContactForm",
  "props": {
    "heading": "Kontakta oss",
    "description": "Har du fragor? Hor av dig sa aterkommet vi sa snart vi kan.",
    "showPhone": true,
    "showSubject": true
  }
}
```

**Frontend rendering:** Renders the same form component currently in `Contact.tsx`, but as an embeddable block that posts to `POST /api/contact`.

---

## 6. Technical Recommendation

### 6.1 Library Evaluation

| Criterion | Puck | Craft.js | @dnd-kit + Custom | Plate.js | Editor.js |
|---|---|---|---|---|---|
| **Primary purpose** | Visual page builder | Page builder framework | Drag-and-drop library | Rich text editor | Block text editor |
| **Completeness** | Full editor UI included | Framework only, build your own UI | Library only, build everything | Rich text focus, no page layout | Block content, no page layout |
| **Drag-and-drop** | Built-in, CSS grid/flex support | Built-in, basic | You build it | Not applicable | Not applicable |
| **Inline editing** | Yes (v0.20+) | Possible with custom work | You build it | Yes (core feature) | Yes (core feature) |
| **Sidebar config** | Built-in | You build it | You build it | Not applicable | Not applicable |
| **Viewport preview** | Built-in iframe | You build it | You build it | Not applicable | Not applicable |
| **Undo/redo** | Built-in | You build it | You build it | Built-in | Plugin available |
| **JSON output** | Yes | Yes | You design it | Yes | Yes |
| **Field types** | text, textarea, number, select, radio, array, object, external, slot, richtext | None (framework) | None (library) | N/A | N/A |
| **Multi-column** | Slot fields with CSS flex/grid | Custom implementation | Custom implementation | N/A | N/A |
| **Permissions** | Built-in per-component/global | Manual | Manual | N/A | N/A |
| **Plugins** | Plugin API (v0.21+) | Extensions | N/A | Plugin system | Plugin system |
| **Learning curve** | Days | Weeks | Months | Days (different scope) | Days (different scope) |
| **React compatibility** | React 18+ | React 16+ | React 16+ | React 18+ | Framework-agnostic |
| **Tailwind integration** | Native (your components) | Your components | Your components | Styled components | Custom renderers |
| **GitHub stars** | ~10K | ~7K | ~12K | ~15K | ~28K |
| **Maintenance** | Very active (v0.21, Feb 2026) | Slower updates | Very active | Active | Active |
| **License** | MIT | MIT | MIT | MIT | Apache 2.0 |
| **Effort to achieve goal** | **Low** (weeks) | Medium (months) | High (months) | N/A (wrong tool) | N/A (wrong tool) |

### 6.2 Recommendation: Puck

**Puck is the clear winner for this project.** Here is the detailed reasoning:

**Why Puck over Craft.js:**
Craft.js is a lower-level framework that provides the building blocks for a page editor but requires you to build the entire UI yourself -- sidebar, toolbar, drag indicators, viewport preview, undo/redo. For a project where the goal is "intuitive for a non-technical user," the months of custom UI development needed for Craft.js is unnecessary risk. Puck provides a polished, tested editor UI out of the box.

**Why Puck over @dnd-kit + custom:**
@dnd-kit is an excellent drag-and-drop library (smooth animations, keyboard accessibility, touch support), but it is a library, not an editor. Building a complete page builder on top of @dnd-kit means implementing: component palette, sidebar configuration panels, inline editing, viewport preview, undo/redo history, slot/nesting system, JSON serialization, and permissions. This is 3-6 months of work that Puck already provides.

**Why Puck over Plate.js:**
Plate.js is a rich text editor framework built on Slate. It excels at Notion-style document editing with blocks. However, it is designed for content editing (text, images, embeds) within a document, not for page building with configurable component props, multi-column layouts, and visual layout control. Plate.js would be an excellent choice for the rich text editing inside blocks, but Puck already integrates TipTap for this purpose (which the project already uses).

**Why Puck over Editor.js:**
Editor.js produces clean JSON blocks, which is appealing. However, like Plate.js, it is a document editor, not a page builder. It has no concept of configurable component props (image source, CTA link, color variant), multi-column layouts, or visual page composition.

### 6.3 Implementation Architecture

```
packages/admin/src/
  components/
    Editor.tsx              <-- Current TipTap editor (keep for now)
    PageBuilder.tsx          <-- NEW: Puck editor wrapper
    blocks/                  <-- NEW: Block component definitions
      Hero.tsx
      RichText.tsx
      Image.tsx
      CardGrid.tsx
      Accordion.tsx
      CTABanner.tsx
      Testimonial.tsx
      Columns.tsx
      Separator.tsx
      ButtonGroup.tsx
      ContactForm.tsx
      ImageGallery.tsx
      VideoEmbed.tsx
    blocks/config.ts         <-- NEW: Puck component config (fields, defaults)
  pages/
    PageEditor.tsx           <-- Modify: Replace TipTap with Puck

packages/web/src/
  components/
    blocks/                  <-- NEW: Frontend block renderers
      Hero.tsx
      RichText.tsx
      Image.tsx
      CardGrid.tsx
      ... (same set)
    BlockRenderer.tsx        <-- NEW: Puck Render component wrapper
  pages/
    Page.tsx                 <-- Modify: Render blocks from JSON
```

**Key architectural principle:** The block components in `admin/blocks/` and `web/blocks/` should share as much code as possible. Ideally, the `render` function in the Puck config IS the web component, so what the editor shows is exactly what the public site renders.

### 6.4 Package Additions

```json
{
  "dependencies": {
    "@puckeditor/core": "^0.21.0"
  }
}
```

In the web package, only the Puck `Render` component is needed (much smaller than the full editor):

```json
{
  "dependencies": {
    "@puckeditor/core": "^0.21.0"
  }
}
```

### 6.5 Rich Text Within Blocks

Puck v0.21 introduces a built-in `richtext` field type that uses TipTap internally. Since the project already depends on TipTap, this is a natural fit. The richtext field supports inline editing on the canvas (click to edit text directly) and stores content as structured JSON, not HTML.

For the existing standalone TipTap editor (`packages/admin/src/components/Editor.tsx`), it should be preserved as a fallback for editing legacy HTML content from the WordPress migration. Over time, as pages are rebuilt in the block editor, the legacy editor becomes less needed.

---

## 7. Interaction Design Details

### 7.1 Drag Handles

**Recommendation: Appear on hover, positioned to the left of the block.**

- When the cursor hovers over a block, a subtle grip icon (six dots, `⠿`) appears to the left of the block, outside the content area.
- The handle has a 44x44px touch target (meeting WCAG minimum).
- The handle is semi-transparent (60% opacity) until hovered directly, then becomes fully opaque.
- On hover, the entire block gets a subtle 1px dashed border (blue-200) to indicate its bounds.
- Puck provides this behavior by default through its built-in drag system.

**Do not** make handles always visible. Always-visible handles create visual noise on a page with 10+ blocks.

### 7.2 Drop Zone Indicators

**Recommendation: Blue horizontal line with smooth animation.**

- When dragging a block, valid drop positions are indicated by a 2px solid blue line (blue-500) spanning the full width of the content area.
- The line animates into position (150ms ease-out) as the dragged block moves over different positions.
- Adjacent blocks shift apart slightly (8px) to make room for the indicator, providing a "magnetic gap" effect.
- For column slots: the drop zone shows a highlighted area (blue-50 background with blue-200 dashed border) when a block is dragged over an empty column.
- Puck 0.18+ provides fluid drag-and-drop with CSS flex/grid support, including these visual indicators.

### 7.3 Block Toolbars

**Recommendation: Floating action bar above the selected block.**

When a block is selected (clicked), a floating toolbar appears directly above the block:

```
[Move Up] [Move Down] [Duplicate] [Delete]     [Parent]
```

- **Move Up / Move Down:** Arrow icons to reorder without dragging.
- **Duplicate:** Copy icon. Creates an identical block below.
- **Delete:** Trash icon with confirmation on click (red highlight, "Radera?" label, click again to confirm).
- **Parent:** Navigate to the parent block (useful in column layouts).

The toolbar is absolutely positioned relative to the selected block and scrolls with it. It does not persist when no block is selected.

**Do not** use a fixed toolbar at the top of the page. Fixed toolbars become cluttered as more block types are added (the WordPress Gutenberg lesson).

### 7.4 Block Palette / Sidebar Feel

**Left sidebar design:**

```
+---------------------------------------------+
|  [Search blocks...]                         |
|                                             |
|  POPULARA                                   |
|  +-------+  +-------+  +-------+           |
|  | [img] |  | [img] |  | [img] |           |
|  | Fritext|  | Bild  |  |Knappar|           |
|  +-------+  +-------+  +-------+           |
|                                             |
|  LAYOUT                                     |
|  +-------+  +-------+                       |
|  | [img] |  | [img] |                       |
|  |Kolumner|  |Avskil.|                       |
|  +-------+  +-------+                       |
|                                             |
|  INNEHALL                                   |
|  +-------+  +-------+  +-------+           |
|  | [img] |  | [img] |  | [img] |           |
|  | Hjalte |  |Fritext|  | Bild  |           |
|  +-------+  +-------+  +-------+           |
|  +-------+  +-------+                       |
|  | [img] |  | [img] |                       |
|  | FAQ   |  | Video |                       |
|  +-------+  +-------+                       |
|                                             |
|  MARKNADSFORING                             |
|  ...                                        |
+---------------------------------------------+
```

- Each block is represented as a card with a thumbnail preview (48x48px) and Swedish label.
- Cards are arranged in a 2-3 column grid within each category.
- Blocks can be dragged from the palette directly onto the canvas.
- Clicking a block in the palette inserts it at the current cursor position (or at the end if nothing is selected).
- The sidebar is collapsible to give more canvas space when not adding blocks.
- Puck supports categories via `componentConfig.categories` and the sidebar can be customized via the plugin system.

### 7.5 Right Sidebar (Configuration Panel)

When a block is selected on the canvas, the right sidebar shows its configuration:

```
+---------------------------------------------+
|  Hero                             [x Close] |
|  ------------------------------------------ |
|                                             |
|  Variant                                    |
|  [Gradient] [Bild] [Enfargad]               |
|                                             |
|  Bakgrundsfarg                              |
|  [Primary v]                                |
|                                             |
|  Bakgrundsbild                              |
|  [+ Valj bild]                              |
|                                             |
|  Textjustering                              |
|  [Vanster] [Center] [Hoger]                 |
|                                             |
|  Primar knapp                               |
|  Text: [Se utbildningar]                    |
|  Lank: [/utbildningar]                      |
|                                             |
|  Sekundar knapp                             |
|  Text: [Vad ar ACT?]                        |
|  Lank: [/act]                               |
|                                             |
|  Hojd                                       |
|  [Full viewhojd] [Automatisk]               |
+---------------------------------------------+
```

- The panel uses the same shadcn/ui form components already in the admin panel (Input, Select, Label).
- Changes are reflected immediately on the canvas (live preview).
- The panel scrolls independently of the canvas.
- Puck handles this rendering automatically based on the `fields` configuration in `ComponentConfig`.

### 7.6 Essential Keyboard Shortcuts

| Shortcut | Action | Context |
|---|---|---|
| `Ctrl/Cmd + Z` | Undo | Global |
| `Ctrl/Cmd + Shift + Z` | Redo | Global |
| `Ctrl/Cmd + S` | Save page | Global |
| `Ctrl/Cmd + I` | Toggle interactive preview mode | Global (Puck built-in) |
| `Delete` / `Backspace` | Delete selected block | Block selected |
| `Ctrl/Cmd + D` | Duplicate selected block | Block selected |
| `Arrow Up` | Select previous block | Block selected |
| `Arrow Down` | Select next block | Block selected |
| `Escape` | Deselect block / close sidebar | Block selected |
| `Enter` | Enter inline editing mode | Block selected |

### 7.7 Transition from Viewing to Editing

The editing experience should feel like directly manipulating the page, not like filling out a form:

1. **Page loads in preview mode.** The page renders exactly as it would on the public site, inside the Puck iframe. The left sidebar shows the block palette. The right sidebar is empty or shows page-level settings.

2. **Hover over a block.** A subtle dashed border appears around the block. The drag handle appears to the left. The cursor changes to indicate interactivity.

3. **Click a block.** The block gets a solid blue border (2px, primary color). The floating action bar appears above it. The right sidebar populates with the block's configuration fields.

4. **Click text within a block.** The text becomes editable inline. A floating formatting toolbar appears above the selected text. The user types directly on the canvas.

5. **Click outside all blocks.** Selection is cleared. Borders disappear. The sidebar returns to page-level settings or block palette.

This flow should feel as natural as clicking to edit a cell in a spreadsheet. No "edit mode" toggle, no modal transitions, no separate editor screen.

---

## 8. Migration Strategy from Current System

### 8.1 Database Changes

**Phase 1: Add columns (non-breaking)**
```sql
ALTER TABLE pages ADD COLUMN content_blocks TEXT;
ALTER TABLE pages ADD COLUMN editor_version TEXT DEFAULT 'html';
-- editor_version: 'html' (legacy) | 'puck' (new block editor)

ALTER TABLE posts ADD COLUMN content_blocks TEXT;
ALTER TABLE posts ADD COLUMN editor_version TEXT DEFAULT 'html';
```

**Phase 2: Dual rendering on the frontend**

The `Page.tsx` component checks `editor_version`:
- If `html`: render using `dangerouslySetInnerHTML` with sanitization (current behavior).
- If `puck`: render using Puck's `<Render>` component with the JSON from `content_blocks`.

This allows gradual migration without a big-bang cutover.

### 8.2 Admin Editor Selection

The `PageEditor.tsx` should detect `editor_version` and show either:
- The legacy TipTap editor for pages with `editor_version = 'html'`.
- The new Puck page builder for pages with `editor_version = 'puck'`.

A "Uppgradera till blockbyggaren" (Upgrade to block builder) button on legacy pages converts them to the new editor. This conversion is one-way (HTML to blocks requires manual reconstruction).

### 8.3 Migration Order

1. **New pages** are created with the block editor by default.
2. **High-traffic pages** (Home, Courses, About) are rebuilt manually in the block editor.
3. **Content-only pages** (simple text pages from WordPress) remain in HTML mode indefinitely. They work fine with `dangerouslySetInnerHTML` and do not benefit significantly from the block editor.
4. **Blog posts** can continue using TipTap (or optionally the block editor). Blog posts are primarily text content and do not need page-building capabilities.

---

## 9. Risk Assessment

### 9.1 Risks and Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Puck is a relatively young project (v0.21) | Medium | MIT licensed, active development, can fork if abandoned. The JSON data format is portable. |
| Learning curve for Fredrik | Low | Puck's editing model (click, edit, drag) is similar to Squarespace/Wix which have high adoption among non-technical users. |
| Performance with many blocks | Low | Puck renders in an iframe. 20-30 blocks per page is well within performance limits. |
| Existing HTML content not editable in block editor | Medium | Mitigated by dual-mode rendering. Legacy pages continue working as-is. |
| Puck bundle size increases admin build | Low | Puck core is ~80KB gzipped. The web package only needs the Render component (~5KB). |
| Tailwind class conflicts between editor and preview | Low | Puck's iframe isolation prevents style conflicts. |
| TipTap version conflicts with Puck's richtext field | Low | Puck v0.21 uses TipTap internally. Version alignment should be straightforward. |

### 9.2 What NOT to Build

To keep scope manageable, the following features should be explicitly deferred:

- **Custom CSS per block.** No inline style editing, no CSS class input. Blocks have predefined variants.
- **Animation/transition configuration.** Blocks render with static styles. Animations come from the component CSS, not user configuration.
- **A/B testing.** No content variant system at this stage.
- **Internationalization.** The site is Swedish-only. No multi-language block content.
- **Version history/revisions.** No saved versions of page content. Undo/redo is session-only.
- **Scheduled publishing.** Pages are either draft or published. No future-dated publishing.
- **Block-level permissions.** All blocks are available to all editors.

### 9.3 Success Criteria

The page builder is successful if Fredrik can:

1. Create a new course landing page from a template in under 10 minutes.
2. Update the home page hero text and CTA without developer help.
3. Add a new FAQ section to any page by dragging an Accordion block.
4. Rearrange sections on a page by dragging blocks up/down.
5. Preview the page on mobile, tablet, and desktop viewports before publishing.
6. Perform all of the above without reading documentation or receiving training.

---

## Appendix A: Competitive Feature Matrix

| Feature | Notion | Framer | Webflow | Sanity | Payload | Tina | Storyblok | Gutenberg | Ghost |
|---|---|---|---|---|---|---|---|---|---|
| Block-based editing | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Visual page builder | No | Yes | Yes | No | No | Partial | Yes | Partial | No |
| Inline text editing | Yes | Yes | Yes | No | No | No | No | Yes | Yes |
| Drag-and-drop | Yes | Yes | Yes | No | No | No | Yes | Yes | No |
| Structured JSON output | Yes | Yes | No | Yes | Yes | Yes | Yes | No* | Yes |
| Multi-column layouts | Limited | Yes | Yes | N/A | N/A | N/A | Yes | Yes | No |
| Responsive preview | No | Yes | Yes | No | No | Yes | Yes | Partial | No |
| Slash commands | Yes | No | No | No | No | No | No | Yes | Yes |
| Reusable templates | Yes | Yes | No | No | No | No | Yes | Yes | No |
| Real-time collaboration | Yes | Yes | No | Yes | No | No | Yes | No | No |
| Non-technical user friendly | Yes | No | No | No | No | Yes | Yes | Partial | Yes |

*Gutenberg stores blocks as HTML comments with JSON attributes, a hybrid format.

## Appendix B: Puck Configuration Reference

Below is a simplified reference of how the Livskompass block config would look in Puck:

```typescript
import type { Config } from "@puckeditor/core";

const config: Config = {
  categories: {
    layout: { title: "Layout", components: ["Columns", "Separator"] },
    content: { title: "Innehall", components: ["Hero", "RichText", "Image", "Accordion"] },
    marketing: { title: "Marknadsforing", components: ["CTABanner", "CardGrid", "Testimonial", "ButtonGroup"] },
    media: { title: "Media", components: ["ImageGallery", "VideoEmbed"] },
    advanced: { title: "Avancerat", components: ["ContactForm"] },
  },
  components: {
    Hero: {
      label: "Hjaltebanner",
      defaultProps: {
        heading: "Rubrik har",
        subheading: "Underrubrik har",
        variant: "gradient",
        backgroundColor: "primary",
        textAlignment: "center",
        ctaPrimaryText: "",
        ctaPrimaryLink: "",
        ctaSecondaryText: "",
        ctaSecondaryLink: "",
        fullHeight: "auto",
      },
      fields: {
        heading: { type: "richtext" },
        subheading: { type: "richtext" },
        variant: {
          type: "select",
          options: [
            { label: "Gradient", value: "gradient" },
            { label: "Bild", value: "image" },
            { label: "Enfargad", value: "solid-color" },
          ],
        },
        // ... additional fields
      },
      render: ({ heading, subheading, variant, ...props }) => {
        // Renders the Hero component with Tailwind classes
        return <HeroComponent {...props} />;
      },
    },
    // ... other components
  },
};
```

## Appendix C: Sources

- [Puck Editor - GitHub](https://github.com/puckeditor/puck)
- [Puck Editor - Documentation](https://puckeditor.com/docs)
- [Puck ComponentConfig API](https://puckeditor.com/docs/api-reference/configuration/component-config)
- [Puck Multi-Column Layouts](https://puckeditor.com/docs/integrating-puck/multi-column-layouts)
- [Puck 0.18 Release - New DnD Engine](https://puckeditor.com/blog/puck-018)
- [Puck Editor Component Props](https://puckeditor.com/docs/api-reference/components/puck)
- [Craft.js - GitHub](https://github.com/prevwong/craft.js/)
- [Plate.js - Rich Text Editor Framework](https://platejs.org/)
- [Liveblocks - Rich Text Editor Comparison 2025](https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025)
- [Notion UI Design Patterns](https://dashibase.com/blog/notion-ui/)
- [Notion Slash Commands](https://www.notion.com/help/guides/using-slash-commands)
- [Sanity Portable Text Editor](https://www.sanity.io/docs/studio/portable-text-editor-configuration)
- [Storyblok Visual Editor](https://www.storyblok.com/docs/manuals/visual-editor)
- [WordPress Gutenberg Block Editor UX](https://github.com/WordPress/gutenberg/issues/18667)
- [Framer vs Webflow Comparison](https://www.toools.design/blog-posts/webflow-vs-framer-in-2025-an-honest-in-depth-comparison)
- [Drag-and-Drop UX Best Practices - NN/g](https://www.nngroup.com/articles/drag-drop/)
- [Accessible Drag-and-Drop Patterns - Salesforce](https://medium.com/salesforce-ux/4-major-patterns-for-accessible-drag-and-drop-1d43f64ebf09)
- [Ghost CMS Editor UX](https://goodux.appcues.com/blog/ghost-cms-editor-user-onboarding)
- [Payload CMS - Figma Acquisition](https://www.cmswire.com/digital-experience/when-cms-meets-ux-design-what-figmas-payload-deal-really-means/)
- [Tina CMS Visual Editing](https://vercel.com/blog/visual-editing-meets-markdown)
- [Content Modeling Best Practices](https://www.afteractive.com/blog/best-practices-for-structuring-content-in-a-headless-cms)
- [Modular Content Fields - DatoCMS](https://www.datocms.com/docs/content-modelling/modular-content)
