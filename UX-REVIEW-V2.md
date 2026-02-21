# UX Review: Design System V2

**Reviewer**: UX Designer
**Date**: 2026-02-21
**Document reviewed**: DESIGN-SYSTEM-V2.md
**Verdict**: **ACCEPT WITH REQUIRED CHANGES** (5 must-fix, 8 recommendations)

---

## Overall Assessment

The design system is thoughtful, well-structured, and genuinely appropriate for the Livskompass domain. The "meditation room" vision translates into concrete, implementable decisions. The token system is complete. The motion philosophy matches the brand. The serif + sans pairing is strong.

This is not a rejection. It's an acceptance with five issues that must be resolved before implementation, plus recommendations that would improve the final result.

---

## 1. Typography & Swedish Language Fitness

### What works

- **Instrument Serif** is an excellent choice. It supports Latin Extended (Swedish a, a, o render correctly). At large sizes (display, h1, h2), the 400 weight carries enough presence without needing bold. The "considered editorial" feel is exactly right for a psychologist's practice.
- **Inter** stays for body/UI: correct decision. Inter's Swedish character rendering is best-in-class.
- **Fluid clamp() scale**: well-calculated. The min/max ranges are appropriate.
- **The serif/sans split at h3**: clean hierarchy. Serif for the "moments," sans for the "details" is a strong organizing principle.

### MUST-FIX: Hero max-width for Swedish text

The document specifies:
> Max-width: 14ch for short dramatic lines, 20ch for longer titles

Swedish compound words break this constraint. Real content from this site:

| Swedish heading | Character count |
|---|---|
| "Gruppledarutbildning" | 20ch (one word!) |
| "Forskning pa metoden" | 20ch |
| "Acceptans- och engagemangsterapi" | 33ch |
| "Kommande utbildningar" | 21ch |
| "Mindfulnessovningar" | 19ch |

At `--type-display` (80px), a 14ch constraint would force "Gruppledarutbildning" to a single word on its own line with zero room for anything else.

**Fix**: Change hero heading max-width guidance to:
- Short dramatic: **18ch** minimum
- Standard: **24ch**
- Long Swedish compound titles: **28ch** or `max-width: 720px`

### Recommendation: Line-height for serif at display size

`--leading-display: 1.05` is very tight. Instrument Serif's ascenders/descenders at 80px with 1.05 line-height means Swedish characters with diacritics (A, A, O) may visually collide with descenders from the line above in multi-line display headings. Test with "Ovningar for livet" as a two-line hero.

**Suggestion**: Increase `--leading-display` to `1.1` for breathing room. Still dramatic, but safe for diacritics.

### Recommendation: Overline tracking for Swedish

`--tracking-overline: 0.1em` with uppercase is aggressive for Swedish. Swedish category labels like "UTBILDNINGAR" (12 chars, uppercase) at 0.1em wide tracking will span notably wider than English equivalents. This isn't a blocker but may cause layout overflow in badge/pill contexts.

**Suggestion**: Reduce to `0.08em` or test with actual Swedish labels before finalizing.

---

## 2. Color Contrast (WCAG AA)

I calculated contrast ratios for every proposed text/background combination. All calculations use the WCAG 2.1 relative luminance formula.

### Passing combinations (no issues)

| Combination | Ratio | Requirement | Result |
|---|---|---|---|
| stone-950 on stone-50 (body text on page) | ~16.5:1 | 4.5:1 | PASS |
| stone-800 on stone-50 (prose text) | ~9.8:1 | 4.5:1 | PASS |
| forest-600 on white (links, buttons) | ~6.7:1 | 4.5:1 | PASS |
| stone-600 on stone-50 (nav links) | ~5.2:1 | 4.5:1 | PASS |
| white on forest-950 (hero text) | ~17.5:1 | 4.5:1 | PASS |
| white on forest-700 (gradient endpoint) | ~10.0:1 | 4.5:1 | PASS |
| white on forest-600 (primary button) | ~6.7:1 | 4.5:1 | PASS |
| 75% white on gradient midpoint (~forest-800) | ~7.8:1 | 4.5:1 | PASS |
| stone-700 on white (labels) | ~7.0:1 | 4.5:1 | PASS |

### MUST-FIX: Amber-500 fails for button text

| Combination | Ratio | Requirement | Result |
|---|---|---|---|
| **white on amber-500 (#A67B4A)** | **~3.8:1** | **4.5:1** | **FAIL** |
| white on amber-600 (#8C6534) | ~5.2:1 | 4.5:1 | PASS |

The accent button is specified as `amber-500` background with white text. This **fails WCAG AA for normal text** (15px button labels). At 16px+ it passes AA for large text (3:1) but buttons at 15px are not "large text" under WCAG.

**Fix**: Use `amber-600` (#8C6534) as the accent button background. Update hover to `amber-500` (lighter on hover is still fine for a non-resting state). Or darken amber-500 to at least `#906930` which would achieve ~4.5:1.

Updated accent button spec:
```
Background: var(--amber-600)  /* #8C6534 */
Hover: var(--amber-500)       /* #A67B4A — hover states don't need AA compliance */
Active: var(--amber-700) or darker
```

### MUST-FIX: Forest-400 fails for interactive text

| Combination | Ratio | Requirement | Result |
|---|---|---|---|
| **forest-400 (#5C9873) on white** | **~3.5:1** | **4.5:1** | **FAIL** |
| forest-400 on stone-50 (#F8F6F2) | ~3.3:1 | 4.5:1 | FAIL |

Forest-400 is described as "Secondary interactive elements." If used as text color for links or clickable labels at body size, this fails AA. It only passes for large text (3:1).

**Fix**: Restrict forest-400 to decorative/non-text use only (borders, icons larger than 24px, background tints). For secondary interactive text, use `forest-500` (#3E7B57) which achieves ~4.8:1 on white. Update the color table to clarify:

```
forest-400: #5C9873 — Decorative only: borders, large icons, accent lines
forest-500: #3E7B57 — Secondary interactive text, link hover states
```

### Recommendation: Stone-500 for disabled states

Stone-500 (#8A847A) on white has ~3.2:1 contrast. For "disabled" and "placeholder" uses this is acceptable (WCAG doesn't require contrast for disabled controls). But if stone-500 is ever used for readable text (not just placeholders), it will fail. Add a note: "stone-500: placeholder/disabled only, never for readable content."

---

## 3. Motion & Reduced Motion

### What works

- The breathing metaphor is appropriate for a mindfulness brand.
- Exponential deceleration (`--ease-out`) creates calm, natural movement.
- Scroll-triggered reveals with `threshold: 0.15` are subtle and non-intrusive.
- One-shot animations (no looping, no exit) are the right choice.
- Stagger maximum of 5 items (400ms total) prevents tedious waits.
- `prefers-reduced-motion` is addressed with a global media query.

### MUST-FIX: Remove spring easing

`--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` has an overshoot value of 1.56, meaning elements bounce past their target position. This is described for "button press feedback."

For a mindfulness/therapy site, **no element should ever bounce or overshoot**. Users visiting this site may be experiencing anxiety, stress, or sensory sensitivity. Overshoot animation, even subtle, contradicts the design vision of "breathing" motion.

**Fix**: Remove `--ease-spring` entirely. Use `--ease-out` for button active states (fast start, gentle deceleration to rest — like setting something down gently). If you want a slightly different feel for active states, use `--ease-gentle` which has no overshoot.

### Recommendation: Refine reduced-motion implementation

The current approach:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

This is too aggressive. It removes **all** transitions, including:
- Focus ring appearance (needed for keyboard navigation visibility)
- Form input state changes (border color on focus)
- Color transitions on interactive elements (hover feedback)

Users who prefer reduced motion still need visual feedback for interactions — they just don't want things flying around the screen.

**Suggested approach**:
```css
@media (prefers-reduced-motion: reduce) {
  /* Remove movement-based animations */
  .reveal { opacity: 1 !important; transform: none !important; }

  /* Disable transform/movement transitions but keep color/opacity */
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }

  /* Preserve quick feedback transitions for interactive states */
  /* (color, background-color, border-color, opacity, box-shadow) */
  /* Only zero out transform-related transitions */
}
```

This is harder to implement with pure CSS, so alternatively: add a note that focus rings, border-color, and background-color transitions should use a separate class that isn't suppressed by the blanket rule.

---

## 4. Navigation — Information Architecture

### Current: 8 items

```
ACT | Utbildningar | Material | Mindfulness | Forskning pa metoden | Om Fredrik Livheim | Kontakt | Nyheter
```

### Width calculation at proposed spec (Inter 500, 15px)

At Inter 500 15px, approximate character widths:
- "ACT": ~28px
- "Utbildningar": ~88px
- "Material": ~58px
- "Mindfulness": ~82px
- "Forskning pa metoden": ~148px
- "Om Fredrik Livheim": ~128px
- "Kontakt": ~54px
- "Nyheter": ~52px

Total nav items: ~638px
Gaps (7 x 24px): ~168px
Logo: ~150px
Container padding: ~64px

**Total: ~1020px** at minimum. The desktop breakpoint is `lg: 1024px`.

This means the nav will be crammed edge-to-edge at 1024px with zero breathing room. Items will feel crowded, and any dropdown chevron icons add ~16px each. At 1024-1100px it will overflow or require items to wrap.

### MUST-FIX: Reduce visible nav items

**Option A — Group informational pages** (recommended):
```
ACT | Utbildningar | Material | Om oss (dropdown) | Kontakt | Nyheter
```
Where "Om oss" dropdown contains: Mindfulness, Forskning, Om Fredrik

This reduces to 6 items. Total width: ~650px including gaps. Comfortable at 1024px.

**Option B — Shorten labels**:
```
ACT | Utbildningar | Material | Mindfulness | Forskning | Om Fredrik | Kontakt | Nyheter
```
"Forskning pa metoden" → "Forskning" and "Om Fredrik Livheim" → "Om Fredrik" saves ~90px. Marginal improvement but still 8 items.

**Option C — Two-tier nav** (less recommended):
Primary: ACT | Utbildningar | Material | Kontakt
Secondary: Mindfulness | Forskning | Om Fredrik | Nyheter

**Recommendation**: Option A. Six items with smart grouping. The "informational" pages (Mindfulness, Forskning, Om Fredrik) are content pages that serve an "about" function — grouping them is semantically honest, not just space-saving.

---

## 5. Mobile Compositions

### Gap: No block-level mobile specifications

The design system covers responsive typography, section padding, and container padding — but doesn't specify how individual blocks adapt on mobile. This matters because "stack everything to one column" is not always the right answer.

### Specific mobile composition recommendations per block

**Hero**: On mobile (< 640px), CTA buttons should stack vertically (`flex-col`) with the primary button full-width. Hero min-height should be at least `85vh` on mobile for the `full-viewport` variant to avoid awkward short heroes on tall phones.

**CourseInfo (grid layout)**: The 4-column grid should go to 2 columns on mobile, not 1. Course info items (location, date, price, spots) are short values — they work in pairs. Single-column wastes vertical space.

**PricingTable**: On mobile, pricing cards should stack vertically with the highlighted card first (moved to top, regardless of DOM order). Use `order: -1` on the highlighted card at mobile breakpoint.

**ContactForm (split layout)**: The `md:grid-cols-[1fr_1.5fr]` split correctly goes to single column on mobile. But the contact info card should appear ABOVE the form on mobile (it currently will, since it's first in DOM order). Good.

**ImageGallery**: 4-column → 2-column is fine on mobile. 1-column would make landscape images too small. But 2-col with `gap-2` (8px) feels cramped on phone screens. Use `gap-3` minimum on mobile.

**CourseList**: On mobile, the price + button row (`flex items-center justify-between`) will be tight. At 375px width minus padding, the price text (e.g., "12 500 kr") plus two buttons ("Las mer" + "Boka plats") won't fit on one row. The buttons should stack below the price on mobile.

**Accordion**: Works fine on mobile as-is (full-width stacked). No changes needed.

**PostGrid**: On mobile, 3-column → 1-column is correct. But consider showing the first post as a "featured" card (larger image, full-width) and remaining posts as a compact list. This is common in news layouts and would improve the mobile reading experience.

**Add to design system**: A "Mobile Breakpoint Behaviors" section that specifies per-block column collapse rules and any reordering.

---

## 6. Block Architecture — Sufficiency

### Current: 28 blocks across 7 categories

The block set is comprehensive for the site's current needs. Most content types are covered.

### Missing blocks worth adding

| Block | Rationale | Priority |
|---|---|---|
| **Alert/Notice** | Critical for announcements: "Nasta utbildning startar 15 mars", COVID info, registration reminders. Currently no way to highlight urgent information within page content. | High |
| **Timeline** | ACT training programs are multi-day/multi-week. A visual timeline showing session progression, course schedule, or "What to expect" flow would serve the educational context well. | Medium |
| **Download/Resource** | Mindfulness sites typically offer downloadable resources: guided meditations (audio), worksheets (PDF), reading lists. Current blocks can link to files but don't present them as download cards with file type indicators and sizes. | Medium |
| **Table** | Comparing course options, showing schedules, or listing what's included. PricingTable is styled specifically for pricing and can't serve general data needs. | Low |

### Blocks to reconsider

| Block | Concern |
|---|---|
| **Spacer** | Redundant if section padding tokens are used consistently. Spacer blocks in CMS content tend to accumulate and create inconsistent spacing. Consider removing and relying on section padding. However, I acknowledge it serves as a useful "escape hatch" in visual editors for non-technical users. Keep, but add CMS guidance: "Use section padding tokens instead of Spacer when possible." |
| **NavigationMenu** | Overlaps with PageCards and site navigation. When would an inline nav menu be used instead of PageCards (which shows linked cards) or the site nav? If the use case is "sub-page navigation within a section page," rename it to **SubNav** and make the use case clearer. |

### Block count verdict

28 blocks is a solid count. Adding Alert/Notice (high priority) and keeping the rest as-is gives 29 blocks. This is manageable in the Puck sidebar without overwhelming the content editor.

---

## 7. Forms — Contact & Booking UX

### Contact Form

**What works**: Split layout with contact info card is excellent for this domain. Having Fredrik's name, title, email, and phone visible alongside the form builds trust. The success state is clear and warm.

**Issues to fix in implementation** (not design system level, but noting for the block redesign):

1. **No aria-describedby on error messages**: When the error banner appears, screen readers don't associate it with the form. Add `aria-describedby` linking the error message `id` to the form element, or better: add per-field inline errors with `aria-describedby` on each input.

2. **No aria-invalid on fields**: When validation fails, inputs should get `aria-invalid="true"` and associate with their specific error via `aria-describedby`.

3. **Success state is a dead end**: After sending, the user sees "Tack for ditt meddelande!" but can't send another message or navigate without using browser back. Add a "Skicka ett till meddelande" link/button in the success state.

4. **No phone format hint**: Swedish phone numbers have various formats. Add `placeholder="070-123 45 67"` or a helper text below the field.

### Booking Form

**What works**: Course summary card above the form provides context. Price calculation updates dynamically. The full/completed states show clear messaging.

**Issues**:

1. **No price breakdown**: When selecting 3 participants at 2 500 kr, user sees "Totalt: 7 500 kr" but not *how* it was calculated. Show: "3 x 2 500 kr = 7 500 kr".

2. **No spots-remaining indicator near the form**: CourseInfo block shows spots, but by the time the user scrolls to the booking form, that information is off-screen. Repeat "X platser kvar" near the participant selector.

3. **Checkout redirect UX**: After clicking "Ga till betalning," the button text changes to "Bearbetar..." but there's no indication of *what's happening*. Users may think the page is broken. Add: a brief "Du skickas till Stripe for saker betalning..." message and a loading spinner.

4. **No terms acceptance**: Before processing a payment, there should be a checkbox: "Jag godkanner [villkoren]" (terms & conditions). This is both a legal requirement for EU commerce and a UX best practice.

5. **Participant selector**: For 1-10 options, a numeric stepper (+/- buttons) would be faster than a dropdown `<select>`. Minor UX improvement.

---

## 8. CMS Preview / Production Parity

### Will Puck preview match production?

**Low risk**: The design system changes component code (Tailwind classes), not stored data. Block props like `backgroundColor: "primary"` use semantic strings that map to classes internally. Changing `bg-primary-600` to `bg-forest-600` in component JSX doesn't affect stored JSON.

**Medium risk**: The current Puck iframe CSS injection system (extracting parent `document.styleSheets` and injecting into iframe) will work IF:
1. The new Google Fonts URL (Instrument Serif) is loaded in the parent window
2. The CSS custom properties (`:root` tokens) are defined in the parent stylesheet
3. The Tailwind classes generated from the new preset are in the parent stylesheet

All of these should be true if both admin and web use the shared tailwind-preset.

**Action items for implementation**:
1. Ensure the Puck iframe injection script also injects the Google Fonts `<link>` for Instrument Serif (it currently does this for Inter)
2. Verify that CSS custom properties defined in `:root` propagate into the iframe `<style>` injection
3. Test that `font-display` class (new) renders Instrument Serif in the Puck preview iframe

### Naming migration

The class rename from `font-heading` to `font-display` and from `primary/accent/neutral` to `forest/amber/stone` requires a systematic find-and-replace across all block components. This is a code change, not a data migration. No database content needs to change.

**Risk**: Missing a rename in one block will cause it to silently fall back to Tailwind defaults (e.g., `text-primary-600` won't resolve if `primary` is removed from the preset). The implementation task should include a grep for all V1 class names to ensure none survive.

---

## Summary of Required Changes

### Must-Fix (5 items — block implementation)

| # | Issue | Fix |
|---|---|---|
| **MF-1** | Amber-500 white text fails WCAG AA (3.8:1) | Use amber-600 as accent button bg. Hover → amber-500. |
| **MF-2** | Forest-400 fails for interactive text (3.5:1) | Restrict forest-400 to decorative. Use forest-500 for secondary interactive text. |
| **MF-3** | Hero max-width 14ch too narrow for Swedish | Change to 18ch (short) / 24ch (standard) / 720px (long) |
| **MF-4** | Spring easing inappropriate for mindfulness audience | Remove `--ease-spring`. Use `--ease-out` for all active states. |
| **MF-5** | Nav overflows at lg (1024px) with 8 items | Reduce to 6 visible items. Group "Mindfulness + Forskning + Om Fredrik" under "Om oss" dropdown. |

### Recommendations (8 items — would improve quality)

| # | Recommendation | Impact |
|---|---|---|
| **R-1** | Increase `--leading-display` from 1.05 to 1.1 for diacritic safety | Low effort, prevents clipping |
| **R-2** | Reduce `--tracking-overline` from 0.1em to 0.08em for Swedish labels | Low effort, prevents badge overflow |
| **R-3** | Refine prefers-reduced-motion to preserve focus/color transitions | Medium effort, better a11y |
| **R-4** | Add "Mobile Breakpoint Behaviors" section per block | Documentation only |
| **R-5** | Add Alert/Notice block to block system | Medium effort, high utility |
| **R-6** | Add aria-describedby/aria-invalid to form blocks | Small effort, WCAG compliance |
| **R-7** | Add price breakdown and spots indicator to BookingForm | Small effort, clearer UX |
| **R-8** | Add terms checkbox to BookingForm (EU legal requirement) | Small effort, required for commerce |

---

## Verdict

**ACCEPT WITH REQUIRED CHANGES.**

The design system is strong. The vision is appropriate for the domain. The token architecture is complete and implementable. The five must-fix items are all targeted corrections, not directional problems. Once MF-1 through MF-5 are addressed, this system is ready for implementation.

The design team should update DESIGN-SYSTEM-V2.md with the five fixes before passing to Task #4 (implementation).
