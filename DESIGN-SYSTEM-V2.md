# Livskompass Design System V2

> **Design vision**: A well-designed meditation room — not a wellness blog, not a corporate site. Every element earns its place through restraint. Massive whitespace lets content breathe. Color is used as punctuation, not decoration. Typography creates hierarchy through scale contrast, not ornament. Surfaces are quiet until interacted with. The aesthetic says: *someone thoughtful made this.*

---

## 1. Typography

### Font Pairing

| Role | Family | Source | Weights |
|---|---|---|---|
| **Display / Headings** | Instrument Serif | Google Fonts | 400, 400 italic |
| **Body / UI** | Inter | Google Fonts | 400, 450, 500, 600 |

**Why Instrument Serif**: Refined without being ornamental. Contemplative and literary — perfect for a mindfulness brand. Beautiful italics for testimonials and pull quotes. Unlike Fraunces (which reads "artisan craft"), Instrument Serif reads "considered editorial." It carries weight at large sizes without needing bold weights.

**Why Inter stays**: One of the best-designed sans-serifs ever made. No reason to swap. It handles Swedish characters (å, ä, ö) beautifully and is optimized for screen rendering at all sizes.

**Google Fonts URL:**
```
https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:opsz,wght@14..32,400..600&display=swap
```

### Fluid Type Scale

All sizes use `clamp()` for smooth scaling between 375px and 1440px viewports.

| Token | Min | Max | Font | Weight | Use |
|---|---|---|---|---|---|
| `--type-display` | 48px (3rem) | 80px (5rem) | Instrument Serif | 400 | Hero headings only |
| `--type-h1` | 36px (2.25rem) | 56px (3.5rem) | Instrument Serif | 400 | Page titles |
| `--type-h2` | 28px (1.75rem) | 40px (2.5rem) | Instrument Serif | 400 | Section headings |
| `--type-h3` | 22px (1.375rem) | 28px (1.75rem) | Inter | 600 | Subsection headings |
| `--type-h4` | 18px (1.125rem) | 21px (1.3125rem) | Inter | 600 | Card titles, labels |
| `--type-body-lg` | 19px | 19px | Inter | 400 | Lead paragraphs |
| `--type-body` | 17px | 17px | Inter | 400 | Body text |
| `--type-body-sm` | 15px | 15px | Inter | 400 | Secondary text |
| `--type-caption` | 13px | 13px | Inter | 500 | Metadata, timestamps |
| `--type-overline` | 12px | 12px | Inter | 500 | Category labels |

**CSS clamp formulas** (viewport range 375px–1440px):
```css
--type-display:  clamp(3rem, 2rem + 3.333vw, 5rem);
--type-h1:       clamp(2.25rem, 1.625rem + 2.083vw, 3.5rem);
--type-h2:       clamp(1.75rem, 1.417rem + 1.111vw, 2.5rem);
--type-h3:       clamp(1.375rem, 1.208rem + 0.556vw, 1.75rem);
--type-h4:       clamp(1.125rem, 1.042rem + 0.278vw, 1.3125rem);
--type-body-lg:  1.1875rem;
--type-body:     1.0625rem;
--type-body-sm:  0.9375rem;
--type-caption:  0.8125rem;
--type-overline: 0.75rem;
```

### Letter Spacing

| Level | Value | Rationale |
|---|---|---|
| Display | `-0.035em` | Tight tracking for impact at massive sizes |
| H1 | `-0.025em` | Slightly looser than display |
| H2 | `-0.02em` | Comfortable reading at section-heading size |
| H3 | `-0.015em` | Subtle tightening for Inter semibold |
| H4 | `-0.01em` | Near-default |
| Body | `0` | Default — Inter's native spacing is already optimal |
| Overline | `0.1em` | Wide tracking for uppercase micro-labels |

### Line Height

| Level | Value |
|---|---|
| Display | `1.05` |
| H1 | `1.1` |
| H2 | `1.2` |
| H3 | `1.25` |
| H4 | `1.3` |
| Body-lg | `1.6` |
| Body | `1.65` |
| Body-sm | `1.6` |
| Caption | `1.5` |

### Weight Rules

- **Display / H1 / H2**: Instrument Serif 400 — the font's natural weight is elegant at large sizes; bold would be crude
- **H3 / H4**: Inter 600 — semibold sans creates hierarchy shift from serif headings above
- **Body**: Inter 400 (regular)
- **Body emphasis**: Inter 500 (medium) — for inline emphasis, metadata values
- **Buttons / Labels**: Inter 500 (medium)
- **Strong / Bold**: Inter 600 (semibold)
- **Overline**: Inter 500, uppercase

### Font assignment rule

Instrument Serif is reserved for sizes `--type-h2` and above. Everything at `--type-h3` and below uses Inter. This prevents the serif from looking fragile at small sizes and creates a clean two-tier hierarchy: serif carries the big moments, sans carries the details.

---

## 2. Color System

### Design principle

Two color families. That's it. **Forest green** for brand identity and interactive elements. **Warm stone** for backgrounds and text. One optional **amber** accent for high-emphasis CTAs and pricing highlights — used surgically, not scattered.

The palette is inspired by natural Nordic materials: deep pine forest, sandstone, aged brass. Every color should feel like it came from the landscape, not from a neon sign.

### Forest (Primary)

The brand color. Used for interactive elements, emphasis, and identity.

| Token | Hex | Use |
|---|---|---|
| `--forest-950` | `#0A1A10` | Headings on light backgrounds (near-black with green warmth) |
| `--forest-900` | `#132B1C` | Dark heading variant |
| `--forest-800` | `#1C3D29` | — |
| `--forest-700` | `#275137` | — |
| `--forest-600` | `#326647` | **Primary button bg, links, active states** |
| `--forest-500` | `#3E7B57` | Button hover state |
| `--forest-400` | `#5C9873` | Secondary interactive elements |
| `--forest-300` | `#84B496` | Decorative accents, borders |
| `--forest-200` | `#B0D1BC` | Light accent backgrounds |
| `--forest-100` | `#D7E9DD` | Badge backgrounds, subtle fills |
| `--forest-50` | `#ECF5EF` | Surface tint, hover backgrounds |

### Stone (Neutral)

The foundation. Backgrounds, text, borders — everything structural.

| Token | Hex | Use |
|---|---|---|
| `--stone-950` | `#1A1816` | Primary body text (near-black, warm) |
| `--stone-900` | `#2C2924` | Secondary dark text |
| `--stone-800` | `#403C36` | — |
| `--stone-700` | `#575249` | Secondary text, labels |
| `--stone-600` | `#6E685E` | Muted text |
| `--stone-500` | `#8A847A` | Placeholder text, disabled |
| `--stone-400` | `#A9A49B` | Input placeholders |
| `--stone-300` | `#C8C4BC` | Borders, dividers |
| `--stone-200` | `#E2DFD9` | Subtle borders, card outlines |
| `--stone-100` | `#EFECE7` | Alternate section background |
| `--stone-50` | `#F8F6F2` | **Page background** (warm cream) |

### Amber (Accent)

Warm brass / sandstone tone. Used ONLY for: primary CTA emphasis, pricing highlights, booking buttons, success badges. Maximum 2-3 instances per page.

| Token | Hex | Use |
|---|---|---|
| `--amber-600` | `#8C6534` | Dark accent text |
| `--amber-500` | `#A67B4A` | **Accent button bg, highlighted pricing** |
| `--amber-400` | `#C0955F` | Accent hover state |
| `--amber-300` | `#D5B68A` | Light decorative accent |
| `--amber-200` | `#EAD5B5` | Badge backgrounds |
| `--amber-100` | `#F4EADB` | Surface tint |
| `--amber-50` | `#FBF5EC` | Lightest accent surface |

### Semantic

| State | Foreground | Background |
|---|---|---|
| Success | `#2F7A42` | `#EFF7F1` |
| Warning | `#A67B4A` | `#FBF5EC` (same as amber) |
| Error | `#C43B32` | `#FEF1F0` |
| Info | `#2E6FA0` | `#EFF5FB` |

### Surface Colors

| Token | Value | Use |
|---|---|---|
| `--surface-primary` | `#F8F6F2` | Main page background |
| `--surface-secondary` | `#EFECE7` | Alternating sections, sidebar |
| `--surface-elevated` | `#FFFFFF` | Cards, dropdowns, modals |
| `--surface-glass` | `rgba(248, 246, 242, 0.72)` | Frosted nav, floating elements |
| `--surface-glass-border` | `rgba(200, 196, 188, 0.25)` | Glass element borders |
| `--surface-overlay` | `rgba(10, 26, 16, 0.6)` | Image overlays, modals |
| `--surface-overlay-heavy` | `rgba(10, 26, 16, 0.8)` | Dark image overlays |

### Gradient Definitions

```css
/* Hero gradient — deep forest sweep */
--gradient-hero: linear-gradient(145deg, #0A1A10 0%, #1C3D29 45%, #275137 100%);

/* Subtle page section transition */
--gradient-section: linear-gradient(180deg, var(--surface-primary) 0%, var(--surface-secondary) 100%);

/* Radial glow — for hero accent lighting */
--gradient-glow: radial-gradient(ellipse 60% 50% at 80% 20%, rgba(62, 123, 87, 0.12) 0%, transparent 70%);

/* Card shimmer on hover */
--gradient-shimmer: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.04) 50%, transparent 100%);
```

---

## 3. Spacing & Layout

### Section Padding Scale

Generous vertical rhythm is what separates premium from template. These values use `clamp()` between 375px and 1440px viewports.

| Token | Mobile | Desktop | CSS |
|---|---|---|---|
| `--section-xs` | 32px | 64px | `clamp(2rem, 1rem + 3.333vw, 4rem)` |
| `--section-sm` | 48px | 80px | `clamp(3rem, 2rem + 3.333vw, 5rem)` |
| `--section-md` | 64px | 112px | `clamp(4rem, 2.667rem + 4.444vw, 7rem)` |
| `--section-lg` | 80px | 144px | `clamp(5rem, 3rem + 6.667vw, 9rem)` |
| `--section-xl` | 96px | 168px | `clamp(6rem, 3.333rem + 8.889vw, 10.5rem)` |

**Usage guide:**
- Hero sections: `--section-xl` padding
- Major content sections: `--section-lg` padding
- Standard sections: `--section-md` padding
- Tight sections (FAQ, form): `--section-sm` padding
- Within-section gaps: `--section-xs`

### Component Gap Scale

| Token | Value | Use |
|---|---|---|
| `--gap-xs` | `0.5rem` (8px) | Inline icon + text, tight groups |
| `--gap-sm` | `0.75rem` (12px) | List items, input + label |
| `--gap-md` | `1rem` (16px) | Card internal padding gutters |
| `--gap-lg` | `1.5rem` (24px) | Card grid gaps, form fields |
| `--gap-xl` | `2rem` (32px) | Section subsections |
| `--gap-2xl` | `3rem` (48px) | Major visual breaks |
| `--gap-3xl` | `4rem` (64px) | Between section header and content |

### Grid & Content Width

| Token | Value | Use |
|---|---|---|
| `--width-content` | `1280px` | Standard content max-width |
| `--width-wide` | `1440px` | Full-bleed card grids, hero overlays |
| `--width-narrow` | `720px` | Prose, forms, focused reading |
| `--width-prose` | `65ch` | Optimal line length for rich text |

### Container Padding (responsive)

```css
--container-px: clamp(1rem, 0.5rem + 2vw, 4rem);
/* Results in: 16px (375px) → 24px (sm) → 32px (md) → 48px (lg) → 64px (xl) */
```

### Responsive Breakpoints

| Name | Value | Purpose |
|---|---|---|
| `sm` | `640px` | Small tablets |
| `md` | `768px` | Tablets, layout switches |
| `lg` | `1024px` | Desktop nav breakpoint |
| `xl` | `1280px` | Wide desktop |
| `2xl` | `1536px` | Ultra-wide |

---

## 4. Motion & Animation

### Design principle

Motion should feel like breathing — gradual, intentional, calming. No bouncing, no snapping, no flashy reveals. Everything eases out exponentially (fast start, gentle deceleration) because that's how natural objects move.

### Easing Curves

| Token | Value | Character | Use |
|---|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Exponential deceleration | Entrance animations, reveals, dropdowns |
| `--ease-in-out` | `cubic-bezier(0.45, 0, 0.55, 1)` | Symmetric smooth | General UI transitions, color changes |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Subtle overshoot | Button press feedback only |
| `--ease-gentle` | `cubic-bezier(0.4, 0, 0.2, 1)` | Material-inspired | Hover states, micro-interactions |

### Duration Standards

| Token | Value | Use |
|---|---|---|
| `--duration-instant` | `100ms` | Color changes, opacity toggles |
| `--duration-fast` | `200ms` | Button hover/active, focus rings |
| `--duration-normal` | `350ms` | Dropdown open/close, card hover lift |
| `--duration-slow` | `500ms` | Image scale on card hover, section fade |
| `--duration-reveal` | `700ms` | Scroll-triggered entrance animations |
| `--duration-dramatic` | `1000ms` | Hero entrance, page load animation |

### Keyframe Animations

```css
/* Primary entrance — content coming into view */
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Subtle fade without movement */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Scale from slightly smaller — for cards, modals */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Horizontal slide — for staggered grid items */
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Hero text entrance — dramatic, slow */
@keyframes hero-enter {
  from {
    opacity: 0;
    transform: translateY(32px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Divider line expand */
@keyframes line-expand {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

### Scroll-Triggered Reveals

Use `IntersectionObserver` with `threshold: 0.15` and `rootMargin: "0px 0px -60px 0px"`.

```
Default behavior:
- Element starts: opacity 0, translateY(24px)
- On intersect: animate to opacity 1, translateY(0)
- Duration: 700ms
- Easing: var(--ease-out)
- Once visible → stays visible (one-shot, no exit animation)

Stagger pattern for grids/lists:
- Each child delays by 80ms × index
- Maximum stagger: 5 items (400ms total)
- Items beyond 5 use the same 400ms delay

CSS utility classes:
- .reveal — base reveal class (sets initial hidden state)
- .reveal-visible — applied when intersected (triggers animation)
- .reveal-stagger-1 through .reveal-stagger-5 — delay modifiers
```

### Hover Interactions

| Element | Effect | Duration | Easing |
|---|---|---|---|
| Card | `translateY(-4px)`, shadow-sm → shadow-lg | 350ms | ease-out |
| Button (primary) | brightness(1.05), shadow boost, translateY(-1px) | 200ms | ease-gentle |
| Button (active) | translateY(0), shadow-xs, brightness(0.95) | 100ms | ease-spring |
| Nav link | Underline slides in from left (using `background-size`) | 300ms | ease-out |
| Image in card | `scale(1.03)` | 500ms | ease-out |
| Icon in feature card | `translateY(-2px)`, color shift to forest-600 | 300ms | ease-gentle |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .reveal {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

---

## 5. Surfaces & Depth

### Shadow Scale

All shadows use a green-tinted black (`rgba(10, 26, 16, ...)`) instead of pure black. This creates shadows that feel organic and harmonious with the forest palette rather than harsh and digital.

| Token | Value | Use |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(10, 26, 16, 0.05)` | Subtle lift, input focus ring inner |
| `--shadow-sm` | `0 2px 4px rgba(10, 26, 16, 0.04), 0 1px 2px rgba(10, 26, 16, 0.06)` | Default card resting state |
| `--shadow-md` | `0 4px 12px rgba(10, 26, 16, 0.05), 0 2px 4px rgba(10, 26, 16, 0.06)` | Card hover, dropdowns |
| `--shadow-lg` | `0 8px 24px rgba(10, 26, 16, 0.07), 0 4px 8px rgba(10, 26, 16, 0.05)` | Modals, popovers |
| `--shadow-xl` | `0 16px 48px rgba(10, 26, 16, 0.1), 0 8px 16px rgba(10, 26, 16, 0.05)` | Hero floating elements |
| `--shadow-glow` | `0 0 0 1px rgba(62, 123, 87, 0.15), 0 4px 16px rgba(62, 123, 87, 0.1)` | Focus rings, accent highlights |
| `--shadow-amber` | `0 2px 8px rgba(166, 123, 74, 0.2), 0 1px 3px rgba(166, 123, 74, 0.15)` | Accent button shadow |

### Radius Scale

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | `4px` | Tags, small badges |
| `--radius-sm` | `6px` | Code blocks, tooltips |
| `--radius-md` | `10px` | Input fields, small cards |
| `--radius-lg` | `14px` | Dropdown menus, medium panels |
| `--radius-xl` | `20px` | Primary cards, sections |
| `--radius-2xl` | `24px` | Hero overlays, featured cards |
| `--radius-full` | `9999px` | Buttons (pill), badges, avatars |

### Card Variants

#### 1. Elevated (default card)
```
background: var(--surface-elevated)           /* #FFFFFF */
border: 1px solid var(--stone-200)            /* #E2DFD9 */
border-radius: var(--radius-xl)               /* 20px */
box-shadow: var(--shadow-sm)
padding: 28px                                  /* or 32px on desktop */

Hover:
  box-shadow: var(--shadow-md)
  transform: translateY(-4px)
  border-color: var(--stone-300)
  transition: all 350ms var(--ease-out)
```

#### 2. Glass (premium floating elements)
```
background: rgba(255, 255, 255, 0.6)
border: 1px solid rgba(255, 255, 255, 0.2)
border-radius: var(--radius-xl)               /* 20px */
backdrop-filter: blur(20px) saturate(1.4)
-webkit-backdrop-filter: blur(20px) saturate(1.4)
box-shadow: var(--shadow-sm)

Use for: featured testimonials, floating CTAs,
overlay panels on image heroes
```

#### 3. Flat (subtle containers)
```
background: var(--stone-50)                   /* or transparent */
border: 1px solid var(--stone-200)
border-radius: var(--radius-lg)               /* 14px */
box-shadow: none

Use for: FAQ items, form sections, sidebar groups
```

#### 4. Accent (highlighted content)
```
background: var(--forest-50)                  /* #ECF5EF */
border: 1px solid var(--forest-100)           /* #D7E9DD */
border-radius: var(--radius-xl)               /* 20px */
box-shadow: none

Use for: featured course cards, important notices,
testimonial highlights
```

### Backdrop Blur Values

| Context | Blur | Saturate | Background alpha |
|---|---|---|---|
| Sticky navigation | `16px` | `1.8` | `0.72` |
| Glass cards | `20px` | `1.4` | `0.6` |
| Mobile menu overlay | `12px` | `1.2` | `0.85` |
| Image overlay text | `8px` | `1.0` | `0.5` |

### Border Treatments

- **Default border**: `1px solid var(--stone-200)` — barely visible, structural
- **Hover border**: `1px solid var(--stone-300)` — slightly more defined
- **Active/focus border**: `1.5px solid var(--forest-400)` — clear focus indicator
- **Divider line**: `1px solid var(--stone-200)` — between sections/list items
- **Accent border**: `3px solid var(--forest-300)` — blockquote left border, feature highlight

---

## 6. Component Patterns

### Navigation (Sticky Header)

```
Height: 64px (mobile), 72px (desktop)
Background: var(--surface-glass)  — rgba(248, 246, 242, 0.72)
Backdrop: blur(16px) saturate(1.8)
Border-bottom: 1px solid var(--surface-glass-border) — rgba(200, 196, 188, 0.25)
Box-shadow: none (the frosted border is enough)
Z-index: 50
Max-width: var(--width-wide) centered
Padding: 0 var(--container-px)

Logo:
  Font: Instrument Serif, 22px (1.375rem), weight 400
  Color: var(--forest-950)
  Letter-spacing: -0.01em
  No icon — wordmark only ("Livskompass")

Desktop nav links:
  Font: Inter 500, 15px
  Color: var(--stone-600)
  Hover: var(--forest-600)
  Transition: color 200ms var(--ease-gentle)

Active link indicator:
  Color: var(--forest-600)
  Underline: 2px solid var(--forest-600)
  Underline-offset: 6px
  Animated: background-size from 0% to 100% on hover, 300ms ease-out

Dropdown (desktop):
  Background: var(--surface-elevated)
  Border: 1px solid var(--stone-200)
  Border-radius: var(--radius-lg) (14px)
  Box-shadow: var(--shadow-lg)
  Padding: 8px
  Animation: scale-in, 200ms ease-out, transform-origin top

Mobile hamburger: 24×24, var(--stone-700), rounded tap target 44×44
Mobile menu panel:
  Background: var(--surface-glass) with blur(12px)
  Border-top: 1px solid var(--stone-200)
  Animation: fade-up, 300ms ease-out
```

### Hero Patterns

#### Gradient Hero (primary)
```
Background: var(--gradient-hero) — linear-gradient(145deg, #0A1A10 0%, #1C3D29 45%, #275137 100%)
Overlay: var(--gradient-glow) layered on top — subtle radial light in upper-right
No SVG patterns. No dot grids. The gradient and typography do the work.

Padding: var(--section-xl) top and bottom
Text color: white

Heading: Instrument Serif 400
  Size: var(--type-display) — 48px → 80px
  Letter-spacing: -0.035em
  Line-height: 1.05
  Max-width: 14ch for short dramatic lines, 20ch for longer titles
  Animation: hero-enter, 1000ms ease-out, delay 100ms

Subheading: Inter 400
  Size: var(--type-body-lg) — 19px
  Color: rgba(255, 255, 255, 0.75)
  Max-width: 540px
  Line-height: 1.6
  Animation: hero-enter, 1000ms ease-out, delay 300ms

CTA buttons:
  Animation: hero-enter, 1000ms ease-out, delay 500ms
```

#### Image Hero
```
Full-bleed background image, object-fit cover
Overlay: linear-gradient(to top, rgba(10, 26, 16, 0.75) 0%, rgba(10, 26, 16, 0.2) 60%, rgba(10, 26, 16, 0.35) 100%)
Text and layout same as gradient hero
Image loads with fade-in, 500ms
```

#### Light Hero (internal pages)
```
Background: var(--surface-primary) — #F8F6F2
No gradient, no overlay.
Text color: var(--forest-950)

Heading: Instrument Serif 400
  Size: var(--type-h1)
  Color: var(--forest-950)

Subheading: Inter 400
  Size: var(--type-body-lg)
  Color: var(--stone-600)

Padding: var(--section-md) top, var(--section-sm) bottom
Optional: thin decorative line below (line-expand animation)
```

### Button Hierarchy

#### Primary (main CTA)
```
Background: var(--forest-600) — #326647
Color: white
Height: 48px (default) | 40px (sm) | 56px (lg)
Padding: 0 28px (default) | 0 20px (sm) | 0 36px (lg)
Border-radius: var(--radius-full) — pill shape
Font: Inter 500, 15px (default) | 14px (sm) | 16px (lg)
Letter-spacing: 0
Box-shadow: 0 1px 3px rgba(50, 102, 71, 0.2), 0 1px 2px rgba(50, 102, 71, 0.12)

Hover:
  Background: var(--forest-500) — #3E7B57
  Box-shadow: 0 4px 12px rgba(50, 102, 71, 0.2), 0 2px 4px rgba(50, 102, 71, 0.12)
  Transform: translateY(-1px)

Active:
  Background: var(--forest-700) — #275137
  Box-shadow: var(--shadow-xs)
  Transform: translateY(0)

Transition: all 200ms var(--ease-gentle)
```

#### Secondary (outline)
```
Background: transparent
Border: 1.5px solid var(--stone-300)
Color: var(--forest-950) — #0A1A10
Same height/padding/radius as primary

Hover:
  Background: var(--stone-100) — #EFECE7
  Border-color: var(--stone-400)

Active:
  Background: var(--stone-200)
```

#### Ghost (minimal)
```
Background: transparent
Border: none
Color: var(--forest-600)
Padding: 0 16px (more compact)

Hover:
  Background: var(--forest-50) — #ECF5EF
  Color: var(--forest-700)

Active:
  Background: var(--forest-100)
```

#### Accent (warm CTA — used sparingly)
```
Background: var(--amber-500) — #A67B4A
Color: white
Same sizing as primary
Box-shadow: var(--shadow-amber)

Hover:
  Background: var(--amber-400) — #C0955F
  Box-shadow: 0 4px 12px rgba(166, 123, 74, 0.25), 0 2px 4px rgba(166, 123, 74, 0.15)
  Transform: translateY(-1px)

Active:
  Background: var(--amber-600) — #8C6534

Use for: booking CTAs, pricing "buy" buttons, limited availability emphasis.
Maximum 1 per page section.
```

### Badge / Pill Styles

```
Padding: 4px 10px
Border-radius: var(--radius-full)
Font: Inter 500, 12px (--type-overline)
Text-transform: uppercase
Letter-spacing: 0.05em

Variants:
  default:   bg var(--forest-50),  text var(--forest-700),  border 1px var(--forest-200)
  accent:    bg var(--amber-50),   text var(--amber-600),   border 1px var(--amber-200)
  muted:     bg var(--stone-100),  text var(--stone-600),   border 1px var(--stone-200)
  success:   bg #EFF7F1,           text #2F7A42,            border 1px #D7E9DD
  error:     bg #FEF1F0,           text #C43B32,            border 1px #FCDCDA
```

### Form Inputs

```
Height: 48px (default) | 40px (sm)
Background: var(--surface-elevated) — white
Border: 1.5px solid var(--stone-300)
Border-radius: var(--radius-md) — 10px
Font: Inter 400, 16px (prevents iOS zoom on focus)
Color: var(--stone-950)
Padding: 0 16px
Placeholder color: var(--stone-400)

Focus:
  Border: 1.5px solid var(--forest-400)
  Box-shadow: 0 0 0 3px rgba(62, 123, 87, 0.1)
  Outline: none

Transition: border-color 200ms, box-shadow 200ms

Textarea: same styling, min-height 120px, padding 12px 16px, resize vertical

Label:
  Font: Inter 500, 14px
  Color: var(--stone-700)
  Margin-bottom: 6px
```

### Section Transitions

Between sections with different backgrounds:
- No hard edges. Use generous padding and let whitespace be the transition.
- If sections alternate between `--surface-primary` and `--surface-secondary`, no divider needed — the subtle color shift is enough.
- For same-background sections, use a 1px divider: `border-top: 1px solid var(--stone-200)` centered at `max-width: 200px`.

### Prose / Rich Text

```
Max-width: var(--width-prose) — 65ch
Font: Inter 400, var(--type-body) — 17px
Line-height: 1.65
Color: var(--stone-800)

h1, h2: Instrument Serif 400, tracking per scale
h3, h4, h5, h6: Inter 600, tracking per scale

a: color var(--forest-600), underline, underline-offset 4px,
   decoration-thickness 1.5px, decoration-color var(--forest-300)
   hover: decoration-color var(--forest-600), transition 200ms

blockquote:
  border-left: 3px solid var(--forest-300)
  padding-left: 1.5rem
  font-style: italic
  color: var(--stone-600)

code (inline):
  bg var(--stone-100), px 4px, py 2px,
  radius var(--radius-xs), font-size 0.9em

hr:
  border: none
  height: 1px
  bg var(--stone-200)
  margin: 2.5rem 0

img:
  border-radius: var(--radius-lg)
  margin: 2rem 0
```

### Testimonial Block

```
Featured variant:
  Background: var(--forest-50)
  Border: 1px solid var(--forest-100)
  Border-radius: var(--radius-2xl)
  Padding: 48px (mobile) → 64px (desktop)
  Quote mark: Instrument Serif italic, 120px, color var(--forest-200), absolute positioned
  Quote text: Instrument Serif italic, var(--type-h3), color var(--stone-800)
  Author: Inter 500, var(--type-body-sm)
  Role: Inter 400, var(--type-caption), color var(--stone-500)

Minimal variant:
  Border-left: 3px solid var(--forest-300)
  Padding-left: 24px
  Quote text: Inter 400 italic, var(--type-body-lg)
```

---

## 7. CSS Custom Properties — Full Token Set

This is the complete token set to be defined in `:root`. All components reference these tokens.

```css
:root {
  /* ==================== Typography ==================== */
  --font-display: 'Instrument Serif', Georgia, 'Times New Roman', serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;

  --type-display:  clamp(3rem, 2rem + 3.333vw, 5rem);
  --type-h1:       clamp(2.25rem, 1.625rem + 2.083vw, 3.5rem);
  --type-h2:       clamp(1.75rem, 1.417rem + 1.111vw, 2.5rem);
  --type-h3:       clamp(1.375rem, 1.208rem + 0.556vw, 1.75rem);
  --type-h4:       clamp(1.125rem, 1.042rem + 0.278vw, 1.3125rem);
  --type-body-lg:  1.1875rem;
  --type-body:     1.0625rem;
  --type-body-sm:  0.9375rem;
  --type-caption:  0.8125rem;
  --type-overline: 0.75rem;

  --leading-display: 1.05;
  --leading-h1: 1.1;
  --leading-h2: 1.2;
  --leading-h3: 1.25;
  --leading-h4: 1.3;
  --leading-body: 1.65;
  --leading-body-sm: 1.6;
  --leading-caption: 1.5;

  --tracking-display: -0.035em;
  --tracking-h1: -0.025em;
  --tracking-h2: -0.02em;
  --tracking-h3: -0.015em;
  --tracking-h4: -0.01em;
  --tracking-body: 0;
  --tracking-overline: 0.1em;

  /* ==================== Colors ==================== */

  /* Forest (Primary) */
  --forest-950: #0A1A10;
  --forest-900: #132B1C;
  --forest-800: #1C3D29;
  --forest-700: #275137;
  --forest-600: #326647;
  --forest-500: #3E7B57;
  --forest-400: #5C9873;
  --forest-300: #84B496;
  --forest-200: #B0D1BC;
  --forest-100: #D7E9DD;
  --forest-50:  #ECF5EF;

  /* Stone (Neutral) */
  --stone-950: #1A1816;
  --stone-900: #2C2924;
  --stone-800: #403C36;
  --stone-700: #575249;
  --stone-600: #6E685E;
  --stone-500: #8A847A;
  --stone-400: #A9A49B;
  --stone-300: #C8C4BC;
  --stone-200: #E2DFD9;
  --stone-100: #EFECE7;
  --stone-50:  #F8F6F2;

  /* Amber (Accent) */
  --amber-600: #8C6534;
  --amber-500: #A67B4A;
  --amber-400: #C0955F;
  --amber-300: #D5B68A;
  --amber-200: #EAD5B5;
  --amber-100: #F4EADB;
  --amber-50:  #FBF5EC;

  /* Semantic */
  --color-success-fg: #2F7A42;
  --color-success-bg: #EFF7F1;
  --color-warning-fg: #A67B4A;
  --color-warning-bg: #FBF5EC;
  --color-error-fg:   #C43B32;
  --color-error-bg:   #FEF1F0;
  --color-info-fg:    #2E6FA0;
  --color-info-bg:    #EFF5FB;

  /* Surfaces */
  --surface-primary:       #F8F6F2;
  --surface-secondary:     #EFECE7;
  --surface-elevated:      #FFFFFF;
  --surface-glass:         rgba(248, 246, 242, 0.72);
  --surface-glass-border:  rgba(200, 196, 188, 0.25);
  --surface-overlay:       rgba(10, 26, 16, 0.6);
  --surface-overlay-heavy: rgba(10, 26, 16, 0.8);

  /* Gradients */
  --gradient-hero:    linear-gradient(145deg, #0A1A10 0%, #1C3D29 45%, #275137 100%);
  --gradient-section: linear-gradient(180deg, var(--surface-primary) 0%, var(--surface-secondary) 100%);
  --gradient-glow:    radial-gradient(ellipse 60% 50% at 80% 20%, rgba(62, 123, 87, 0.12) 0%, transparent 70%);

  /* ==================== Spacing ==================== */

  /* Section padding */
  --section-xs: clamp(2rem, 1rem + 3.333vw, 4rem);
  --section-sm: clamp(3rem, 2rem + 3.333vw, 5rem);
  --section-md: clamp(4rem, 2.667rem + 4.444vw, 7rem);
  --section-lg: clamp(5rem, 3rem + 6.667vw, 9rem);
  --section-xl: clamp(6rem, 3.333rem + 8.889vw, 10.5rem);

  /* Component gaps */
  --gap-xs:  0.5rem;
  --gap-sm:  0.75rem;
  --gap-md:  1rem;
  --gap-lg:  1.5rem;
  --gap-xl:  2rem;
  --gap-2xl: 3rem;
  --gap-3xl: 4rem;

  /* Layout widths */
  --width-content: 1280px;
  --width-wide:    1440px;
  --width-narrow:  720px;
  --width-prose:   65ch;

  /* Container padding */
  --container-px: clamp(1rem, 0.5rem + 2vw, 4rem);

  /* ==================== Motion ==================== */

  --ease-out:     cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out:  cubic-bezier(0.45, 0, 0.55, 1);
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-gentle:  cubic-bezier(0.4, 0, 0.2, 1);

  --duration-instant:  100ms;
  --duration-fast:     200ms;
  --duration-normal:   350ms;
  --duration-slow:     500ms;
  --duration-reveal:   700ms;
  --duration-dramatic: 1000ms;

  /* ==================== Surfaces ==================== */

  --shadow-xs:    0 1px 2px rgba(10, 26, 16, 0.05);
  --shadow-sm:    0 2px 4px rgba(10, 26, 16, 0.04), 0 1px 2px rgba(10, 26, 16, 0.06);
  --shadow-md:    0 4px 12px rgba(10, 26, 16, 0.05), 0 2px 4px rgba(10, 26, 16, 0.06);
  --shadow-lg:    0 8px 24px rgba(10, 26, 16, 0.07), 0 4px 8px rgba(10, 26, 16, 0.05);
  --shadow-xl:    0 16px 48px rgba(10, 26, 16, 0.1), 0 8px 16px rgba(10, 26, 16, 0.05);
  --shadow-glow:  0 0 0 1px rgba(62, 123, 87, 0.15), 0 4px 16px rgba(62, 123, 87, 0.1);
  --shadow-amber: 0 2px 8px rgba(166, 123, 74, 0.2), 0 1px 3px rgba(166, 123, 74, 0.15);

  --radius-xs:   4px;
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   14px;
  --radius-xl:   20px;
  --radius-2xl:  24px;
  --radius-full: 9999px;
}
```

---

## 8. Tailwind Integration

The CSS custom properties above should be mapped into the Tailwind preset so blocks can use Tailwind utility classes that reference the design tokens. The preset extends (does not replace) Tailwind's defaults.

### Tailwind Preset Structure

```ts
// packages/shared/src/tailwind-preset.ts
const preset = {
  theme: {
    extend: {
      fontFamily: {
        display: ['Instrument Serif', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        forest: {
          50: '#ECF5EF', 100: '#D7E9DD', 200: '#B0D1BC',
          300: '#84B496', 400: '#5C9873', 500: '#3E7B57',
          600: '#326647', 700: '#275137', 800: '#1C3D29',
          900: '#132B1C', 950: '#0A1A10',
        },
        stone: {
          50: '#F8F6F2', 100: '#EFECE7', 200: '#E2DFD9',
          300: '#C8C4BC', 400: '#A9A49B', 500: '#8A847A',
          600: '#6E685E', 700: '#575249', 800: '#403C36',
          900: '#2C2924', 950: '#1A1816',
        },
        amber: {
          50: '#FBF5EC', 100: '#F4EADB', 200: '#EAD5B5',
          300: '#D5B68A', 400: '#C0955F', 500: '#A67B4A',
          600: '#8C6534',
        },
      },
      borderRadius: {
        xs: '4px', sm: '6px', md: '10px',
        lg: '14px', xl: '20px', '2xl': '24px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(10, 26, 16, 0.05)',
        sm: '0 2px 4px rgba(10, 26, 16, 0.04), 0 1px 2px rgba(10, 26, 16, 0.06)',
        md: '0 4px 12px rgba(10, 26, 16, 0.05), 0 2px 4px rgba(10, 26, 16, 0.06)',
        lg: '0 8px 24px rgba(10, 26, 16, 0.07), 0 4px 8px rgba(10, 26, 16, 0.05)',
        xl: '0 16px 48px rgba(10, 26, 16, 0.1), 0 8px 16px rgba(10, 26, 16, 0.05)',
        glow: '0 0 0 1px rgba(62, 123, 87, 0.15), 0 4px 16px rgba(62, 123, 87, 0.1)',
        amber: '0 2px 8px rgba(166, 123, 74, 0.2), 0 1px 3px rgba(166, 123, 74, 0.15)',
      },
      // ... spacing, animation, etc. mapped from CSS custom properties
    },
  },
}
```

### Key Tailwind class mappings

| Design token | Tailwind class | Example |
|---|---|---|
| `--forest-600` | `bg-forest-600` | Primary button |
| `--stone-50` | `bg-stone-50` | Page background |
| `--type-display` | Custom `text-display` utility | Hero heading |
| `--shadow-sm` | `shadow-sm` | Card resting |
| `--radius-xl` | `rounded-xl` | Cards |
| `--radius-full` | `rounded-full` | Buttons |

### Typography utilities (custom)

Define in `index.css` using `@layer utilities`:

```css
@layer utilities {
  .text-display {
    font-family: var(--font-display);
    font-size: var(--type-display);
    line-height: var(--leading-display);
    letter-spacing: var(--tracking-display);
    font-weight: 400;
  }
  .text-h1 {
    font-family: var(--font-display);
    font-size: var(--type-h1);
    line-height: var(--leading-h1);
    letter-spacing: var(--tracking-h1);
    font-weight: 400;
  }
  .text-h2 {
    font-family: var(--font-display);
    font-size: var(--type-h2);
    line-height: var(--leading-h2);
    letter-spacing: var(--tracking-h2);
    font-weight: 400;
  }
  .text-h3 {
    font-family: var(--font-body);
    font-size: var(--type-h3);
    line-height: var(--leading-h3);
    letter-spacing: var(--tracking-h3);
    font-weight: 600;
  }
  .text-h4 {
    font-family: var(--font-body);
    font-size: var(--type-h4);
    line-height: var(--leading-h4);
    letter-spacing: var(--tracking-h4);
    font-weight: 600;
  }
}
```

---

## 9. Migration Notes

### What changes from V1

| Element | V1 (current) | V2 (new) |
|---|---|---|
| Heading font | Fraunces (quirky, optical-size) | Instrument Serif (refined, editorial) |
| Body font | Inter | Inter (unchanged) |
| Primary color | Sage green `#3D6B50` | Deep forest `#326647` (darker, richer) |
| Accent color | Warm amber `#E99544` | Aged brass `#A67B4A` (desaturated, premium) |
| Background | `#FAFAF7` (cool off-white) | `#F8F6F2` (warm cream) |
| Neutral family | Cool gray-beige | Warm stone (consistent warm undertone) |
| Card radius | `0.5rem` (8px) | `20px` (generous, modern) |
| Section padding | `py-16 md:py-20` (64–80px) | `clamp(80px, ..., 144px)` (dramatically more air) |
| Shadows | Standard Tailwind (blue-gray tint) | Custom green-tinted (organic, harmonious) |
| Buttons | Rounded-lg rectangles | Pill shape (radius-full) |
| Hero | SVG dot pattern + flat gradient | Clean gradient with radial glow accent |
| Motion | 1 animation (fadeInUp 0.3s) | Full system: reveals, staggers, easing curves |
| Tokens | None (raw Tailwind utilities) | Complete CSS custom property system |
| Font class | `.font-heading` | `.font-display` + semantic `text-h1`, `text-h2`, etc. |

### Naming changes

| V1 class | V2 class |
|---|---|
| `font-heading` | `font-display` |
| `text-primary-*` | `text-forest-*` |
| `text-accent-*` | `text-amber-*` |
| `text-neutral-*` | `text-stone-*` |
| `bg-neutral-50` | `bg-stone-50` |
| `card-hover` | Custom via reveal system + explicit hover classes |
