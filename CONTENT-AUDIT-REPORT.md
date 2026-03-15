# Content Audit Report — Livskompass

**Date:** 2026-03-15
**API:** `https://livskompass-api.livskompass-config.workers.dev`

---

## Summary

| Type | Total | Puck Blocks | HTML Only (Legacy) | Empty | Issues |
|------|------:|:-----------:|:------------------:|:-----:|:------:|
| Pages | 72 | 72 (100%) | 0 | 0 | 34 thin, 1 legacy img |
| Posts | 10 | 10 (100%) | 0 | 0 | 0 excerpts |
| Courses | 7 | 0 | 0 | 0 | 7 missing fields |
| Products | 6 | 0 | 0 | 0 | 6 legacy HTML desc |

**Key finding:** All 72 pages and 10 posts have been migrated to Puck blocks. No legacy HTML-only content remains. However, courses and products still use plain text/HTML descriptions (no Puck blocks) and have several data quality issues.

---

## Page Status

All 72 pages are `published`. No drafts found in the public API.

### Block Type Usage Across All Pages

| Block Type | Count | Notes |
|-----------|------:|-------|
| RichText | 83 | Most-used block |
| Hero | 54 | Almost every page has one |
| CTABanner | 32 | Strong CTA presence |
| ImageBlock | 21 | |
| PageHeader | 18 | |
| PageCards | 9 | Child page navigation |
| Accordion | 6 | |
| ButtonGroup | 4 | |
| FeatureGrid | 4 | |
| StatsCounter | 3 | |
| ProductList | 2 | |
| SeparatorBlock | 2 | |
| CourseList | 2 | |
| ContactForm | 1 | Only on /kontakt |
| Testimonial | 1 | |
| PostGrid | 1 | |
| PersonCard | 1 | |

**Unused blocks (18 of 35 block types never used):** Columns, Spacer, PricingTable, CardGrid, ImageGallery, VideoEmbed, AudioEmbed, FileEmbed, EmbedBlock, NavigationMenu, BookingForm, CourseInfo, BookingCTA, PostHeader. These blocks exist in puck-config but are unused — verify they render correctly if a content editor tries to use them.

### Thin Pages (2 blocks or fewer) — 34 pages

These pages have minimal structure (typically just Hero + RichText). While not broken, they could benefit from richer block usage.

| Severity | Slug | Blocks | Text Length | Notes |
|----------|------|-------:|------------:|-------|
| **Critical** | `tidningsartiklar-om-denna-act-intervention` | 2 | 0 chars | PageHeader + PageCards only — no actual content |
| **Critical** | `kontakt` | 2 | 0 chars | PageHeader + ContactForm — functional but no intro text |
| **Warning** | `material-for-group-leaders` | 2 | 73 chars | Very thin — English page for international users |
| **Warning** | `bestallning-av-cd-medveten-narvaro` | 2 | 139 chars | Order page with almost no content |
| **Warning** | `pressbilder` | 2 | 212 chars | Press photos page — thin |
| OK | `traff-5-valfritt` | 2 | 351 chars | Training material |
| OK | 28 more pages | 2 | 363–19,702 chars | Adequate content despite low block count |

### Legacy HTML in RichText Blocks

1 page (`cd-skivor-medveten-narvaro-skivor-ovningar`) contains `<img>` tags with `/media/` paths inside RichText blocks. These should use the `ImageBlock` or `InlineImage` component instead.

### Media References

- **569 total `/media/` references** across all page blocks
- All reference paths in `/media/uploads/YYYY/MM/` format (2012–2025)
- **Spot-check: media files resolve correctly** (HTTP 200 from R2)

---

## Posts Audit (10 total)

All 10 posts have Puck blocks (2 blocks each: typically PostHeader + RichText). All have featured images.

| Issue | Count | Details |
|-------|------:|---------|
| Missing excerpt | 10 | **All 10 posts** have `null` excerpt — blog listing shows no preview text |
| Low block count | 10 | All posts have exactly 2 blocks — minimal structure |

**Recommendation:** Add excerpts to all posts for better blog listing UX. Consider enriching post content with more block types (images, CTAs).

---

## Courses Audit (7 total)

No courses have Puck content blocks — they rely on plain text `description` field only. All are status `active`.

| Slug | Price | Max Participants | Start Date | Issues |
|------|------:|-----------------:|:----------:|--------|
| `prosocial-ledarskapsutbildning` | — | — | — | NO_PRICE, NO_MAX, NO_DATE |
| `forelasningar` | — | — | — | NO_PRICE, NO_MAX, NO_DATE |
| `act-inom-sis-och-bup` | — | — | — | NO_PRICE, NO_MAX, NO_DATE |
| `stockholm-varen` | 16,500 | — | — | NO_MAX |
| `norge` | 16,500 | — | — | NO_MAX |
| `booster` | 1,500 | — | — | NO_MAX |
| `act-grupp-for-ungdomar-13-19-ar` | 12,500 | — | — | NO_MAX |

**Critical issues:**
- **3 courses have no price** — booking will fail or show SEK 0
- **ALL 7 courses missing `max_participants`** — the booking race condition fix (`current_participants + ? <= max_participants`) will always reject bookings when `max_participants` is NULL
- **No start/end dates set** — public site shows no scheduling info
- **No Puck blocks** — course detail pages render only the plain text description

---

## Products Audit (6 total)

All products have prices, images, and are in stock. However:

| Issue | Count | Details |
|-------|------:|---------|
| Legacy HTML in description | 6 | **All 6 products** have raw HTML with `<img>`, `<a>`, `<p>` tags in description |
| No Puck blocks | 6 | Products use `description` field only, no `content_blocks` |

The legacy HTML descriptions contain embedded images and links from WordPress. These render via `dangerouslySetInnerHTML` — functional but not editable via the CMS inline editor.

---

## Slug Conflicts (CRITICAL)

**7 pages share slugs with courses:**
- `prosocial-ledarskapsutbildning`, `forelasningar`, `act-inom-sis-och-bup`, `stockholm-varen`, `norge`, `booster`, `act-grupp-for-ungdomar-13-19-ar`

**4 pages share slugs with products:**
- `act-samtalskort`, `cd-medveten-narvaro`, `act-samtalskort-norska`, `act-conversation-cards`

This means the same slug is used for both a page (rendered at `/:slug`) and a course (at `/utbildningar/:slug`) or product. The **routing is currently correct** because pages use `/:slug` and courses use `/utbildningar/:slug`, but this creates confusion in the CMS — editing the "page" vs the "course" for the same topic.

**Recommendation:** Decide whether these entities should be pages, courses/products, or both. If both, ensure the page content links to the course/product detail page.

---

## Recommendations

### P0 — Must fix before launch

1. **Set `max_participants` on all 7 courses** — Without this, the booking atomic UPDATE will reject all bookings (NULL comparison fails)
2. **Set prices on 3 courses** — `prosocial-ledarskapsutbildning`, `forelasningar`, `act-inom-sis-och-bup` need prices or should be marked non-bookable
3. **Add excerpts to all 10 posts** — Blog listing shows blank preview cards

### P1 — Should fix before launch

4. **Migrate product descriptions to Puck blocks** — Replace legacy HTML descriptions with structured blocks
5. **Add start/end dates to courses** — Public site shows no scheduling info
6. **Resolve slug conflicts** — Clarify relationship between duplicate page/course/product entities
7. **Replace `<img>` tags in RichText** — `cd-skivor-medveten-narvaro-skivor-ovningar` has embedded images that should use ImageBlock

### P2 — Should fix (content quality)

8. **Enrich thin pages** — 34 pages have only 2 blocks; key pages like `kontakt` and `bestallning-av-cd-medveten-narvaro` need more content
9. **Verify unused block types render correctly** — 18 of 35 block types are never used in production content
10. **Add course Puck blocks** — All 7 courses have no `content_blocks`; course detail pages show only plain text description
