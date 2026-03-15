# CMS Content Audit A — Independent Validation

**Auditor**: cms-audit-a
**Date**: 2026-02-21
**Scope**: Every `.tsx` file in `packages/web/src/` and `packages/shared/src/blocks/`, plus `puck-config.tsx`, `templates.ts`, and supporting files.

**Methodology**: Bottom-up — started from buttons/labels/placeholders, then error states/badges, then sections (header/footer/nav), then page-level templates.

**Classification**:
- **CMS-EDITABLE**: Text is either a Puck block `defaultProp` (admin changes via editor), from the API/database, or from the site settings API. These are OK.
- **HARDCODED**: User-facing text baked into React components with no admin control. These are flagged.
- **EDITOR-ONLY**: Placeholder text visible only inside the Puck editor, not on the public site. These are acceptable.
- **A11Y**: Accessibility labels (aria-label, skip links). Generally not CMS-editable in any system. Low priority.

---

## Summary

| Severity | Count | Description |
|----------|-------|-------------|
| CRITICAL | 3 | Major user-facing flows with zero CMS control |
| HIGH | 5 | Visible hardcoded strings users encounter regularly |
| MEDIUM | 4 | Block-level hardcoded strings within Puck blocks |
| LOW | 3 | Accessibility strings, editor placeholders, fallbacks |

---

## CRITICAL FINDINGS

### C1: BookingPage.tsx — Entire booking flow is hardcoded (~20 strings)

**File**: `packages/web/src/pages/BookingPage.tsx`
**Impact**: Every user who books a course sees this page. Zero admin control over any text.

| Line | Hardcoded String | Context |
|------|-----------------|---------|
| 57 | `'Boka plats'` | Page title (useDocumentTitle fallback) |
| 66 | `'Kunde inte starta betalningen. Försök igen.'` | Error message |
| 70 | `'Något gick fel. Försök igen.'` | Error message |
| 99 | `'Genomförd'` / `'Fullbokad'` | Badge labels |
| 102 | `'Kan inte boka'` | Heading when course unavailable |
| 105-107 | `'Denna utbildning har redan genomförts.'` / `'...är fullbokad.'` | Status messages |
| 112 | `'Se andra utbildningar'` | Button text |
| 138 | `'Tillbaka'` | Back button |
| 142 | `'Boka plats'` | Page heading |
| 162 | `'kr/person'` | Price suffix |
| 176 | `'Dina uppgifter'` | Form section heading |
| 181 | `'Namn *'` | Form label |
| 192 | `'E-post *'` | Form label |
| 203 | `'Telefon'` | Form label |
| 213 | `'Organisation/företag'` | Form label |
| 223 | `'Antal deltagare *'` | Form label |
| 242 | `'Meddelande'` | Form label |
| 248 | `'Eventuella frågor eller önskemål...'` | Placeholder |
| 255 | `'Totalt att betala'` | Price summary label |
| 265 | `'Bearbetar...'` / `'Gå till betalning'` | Submit button states |
| 270 | `'Du kommer att dirigeras till Stripe för säker betalning'` | Info text |

**Note**: BookingPage has a future-proofing check for `courseAny.booking_blocks` (lines 82-88), but `booking_blocks` doesn't exist in the database schema. The entire default booking form is a static React component.

---

### C2: BookingConfirmation.tsx — Entire confirmation flow is hardcoded (~15 strings)

**File**: `packages/web/src/pages/BookingConfirmation.tsx`
**Impact**: Users see this immediately after payment. All text is static.

| Line | Hardcoded String | Context |
|------|-----------------|---------|
| 11 | `'Bokningsbekräftelse'` | Document title |
| 33 | `'Ingen bokning hittades'` | No booking ID state |
| 39 | `'Se utbildningar'` | Button text |
| 57 | `'Betalning avbruten'` | Cancelled heading |
| 59 | `'Betalningen avbrotades. Ingen debitering har gjorts.'` | Cancelled description |
| 65 | `'Tillbaka till utbildningar'` | Button text |
| 78 | `'Bekräftar bokning...'` | Loading text |
| 92 | `'Behandlar betalning...'` | Pending heading |
| 95 | `'Vi behandlar din bokning. Vänligen vänta...'` | Pending description |
| 108 | `'Tack för din bokning!'` | Success heading |
| 111 | `'Din bokning är bekräftad. Spara ditt bokningsnummer. Kontakta oss vid frågor.'` | Success description |
| 117 | `'Bokningsnummer'` | Label |
| 120 | `'Bekräftad'` | Badge text |
| 127 | `'Till startsidan'` | Button text |
| 142 | `'Något gick fel'` | Error heading |
| 145 | `'Det uppstod ett problem med din betalning. Kontakta oss om du har frågor.'` | Error description |
| 150 | `'Kontakta oss'` | Button text |

---

### C3: Block components have hardcoded Swedish strings NOT exposed as Puck fields

These are Puck blocks that admins CAN add to pages, but the internal text (status labels, button text, form labels, empty states) is baked into the component code. An admin cannot change "Boka plats" to "Anmäl dig" or "Fullbokad" to "Slutsåld" etc.

#### CourseList.tsx
| Line | Hardcoded String | Not Editable |
|------|-----------------|--------------|
| 81 | `'Fullbokad'` / `'${spotsLeft} platser kvar'` | Status badge |
| 110 | `'Läs mer'` | Link text |
| 117 | `'Boka plats'` | Button text |
| 103 | `'kr'` | Currency suffix |
| 130 | `'Det finns inga utbildningar planerade just nu.'` | Empty state |

#### ProductList.tsx
| Line | Hardcoded String | Not Editable |
|------|-----------------|--------------|
| 22-28 | `'Böcker'`, `'CD-skivor'`, `'Kort'`, `'Appar'`, `'Nedladdningar'` | Type labels |
| 104 | `'Gratis'` | Price fallback |
| 107 | `'Slut i lager'` | Stock status |
| 115 | `'Köp'` | Button text |
| 101 | `'kr'` | Currency suffix |
| 129 | `'Inga produkter hittades.'` | Empty state |

#### BookingCTA.tsx
| Line | Hardcoded String | Not Editable |
|------|-----------------|--------------|
| 28 | `'Denna utbildning har genomförts.'` | Status text |
| 40-41 | `'Denna utbildning är fullbokad.'` / `'Kontakta oss om du vill ställas i kö.'` | Status text |
| 55, 71 | `'Boka plats'` | Button text |
| 65 | `'Intresserad av att delta?'` | CTA heading |
| 66 | `'Boka din plats redan idag'` | CTA description |

#### CourseInfo.tsx
| Line | Hardcoded String | Not Editable |
|------|-----------------|--------------|
| 44 | `'Plats'`, `'Datum'`, `'Pris'`, `'Platser'` | Info labels |
| 47 | `'Fullbokad'` / `'${spotsLeft} av ${max} kvar'` | Availability text |
| 51 | `'Sista anmälningsdag'` | Deadline label |
| 46 | `'kr'` | Currency suffix |

#### ContactForm.tsx
| Line | Hardcoded String | Not Editable |
|------|-----------------|--------------|
| 61 | `'Namn *'` | Form label |
| 72 | `'E-post *'` | Form label |
| 85 | `'Telefon'` | Form label |
| 97 | `'Ämne'` | Form label |
| 108 | `'Meddelande *'` | Form label |
| 123 | `'Skickar...'` / `'Skicka meddelande'` | Button text |
| 134 | `'Tack för ditt meddelande!'` | Success heading |
| 135 | `'Vi återkommer så snart vi kan.'` | Success description |
| 48 | `'Kunde inte skicka meddelandet'` | Error fallback |
| 53 | `'Något gick fel'` | Error fallback |

#### BookingForm.tsx
| Line | Hardcoded String | Not Editable |
|------|-----------------|--------------|
| 133 | `'Namn *'` | Form label |
| 144 | `'E-post *'` | Form label |
| 156 | `'Telefon'` | Form label |
| 167 | `'Organisation'` | Form label |
| 178 | `'Antal deltagare *'` | Form label |
| 192 | `'Meddelande'` | Form label |
| 205 | `'Totalt'` | Price label |
| 216 | `'Bearbetar...'` / `'Gå till betalning'` | Button text |
| 118 | `'kr/person'` | Price suffix |
| 55 | `'Denna utbildning är fullbokad.'` / `'...har genomförts.'` | Status text |
| 84 | `'Kunde inte skapa bokning'` | Error fallback |
| 95 | `'Något gick fel'` | Error fallback |

#### PricingTable.tsx
| Line | Hardcoded String | Not Editable |
|------|-----------------|--------------|
| 55 | `'Populärt val'` | Highlighted badge |
| 61 | `'kr'` | Currency suffix |

#### PostGrid.tsx
| Line | Hardcoded String | Not Editable |
|------|-----------------|--------------|
| 84 | `'Inga inlägg hittades'` | Empty state |

---

## HIGH FINDINGS

### H1: NotFound.tsx — 404 page entirely hardcoded (4 strings)

**File**: `packages/web/src/pages/NotFound.tsx`

| Line | Hardcoded String |
|------|-----------------|
| 7, 12 | `'Sidan hittades inte'` |
| 15 | `'Sidan du letar efter finns inte eller har flyttats.'` |
| 21 | `'Till startsidan'` |
| 27 | `'Kontakta oss'` |

**Impact**: Users who hit a broken link see entirely static text.

---

### H2: Footer "Kontakt" section heading — hardcoded in Layout.tsx

**File**: `packages/web/src/components/Layout.tsx:338`
**Code**: `<h3 className="text-h4 mb-4">Kontakt</h3>`

The footer columns and links come from the CMS site settings, but the "Kontakt" section heading (above the email/phone) is hardcoded in the component template. Admin cannot rename this section heading via CMS.

Same issue in the Puck preview chrome: `packages/shared/src/puck-config.tsx:165`

---

### H3: BlockRenderer.tsx — error fallback message

**File**: `packages/web/src/components/BlockRenderer.tsx:14`
**Code**: `'Kunde inte ladda sidinnehåll.'`

If Puck JSON is malformed, users see this hardcoded error. Cannot be customized by admin.

---

### H4: UniversalPage.tsx — fallback page title

**File**: `packages/web/src/pages/UniversalPage.tsx:65`
**Code**: `'Sida'` (fallback when page has no title)

Minor but user-visible.

---

### H5: BookingPage.tsx — document title fallback

**File**: `packages/web/src/pages/BookingPage.tsx:57`
**Code**: `'Boka plats'` (useDocumentTitle fallback when course hasn't loaded)

---

## MEDIUM FINDINGS

### M1: CardGrid.tsx — badge text

**File**: `packages/shared/src/blocks/CardGrid.tsx:149`
**Code**: `'Fullbokad'` / `'Platser kvar'` — status badges on course cards

---

### M2: PageCards.tsx — empty state messages

**File**: `packages/shared/src/blocks/PageCards.tsx:93`
**Code**: `'Inga undersidor hittades'` / `'Lägg till sidor manuellt eller ange en föräldersida'`

The second string is editor-only, but the first appears on the public site if a parentSlug has no children.

---

### M3: puck-config.tsx — default props contain Swedish placeholder text

All Puck block defaultProps like `'Rubrik här'`, `'Skriv ditt innehåll här...'`, `'Ett fantastiskt citat här...'`, `'Fråga här'`/`'Svar här'`, `'Primär knapp'`, `'Home'` — these are initial values when an admin adds a block. They ARE editable (admin changes them immediately), so they're acceptable. However, they do serve as "starter text" that might slip through if an admin doesn't replace them.

**Verdict**: Acceptable — this is standard CMS behavior.

---

### M4: puck-config.tsx — Puck editor labels are in English

All Puck field labels and category names are in English: "Heading", "Subheading", "Primary button text", "Background", etc.

The admin UI is supposed to be in English per project rules, so this is correct. But the content entered by admins will be in Swedish. The mismatch is by design.

**Verdict**: Correct per CLAUDE.md rules (admin UI in English).

---

## LOW FINDINGS

### L1: Accessibility strings in Layout.tsx

| Line | String | Context |
|------|--------|---------|
| 240 | `'Hoppa till innehåll'` | Skip-to-content link |
| 254 | `'Huvudnavigering'` | aria-label on nav |
| 282 | `'Visa navigeringsmeny'` | aria-label on hamburger |
| 182 | `'Visa undersidor för ${item.name}'` | aria-label on dropdown |

These are accessibility labels for screen readers. No CMS in the world typically makes these editable. **Acceptable.**

---

### L2: Editor-only placeholder text in Puck blocks

The following strings appear ONLY inside the Puck editor (when a block has no content) and are never shown on the public site:

- `'Bokningsformulär visas här (data-bunden)'` — BookingForm.tsx:15
- `'Boknings-CTA visas här (data-bunden)'` — BookingCTA.tsx:12
- `'Kursdetaljer visas här (data-bunden)'` — CourseInfo.tsx:18
- `'Inläggsrubrik visas här (data-bunden)'` — PostHeader.tsx:15
- `'Klicka för att lägga till text...'` — RichText.tsx:22
- `'Lägg till kort i inställningarna...'` — CardGrid.tsx:209
- `'Lägg till funktioner i inställningarna...'` — FeatureGrid.tsx:40
- `'Lägg till statistik i inställningarna...'` — StatsCounter.tsx:22
- `'Lägg till priser i inställningarna...'` — PricingTable.tsx:30
- `'Lägg till knappar i inställningarna...'` — ButtonGroup.tsx:49
- `'Lägg till menyalternativ i inställningarna'` — NavigationMenu.tsx:41
- `'Lägg till sidor manuellt eller ange en föräldersida'` — PageCards.tsx:93

**Verdict**: Acceptable — editor UX guidance.

---

### L3: Admin-only toolbar text

- `'Öppna i CMS'` — EditToolbar.tsx:41
- `'Dölj'` — EditToolbar.tsx:49

These are only visible to logged-in admins on the public site. **Acceptable.**

---

## WHAT'S CORRECTLY CMS-MANAGED (Verified)

These areas are properly driven by the CMS:

1. **Site Header** — Logo text, nav items, dropdown children all from `getSiteSettings()` API. Fallback defaults in `defaultHeaderConfig` only used when CMS has no data. ✅
2. **Site Footer** — Company name, tagline, contact info, link columns, copyright all from `getSiteSettings()` API. ✅ (except the "Kontakt" heading, flagged above)
3. **All page content** — Rendered via Puck blocks stored in `content_blocks` column. ✅
4. **All post content** — Same pattern via PostDetail → BlockRenderer. ✅
5. **All course content** — Same pattern via CourseDetail → BlockRenderer. ✅
6. **Puck block props** — All block defaultProps are editable by admins via the Puck sidebar. ✅
7. **Default templates** — `defaultHomeTemplate`, `defaultPageTemplate`, `defaultPostTemplate`, `defaultCourseTemplate` are Puck JSON that pass through the standard block renderer with editable props. ✅
8. **Dynamic data** — CourseList, ProductList, PostGrid, CardGrid, PageCards all fetch from the API. Content comes from the database. ✅

---

## RECOMMENDATIONS

### Priority 1: Convert BookingPage and BookingConfirmation to Puck blocks

Create `BookingForm` and `BookingConfirmation` as Puck-rendered pages using the existing block system. The `BookingForm` block already exists but the page wrapper (BookingPage.tsx) bypasses it entirely. The confirmation page has no Puck equivalent at all.

**Alternative**: Extract all hardcoded strings into a "ui-strings" site setting stored in D1, fetched via the settings API. Admins edit strings via the Settings page.

### Priority 2: Add CMS-editable string props to block components

For blocks like CourseList, ProductList, BookingCTA, CourseInfo, ContactForm:
- Add props like `bookButtonText`, `readMoreText`, `emptyStateText`, `fullLabel`, `spotsLeftLabel`, etc.
- Wire these into the Puck field definitions in puck-config.tsx
- Use current hardcoded text as default values

### Priority 3: Fix footer "Kontakt" heading

The footer layout template should read section headings from the CMS `footerConfig` rather than hardcoding them. Currently the columns array has headings, but the separate "Kontakt" section above the email/phone is hardcoded.

### Priority 4: Create a CMS-managed 404 page

Either make NotFound a Puck-rendered page (with a special `404` slug), or add the 404 strings to the site settings.
