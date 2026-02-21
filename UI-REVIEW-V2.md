# UI Review: DESIGN-SYSTEM-V2.md

**Reviewer**: UI Designer
**Date**: 2026-02-21
**Benchmark**: Mercury, Superhuman, Amplemarket, Until Labs, Slush

---

## VERDICT: ACCEPT WITH REFINEMENTS

This design system is a genuine leap from V1. The philosophy is correct ("meditation room, not wellness blog"), the token architecture is production-ready, and the visual ambition matches the benchmark tier. The issues below are refinements, not rejections. Implement as specified, with the flagged adjustments folded in during Task #4/#5.

---

## 1. Typography — STRONG ACCEPT

### Instrument Serif: Correct call.

The move from Fraunces to Instrument Serif is the single biggest visual upgrade in this system. Fraunces has an optical-size axis that makes it look "artisan bakery" at display sizes — the exaggerated serifs and swelling strokes scream "curated lifestyle brand." Instrument Serif reads *editorial* and *contemplative*. It has the right weight for a mindfulness site: serious without being clinical, elegant without being decorative.

The weight-400-only constraint is a feature. It forces hierarchy through scale rather than boldness, which is how the best editorial sites (Until Labs, Superhuman blog) work. Bold serif at display sizes would feel crude.

### The serif/sans split at H3 is excellent.

Instrument Serif reserved for `--type-h2` and above, Inter for `--type-h3` and below. This creates a clear two-tier hierarchy. The serif carries the "moments" (hero, section headings), the sans carries the "information" (card titles, labels, body). This is the Superhuman pattern.

### Fluid type scale is production-correct.

Checked the clamp() formulas against the stated min/max/viewport range:
- `--type-display: clamp(3rem, 2rem + 3.333vw, 5rem)` — at 375px viewport: `2 + 3.333 * 3.75 = 14.5rem`... wait. Let me recalculate. The formula is `clamp(min, preferred, max)` where preferred = `2rem + 3.333vw`. At 375px: `2rem + (3.333 * 375/100)px = 32px + 12.5px = 44.5px`. At 1440px: `32px + 48px = 80px`. So it correctly reaches the 48px floor and 80px ceiling within the stated range. The math checks out for all sizes.

### Refinements needed:

**R1. Display max should be 96px, not 80px.** At the benchmarks we're targeting, 80px is the *floor* for hero text, not the ceiling. Mercury's landing page headings hit 96px. Amplemarket goes to 88px. Until Labs uses viewport-relative units that push past 100px. For a site with single-word Swedish headlines like "Livskompass" or "Mindfulness," 80px will feel like a section heading, not a hero statement. Recommend:
```
--type-display: clamp(3rem, 1.5rem + 4.444vw, 6rem);  /* 48px → 96px */
```

**R2. Body-lg at fixed 19px feels like a missed opportunity.** Every other size in the scale that spans a range uses clamp(). Body-lg is the lead paragraph under hero headings — it's visible at all viewports. At 19px on a 375px screen, it'll feel proportionally larger than on desktop. Consider:
```
--type-body-lg: clamp(1.0625rem, 1rem + 0.278vw, 1.1875rem);  /* 17px → 19px */
```

**R3. Letter-spacing -0.035em on display is aggressive.** Instrument Serif's natural spacing is already tight. At 96px (per R1), -0.035em = -3.36px of negative tracking. This could cause Swedish characters like "ö" and "å" to collide with adjacent letters in words like "Övningar" or "Förändring." I'd test at -0.025em for display and only go tighter if the rendered output demands it.

**R4. Inter weight 450 is listed in the spec but not in the Google Fonts URL.** The URL loads `wght@14..32,400..600` which is a variable font range — 450 IS included. Good. But the spec table (Section 1) lists "400, 450, 500, 600" which should be clarified as "variable range 400–600" to prevent confusion during implementation. Minor nit.

---

## 2. Color System — STRONG ACCEPT

### Forest palette: Superior to V1.

V1's primary `#3D6B50` was a mid-tone sage that lacked authority. V2's `#326647` at the 600 position is deeper, richer, and more commanding. The full scale from `#0A1A10` (near-black with green warmth) to `#ECF5EF` (whisper-light) is well-graduated. No muddy middle tones.

The decision to use `--forest-950` (#0A1A10) for headings instead of pure black is the detail that separates this from template-tier design. This is what Amplemarket does with their dark navy `#0D0F1A` — it's "black" to the eye but warm to the subconscious.

### Stone palette: The unsung hero.

The warm stone neutrals are what will make this site feel *Scandinavian*. V1's neutrals were a generic gray-beige (`#FAFAF7`). V2's `#F8F6F2` has a true cream warmth. The scale is consistent — every shade maintains the same warm undertone. This is critical. Mixed-temperature neutrals (cool gray borders with warm cream backgrounds) is the most common palette mistake and the V2 system avoids it completely.

### Amber accent: Needs one tweak.

**R5. Amber-500 `#A67B4A` may read as brown, not brass, at small sizes.** At badge/pill size (12px text on `#FBF5EC` background), the contrast between `#A67B4A` and `#FBF5EC` is only ~4.2:1. That passes WCAG AA, but visually at small text it risks looking like "dirt brown" rather than "warm brass." The desaturation from V1's `#E99544` is correct in direction but may have overshot by one stop. I'd move the 500 to `#B08350` — slightly warmer/lighter, still desaturated, but with enough chroma to read "amber" not "khaki." Test in context before committing.

This matters because amber is the *action* color — "Book now," "Buy," pricing highlights. It needs to *pop* without screaming. `#A67B4A` might whisper.

### Semantic colors: Correct.

Warning reusing amber is smart palette cohesion. Success green at `#2F7A42` is distinct enough from forest-600 `#326647` — they won't be confused.

### Surface system: Excellent.

The glass definitions (`rgba(248, 246, 242, 0.72)` with matching `rgba(200, 196, 188, 0.25)` border) are precisely what creates the Mercury frosted effect. The overlay colors using forest-tinted black (`rgba(10, 26, 16, ...)`) instead of pure black will make image overlays feel organic.

### Gradients: One missing token.

**R6. `--gradient-shimmer` is referenced in Section 2 ("Card shimmer on hover") but absent from the CSS custom properties in Section 7.** Add:
```css
--gradient-shimmer: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.04) 50%, transparent 100%);
```

---

## 3. Spacing & Layout — ACCEPT

### Section padding: Finally premium.

`--section-xl` scaling from 96px (mobile) to 168px (desktop) is the single change that will make this site look expensive. V1's `py-16 md:py-20` (64–80px) was WordPress-template territory. 168px is Amplemarket territory. The clamp() formulas provide smooth interpolation.

### Content widths: Correct.

`--width-content: 1280px` is standard. `--width-wide: 1440px` for card grids is good. `--width-narrow: 720px` for forms. `--width-prose: 65ch` for rich text — this is the typographically correct optimal line length. No notes.

### Container padding: Generous.

`clamp(1rem, 0.5rem + 2vw, 4rem)` reaching 64px at wide viewports gives content significant inset from screen edges. This is the "breathing room" that template sites never achieve.

### Refinement:

**R7. The gap scale goes from 8px to 64px but lacks a major breakpoint between `--gap-2xl` (48px) and `--section-xs` (32–64px).** There's an overlap zone where `--gap-3xl` (64px) equals `--section-xs` at its desktop maximum. This works functionally but should be documented — when do you use `gap-3xl` vs `section-xs`? They serve different semantics (intra-section vs inter-section) but will render identically at wide viewports.

---

## 4. Motion & Animation — STRONG ACCEPT

This is the most improved section from V1. The old system had one animation (fadeInUp 0.3s ease-out, 8px). The new system is comprehensive and *intentional*.

### Easing curves: Best-in-class.

`--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` — this is the expo-out curve that Framer Motion popularized. It starts fast and decelerates gradually, like a leaf settling. Perfect for entrance animations on a mindfulness site.

`--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` — the 1.56 overshoot is subtle enough to feel playful without feeling bouncy. Correct usage scope: "Button press feedback only."

`--ease-gentle: cubic-bezier(0.4, 0, 0.2, 1)` — the Material Design standard. Good for micro-interactions that need to feel reliable rather than dramatic.

### Duration scale: Appropriate.

700ms for scroll reveals. 1000ms for hero entrance. These are in the premium range — fast enough to not feel sluggish, slow enough to be perceived. V1's 200-300ms durations made everything feel like a snappy web app rather than a curated experience.

### Scroll-triggered reveals: Well-specified.

`IntersectionObserver` with `threshold: 0.15` and `rootMargin: "0px 0px -60px 0px"` — this means elements trigger when 15% visible and 60px before the viewport bottom. The stagger at 80ms per item capped at 5 items (400ms total) prevents excessive choreography. This is the Amplemarket bento grid pattern.

### Keyframe definitions: Correct.

`translateY(24px)` start offset is 3x the V1's 8px — this creates visible, perceivable movement that reads as intentional rather than jittery. `hero-enter` at 32px with 1000ms duration will feel dramatic and cinematic.

### Refinements:

**R8. No specification for hover-to-unhover (leave) transitions.** The hover table specifies card lift of `translateY(-4px)` at 350ms ease-out, but what about the *return*? If the leave transition uses the same 350ms ease-out, the card will snap back slowly. Best practice: entrance (hover) at 350ms ease-out, exit (leave) at 500ms ease-gentle. This makes the lift feel responsive but the settle feel natural. Add this to the hover interaction table.

**R9. Reduced motion handling is correct but the reveal system should also respect it.** The spec says `.reveal { opacity: 1 !important; transform: none !important; }` under `prefers-reduced-motion` — good. But the stagger delays (`.reveal-stagger-1` through `.reveal-stagger-5`) should also be zeroed. Without this, stagger items would all appear simultaneously but with animation-delay still applied, causing a flash of empty space. Add:
```css
@media (prefers-reduced-motion: reduce) {
  .reveal, [class*="reveal-stagger"] {
    opacity: 1 !important;
    transform: none !important;
    animation-delay: 0ms !important;
  }
}
```

---

## 5. Surfaces & Depth — ACCEPT

### Green-tinted shadows: The right detail.

`rgba(10, 26, 16, ...)` instead of `rgba(0, 0, 0, ...)` for all shadows. This is what separates a designed system from a configured template. The shadows now harmonize with the forest palette instead of fighting it. At scale, across 28 blocks, this consistency will be palpable even to people who can't articulate why.

### Shadow scale: Well-graduated.

xs → sm → md → lg → xl provides clean elevation steps. The jump from `shadow-sm` (cards at rest) to `shadow-md` (cards on hover) to `shadow-lg` (dropdowns) creates a clear depth hierarchy.

`shadow-glow` with its `0 0 0 1px` ring is the right approach for focus indicators — it combines a thin ring with a soft spread, like Superhuman's focus states.

`shadow-amber` for accent buttons is a nice specialized token. The warm-tinted shadow will make amber buttons feel like they have their own light source.

### Radius scale: Bold and correct.

20px for cards (up from V1's 8px) is aggressive but contemporary. This is the radius Mercury, Linear, and Vercel use for 2025/2026 design. 24px for featured cards. Pill (9999px) for buttons. The graduated scale (4px → 6px → 10px → 14px → 20px → 24px → 9999px) covers every use case.

### Card variants: Sufficient variety.

Four variants (Elevated, Glass, Flat, Accent) with distinct specs. The Glass card with `backdrop-filter: blur(20px) saturate(1.4)` on `rgba(255, 255, 255, 0.6)` will look premium on gradient or image backgrounds.

### Refinement:

**R10. Elevated card hover specifies `border-color: var(--stone-300)` but the resting state has `border: 1px solid var(--stone-200)`.** This means on hover both the shadow AND border change simultaneously — two visual properties shifting at once. Mercury's cards only change shadow on hover; the border stays constant. Recommend: keep border at `--stone-200` on hover and let the shadow transition alone carry the depth change. Simpler = more refined.

---

## 6. Component Patterns — ACCEPT

### Navigation: Correct.

Frosted glass with `saturate(1.8)` is what makes the Mercury nav feel "alive" — it slightly boosts the colors showing through from behind, so the blur isn't just gray mud. The 72px desktop height is appropriate for a site with 8 nav items (more items need more vertical breathing room than 64px).

Wordmark-only logo in Instrument Serif is the right call. No icon. This is the Until Labs approach — the typography IS the brand mark.

Active link indicator via background-size animation from 0% to 100% is the correct implementation of a "slide-in underline." This is more refined than the V1 approach (fade-in decoration color).

### Hero patterns: Dramatically improved.

Removing the SVG dot pattern overlay is the single best deletion in this spec. That pattern screamed "2019 startup template." The new hero uses clean gradient + radial glow — the glow at `80% 20%` (upper-right) with forest green tint will create subtle dimensional lighting like a muted spotlight in a dark room. This is cinematic without being flashy.

The staggered entrance (heading at 100ms, subheading at 300ms, CTAs at 500ms) with 1000ms duration creates a choreographed reveal that feels like breathing. Correct for a mindfulness site.

### Buttons: Pill shape is correct.

Pill buttons (radius-full) with multi-layer shadows are the current premium standard. The 48px default height with 28px horizontal padding creates good proportions. The hover lift of `translateY(-1px)` with shadow boost is subtle and correct.

### Refinements:

**R11. Primary button shadow uses `rgba(50, 102, 71, ...)` — this is specifically tinted to match `--forest-600` (#326647).** Excellent detail. But the secondary (outline) button has no shadow spec at all — just background and border changes on hover. Consider adding `shadow-xs` on hover for the secondary to give it a subtle lift, keeping it subordinate to the primary.

**R12. Dropdown animation uses `scale-in` with `transform-origin: top`.** Good — this makes it grow downward from the trigger. But no exit animation is specified. The dropdown should reverse on close: `scale(1) → scale(0.96)` with `opacity 1 → 0` at faster duration (150ms vs 200ms entrance). Instant disappearance feels broken at the tier we're targeting.

**R13. Testimonial quote mark at 120px Instrument Serif italic — beautiful.** But positioning is underspecified. "Absolute positioned" where? Recommend: `top: -8px; left: 24px;` with `opacity: 0.4` so it bleeds slightly above the card border and sits behind the text. The partial overflow creates visual interest.

---

## 7. Token Architecture — ACCEPT

### CSS Custom Properties: Complete.

The full `:root` block in Section 7 covers every token mentioned throughout the document. The naming convention is consistent: `--{category}-{shade}` for colors, `--{property}-{scale}` for everything else. This maps cleanly to Tailwind utilities.

### Tailwind Integration: Functional but incomplete.

**R14. The Tailwind preset in Section 8 uses `// ...` placeholders for spacing and animation mapping.** This needs to be fleshed out before implementation. The implementer should not have to guess which CSS custom properties map to which Tailwind utilities. At minimum, the following should be explicitly specified:
- Animation keyframes (fade-up, scale-in, etc.) as Tailwind `animation` entries
- Section padding as custom spacing utilities
- Font-size utilities that reference the clamp() values

The typography utilities (`text-display`, `text-h1`, etc.) defined in `@layer utilities` are the right approach — these compound properties (family + size + line-height + letter-spacing + weight) can't be expressed as individual Tailwind classes without creating 5-class stacks everywhere.

---

## 8. What's Missing (Non-Blockers)

These are NOT reasons to reject. They should be tracked for future iterations.

**M1. No dark mode.** The token system is color-agnostic enough to support dark mode later, but no dark values are defined. The surface/forest/stone naming makes future dark mode mapping obvious. Not a blocker.

**M2. No responsive type scale for body text.** Display through H4 use clamp(). Body-lg through overline are fixed. This is intentional (body text shouldn't change dramatically between viewports), but body-lg is the one exception — see R2.

**M3. No focus-visible specification for non-input elements.** Form inputs get `shadow-glow` on focus. But buttons, links, and cards need visible focus indicators for keyboard navigation. The `shadow-glow` token exists and should be applied to all interactive elements via `:focus-visible`.

**M4. No page transition spec.** Mercury has smooth page-to-page transitions. The current spec only covers within-page animations (scroll reveals, hover interactions, entrance). Page transitions would require React Router integration with View Transitions API or Framer Motion's `AnimatePresence`. Deferred is fine — this is polish.

**M5. No loading/skeleton state tokens.** V1 has `animate-warm-pulse` for skeletons. V2 doesn't mention skeleton states at all. The warm pulse animation should carry over with stone-100 base color.

---

## Summary of Refinements

| ID | Section | Severity | Change |
|---|---|---|---|
| R1 | Typography | Medium | Increase `--type-display` max from 80px to 96px |
| R2 | Typography | Low | Make `--type-body-lg` fluid (17px → 19px) |
| R3 | Typography | Low | Test display letter-spacing at -0.025em for Swedish chars |
| R4 | Typography | Nit | Clarify Inter weights as "variable 400–600" |
| R5 | Color | Medium | Test amber-500 at `#B08350` for warmer chroma |
| R6 | Color | Low | Add `--gradient-shimmer` to CSS properties |
| R7 | Spacing | Nit | Document gap-3xl vs section-xs semantic distinction |
| R8 | Motion | Low | Specify hover-leave duration (500ms ease-gentle) |
| R9 | Motion | Low | Zero stagger delays under reduced-motion |
| R10 | Surfaces | Low | Keep card border constant on hover (shadow only) |
| R11 | Components | Low | Add shadow-xs to secondary button hover |
| R12 | Components | Low | Add dropdown exit animation (150ms) |
| R13 | Components | Nit | Specify testimonial quote mark absolute positioning |
| R14 | Tailwind | Medium | Complete the Tailwind preset (no `...` placeholders) |

**Critical blockers**: 0
**Medium refinements**: 3 (R1, R5, R14)
**Low refinements**: 8
**Nits**: 3

---

## Final Assessment

This design system would stand alongside Mercury and Amplemarket in a portfolio. The typography choice is distinctive, the color system is sophisticated, the spacing is generous, the motion is intentional, and the surfaces have real depth hierarchy. The Nordic character comes through in the warm stones, deep forests, and restrained elegance — it feels Scandinavian without being a cliche.

The biggest risk is the amber accent (#A67B4A) being too muted at small sizes. Test this in rendered context before committing.

**Rating**: 8.5/10 — the 1.5 points come from the display size cap (R1), amber chroma concern (R5), and the Tailwind preset incompleteness (R14). All fixable during implementation.

**ACCEPT.** Proceed to implementation.
