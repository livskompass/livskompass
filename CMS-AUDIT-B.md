# CMS Content Audit B — Independent Validation

**Auditor:** cms-audit-b
**Date:** 2026-02-21
**Scope:** Every file that renders user-visible text on the public frontend
**Methodology:** Systematic sweep of all shared blocks, web components, web pages, templates, and puck-config

---

## Executive Summary

The site has a solid CMS architecture — the Puck visual editor covers page/post/course/product content, and the admin Settings page covers header/footer/nav. **However, several critical page-level components (booking flow, 404, confirmation) contain significant hardcoded Swedish text that admins cannot modify through any CMS interface.** Block-level hardcoding is mostly limited to status messages and form labels.

**Counts:**
- CRITICAL: 13 findings (user-facing text with no CMS editing path)
- MEDIUM: 24 findings (labels/badges that rarely change but are hardcoded)
- LOW: 18 findings (editor placeholders, error messages, fallback defaults)

---

## CRITICAL Findings

### C-01: BookingConfirmation.tsx — Entire page hardcoded

**File:** `packages/web/src/pages/BookingConfirmation.tsx`

Every piece of text on the booking confirmation page is hardcoded. Admins have zero ability to customize the post-payment experience.

| Line | Hardcoded text | Should come from |
|------|---------------|-----------------|
| 34 | `"Ingen bokning hittades"` | CMS or site settings |
| 39 | `"Se utbildningar"` | CMS or site settings |
| 57 | `"Betalning avbruten"` | CMS or site settings |
| 60 | `"Betalningen avbrotades. Ingen debitering har gjorts."` | CMS or site settings |
| 65 | `"Tillbaka till utbildningar"` | CMS or site settings |
| 79 | `"Bekräftar bokning..."` | CMS or site settings |
| 92 | `"Behandlar betalning..."` | CMS or site settings |
| 95 | `"Vi behandlar din bokning. Vänligen vänta..."` | CMS or site settings |
| 108 | `"Tack för din bokning!"` | CMS or site settings |
| 111 | `"Din bokning är bekräftad. Spara ditt bokningsnummer. Kontakta oss vid frågor."` | CMS or site settings |
| 117 | `"Bokningsnummer"` | CMS or site settings |
| 120 | `"Bekräftad"` (badge) | CMS or site settings |
| 127 | `"Till startsidan"` | CMS or site settings |
| 142 | `"Något gick fel"` | CMS or site settings |
| 145 | `"Det uppstod ett problem med din betalning. Kontakta oss om du har frågor."` | CMS or site settings |
| 150 | `"Kontakta oss"` | CMS or site settings |

**Impact:** The admin cannot customize booking confirmation messaging, which is critical for customer communication.

---

### C-02: NotFound.tsx — Entire page hardcoded

**File:** `packages/web/src/pages/NotFound.tsx`

| Line | Hardcoded text | Should come from |
|------|---------------|-----------------|
| 12 | `"Sidan hittades inte"` | CMS or site settings |
| 15 | `"Sidan du letar efter finns inte eller har flyttats."` | CMS or site settings |
| 21 | `"Till startsidan"` | CMS or site settings |
| 26 | `"Kontakta oss"` | CMS or site settings |

**Impact:** Admin can't customize the 404 experience.

---

### C-03: BookingPage.tsx — Full booking form hardcoded

**File:** `packages/web/src/pages/BookingPage.tsx`

This is the standalone booking page (not the Puck BookingForm block). All text is hardcoded.

| Line | Hardcoded text | Should come from |
|------|---------------|-----------------|
| 99 | `"Genomförd"` / `"Fullbokad"` (badges) | CMS |
| 102 | `"Kan inte boka"` | CMS |
| 105-107 | `"Denna utbildning har redan genomförts."` / `"Denna utbildning är fullbokad."` | CMS |
| 112 | `"Se andra utbildningar"` | CMS |
| 138 | `"Tillbaka"` | CMS |
| 142 | `"Boka plats"` (heading) | CMS |
| 176 | `"Dina uppgifter"` (card title) | CMS |
| 181-248 | Form labels: `"Namn *"`, `"E-post *"`, `"Telefon"`, `"Organisation/företag"`, `"Antal deltagare *"`, `"Meddelande"` | CMS |
| 248 | `"Eventuella frågor eller önskemål..."` (placeholder) | CMS |
| 255 | `"Totalt att betala"` | CMS |
| 265 | `"Bearbetar..."` / `"Gå till betalning"` | CMS |
| 270 | `"Du kommer att dirigeras till Stripe för säker betalning"` | CMS |

**Impact:** The booking form page has ~15+ hardcoded strings. If the admin wants to change wording (e.g., from "Boka plats" to "Anmäl dig"), they can't.

**Note:** The Puck `BookingForm` block has similar hardcoded text — see C-05.

---

### C-04: BookingCTA.tsx — Block renders hardcoded text NOT from props

**File:** `packages/shared/src/blocks/BookingCTA.tsx`

This block receives only a `style` prop. All visible text is hardcoded within the component.

| Line | Hardcoded text | Notes |
|------|---------------|-------|
| 28 | `"Denna utbildning har genomförts."` | Status message, not a prop |
| 40 | `"Denna utbildning är fullbokad."` | Status message, not a prop |
| 41 | `"Kontakta oss om du vill ställas i kö."` | Instruction, not a prop |
| 55 | `"Boka plats"` | Button text, not a prop |
| 65 | `"Intresserad av att delta?"` | Heading, not a prop |
| 66 | `"Boka din plats redan idag"` | Subtext, not a prop |
| 71 | `"Boka plats"` | Button text, not a prop |

**Impact:** Admin places this block but can't change any of its visible text. The heading, description, button text, and status messages are all baked in.

---

### C-05: BookingForm.tsx — Block renders hardcoded text NOT from props

**File:** `packages/shared/src/blocks/BookingForm.tsx`

This block only receives `showOrganization` and `showNotes` props. All text is hardcoded.

| Line | Hardcoded text | Notes |
|------|---------------|-------|
| 54-55 | `"Denna utbildning är fullbokad."` / `"Denna utbildning har genomförts."` | Status message |
| 133 | `"Namn *"` | Form label |
| 144 | `"E-post *"` | Form label |
| 156 | `"Telefon"` | Form label |
| 167 | `"Organisation"` | Form label |
| 178 | `"Antal deltagare *"` | Form label |
| 192 | `"Meddelande"` | Form label |
| 205 | `"Totalt"` | Price label |
| 216 | `"Bearbetar..."` / `"Gå till betalning"` | Button text |

**Impact:** Admin places BookingForm block but can't change form labels, button text, or status messages.

---

### C-06: ContactForm.tsx — Success message hardcoded

**File:** `packages/shared/src/blocks/ContactForm.tsx`

The ContactForm block has editable props for heading, description, and contact info — but the **success confirmation** after form submission is fully hardcoded.

| Line | Hardcoded text | Notes |
|------|---------------|-------|
| 123 | `"Skickar..."` / `"Skicka meddelande"` | Button text, not a prop |
| 134 | `"Tack för ditt meddelande!"` | Success heading, NOT editable |
| 135 | `"Vi återkommer så snart vi kan."` | Success body, NOT editable |

Form labels are also hardcoded:

| Line | Hardcoded text |
|------|---------------|
| 61 | `"Namn *"` |
| 72 | `"E-post *"` |
| 85 | `"Telefon"` |
| 96 | `"Ämne"` |
| 108 | `"Meddelande *"` |

**Impact:** Admin can customize heading/description but cannot change the confirmation message or form labels.

---

### C-07: Footer "Kontakt" heading hardcoded

**File:** `packages/web/src/components/Layout.tsx:338` and `packages/shared/src/puck-config.tsx:165`

Both Layout.tsx and the Puck preview SiteFooter render a hardcoded `"Kontakt"` section heading between the tagline column and the link columns:

```tsx
<h3 className="text-h4 mb-4">Kontakt</h3>
```

This heading is NOT part of the `SiteFooterConfig` type. The admin can edit company name, tagline, contact info, copyright, and link columns via Settings — but this "Kontakt" heading cannot be changed.

**Impact:** Minor since it's unlikely to change, but it breaks the "everything editable" principle.

---

### C-08: CourseList.tsx — Empty state hardcoded

**File:** `packages/shared/src/blocks/CourseList.tsx:130`

```
"Det finns inga utbildningar planerade just nu."
```

This empty state message is user-facing and not a prop. When there are no courses, visitors see this hardcoded text.

---

### C-09: PostGrid.tsx — Empty state hardcoded

**File:** `packages/shared/src/blocks/PostGrid.tsx:84`

```
"Inga inlägg hittades"
```

User-facing empty state, not a prop.

---

### C-10: ProductList.tsx — Empty state hardcoded

**File:** `packages/shared/src/blocks/ProductList.tsx:129`

```
"Inga produkter hittades."
```

User-facing empty state, not a prop.

---

### C-11: BlockRenderer.tsx — Error state hardcoded

**File:** `packages/web/src/components/BlockRenderer.tsx:14`

```
"Kunde inte ladda sidinnehåll."
```

If Puck JSON is corrupt, visitors see this hardcoded error message.

---

### C-12: PageCards.tsx — Empty state hardcoded

**File:** `packages/shared/src/blocks/PageCards.tsx:93`

```
"Inga undersidor hittades"
```

User-facing empty state when parentSlug returns no children, not a prop.

---

### C-13: Default header/footer configs TRIPLICATED and INCONSISTENT

**Files:**
- `packages/web/src/components/Layout.tsx:13-53` (defaultHeaderConfig/defaultFooterConfig)
- `packages/shared/src/puck-config.tsx:57-89` (defaultHeader/defaultFooter)
- `packages/admin/src/pages/Settings.tsx:37-77` (defaultHeader/defaultFooter)

These defaults are used when no site settings have been saved to the database. The Layout.tsx version and Settings.tsx version are identical and include `children` nav items for "Om oss" dropdown. But the **puck-config.tsx version is different** — it has a flat nav without children:

| Location | "Om oss" nav item |
|----------|-------------------|
| Layout.tsx | Has children: Mindfulness, Forskning, Om Fredrik |
| Settings.tsx | Has children: Mindfulness, Forskning, Om Fredrik |
| puck-config.tsx | **No children, just `{ label: 'Om oss', href: '#' }`** |

**Impact:** The Puck editor preview shows a simpler header than the actual public site when using defaults. Inconsistent experience.

---

## MEDIUM Findings

### M-01: CourseList.tsx — Badge/button text hardcoded

**File:** `packages/shared/src/blocks/CourseList.tsx`

| Line | Hardcoded text |
|------|---------------|
| 81 | `"Fullbokad"` / `"${spotsLeft} platser kvar"` (badges) |
| 110 | `"Läs mer"` (button) |
| 117 | `"Boka plats"` (button) |

These are not props and cannot be changed by the admin.

---

### M-02: ProductList.tsx — Type labels and badges hardcoded

**File:** `packages/shared/src/blocks/ProductList.tsx`

| Line | Hardcoded text |
|------|---------------|
| 22-28 | Type labels: `"Böcker"`, `"CD-skivor"`, `"Kort"`, `"Appar"`, `"Nedladdningar"` |
| 104 | `"Gratis"` |
| 107 | `"Slut i lager"` |
| 115 | `"Köp"` (button) |

---

### M-03: CourseInfo.tsx — Field labels hardcoded

**File:** `packages/shared/src/blocks/CourseInfo.tsx`

| Line | Hardcoded text |
|------|---------------|
| 44 | `"Plats"` |
| 45 | `"Datum"` |
| 46 | `"Pris"` |
| 47 | `"Platser"` / `"Fullbokad"` / `"av ... kvar"` |
| 51 | `"Sista anmälningsdag"` |

---

### M-04: CardGrid.tsx — Badge text hardcoded

**File:** `packages/shared/src/blocks/CardGrid.tsx`

| Line | Hardcoded text |
|------|---------------|
| 149 | `"Fullbokad"` / `"Platser kvar"` (badges for courses) |

---

### M-05: PricingTable.tsx — Highlight label hardcoded

**File:** `packages/shared/src/blocks/PricingTable.tsx:55`

```
"Populärt val"
```

This label appears on highlighted pricing items and is not a prop.

---

### M-06: PageHeader.tsx — Breadcrumb "Hem" hardcoded

**File:** `packages/shared/src/blocks/PageHeader.tsx:45`

```tsx
<a href="/" ...>Hem</a>
```

The breadcrumb root text is always "Hem" and is not a prop.

---

### M-07: Layout.tsx — Accessibility labels hardcoded

**File:** `packages/web/src/components/Layout.tsx`

| Line | Hardcoded text |
|------|---------------|
| 240 | `"Hoppa till innehåll"` (skip nav) |
| 254 | `aria-label="Huvudnavigering"` |
| 282 | `aria-label="Visa navigeringsmeny"` |

These are structural a11y labels. Rarely need changing, but hardcoded.

---

### M-08: EditToolbar.tsx — Button label hardcoded

**File:** `packages/web/src/components/EditToolbar.tsx`

| Line | Hardcoded text |
|------|---------------|
| 41 | `"Öppna i CMS"` |
| 49 | `"Dölj"` (tooltip) |

---

### M-09: BookingForm.tsx — Currency label hardcoded

**File:** `packages/shared/src/blocks/BookingForm.tsx:118`

```
kr/person
```

The "kr" currency and "/person" suffix are hardcoded.

---

### M-10: UniversalPage.tsx — Fallback title

**File:** `packages/web/src/pages/UniversalPage.tsx:65`

```tsx
.replace('__PAGE_TITLE__', page.title || 'Sida')
```

Fallback page title "Sida" when title is missing — minor but hardcoded.

---

## LOW Findings (Editor-only placeholders and error messages)

These are text strings visible only inside the Puck editor or during error conditions. They don't appear to end users under normal circumstances.

| File | Line | Text | Context |
|------|------|------|---------|
| RichText.tsx | 22 | `"Klicka för att lägga till text..."` | Editor empty state |
| ImageBlock.tsx | 46 | `"Välj en bild..."` | Editor empty state |
| Accordion.tsx | 91 | `"Lägg till frågor i inställningarna..."` | Editor empty state |
| FeatureGrid.tsx | 40 | `"Lägg till funktioner i inställningarna..."` | Editor empty state |
| StatsCounter.tsx | 23 | `"Lägg till statistik i inställningarna..."` | Editor empty state |
| ImageGallery.tsx | 38 | `"Lägg till bilder i inställningarna"` | Editor empty state |
| VideoEmbed.tsx | 49 | `"Klistra in en video-URL"` | Editor empty state |
| ButtonGroup.tsx | 49 | `"Lägg till knappar i inställningarna..."` | Editor empty state |
| PricingTable.tsx | 30 | `"Lägg till priser i inställningarna..."` | Editor empty state |
| NavigationMenu.tsx | 41 | `"Lägg till menyalternativ i inställningarna"` | Editor empty state |
| CardGrid.tsx | 209-210 | `"Lägg till kort..."` / `"Laddar..."` | Editor empty state |
| PageCards.tsx | 93 | `"Lägg till sidor manuellt eller ange en föräldersida"` | Editor instruction |
| BookingForm.tsx | 15 | `"Bokningsformulär visas här (data-bunden)"` | Editor placeholder |
| BookingCTA.tsx | 12 | `"Boknings-CTA visas här (data-bunden)"` | Editor placeholder |
| CourseInfo.tsx | 18 | `"Kursdetaljer visas här (data-bunden)"` | Editor placeholder |
| PostHeader.tsx | 15 | `"Inläggsrubrik visas här (data-bunden)"` | Editor placeholder |
| ContactForm.tsx | 48,53 | `"Kunde inte skicka meddelandet"` / `"Något gick fel"` | Error messages |
| ButtonGroup.tsx | 69 | `"Knapp"` | Fallback button text |

---

## What IS Properly CMS-Managed (GOOD)

For context, these areas are correctly CMS-managed:

1. **Site Header** — Logo text, nav items (with children), all come from `/api/site-settings`. Admin can edit via Settings page. Fallback defaults exist but are overridden once admin saves.

2. **Site Footer** — Company name, tagline, contact info, copyright, link columns — all from `/api/site-settings`. Admin edits via Settings page. **Exception:** the "Kontakt" heading is hardcoded (C-07).

3. **All Puck block defaultProps** — When an admin places a block (Hero, CTABanner, PersonCard, etc.), all text defaults are editable in the Puck sidebar. This is correct CMS behavior.

4. **Templates** (templates.ts) — Default home/page/post/course templates contain block instances with default prop values. These are editable once the admin opens the page in Puck. This is acceptable — it's how a template system works.

5. **Page content** — All via Puck editor or legacy HTML. Correctly CMS-managed.

6. **Course/Post/Product content** — All via Puck editor with data context. Correctly CMS-managed.

---

## Architecture Note: Hardcoded Text Concentration

The hardcoded text problem is concentrated in **3 areas**:

1. **Standalone page components** (BookingPage, BookingConfirmation, NotFound) — These are NOT Puck-rendered. They have their own JSX with all text inline. To fix: either convert them to Puck-rendered pages or extract strings to a site settings / translations config.

2. **Data-bound blocks** (BookingCTA, BookingForm, CourseInfo, CourseList) — These blocks render status-dependent text ("Fullbokad", "Boka plats", etc.) that isn't passed as props. To fix: add these as optional props with sensible defaults.

3. **ContactForm success state** — The block has props for heading/description but the success confirmation is hardcoded. To fix: add `successHeading` and `successMessage` props.

---

## Recommendations

### Priority 1 (Before launch)
- Add props to BookingCTA for heading, description, button text, full/completed messages
- Add props to BookingForm for button text, status messages, form labels
- Add success message props to ContactForm
- Convert BookingConfirmation to use site settings or a CMS-editable config

### Priority 2 (Should fix)
- Add empty state text props to CourseList, PostGrid, ProductList, PageCards
- Fix the triplicated default configs (C-13) — use a single source of truth
- Make the footer "Kontakt" heading part of the SiteFooterConfig

### Priority 3 (Nice to have)
- Convert NotFound.tsx to a CMS-editable page
- Add currency/label props to CourseInfo, BookingForm
- Make CourseList button text ("Läs mer", "Boka plats") configurable
