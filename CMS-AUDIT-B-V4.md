# CMS Content Audit B — V4 Independent Validation

**Auditor:** validator-b (CMS Content Validator B)
**Date:** 2026-02-21
**Scope:** Full sweep of all shared blocks, web pages, templates, Layout, puck-config — every file that renders user-visible text
**Methodology:** Systematic file-by-file read of all 28 shared blocks, all 6 web pages, Layout.tsx, BlockRenderer.tsx, EditToolbar.tsx, InlineEditProvider.tsx, templates.ts, puck-config.tsx, admin Settings.tsx

---

## Executive Summary

The V3 audit found 13 CRITICAL, 24 MEDIUM, and 18 LOW findings. **None of the V3 findings have been fixed.** All hardcoded strings from V3 remain exactly as they were. Additionally, this V4 audit found **5 new findings** not covered in V3, plus provides an important content-readiness assessment since Task #2 (page population) is now in progress.

**V3 Finding Status:**
- CRITICAL C-01 through C-13: **ALL STILL OPEN** — zero fixes applied
- MEDIUM M-01 through M-10: **ALL STILL OPEN**
- LOW findings: **ALL STILL OPEN**

**New V4 Findings: 3 CRITICAL, 2 MEDIUM**

---

## V3 Finding Verification (All Still Open)

### CRITICAL — All 13 Confirmed Unchanged

| V3 ID | File | Status | Notes |
|-------|------|--------|-------|
| C-01 | BookingConfirmation.tsx | **OPEN** | 15+ hardcoded strings, entire page still not CMS-managed. Lines 34, 39, 57, 60, 65, 79, 92, 95, 108, 111, 117, 120, 127, 142, 145, 150 all unchanged. |
| C-02 | NotFound.tsx | **OPEN** | 4 hardcoded strings (lines 12, 15, 21, 26). Still not a CMS page. |
| C-03 | BookingPage.tsx | **OPEN** | ~18 hardcoded strings for the entire booking form. Lines 99, 102, 105-107, 112, 138, 142, 176, 181-248, 255, 265, 270. Also error messages at lines 66, 70. |
| C-04 | BookingCTA.tsx | **OPEN** | Props still only `style`. Hardcoded: "Denna utbildning har genomförts." (28), "Denna utbildning är fullbokad." (40), "Kontakta oss om du vill ställas i kö." (41), "Boka plats" (55, 71), "Intresserad av att delta?" (65), "Boka din plats redan idag" (66). |
| C-05 | BookingForm.tsx | **OPEN** | Props still only `showOrganization`, `showNotes`. All form labels, button text, status messages remain hardcoded. Lines 54-55, 133, 144, 156, 167, 178, 192, 205, 216. |
| C-06 | ContactForm.tsx | **OPEN** | Success message still hardcoded at lines 134-135: "Tack för ditt meddelande!" / "Vi återkommer så snart vi kan." Form labels still hardcoded: Namn, E-post, Telefon, Ämne, Meddelande (lines 61, 72, 85, 97, 108). Button text at line 123. |
| C-07 | Layout.tsx:338 + puck-config.tsx:178 | **OPEN** | Footer "Kontakt" heading still hardcoded in both locations. Not part of SiteFooterConfig. |
| C-08 | CourseList.tsx:130 | **OPEN** | Empty state "Det finns inga utbildningar planerade just nu." still hardcoded. |
| C-09 | PostGrid.tsx:84 | **OPEN** | Empty state "Inga inlägg hittades" still hardcoded. |
| C-10 | ProductList.tsx:129 | **OPEN** | Empty state "Inga produkter hittades." still hardcoded. |
| C-11 | BlockRenderer.tsx:14 | **OPEN** | Error message "Kunde inte ladda sidinnehåll." still hardcoded. |
| C-12 | PageCards.tsx:93 | **OPEN** | Empty state "Inga undersidor hittades" still hardcoded. |
| C-13 | Defaults triplicated | **OPEN** | Three separate copies of default header/footer config still exist in Layout.tsx (lines 13-53), puck-config.tsx (lines 57-93), and Settings.tsx (lines 37-77). The puck-config.tsx version now matches the others (includes children for "Om oss"), so the **inconsistency** from V3 is actually FIXED — all three copies now have identical nav structure. But the triplication itself remains. |

**C-13 partial fix noted:** The puck-config.tsx defaultHeader now includes children for "Om oss" (Mindfulness, Forskning, Om Fredrik), matching Layout.tsx and Settings.tsx. This was inconsistent in V3 and is now consistent. The triplication design issue remains.

### MEDIUM — All 10 Confirmed Unchanged

| V3 ID | Status | Notes |
|-------|--------|-------|
| M-01 | **OPEN** | CourseList badges/buttons ("Fullbokad", "platser kvar", "Läs mer", "Boka plats") |
| M-02 | **OPEN** | ProductList type labels ("Böcker", "CD-skivor", etc.), "Gratis", "Slut i lager", "Köp" |
| M-03 | **OPEN** | CourseInfo field labels ("Plats", "Datum", "Pris", "Platser", "Fullbokad", "Sista anmälningsdag") |
| M-04 | **OPEN** | CardGrid badge text ("Fullbokad", "Platser kvar") |
| M-05 | **OPEN** | PricingTable "Populärt val" (line 55) |
| M-06 | **OPEN** | PageHeader breadcrumb "Hem" (line 64) |
| M-07 | **OPEN** | Layout.tsx a11y labels ("Hoppa till innehåll", "Huvudnavigering", "Visa navigeringsmeny") |
| M-08 | **OPEN** | EditToolbar "Öppna i CMS" (line 64), "Dölj" (line 72), "Sparar..." (37), "Sparat" (43), "Fel vid sparning" (49) |
| M-09 | **OPEN** | BookingForm currency "kr/person" (line 118) |
| M-10 | **OPEN** | UniversalPage fallback title "Sida" (line 79) |

### LOW — All 18 Confirmed Unchanged

All editor placeholders ("Klicka för att lägga till text...", "Välj en bild...", etc.) and error messages remain exactly as documented in V3.

---

## NEW V4 Findings

### CRITICAL

#### V4-C01: Homepage slug hardcoded as "home-2" — fragile WordPress artifact

**File:** `packages/web/src/App.tsx:31` and `packages/web/src/pages/UniversalPage.tsx:72`

```tsx
// App.tsx:31
<Route index element={<UniversalPage slug="home-2" />} />

// UniversalPage.tsx:72
if (slug === 'home-2' && (!page.content || page.content.trim() === '')) {
```

The homepage is hardcoded to use slug `"home-2"` — this is clearly a WordPress migration artifact (WordPress often creates "home-2" when there's a slug conflict). This is:
1. **Fragile** — if anyone renames or recreates the homepage in the CMS with a different slug, the homepage breaks
2. **Not CMS-manageable** — the admin has no way to change which page is the homepage
3. **Confusing** — "home-2" reveals implementation debt to anyone inspecting the source

**Impact:** CRITICAL for content management. If Task #2 populates pages and uses a different home slug, the site breaks.

**Recommended fix:** Add a `homepage_slug` setting to site settings, or use a conventional slug like `home` or `hem`.

---

#### V4-C02: No products listing page exists — `/material` renders via UniversalPage

**File:** `packages/web/src/App.tsx:37`

```tsx
<Route path="material" element={<UniversalPage slug="material" />} />
```

The `/material` route renders via UniversalPage (the generic CMS page renderer). There is no dedicated product listing component. If the "material" page in the database has no Puck content_blocks with a `ProductList` block, visitors see either:
- Empty default page template (just a heading)
- Legacy WordPress HTML content (which likely doesn't include dynamic product listings)

The `ProductList` block exists and works — but it needs to be explicitly placed on the `material` page via the CMS editor. **If Task #2 doesn't include a ProductList block on the material page, products will be invisible to visitors.**

**Impact:** Products may not be visible on the public site depending on content population.

---

#### V4-C03: Course listing relies on CMS content — no fallback

**File:** `packages/web/src/App.tsx:34`

```tsx
<Route path="utbildningar" element={<UniversalPage slug="utbildningar" />} />
```

Same pattern as V4-C02. The `/utbildningar` route is a generic UniversalPage. If the CMS page doesn't contain a `CourseList` block, visitors see no courses. The `CourseList` block exists and fetches from the API — but it must be manually placed via the CMS.

**Impact:** Courses may not be visible on the public site if the "utbildningar" page doesn't have a CourseList block.

---

### MEDIUM

#### V4-M01: BookingPage error messages hardcoded in non-standard Swedish

**File:** `packages/web/src/pages/BookingPage.tsx:66,70`

```tsx
setError('Kunde inte starta betalningen. Försök igen.')  // line 66
setError(err.message || 'Något gick fel. Försök igen.')   // line 70
```

These error messages are hardcoded AND may surface raw API error messages (from `err.message`) directly to users. The API might return English error strings or technical error details that shouldn't be shown to end users.

**Impact:** Users may see inconsistent or technical error messages during booking failures.

---

#### V4-M02: BookingPage "kr/person" currency hardcoded

**File:** `packages/web/src/pages/BookingPage.tsx:162`

```tsx
<span>{priceSek.toLocaleString('sv-SE')} kr/person</span>
```

Same issue as M-09 (BookingForm). The "kr/person" suffix is hardcoded in both the standalone BookingPage AND the Puck BookingForm block — two places with the same problem.

---

## Content Readiness Assessment

### Pages That MUST Have Rich Puck Content (Task #2 Dependencies)

The following pages are referenced in navigation but render via `UniversalPage`. If they don't have Puck `content_blocks` with appropriate blocks, they will show either empty default templates or legacy WordPress HTML:

| Page Slug | Nav Location | Required Blocks | Risk if Missing |
|-----------|-------------|-----------------|-----------------|
| `home-2` | Homepage (index route) | Hero, CourseList, PostGrid, CTABanner | **Site looks empty** |
| `utbildningar` | Main nav | CourseList | **Courses invisible** |
| `material` | Main nav | ProductList | **Products invisible** |
| `kontakt` | Main nav | ContactForm | **Contact form missing** |
| `act` | Main nav | PageHeader, RichText (+ child pages) | Content missing |
| `mindfulness` | "Om oss" dropdown | PageHeader, RichText (+ child pages) | Content missing |
| `forskning-pa-metoden` | "Om oss" dropdown | PageHeader, RichText (+ child pages) | Content missing |
| `om-fredrik-livheim` | "Om oss" dropdown | PersonCard, RichText | About page empty |
| `nyhet` | Main nav | PostGrid | Blog listing empty |

### Template Fallback Behavior

When a page has no `content_blocks`:

1. **Homepage** (`home-2`): Falls back to `defaultHomeTemplate` (Hero + CourseList + PostGrid + CTABanner) — **this is fine**
2. **Other pages**: Fall back to `defaultPageTemplate` (PageHeader + RichText with legacy content) — shows WordPress HTML
3. **Courses**: Fall back to `defaultCourseTemplate` (CourseInfo + RichText + BookingCTA) — **this is fine**
4. **Posts**: Fall back to `defaultPostTemplate` (PostHeader + RichText) — **this is fine**

**Key risk:** Pages like `/utbildningar`, `/material`, `/kontakt` that need **dynamic data blocks** (CourseList, ProductList, ContactForm) will NOT get them from the default template — the default template only includes PageHeader + RichText. These pages MUST be manually built with appropriate blocks via the CMS.

---

## Block Quality Assessment

### Blocks That Properly Use CMS Props (GOOD)

| Block | Editable Props | Quality |
|-------|---------------|---------|
| Hero | heading, subheading, bgStyle, CTAs, image, preset | Excellent — fully editable, inline editing support |
| PageHeader | heading, subheading, alignment, size, breadcrumbs | Excellent — inline editing support |
| RichText | content, maxWidth | Good — inline editing support |
| CTABanner | heading, description, buttonText, buttonLink, bg, alignment | Excellent — all text editable |
| Testimonial | quote, author, role, style | Good — all text editable |
| PersonCard | name, title, bio, image, email, phone, style | Excellent — all text editable |
| FeatureGrid | heading, subheading, columns, items (icon/title/desc), style | Excellent |
| StatsCounter | items (value/label/prefix/suffix), columns, style | Good |
| Accordion | heading, items (question/answer), defaultOpen, style | Good |
| PricingTable | heading, items (name/price/desc/features/cta), columns | Good — except "Populärt val" (M-05) |
| ButtonGroup | buttons (text/link/variant), alignment, direction, size | Good — except fallback "Knapp" |
| CardGrid | heading, subheading, manualCards, source, columns, style | Good |
| NavigationMenu | items (label/link), layout, style, alignment | Good |
| ImageBlock | src, alt, caption, size, alignment, rounded, link | Good |
| ImageGallery | images (src/alt/caption), columns, gap, aspectRatio | Good |
| VideoEmbed | url, aspectRatio, caption | Good |
| PostHeader | showBackLink, backLinkText, backLinkUrl | Good — back link text is editable |
| PostGrid | heading, subheading, count, columns, show toggles | Good |
| PageCards | heading, parentSlug, manualPages, columns, style | Good |
| Spacer | size | N/A (no text) |
| SeparatorBlock | variant, spacing, lineColor, maxWidth | N/A (no text) |
| Columns | columns | N/A (structural) |

### Blocks With Hardcoded Text Issues

| Block | Missing Props | Hardcoded Strings Count |
|-------|--------------|------------------------|
| BookingCTA | heading, description, buttonText, fullMsg, completedMsg, queueMsg | 7 strings |
| BookingForm | buttonText, submittingText, fullMsg, completedMsg, all 6 form labels | 12 strings |
| ContactForm | successHeading, successMessage, form labels (5) | 7 strings |
| CourseList | emptyText, fullBadge, spotsText, readMoreText, bookText | 5 strings |
| ProductList | emptyText, typeLabels, freeText, outOfStockText, buyText | 8 strings |
| CourseInfo | field labels (5) | 5 strings |
| CardGrid | fullBadge, spotsText | 2 strings |

---

## Default Configs Triplication Analysis (C-13 Update)

| Location | Header Nav "Om oss" children | Footer "Kontakt" heading | Consistent? |
|----------|------------------------------|--------------------------|-------------|
| Layout.tsx:13-53 | Mindfulness, Forskning, Om Fredrik | Hardcoded "Kontakt" | Yes (with each other) |
| puck-config.tsx:57-93 | Mindfulness, Forskning, Om Fredrik | Hardcoded "Kontakt" | **NOW FIXED** (was flat in V3) |
| Settings.tsx:37-77 | Mindfulness, Forskning, Om Fredrik | N/A (not rendered here) | Yes |

**Update from V3:** The puck-config.tsx defaults now include the `children` array for "Om oss", fixing the V3 inconsistency. However, the triplication itself remains a maintenance risk.

---

## Swedish Language Quality Assessment

### Text Quality (what exists is correct)

All Swedish text across the codebase is grammatically correct and uses proper tone:
- Form labels are standard and professional
- Status messages are clear
- Error messages are user-friendly
- "Fullbokad", "Boka plats", "Läs mer" etc. are all correct Swedish

### Missing Unicode Characters — NOT AN ISSUE

All Swedish characters (å, ä, ö) are properly rendered throughout the codebase. The V3 audit did not flag this, and I confirm no encoding issues exist in any block or page component.

---

## Summary by Priority

### Must Fix Before Launch

1. **V4-C01**: Rename homepage slug from "home-2" to something sensible (e.g., "hem" or make it configurable via site settings)
2. **V4-C02/C03**: Ensure Task #2 populates `/utbildningar`, `/material`, `/kontakt` with appropriate dynamic blocks (CourseList, ProductList, ContactForm)
3. **C-01**: BookingConfirmation entire page hardcoded — at minimum, make confirmation text configurable
4. **C-03**: BookingPage form labels/messages hardcoded — should accept props or use settings
5. **C-04/C-05**: BookingCTA + BookingForm blocks need text props (heading, button text, status messages)
6. **C-06**: ContactForm success message needs props

### Should Fix Before Launch

1. **C-07**: Footer "Kontakt" heading should be part of SiteFooterConfig
2. **C-08/C-09/C-10/C-12**: Empty state messages should be optional props with defaults
3. **C-13**: Extract shared default config to a single source of truth (e.g., `packages/shared/src/defaults.ts`)
4. **M-01/M-02**: Data-bound block badges/buttons should have text props

### Post-Launch

1. **C-02**: Convert NotFound to CMS-editable page
2. **C-11**: BlockRenderer error message → prop or settings
3. **M-03 through M-10**: Various minor hardcoded labels
4. All LOW findings (editor-only placeholders)

---

## Recommendations for Task #2 (Content Population)

When populating pages, the following pages MUST include specific blocks to function correctly:

1. **`utbildningar`** — Must contain a `CourseList` block (otherwise no courses visible)
2. **`material`** — Must contain a `ProductList` block (otherwise no products visible)
3. **`kontakt`** — Must contain a `ContactForm` block (otherwise no contact form)
4. **`nyhet`** — Must contain a `PostGrid` block (otherwise no blog listing)
5. **`home-2`** (or whatever the homepage slug is) — Should contain Hero + CourseList + PostGrid + CTABanner (the default template does this, but custom content should be richer)

Pages that work fine with just RichText + PageHeader:
- `act`, `mindfulness`, `forskning-pa-metoden` — informational pages
- `om-fredrik-livheim` — should use PersonCard block for best results

---

## Conclusion

The codebase has excellent CMS architecture for content that IS managed through Puck blocks and site settings. The core issue remains concentrated in three areas (unchanged from V3):

1. **Standalone page components** (BookingPage, BookingConfirmation, NotFound) — NOT Puck-rendered, all text hardcoded
2. **Data-bound blocks** (BookingCTA, BookingForm, CourseList, ProductList, CourseInfo) — status/label text hardcoded instead of being props
3. **ContactForm success state** — hardcoded despite other parts being prop-driven

New V4 concerns focus on content-readiness: the homepage slug artifact and the dependency on Task #2 to properly populate listing pages with dynamic blocks.
