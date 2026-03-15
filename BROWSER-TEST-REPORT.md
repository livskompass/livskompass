# Browser Test Report

**Date**: 2026-03-15
**Tester**: browser-test agent
**Servers**: Web (localhost:3000), Admin (localhost:3001), API proxied to production

---

## Public Site Routes (localhost:3000)

| Route | HTTP | Has Content | Notes |
|---|---|---|---|
| `/` | 200 | SPA shell | Client-rendered; API feeds content |
| `/mindfulness` | 200 | SPA shell | Page exists in API, 2441b Puck blocks, 8 children |
| `/utbildningar` | 200 | SPA shell | Page exists, 1932b blocks, 7 children |
| `/material` | 200 | SPA shell | Page exists, 1662b blocks, 4 children |
| `/nyhet` | 200 | SPA shell | Blog route; 10 posts available via API |
| `/kontakt` | 200 | SPA shell | Page exists, 706b blocks + 2996b legacy content |
| `/act` | 200 | SPA shell | Page exists, 2663b blocks, 2 children |
| `/forskning-pa-metoden` | 200 | SPA shell | Page exists, 2278b blocks, 2 children |
| `/om-fredrik-livheim` | 200 | SPA shell | Page exists, 2781b blocks, largest content (8124b total) |
| `/nonexistent-route` | 200 | SPA shell | Client-side 404 handling (expected for SPA) |

**Note**: All public routes return the same SPA HTML shell (~1902 bytes). Content is client-side rendered via React. The HTML shell includes proper `lang="sv"`, OG meta tags, and Swedish descriptions.

---

## API Endpoints (via proxy localhost:3000/api)

| Endpoint | HTTP | Count | Sample Content |
|---|---|---|---|
| `GET /api/pages` | 200 | 72 pages | "Mindfulness", "ACT", etc. |
| `GET /api/posts` | 200 | 10 posts | "Anmal dig till vara kommande utbildningar" |
| `GET /api/courses` | 200 | 7 courses | "Prosocial - ledarskapsutbildning" |
| `GET /api/products` | 200 | 6 products | "ACT Manual - Att hantera stress..." |

### Specific Page Endpoints

| Endpoint | HTTP | Editor | Blocks | Content | Children | Status |
|---|---|---|---|---|---|---|
| `/api/pages/mindfulness` | 200 | puck | 2441b | 0b | 8 | published |
| `/api/pages/act` | 200 | puck | 2663b | 200b | 2 | published |
| `/api/pages/utbildningar` | 200 | puck | 1932b | 912b | 7 | published |
| `/api/pages/material` | 200 | puck | 1662b | 859b | 4 | published |
| `/api/pages/kontakt` | 200 | puck | 706b | 2996b | 0 | published |
| `/api/pages/forskning-pa-metoden` | 200 | puck | 2278b | 262b | 2 | published |
| `/api/pages/om-fredrik-livheim` | 200 | puck | 2781b | 4614b | 0 | published |

### Subpage Endpoints

| Endpoint | HTTP | Has Blocks | Has Content | Title |
|---|---|---|---|---|
| `/api/pages/vad-ar-medveten-narvaro` | 200 | yes | no | Vad ar medveten narvaro |
| `/api/pages/cd-skivor-medveten-narvaro-skivor-ovningar` | 200 | yes | yes | CD skivor medveten narvaro |
| `/api/pages/vad-ar-act` | 200 | yes | yes | Vad ar ACT? |
| `/api/pages/actonline` | 200 | yes | yes | ACTonline |
| `/api/pages/pressbilder` | 200 | yes | yes | Pressbilder |
| `/api/pages/norge` | 200 | yes | yes | Utdanning - online. ACT... |

### 404 Handling

| Endpoint | HTTP | Notes |
|---|---|---|
| `/api/pages/nonexistent-slug-12345` | 404 | Correct — returns error JSON |

---

## Posts (first 5 of 10)

| Slug | Editor | Has Blocks | Has Content |
|---|---|---|---|
| anmal-dig-till-vara-kommande-utbildningar | puck | yes | yes |
| fredrik-livheim-medverkar-i-facktidningen-kollega | puck | yes | yes |
| tid-att-leva-testad-i-vetenskaplig-studie-pre... | puck | yes | yes |
| nyinspelade-filmer | puck | yes | yes |
| fredriks-doktorsavhandling-nu-publicerad | puck | yes | yes |

---

## Courses (7 total)

| Slug | Editor | Has Blocks | Has Description | Price (SEK) |
|---|---|---|---|---|
| prosocial-ledarskapsutbildning | legacy | no | yes | - |
| forelasningar | legacy | no | yes | - |
| act-inom-sis-och-bup | legacy | no | yes | - |
| stockholm-varen | legacy | no | yes | 16500 |
| norge | legacy | no | yes | 16500 |
| booster | legacy | no | yes | 1500 |
| act-grupp-for-ungdomar-13-19-ar | legacy | no | yes | 12500 |

**Note**: All courses use `legacy` editor (no Puck blocks). Content is in `description` field only.

---

## Products (6 total)

| Slug | Type | Price (SEK) | Has Description |
|---|---|---|---|
| act-manual | manual | 1750 | yes |
| act-conversation-cards | kort | 133 | yes |
| act-samtalskort | kort | 133 | yes |
| act-samtalskort-norska | kort | 149 | yes |
| cd-medveten-narvaro | cd | 149 | yes |
| cd-nar-det-gor-ont | cd | 149 | yes |

---

## Admin Routes (localhost:3001)

| Route | HTTP | Notes |
|---|---|---|
| `/` | 200 | Dashboard |
| `/pages` | 200 | Pages list |
| `/posts` | 200 | Posts list |
| `/courses` | 200 | Courses list |
| `/bookings` | 200 | Bookings list |
| `/products` | 200 | Products list |
| `/pages/new` | 200 | New page editor |
| `/posts/new` | 200 | New post editor |
| `/courses/new` | 200 | New course editor |
| `/products/new` | 200 | New product editor |

---

## Summary

| Category | Result | Details |
|---|---|---|
| Public routes | PASS | All 9 main routes return 200 |
| API list endpoints | PASS | 72 pages, 10 posts, 7 courses, 6 products |
| Page content | PASS | All 7 main pages have Puck blocks + published status |
| Subpages | PASS | All 6 tested subpages have content |
| Posts | PASS | All tested posts have Puck blocks |
| Courses | PASS | All 7 have descriptions (legacy editor, no Puck blocks) |
| Products | PASS | All 6 have descriptions and prices |
| Admin routes | PASS | All 10 routes return 200 |
| 404 handling | PASS | API returns 404 for missing slugs |
| HTML shell | PASS | Proper lang="sv", OG tags, meta descriptions |

### Issues Found

1. **Courses use legacy editor only** — All 7 courses have `editor_version: "legacy"` with no Puck content_blocks. They rely solely on the `description` field. Not a bug (they were migrated from WordPress), but they won't benefit from the visual editor unless re-edited.

2. **3 courses have no price** — `prosocial-ledarskapsutbildning`, `forelasningar`, and `act-inom-sis-och-bup` have `price_sek: null`. This may be intentional (free/TBD) or missing data.

3. **SPA limitation** — All public routes return the same HTML shell. Content correctness depends entirely on client-side rendering working properly. Server-side rendering (SSR) would improve SEO and initial load. Cannot verify actual rendered content via curl alone.

### Verdict: **PASS** — All routes respond, all API endpoints return real Swedish content, no 500 errors encountered.
