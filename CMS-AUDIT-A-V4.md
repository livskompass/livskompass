# CMS Content Audit A — V4

*Audited 2026-02-21 by content-architect*

---

## Executive Summary

All 72 pages have Puck content blocks and are published. No empty or legacy pages remain. However, ~95 Swedish UI strings are hardcoded in web components and ~50 in shared block components. These are functional but not CMS-editable.

---

## 1. Database Content Status

| Metric | Value |
|--------|-------|
| Total pages | 72 |
| Pages with Puck content | **72 (100%)** |
| Empty pages | **0** |
| Legacy (non-Puck) pages | **0** |
| Published pages | **72 (100%)** |
| Draft/unpublished pages | **0** |

**Smallest pages** (may need more content):
- `material-for-group-leaders` (580 bytes) — English page with minimal RichText
- `bestallning-av-cd-medveten-narvaro` (611 bytes) — Legacy order form
- `pressbilder` (617 bytes) — Press photos with minimal content
- `kontakt` (706 bytes) — Contact page (intentionally short, has ContactForm block)

**Duplicate pages** (should be consolidated):
- `rekryteringsmaterial` and `rekryteringsmaterial-infor-gruppledarutbildning` — identical content (5,980 bytes each)
- `bestallning-ny-manual` (1,679b) and `bestallning-ny-manual-2` (2,702b) — duplicate order forms
- `bestallning-av-cd-medveten-narvaro` (611b) and `bestallning-av-cd-medveten-narvaro-2` (1,616b) — duplicate CD order forms

---

## 2. Hardcoded Strings — Web Package (`packages/web/src/`)

### CRITICAL — User-Facing Booking Flow

**BookingPage.tsx** — 25 hardcoded strings:
- Form labels: "Namn *", "E-post *", "Telefon", "Organisation/företag", "Antal deltagare *", "Meddelande"
- Status badges: "Genomförd", "Fullbokad"
- Error messages: "Kunde inte starta betalningen. Försök igen.", "Något gick fel. Försök igen."
- Buttons: "Gå till betalning", "Bearbetar...", "Se andra utbildningar", "Tillbaka"
- Price: "kr/person", "kr"
- Headings: "Boka plats", "Dina uppgifter", "Kan inte boka", "Totalt att betala"
- Note: "Du kommer att dirigeras till Stripe för säker betalning"

**BookingConfirmation.tsx** — 18 hardcoded strings:
- Success: "Tack för din bokning!", "Din bokning är bekräftad...", "Bokningsnummer", "Bekräftad"
- Error: "Ingen bokning hittades", "Något gick fel", error messages
- Loading: "Bekräftar bokning...", "Behandlar betalning..."
- Buttons: "Till startsidan", "Se utbildningar", "Kontakta oss", "Tillbaka till utbildningar"
- Status: "Betalning avbruten", "Betalningen avbrotades. Ingen debitering har gjorts."

### HIGH — Navigation & Layout

**Layout.tsx** — 20 hardcoded strings (fallbacks for CMS-managed values):
- Header nav: "Livskompass", "ACT", "Utbildningar", "Material", "Om oss", "Kontakt", "Nyheter"
- Header dropdowns: "Mindfulness", "Forskning på metoden", "Om Fredrik Livheim"
- Footer: company name, tagline, copyright, section headings, all link labels
- Accessibility: "Hoppa till innehåll", "Huvudnavigering", "Visa navigeringsmeny", "Visa undersidor för..."
- **Note**: These ARE fallbacks for `getSiteSettings()` API — acceptable as defaults, but not CMS-editable if API fails

### MEDIUM — Error Pages & Admin UI

**NotFound.tsx** — 5 hardcoded strings:
- "Sidan hittades inte", "Sidan du letar efter finns inte eller har flyttats."
- "Till startsidan", "Kontakta oss"

**BlockRenderer.tsx** — 1 hardcoded string:
- "Kunde inte ladda sidinnehåll."

**EditToolbar.tsx** — 5 hardcoded strings (admin-only, acceptable):
- "Sparar...", "Sparat", "Fel vid sparning", "Öppna i CMS", "Dölj"

---

## 3. Hardcoded Strings — Shared Blocks (`packages/shared/src/blocks/`)

### CRITICAL — Form Components

**BookingForm.tsx** — 16 hardcoded strings:
- Form labels duplicated from BookingPage: "Namn *", "E-post *", "Telefon", "Organisation", "Antal deltagare *"
- Messages: "Denna utbildning är fullbokad.", "Denna utbildning har genomförts."
- Errors: "Kunde inte skapa bokning", "Något gick fel"
- Button: "Gå till betalning", "Bearbetar..."
- Price: "kr/person", "Totalt"

**ContactForm.tsx** — 12 hardcoded strings:
- Form labels: "Namn *", "E-post *", "Telefon", "Ämne", "Meddelande *"
- Errors: "Kunde inte skicka meddelandet", "Något gick fel"
- Loading: "Skickar..."
- **Note**: Some strings are configurable via props (heading, description, success messages) — good pattern

### HIGH — Dynamic Content Blocks

**ProductList.tsx** — 4 hardcoded strings:
- "Gratis" (free products), "Slut i lager" (out of stock), "Köp" (buy button), "Inga produkter hittades."

**CardGrid.tsx** — 5 hardcoded strings:
- Route paths: `/utbildningar/`, `/nyhet/`, `/produkter/`
- Badges: "Fullbokad", "Platser kvar"
- Empty/loading: "Lägg till kort i inställningarna...", "Laddar..."

**PostGrid.tsx** — 2 hardcoded strings:
- "Inga inlägg hittades", route path `/nyhet/`

### MEDIUM — Empty State Messages

These appear when block content is not configured — visible mainly in the CMS editor:
- **RichText.tsx**: "Klicka för att lägga till text..."
- **ImageBlock.tsx**: "Välj en bild..."
- **VideoEmbed.tsx**: "Klistra in en video-URL"
- **Accordion.tsx**: "Lägg till frågor i inställningarna..."
- **FeatureGrid.tsx**: "Lägg till funktioner i inställningarna..."
- **NavigationMenu.tsx**: "Lägg till menyalternativ i inställningarna"
- **ButtonGroup.tsx**: "Lägg till knappar i inställningarna..."

### LOW — Fallback Default Values (Acceptable)

These are prop defaults that only appear when content editors don't fill in values:
- **Hero.tsx**: "Rubrik här" (heading default)
- **PersonCard.tsx**: "Fredrik Livheim", "Legitimerad psykolog"
- **Testimonial.tsx**: "Ett fantastiskt citat här..."
- **PageHeader.tsx**: "Rubrik", "Hem" (breadcrumb root)
- **PostHeader.tsx**: "Alla inlägg", `/nyhet`
- **ContactForm.tsx**: "Kontakta oss", "Fredrik Livheim", contact details (all configurable via props)

---

## 4. Block Rendering Verification

All 18 essential pages use a diverse mix of blocks:

| Page | Blocks Used |
|------|-------------|
| Homepage | Hero, FeatureGrid, CourseList, Testimonial, PostGrid, CTABanner |
| ACT | Hero, RichText, PageCards, StatsCounter, CTABanner |
| Vad är ACT? | PageHeader, RichText, Accordion, ButtonGroup |
| Mindfulness | Hero, RichText, PageCards, ProductList, CTABanner |
| Utbildningar | Hero, CourseList, SeparatorBlock, PageCards, CTABanner |
| Forskning | Hero, RichText, StatsCounter, PageCards, CTABanner |
| Material | Hero, ProductList, SeparatorBlock, PageCards, CTABanner |
| Om Fredrik | PageHeader, PersonCard, RichText, StatsCounter, CTABanner |
| Kontakt | PageHeader, ContactForm |

**Block coverage**: 15 of 25 available block types are used across essential pages. Unused blocks (Columns, ImageBlock, ImageGallery, VideoEmbed, NavigationMenu, BookingForm, CourseInfo, BookingCTA, PricingTable, Spacer) are available for future content.

---

## 5. Recommendations

### Must Fix (Blocking reviewers)
1. **Booking flow strings** (BookingPage.tsx + BookingForm.tsx) — Most visible user-facing hardcoded text. Consider a translation constants file or CMS settings endpoint.
2. **Duplicate form labels** — BookingForm.tsx and BookingPage.tsx have identical hardcoded labels. Should share constants.

### Should Fix
3. **ProductList strings** ("Gratis", "Slut i lager", "Köp") — User-facing e-commerce text should be configurable.
4. **CardGrid route paths** — `/utbildningar/`, `/nyhet/`, `/produkter/` hardcoded. Should be constants or derived from config.
5. **Duplicate pages** — Consolidate the 3 pairs of duplicate pages (order forms, recruitment material).

### Acceptable As-Is
6. **Layout.tsx nav fallbacks** — Already CMS-managed via `getSiteSettings()`, hardcoded values are just fallbacks.
7. **Empty state messages** — Only visible in CMS editor, not public-facing. Acceptable as hardcoded.
8. **Prop defaults** (Hero, PersonCard, Testimonial) — Acceptable, they prompt editors to fill in real content.
9. **NotFound page** — System page, acceptable as hardcoded.
10. **EditToolbar** — Admin-only, not public-facing.

---

## 6. Overall Verdict

| Dimension | Status | Notes |
|-----------|--------|-------|
| Database content | **PASS** | All 72 pages have Puck content, all published |
| Essential page quality | **PASS** | 18 pages with rich, diverse block content |
| Secondary page coverage | **PASS** | 6 additional pages populated |
| Hardcoded strings (critical) | **FLAG** | ~40 strings in booking flow need extraction |
| Hardcoded strings (medium) | **FLAG** | ~20 strings in blocks (ProductList, CardGrid) |
| Hardcoded strings (low) | **PASS** | ~35 fallback/editor strings — acceptable |
| Block rendering | **PASS** | 15/25 block types in active use |
| Empty state handling | **PASS** | All blocks have graceful empty states |
