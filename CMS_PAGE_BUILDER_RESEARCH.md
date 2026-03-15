# Drag-and-Drop CMS Page Builder: Research & Recommendation

**Project:** livskompass.se -- Swedish ACT/Mindfulness Training Website
**Date:** 2026-02-15
**Stack:** React 18 + Vite 5 + Tailwind CSS 3.4 + shadcn/ui + Cloudflare (Pages + Workers + D1)
**Current State:** TipTap WYSIWYG editor with raw HTML storage in D1

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Architecture Analysis](#2-current-architecture-analysis)
3. [Landscape Survey: All Options Evaluated](#3-landscape-survey-all-options-evaluated)
4. [Detailed Comparison Matrix](#4-detailed-comparison-matrix)
5. [Top 3 Recommended Approaches](#5-top-3-recommended-approaches)
6. [Ideal Content Module System](#6-ideal-content-module-system)
7. [Data Architecture & Serialization](#7-data-architecture--serialization)
8. [Design Inspiration & Visual Standards](#8-design-inspiration--visual-standards)
9. [Migration Path from Current System](#9-migration-path-from-current-system)
10. [Final Recommendation](#10-final-recommendation)

---

## 1. Executive Summary

After surveying eight major React-based drag-and-drop and visual editing solutions, the clear recommendation for livskompass.se is **Puck** as the primary page builder framework, optionally enhanced with **Plate.js** for rich text editing within content blocks. This combination provides the strongest alignment with the existing tech stack (React 18, Tailwind CSS, shadcn/ui), the cleanest JSON-based data model for D1 storage, and the highest ceiling for visual polish and customization.

The key insight: **Puck and Plate.js solve different problems that together cover the full CMS need**. Puck handles page-level layout, block ordering, and the drag-and-drop canvas. Plate.js (or a continued TipTap setup) handles rich text editing within individual blocks. A custom-built approach using only @dnd-kit primitives is a viable but significantly more labor-intensive alternative.

---

## 2. Current Architecture Analysis

### What Exists Today

The admin panel at `packages/admin/` currently uses:

- **TipTap** (v2.2.4) with StarterKit, Link, and Image extensions
- A single monolithic `content` field storing raw HTML as a string
- Traditional form-based page editor (`PageEditor.tsx`) with title, slug, content, meta, hierarchy fields
- shadcn/ui components (button, card, badge, input, textarea, label, table, separator, skeleton, dialog, select)
- Dark sidebar navigation layout (`AdminLayout.tsx`) with gray-950 background
- Tailwind CSS 3.4 with a custom primary color scale (sky blue)
- React Query for data fetching, React Router for navigation

### What Needs to Change

| Current | Target |
|---------|--------|
| Single HTML blob per page | Structured JSON blocks per page |
| TipTap toolbar-only editing | Visual drag-and-drop canvas |
| No layout control | Multi-column layouts, sections |
| No block types | Hero, cards, FAQ, CTA, testimonials, etc. |
| No live preview | Real-time WYSIWYG preview |
| No responsive preview | Desktop/tablet/mobile preview toggle |
| Generic admin panel feel | Premium, polished Squarespace-level UI |

### Constraints

- **Cloudflare D1**: SQLite database, so JSON content blocks must be stored as TEXT (serialized JSON). No document store.
- **Cloudflare R2**: Media storage -- the page builder must integrate with the existing media library.
- **React 18**: No React 19 features available. Library must support React 18.
- **Bundle size**: Cloudflare Pages has a generous limit, but the admin should still load fast.
- **Swedish content**: All UI labels must be localizable to Swedish.

---

## 3. Landscape Survey: All Options Evaluated

### 3.1 Puck (puckeditor.com)

**What it is:** A modular, open-source visual editor for React. It is a page-builder-first tool, not a text editor. You define component configs and Puck provides the full drag-and-drop canvas, sidebar, and data management.

**Version:** 0.21 (latest as of early 2025, now under @puckeditor/core)
**License:** MIT
**GitHub Stars:** ~9,700+
**NPM Downloads:** Growing rapidly

**Architecture:**
- You provide a `config` object mapping component names to render functions and field definitions
- Puck renders a full editor UI with left sidebar (component list), center canvas (drag-and-drop preview), and right panel (property fields)
- Output is a clean JSON data model: `{ content: [...], root: { props: {...} }, zones: {} }`
- Separate `<Render>` component takes the same config + data to render the published page
- Supports nested components (zones/slots) for complex layouts
- Supports external data sources for dynamic content

**Key 0.21 features:**
- AI page generation (open beta)
- Rich text field type (WYSIWYG inline editing)
- Plugin Rail (left-side navigation for plugin UIs)
- `Puck.Layout` for context provider patterns

**Customization:**
- Compositional API: `<Puck.Preview>`, `<Puck.Components>`, `<Puck.Fields>`, `<Puck.Outline>` -- compose your own editor layout
- UI overrides for `header`, `headerActions`, `drawerItem`, `fieldTypes`, and more
- CSS variable theming for the editor chrome
- Full control over component rendering via your own React components

**Verdict: STRONG MATCH.** Purpose-built for exactly this use case. JSON output fits D1 perfectly. Components can use Tailwind + shadcn/ui. Editor UI is customizable but looks good out of the box.

---

### 3.2 Plate.js (platejs.org)

**What it is:** A rich-text editor framework built on Slate.js and React, with 50+ plugins and pre-built shadcn/ui components.

**Version:** 49.x
**License:** MIT (core), some premium templates
**GitHub Stars:** ~13,000+
**NPM Downloads:** ~73,000+/month

**Architecture:**
- Plugin-based system on top of Slate.js
- Each feature (bold, headings, images, tables, columns, drag-and-drop) is a separate plugin
- Pre-built UI components that are literally shadcn/ui components -- direct compatibility
- Slate's document model (JSON tree of nodes)

**Key features:**
- Native shadcn/ui component integration (buttons, dropdowns, popovers use Radix primitives)
- Block-based editing with drag handles, drop indicators
- Multi-column layout support
- AI-powered content generation
- Floating toolbars, slash commands, mentions
- Table editing with resizable columns
- Media embedding with drag-and-drop upload
- Excalidraw drawing blocks

**Limitations for page building:**
- Fundamentally a rich-text editor, not a page builder
- No concept of "page sections" or "hero blocks" -- everything is a document node
- Layout capabilities exist but are constrained to the document model (columns within a text flow)
- No separate sidebar for component selection in the Puck/Squarespace sense
- No visual canvas separate from editing -- it is inline editing only

**Verdict: EXCELLENT for rich text, PARTIAL for page building.** Best-in-class for the text editing portion of the CMS. Native shadcn/ui compatibility is unmatched. But it does not provide the full page-builder experience (sidebar, canvas, block palette, responsive preview). Best used as the rich-text editor within a Puck block.

---

### 3.3 @dnd-kit (dndkit.com)

**What it is:** Low-level drag-and-drop primitives for React. Not an editor or page builder -- a toolkit for building your own.

**Version:** 6.3.1
**License:** MIT
**Bundle size:** ~10KB minified (core), no external dependencies

**Architecture:**
- Hooks-based: `useDraggable`, `useDroppable`, `useSortable`
- Collision detection algorithms (rectangle intersection, closest center, etc.)
- Drag overlay for visual feedback
- Auto-scrolling, constraints, sensors (pointer, keyboard, touch)
- Tree-shakeable, modular packages

**Relevance:**
- This is what you would use to BUILD your own page builder from scratch
- Puck itself uses drag-and-drop internally (similar concept)
- Maximum control, maximum effort
- No UI provided -- you build everything yourself

**Verdict: BUILDING BLOCK, NOT A SOLUTION.** Use this if you want to build a completely custom page builder from the ground up. Estimate: 3-6 months of development for a polished result. Puck gives you 80% of this for free.

---

### 3.4 Craft.js (craft.js.org)

**What it is:** A React framework for building extensible drag-and-drop page editors. Provides the architecture and state management, you build the UI.

**Version:** 0.2.12 (stable, last published ~1 year ago)
**License:** MIT
**GitHub Stars:** ~8,500
**NPM Downloads:** ~233/week (very low)

**Architecture:**
- `<Editor>` component wraps your entire page builder
- `<Frame>` defines the editable canvas
- `useNode()` and `useEditor()` hooks for component interaction
- Node-based state tree stored as JSON
- You build ALL the UI -- sidebar, toolbar, preview, settings panels

**Concerns:**
- Very low npm download numbers suggest limited adoption
- Last major update was a year ago -- development pace has slowed
- Creator is working on a separate project (Reka) for the next-gen state system
- You must build the entire UI yourself -- no default editor interface
- Documentation is adequate but sparse for advanced patterns

**Verdict: AGING AND RISKY.** The framework concept is sound, but the project appears to be in maintenance mode. Low adoption means fewer community resources. Building all UI from scratch negates the benefit of using a framework. Not recommended for a project that wants to move fast.

---

### 3.5 @hello-pangea/dnd (fork of react-beautiful-dnd)

**What it is:** Community-maintained fork of Atlassian's react-beautiful-dnd, providing beautiful list-based drag-and-drop.

**Version:** Actively maintained
**License:** Apache-2.0
**Note:** Original react-beautiful-dnd was archived August 2025

**Architecture:**
- `<DragDropContext>`, `<Droppable>`, `<Draggable>` components
- Optimized for vertical/horizontal list reordering
- Beautiful animations out of the box
- NOT designed for free-form canvas or grid layouts

**Limitations:**
- Designed for list reordering, not page building
- Cannot do two-dimensional drag-and-drop (no grid/canvas)
- No nested drag-and-drop without significant workarounds
- No concept of drop zones, component palettes, or property editors

**Verdict: WRONG TOOL.** Excellent for simple list reordering (e.g., reordering sidebar items, sorting a block list). Not suitable as the foundation for a visual page builder. Could be used as a supplementary tool for block ordering in a simpler editor.

---

### 3.6 Editor.js (editorjs.io)

**What it is:** A block-based editor with a clean JSON output. Each block is an independent contenteditable element provided by a plugin.

**Version:** 2.x
**License:** Apache-2.0

**Architecture:**
- Vanilla JavaScript core with React wrappers available (react-editor-js)
- Block-based: paragraphs, headings, images, lists, quotes, etc.
- Clean JSON output (each block has type + data)
- Plugin ecosystem for custom block types

**Concerns:**
- Core is vanilla JS, not React-native -- the React wrapper is unofficial
- Limited layout capabilities (no columns, no sections)
- No drag-and-drop canvas -- blocks are reordered via drag handles only
- Styling is its own CSS system, not Tailwind or shadcn compatible
- Cannot render complex page sections (hero, card grids, testimonials)
- No property editing sidebar -- editing happens inline only

**Verdict: TOO LIMITED.** Good for blog-style content editing (like a better version of the current TipTap setup), but cannot serve as a page builder. No layout system, no section-level components, no visual canvas.

---

### 3.7 Builder.io SDK (@builder.io/sdk-react)

**What it is:** A SaaS visual editor that provides a React SDK for rendering content. The editor itself is hosted by Builder.io.

**Version:** SDK v5.1.0
**License:** MIT (SDK), proprietary (editor/service)
**Model:** Freemium SaaS

**Architecture:**
- Content is created/edited in Builder.io's hosted visual editor
- SDK fetches content via API and renders it in your React app
- You register your own React components as "custom components"
- Content stored on Builder.io's infrastructure

**Concerns:**
- **Vendor lock-in**: Content lives on Builder.io's servers, not your D1 database
- **SaaS dependency**: Editor is hosted, not self-hosted -- incompatible with full Cloudflare ownership
- **Pricing**: Free tier has limits; paid plans start at $49/month
- **Latency**: Content fetched from Builder.io API adds a network hop
- **Overkill**: Designed for enterprise teams with multiple brands/sites

**Verdict: WRONG MODEL.** The project explicitly wants self-hosted, own-your-data CMS on Cloudflare. Builder.io is a SaaS service that stores content externally. Philosophical and practical mismatch.

---

### 3.8 GrapesJS (grapesjs.com)

**What it is:** A multi-purpose web builder framework for building HTML/CSS templates via visual editing. Has an official React wrapper.

**Version:** 0.22.x (core), @grapesjs/react v2
**License:** BSD-3-Clause
**GitHub Stars:** ~25,000+
**NPM Downloads:** ~94,000/week

**Architecture:**
- Full visual editor with layers panel, style manager, component manager
- Outputs raw HTML + CSS (not JSON component data)
- React wrapper provides hooks but core is vanilla JS
- Plugin-based block system
- Drag-and-drop canvas with responsive preview

**Concerns:**
- **HTML/CSS output**: Stores raw HTML+CSS, not structured JSON blocks. This is the same problem as the current TipTap setup -- opaque content that cannot be rendered differently per context.
- **Not React-native**: Core is vanilla JS with a React wrapper. Components are GrapesJS components, not React components. You cannot use shadcn/ui components as page blocks.
- **Styling conflict**: GrapesJS has its own CSS system that will conflict with Tailwind/shadcn.
- **Visual complexity**: The editor UI is powerful but complex -- designed for web designers building email templates and landing pages, not content editors building pages.
- **Bundle size**: Large (~180KB+ minified for core alone)

**Verdict: POOR FIT.** Despite high popularity, GrapesJS is architecturally wrong for this project. HTML/CSS output does not allow structured rendering. Not React-native. Cannot use shadcn/ui components as blocks. The editor is powerful but too complex for content editors.

---

### 3.9 BlockNote (blocknotejs.org)

**What it is:** A Notion-style block-based rich text editor built on ProseMirror and TipTap.

**Version:** Latest stable
**License:** MPL-2.0 (core), some premium features GPL-3.0

**Architecture:**
- Block-based editing (Notion-style)
- Built on TipTap/ProseMirror -- similar foundation to current setup
- Slash menu, floating toolbar, drag handles
- JSON block output
- Collaborative editing support via Yjs

**Relevance:**
- A significant upgrade over raw TipTap for the text editing experience
- Better default UI than what exists today
- But still fundamentally a text editor, not a page builder
- No concept of hero sections, card grids, or page layout
- Limited to Notion-style content blocks (paragraphs, headings, images, tables)

**Verdict: UPGRADE PATH FOR TEXT EDITING ONLY.** Like Plate.js, this solves the rich text problem well but does not address the page builder need. Since the project already uses TipTap (BlockNote's foundation), this would be an incremental improvement rather than the transformative upgrade being sought.

---

## 4. Detailed Comparison Matrix

| Criterion | Puck | Plate.js | @dnd-kit | Craft.js | GrapesJS | Editor.js | Builder.io | BlockNote |
|-----------|------|----------|----------|----------|----------|-----------|------------|-----------|
| **Visual quality (out of box)** | High | High | N/A (DIY) | N/A (DIY) | Medium | Medium | High | High |
| **Modular block architecture** | Excellent | Good | N/A | Good | Good | Good | Excellent | Limited |
| **Drag-and-drop UX** | Excellent | Good | Excellent | Good | Good | Basic | Excellent | Good |
| **shadcn/ui compatibility** | Good (custom components) | Native | N/A | Possible | Poor | Poor | Possible | Partial |
| **React 18 support** | Yes | Yes | Yes | Yes | Wrapper | Wrapper | Yes | Yes |
| **Bundle size** | ~50-80KB | ~30-60KB (varies by plugins) | ~10KB | ~40KB | ~180KB+ | ~60KB | ~30KB (SDK) | ~40KB |
| **Community activity** | Very active | Very active | Active | Declining | Active | Active | Active | Active |
| **Customizability** | Very high | Very high | Total | Very high | Medium | Medium | Medium | Medium |
| **Content serialization** | JSON (structured) | Slate JSON | N/A | JSON | HTML+CSS | JSON | Proprietary | JSON |
| **Page layout support** | Full (sections, columns) | Partial (columns) | N/A (DIY) | Full (DIY) | Full | None | Full | None |
| **Live preview** | Yes (canvas) | Yes (inline) | N/A | DIY | Yes | No | Yes | Yes (inline) |
| **Responsive preview** | Yes | No | N/A | DIY | Yes | No | Yes | No |
| **Self-hosted** | Yes | Yes | Yes | Yes | Yes | Yes | No (SaaS) | Yes |
| **Tailwind integration** | Official guide exists | Native via shadcn | N/A | Manual | Difficult | Manual | Manual | Limited |

---

## 5. Top 3 Recommended Approaches

### APPROACH A: Puck + Plate.js Hybrid (RECOMMENDED)

**Architecture:** Use Puck as the page-level editor framework for block management, drag-and-drop, and the visual canvas. Use Plate.js as the rich text editor within Puck's text-heavy blocks.

**How it works:**
1. Define a Puck config with block types (Hero, TextBlock, CardGrid, FAQ, CTA, etc.)
2. Each block's `render` function uses your own React components styled with Tailwind + shadcn/ui
3. For blocks that need rich text editing (TextBlock, Hero subtitle, CTA body), embed a Plate.js editor as a custom Puck field type
4. Page data is stored as Puck's JSON in D1 (single `content_json` TEXT column)
5. On the public frontend, use Puck's `<Render>` component with the same config to render published pages

**Pros:**
- Best of both worlds: Puck's page building + Plate's text editing
- Native shadcn/ui throughout (Plate's components ARE shadcn/ui)
- Clean JSON serialization for D1
- Puck's compositional API allows building a fully custom editor UI
- Both libraries are MIT licensed and actively maintained
- Puck's Tailwind v4 guide exists (works with v3 too)
- AI page generation (Puck 0.21) is a bonus feature

**Cons:**
- Two libraries to learn and maintain
- Some integration effort to embed Plate inside Puck's field system
- Puck's default editor UI needs theming to match the dark sidebar of the current admin

**Estimated effort:** 4-6 weeks for a polished MVP with 10-12 block types

---

### APPROACH B: Puck Standalone (STRONG ALTERNATIVE)

**Architecture:** Use Puck alone with its built-in rich text field (introduced in v0.21) for all editing needs.

**How it works:**
1. Same Puck config approach as Approach A
2. Use Puck's new `richText` field type for text editing within blocks
3. Skip the Plate.js dependency entirely
4. Rely on Puck's built-in field types: text, textarea, number, select, radio, richText, array, object, custom

**Pros:**
- Single library, simpler architecture
- Puck 0.21's rich text field may be sufficient for most content editing needs
- Faster to implement initially
- Smaller bundle size
- One data model to understand

**Cons:**
- Rich text editing will be less sophisticated than Plate.js (fewer formatting options, no slash commands, no AI-assisted text editing)
- If rich text needs grow (tables within text, advanced formatting), you may need to add Plate later anyway
- Puck's rich text field is relatively new and may have limitations

**Estimated effort:** 3-4 weeks for a polished MVP

---

### APPROACH C: Custom Build with @dnd-kit + Plate.js (MAXIMUM CONTROL)

**Architecture:** Build a custom page builder from scratch using @dnd-kit for drag-and-drop, Plate.js for rich text, and shadcn/ui for all UI components.

**How it works:**
1. Design your own block data model (JSON array of typed blocks with props)
2. Build a sidebar component palette with @dnd-kit `<Draggable>` items
3. Build a canvas with @dnd-kit `<SortableContext>` for block ordering
4. Build block-specific property panels using shadcn/ui form components
5. Use Plate.js for rich text blocks
6. Build a custom renderer for the public frontend

**Pros:**
- Total design control -- every pixel is yours
- No Puck chrome to override or work around
- shadcn/ui everywhere, perfectly integrated
- Minimal dependencies (just @dnd-kit + Plate)
- Exactly the features you need, no more

**Cons:**
- **Massive development effort**: 3-6 months for equivalent functionality
- Must build all editor infrastructure: undo/redo, copy/paste blocks, responsive preview, drag indicators, collision detection tuning, keyboard shortcuts, accessibility
- Must build your own data model and validation
- Must build your own renderer
- High risk of UX quality gaps without extensive testing
- Must maintain all of this code forever

**Estimated effort:** 3-6 months for a polished result

---

## 6. Ideal Content Module System

Based on analysis of the current WordPress content (72 pages covering ACT training, mindfulness, courses, products, research), here is the recommended block library:

### Tier 1: Essential Blocks (MVP)

| Block | Description | Fields |
|-------|-------------|--------|
| **Hero** | Full-width hero section with background image/color, heading, subtitle, and CTA button | `heading`, `subtitle`, `backgroundImage`, `backgroundColor`, `ctaText`, `ctaLink`, `alignment`, `overlay` |
| **Rich Text** | Full-featured rich text block using Plate.js or Puck richText field | `content` (rich text), `maxWidth` |
| **Image** | Single image with optional caption, alt text, and link | `src`, `alt`, `caption`, `link`, `width`, `alignment` |
| **Card Grid** | Grid of cards for courses, products, team members, research papers | `columns` (2/3/4), `cards[]` with `image`, `title`, `description`, `link`, `badge` |
| **Accordion / FAQ** | Expandable sections, essential for ACT training Q&A | `items[]` with `question`, `answer` |
| **Call to Action** | Prominent CTA section with heading, body text, and button(s) | `heading`, `body`, `primaryButton`, `secondaryButton`, `backgroundColor` |
| **Separator / Spacer** | Visual divider or vertical spacing | `type` (line/dot/none), `height` |
| **Heading** | Standalone heading with anchor link support | `text`, `level` (h1-h4), `alignment` |

### Tier 2: Important Blocks (Post-MVP)

| Block | Description | Fields |
|-------|-------------|--------|
| **Testimonial** | Customer/participant testimonial with quote, name, role, photo | `quote`, `name`, `role`, `image`, `rating` |
| **Image Gallery** | Grid or carousel of images from R2 media library | `images[]`, `layout` (grid/masonry/carousel), `columns` |
| **Video Embed** | YouTube/Vimeo embed with responsive container | `url`, `title`, `autoplay`, `aspectRatio` |
| **Two Column** | Side-by-side content layout (e.g., image + text) | `leftContent` (slot), `rightContent` (slot), `ratio` (50/50, 60/40, etc.) |
| **Feature List** | Icon + text feature highlights (for course benefits, ACT principles) | `items[]` with `icon`, `title`, `description` |
| **Contact Form** | Embedded contact form (connects to existing API) | `title`, `description`, `fields` config |
| **Embed / Custom HTML** | Raw HTML/embed code for third-party widgets | `html`, `sandbox` (boolean) |

### Tier 3: Domain-Specific Blocks (Livskompass-specific)

| Block | Description | Fields |
|-------|-------------|--------|
| **Course Card** | Dynamic course listing that pulls from the courses API | `filter` (upcoming/all), `maxItems`, `layout` |
| **Product Showcase** | Product cards pulling from the products API | `filter` (type/status), `maxItems` |
| **Research Citation** | Formatted research paper citation with link | `authors`, `title`, `journal`, `year`, `doi`, `link` |
| **Audio Player** | Mindfulness exercise audio player (for the CD content) | `src`, `title`, `description`, `duration` |
| **Booking CTA** | Course booking call-to-action linked to specific course | `courseId`, `heading`, `description`, `buttonText` |
| **Quote Block** | Styled blockquote for key ACT/mindfulness concepts | `quote`, `attribution`, `style` (minimal/bordered/highlighted) |

### Block Properties Common to All Blocks

Every block should have these meta-properties managed by the editor:

- `id` -- Unique block identifier (auto-generated)
- `marginTop` / `marginBottom` -- Spacing control
- `maxWidth` -- Content width constraint (narrow/medium/full)
- `backgroundColor` -- Optional background color
- `anchor` -- Optional anchor ID for in-page navigation
- `visibility` -- Desktop/tablet/mobile visibility toggles

---

## 7. Data Architecture & Serialization

### Recommended Schema Change

```sql
-- Current: single HTML content field
-- pages.content TEXT  -- raw HTML from TipTap

-- Proposed: add a JSON content field alongside HTML for migration
ALTER TABLE pages ADD COLUMN content_json TEXT;  -- Puck JSON data
ALTER TABLE pages ADD COLUMN editor_version TEXT DEFAULT 'tiptap';  -- 'tiptap' or 'puck'
```

During migration, pages can have either `content` (legacy HTML) or `content_json` (new Puck JSON). The `editor_version` field tells the frontend which renderer to use.

### Puck JSON Structure (stored in D1)

```json
{
  "content": [
    {
      "type": "Hero",
      "props": {
        "id": "hero-abc123",
        "heading": "ACT & Mindfulness",
        "subtitle": "Evidensbaserad psykologisk behandling",
        "backgroundImage": "/media/uploads/hero-bg.jpg",
        "ctaText": "Se utbildningar",
        "ctaLink": "/utbildningar",
        "alignment": "center",
        "overlay": 0.4
      }
    },
    {
      "type": "RichText",
      "props": {
        "id": "text-def456",
        "content": "<p>Livskompass erbjuder utbildningar och material...</p>"
      }
    },
    {
      "type": "CardGrid",
      "props": {
        "id": "cards-ghi789",
        "columns": 3,
        "cards": [
          {
            "image": "/media/uploads/course1.jpg",
            "title": "ACT Gruppledarutbildning",
            "description": "Lar dig leda ACT-grupper",
            "link": "/utbildningar/act-gruppledarutbildning",
            "badge": "Populart"
          }
        ]
      }
    },
    {
      "type": "FAQ",
      "props": {
        "id": "faq-jkl012",
        "items": [
          {
            "question": "Vad ar ACT?",
            "answer": "Acceptance and Commitment Therapy..."
          }
        ]
      }
    }
  ],
  "root": {
    "props": {
      "title": "Startsida"
    }
  },
  "zones": {}
}
```

### Rendering Pipeline

```
D1 Database                    Admin Panel                   Public Frontend
     |                              |                              |
     | content_json (TEXT)           |                              |
     |----------------------------->|                              |
     |                    Puck <Editor>                             |
     |                    (drag & drop)                             |
     |                              |                              |
     |<----- save JSON ------------|                              |
     |                                                             |
     |------------------------------- content_json --------------->|
     |                                                             |
     |                                                   Puck <Render>
     |                                                   (same config)
     |                                                   React components
     |                                                   Tailwind CSS
```

---

## 8. Design Inspiration & Visual Standards

### Gold Standard References

The following existing products represent the quality bar the CMS should aim for:

**1. Squarespace Editor (squarespace.com)**
- Clean modal overlays for block settings
- Subtle hover states revealing edit handles
- Smooth spring animations on drag operations
- Minimal chrome -- the content IS the interface
- Muted color palette that does not compete with content

**2. Webflow Designer (webflow.com)**
- Left panel: layers/navigator tree
- Right panel: element-specific settings
- Responsive breakpoint toggles in the top bar
- Clean typography-focused property panels
- Professional-grade spacing and alignment controls

**3. Notion (notion.so)**
- Slash command menu for block insertion
- Drag handles appear on hover (left side of blocks)
- Inline editing -- click to type, no mode switching
- Block type conversion (turn a paragraph into a heading)
- Clean, typographic interface with generous whitespace

**4. Framer (framer.com)**
- Glass-morphism panels with subtle blur effects
- Smooth drag-and-drop with spring physics
- Component variants displayed in a palette
- Real-time preview that matches the final output
- Dark mode interface that makes content pop

**5. Linear App (linear.app)**
- Not a page builder, but the gold standard for admin UI aesthetics
- Command palette (Cmd+K) for quick actions
- Keyboard-first interaction model
- Subtle animations on state transitions
- Consistent 4px/8px spacing grid
- Muted gray palette with strategic color accents

### Design Principles for Livskompass CMS

**1. Content-First Canvas**
- The center canvas should show the page as close to final output as possible
- Editing chrome (handles, outlines, menus) should appear on hover/selection only
- Use subtle blue outlines for selected blocks, dotted outlines for hover
- Drop zones should show smooth animated indicators, not jarring placeholders

**2. Sidebar Architecture**
```
+------------------+----------------------------------------+------------------+
|                  |                                        |                  |
|  Left Sidebar    |           Canvas / Preview             |  Right Sidebar   |
|                  |                                        |                  |
|  - Block palette |  [Responsive toggle: Desktop/Tablet/   |  - Block props   |
|  - Page outline  |   Mobile]                              |  - Style options |
|  - Media library |                                        |  - SEO settings  |
|                  |  +----------------------------------+  |  - Publish ctrl  |
|                  |  |                                  |  |                  |
|                  |  |   Visual page preview with       |  |                  |
|                  |  |   draggable blocks               |  |                  |
|                  |  |                                  |  |                  |
|                  |  +----------------------------------+  |                  |
|                  |                                        |                  |
+------------------+----------------------------------------+------------------+
```

**3. Block Palette Design**
- Organized by category: Layout, Content, Media, Interactive, Dynamic
- Each block type shown as a small preview card with icon + label
- Drag from palette to canvas, or click to append
- Search/filter blocks by name
- Recently used blocks pinned at top

**4. Property Panel Design**
- Appears on right when a block is selected
- Organized into collapsible sections (Content, Style, Advanced)
- Uses shadcn/ui form components throughout
- Color pickers, image selectors, link pickers
- Real-time preview updates as properties change

**5. Animation & Interaction Details**
- Drag indicators: smooth blue line appears between blocks during drag
- Block selection: subtle scale(1.005) + blue border on click
- Panel transitions: 200ms ease-out slide animations
- Loading states: skeleton shimmer matching current admin style
- Success feedback: subtle green flash on save, toast notifications

**6. Color System**
- Editor chrome: gray-950 (matching current sidebar), gray-900 panels
- Canvas background: white (matching final output)
- Accent: primary-600 (sky blue, matching existing theme)
- Selection: primary-400/20 background tint
- Danger: red-500 for delete actions
- Success: emerald-500 for publish/save confirmation

**7. Typography**
- Use Inter or the system font stack already in Tailwind
- Block labels: text-xs font-medium text-gray-500 uppercase tracking-wide
- Property labels: text-sm font-medium text-gray-700
- Canvas content: actual site fonts at actual sizes

---

## 9. Migration Path from Current System

### Phase 1: Foundation (Week 1-2)
1. Install Puck (`@puckeditor/core`) in `packages/admin`
2. Define the initial Puck config with 4-5 basic block types (Hero, RichText, Image, Separator, CTA)
3. Create a new `PageBuilderEditor.tsx` component alongside the existing `PageEditor.tsx`
4. Add `content_json` and `editor_version` columns to the pages table
5. Route: existing pages continue using TipTap; new pages get the option to use the page builder

### Phase 2: Block Library (Week 3-4)
1. Build out all Tier 1 blocks with Tailwind + shadcn/ui styling
2. Integrate Plate.js (if using Approach A) for rich text fields
3. Connect media library integration (R2 image picker within Puck blocks)
4. Build the corresponding `<Render>` configuration for the public frontend
5. Test all blocks at all responsive breakpoints

### Phase 3: Polish & Migration (Week 5-6)
1. Customize Puck's editor UI using overrides and compositional API
2. Apply the dark theme to match the existing admin sidebar aesthetic
3. Add responsive preview toggles
4. Build a migration utility to convert legacy HTML pages to Puck JSON (semi-automated -- complex pages may need manual reconstruction)
5. Migrate high-priority pages first (homepage, course pages, contact page)
6. Add Tier 2 blocks as needed

### Phase 4: Enhancement (Post-launch)
1. Add Tier 3 domain-specific blocks
2. Add page templates (pre-configured block arrangements)
3. Add undo/redo history visualization
4. Add block-level version history
5. Explore Puck's AI page generation feature

### Data Migration Strategy

For the 72 existing WordPress-migrated pages stored as HTML:

1. **Keep HTML rendering working**: The public frontend should detect `editor_version` and render either raw HTML (legacy) or Puck JSON (new)
2. **Gradual migration**: No need to convert all pages at once. Focus on pages that need visual updates.
3. **Semi-automated conversion**: Build a utility that parses HTML and creates approximate Puck JSON (e.g., `<h1>` becomes a Heading block, `<p>` sections become RichText blocks, `<img>` become Image blocks). Manual refinement will be needed for complex layouts.
4. **No data loss**: Original HTML is preserved in the `content` column; new JSON goes in `content_json`.

---

## 10. Final Recommendation

### Go with Approach A: Puck + Plate.js Hybrid

**Primary reasons:**

1. **Puck is purpose-built for this exact use case.** It is a React-native visual page builder with JSON output, MIT license, active maintenance, and a compositional API that allows full UI customization. No other library in the ecosystem provides this combination.

2. **Plate.js is the only editor with native shadcn/ui components.** Since the project already uses shadcn/ui, Plate's components will integrate seamlessly with zero style conflicts. This matters for the "premium, not generic" design goal.

3. **JSON data model fits D1 perfectly.** Puck outputs clean, structured JSON that can be stored as TEXT in SQLite. The data is portable, versionable, and inspectable. Unlike HTML blobs, you can query and transform individual blocks programmatically.

4. **The combination covers the full spectrum.** Puck handles page-level concerns (layout, sections, block ordering, responsive preview). Plate handles text-level concerns (formatting, links, lists, inline images). Neither tool alone covers both levels well.

5. **The migration path is incremental.** Existing pages keep working with the current HTML renderer. New pages use the page builder. Migration can happen page-by-page over time.

6. **Both libraries are actively maintained and growing.** Puck has ~9,700 GitHub stars and growing rapidly with regular releases. Plate has ~13,000 stars and 73,000+ monthly npm downloads. Neither shows signs of abandonment.

### If simplicity is prioritized, go with Approach B: Puck Standalone

Use Puck alone with its built-in rich text field if the rich text editing needs are modest (no tables in text, no slash commands, no AI text assistance needed). This saves integration complexity and can always be upgraded to Approach A later.

### Do NOT pursue Approach C: Custom Build

The development time (3-6 months) and ongoing maintenance burden of a fully custom page builder is not justified when Puck provides 80%+ of the needed functionality out of the box. The time saved should be invested in building beautiful, polished block components and perfecting the content editing experience.

---

## Appendix: Key Links

- Puck documentation: https://puckeditor.com/docs
- Puck GitHub: https://github.com/puckeditor/puck
- Puck + Tailwind v4 guide: https://puckeditor.com/blog/how-to-build-a-react-page-builder-puck-and-tailwind-4
- Puck data model: https://puckeditor.com/docs/api-reference/data-model/data
- Puck custom interfaces: https://puckeditor.com/docs/extending-puck/custom-interfaces
- Puck UI overrides: https://puckeditor.com/docs/extending-puck/ui-overrides
- Plate.js documentation: https://platejs.org/docs
- Plate.js shadcn/ui components: https://platejs.org/docs/components
- Plate.js drag & drop: https://platejs.org/docs/dnd
- @dnd-kit documentation: https://docs.dndkit.com/
- Craft.js: https://craft.js.org/
- GrapesJS React: https://github.com/GrapesJS/react
- Editor.js: https://editorjs.io/
- BlockNote: https://www.blocknotejs.org/
- Builder.io SDK: https://github.com/BuilderIO/builder
- @hello-pangea/dnd: https://github.com/hello-pangea/dnd
