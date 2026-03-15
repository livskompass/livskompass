# Livskompass.se — Information Architecture & Content Plan

*Content audit completed 2026-02-21*

---

## Overview

The WordPress site had 72 pages. After migration to the new CMS, ALL pages are empty (zero content_blocks). This document categorizes every page and defines the modern IA.

**Content types in the new system:**
- **Pages** (72) — Static content pages using Puck visual editor
- **Courses** (7) — Dynamic, managed via course system with booking
- **Products** (6) — Dynamic, managed via product system
- **Posts** (10) — Blog/news, managed via post editor

---

## Navigation Structure (Modern IA)

```
Livskompass.se
│
├── / (Startsida)
│
├── /act                              ← ACT hub
│   ├── /vad-ar-act                   ← What is ACT?
│   └── /om-detta-gruppformat-av-act  ← About the group format
│
├── /mindfulness                      ← Mindfulness hub
│   ├── /vad-ar-medveten-narvaro      ← What is mindfulness?
│   ├── /ovningar-i-medveten-narvaro  ← Exercises
│   └── /tips-nar-du-ovar-medveten-narvaro ← Tips
│
├── /utbildningar                     ← Training hub (shows CourseList block)
│   ├── /allman-information-om-gruppledarutbildningen ← General info
│   ├── /for-dig-som-gar-gruppledarutbildning ← Trainee portal
│   ├── /forelasningar                ← Lectures
│   └── /infor-gruppledarutbildning   ← Pre-training info
│
├── /material                         ← Material hub (shows ProductList block)
│   ├── /arbetsmaterial-att-ladda-hem  ← Downloads
│   └── /tidningsartiklar-om-denna-act-intervention ← ACT in media
│
├── /forskning-pa-metoden             ← Research hub
│   ├── /forskning-pa-detta-gruppformat-av-act-i-sverige ← Swedish research
│   └── /internationell-forskning-pa-ett-liknande-gruppformat-av-act ← Intl research
│
├── /om-fredrik-livheim               ← About Fredrik
├── /kontakt                          ← Contact (ContactForm block)
└── /nyhet                            ← Blog (handled by PostGrid)
```

---

## Page Categories

### ESSENTIAL — Need Rich Puck Content (18 pages)

These are the core pages that make the site functional and complete. Each needs carefully crafted Puck content blocks.

| # | Slug | Title | Role | Blocks Plan |
|---|------|-------|------|-------------|
| 1 | `home-2` | Startsida | **Homepage** | Hero (centered, CTA to utbildningar), FeatureGrid (3 pillars: ACT, Mindfulness, Utbildningar), CourseList (upcoming), Testimonial, PostGrid (latest 3), CTABanner |
| 2 | `act` | ACT | **Hub page** | Hero (minimal), RichText (intro to ACT), PageCards (child pages), StatsCounter (research stats), CTABanner (to courses) |
| 3 | `vad-ar-act` | Vad är ACT? | Educational | PageHeader, RichText (comprehensive ACT explainer), Accordion (FAQ), ButtonGroup (links to courses) |
| 4 | `om-detta-gruppformat-av-act` | Om detta gruppformat | Educational | PageHeader, RichText (group format description), FeatureGrid (format benefits), CTABanner |
| 5 | `mindfulness` | Mindfulness | **Hub page** | Hero (minimal), RichText (intro), PageCards (child pages), ProductList (CDs, apps), CTABanner |
| 6 | `vad-ar-medveten-narvaro` | Vad är medveten närvaro | Educational | PageHeader, RichText (deep explainer), Accordion (common questions), ButtonGroup |
| 7 | `ovningar-i-medveten-narvaro` | Övningar i medveten närvaro | Practical | PageHeader, RichText (exercise descriptions), Accordion (individual exercises), CTABanner |
| 8 | `tips-nar-du-ovar-medveten-narvaro` | Tips när du övar | Practical | PageHeader, RichText (tips), FeatureGrid (tip cards), CTABanner |
| 9 | `utbildningar` | Utbildningar | **Hub page** | Hero (minimal), CourseList (all active), PageCards (child info pages), CTABanner |
| 10 | `allman-information-om-gruppledarutbildningen` | Allmän information | Info | PageHeader, RichText (training overview), FeatureGrid (what you learn), Accordion (practical details), CTABanner |
| 11 | `for-dig-som-gar-gruppledarutbildning` | Material för utbildade gruppledare | Portal | PageHeader, RichText (intro), PageCards (sub-resources), ButtonGroup |
| 12 | `forelasningar` | Föreläsningar | Info | PageHeader, RichText (lecture offerings), PricingTable (options), CTABanner |
| 13 | `forskning-pa-metoden` | Forskning på metoden | **Hub page** | Hero (minimal), RichText (research overview), StatsCounter (key numbers), PageCards (Swedish + Intl research) |
| 14 | `forskning-pa-detta-gruppformat-av-act-i-sverige` | Forskning i Sverige | Research | PageHeader, RichText (Swedish studies), Accordion (study summaries) |
| 15 | `internationell-forskning-pa-ett-liknande-gruppformat-av-act` | Internationell forskning | Research | PageHeader, RichText (international studies), Accordion (study summaries) |
| 16 | `material` | Material | **Hub page** | Hero (minimal), ProductList (all), PageCards (downloads, media articles), CTABanner |
| 17 | `om-fredrik-livheim` | Om Fredrik Livheim | Bio | PageHeader, PersonCard (Fredrik), RichText (bio), StatsCounter (experience), Testimonial |
| 18 | `kontakt` | Kontakt | Contact | PageHeader, ContactForm (split layout with contact details) |

### SECONDARY — Keep with Light Content (12 pages)

Important supporting pages that should have basic content but aren't top navigation targets.

| Slug | Title | Notes |
|------|-------|-------|
| `infor-gruppledarutbildning` | Inför gruppledarutbildning | Pre-training checklist — PageHeader + RichText + Accordion |
| `arbetsmaterial-att-ladda-hem` | Arbetsmaterial att ladda hem | Downloadable resources — PageHeader + RichText with download links |
| `tidningsartiklar-om-denna-act-intervention` | ACT i media | Media hub — PageHeader + PageCards (child media pages) |
| `pressbilder` | Pressbilder | Press photos — PageHeader + ImageGallery |
| `act-pa-norska` | ACT på norska | Norwegian content — PageHeader + RichText |
| `norge` | Utdanning Norge | Norwegian training — PageHeader + RichText + CTABanner |
| `material-for-act-att-leva-livet-fullt-ut` | Material för ACT | Book-specific material — PageHeader + RichText |
| `material-for-group-leaders` | Material for group leaders | English page — PageHeader + RichText |
| `act-conversation-cards` | ACT conversation cards | English product info — PageHeader + RichText |
| `ahorarkopior-fran-forelasningar-med-fredrik-livheim` | Åhörarkopior | Lecture handouts — PageHeader + RichText |
| `ovningar-for-kursdeltagare` | Övningar för kursdeltagare | Course exercises — PageHeader + RichText |
| `cd-skivor-medveten-narvaro-skivor-ovningar` | CD skivor | CD overview — redirects to /mindfulness or ProductList |

### ARCHIVE — Media Article Pages (5 pages)

These are reference pages about media coverage. Minimal content needed.

| Slug | Title | Notes |
|------|-------|-------|
| `internationell-media-om-act` | Internationell media om ACT | PageHeader + RichText (article links) |
| `media-om-detta-act-gruppformat` | Media om ACT-gruppformat | PageHeader + RichText (article links) |
| `ovrig-svensk-media-om-act` | Svensk media om ACT | PageHeader + RichText (article links) |
| `cd-medveten-narvaro` | CD Medveten Närvaro | Product detail → handled by product system |
| `cd-nar-det-gor-ont-medveten-narvaro-yin-yoga` | CD När det gör ont | Product detail → handled by product system |

### ARCHIVE — Trainee Portal Sub-pages (14 pages)

Resource pages under `/for-dig-som-gar-gruppledarutbildning/`. Keep as-is, light content.

| Slug | Parent | Title |
|------|--------|-------|
| `act-7-traffar` | for-dig-som-gar-gruppledarutbildning | ACT - 7 träffar |
| `traff-1-2` | " | Träff 1 |
| `traff-2` | " | Träff 2 |
| `traff-3` | " | Träff 3 |
| `traff-4` | " | Träff 4 |
| `traff-5-valfritt` | " | Träff 5 (valfritt) |
| `filmer` | " | Filmer |
| `filmer-till-act-kursen` | " | Filmer till ACT-kursen |
| `matformular` | " | Mätformulär |
| `ovrigt-material` | " | Övrigt material |
| `pafyllnadsutbildningar` | " | Påfyllnadsutbildningar |
| `rekryteringsmaterial` | " | Rekryteringsmaterial |
| `actonline-losenord` | " | ACTonline lösenord |
| `rekryteringsmaterial-infor-gruppledarutbildning` | infor-gruppledarutbildning | Rekryteringsmaterial |

### OBSOLETE — Should Be Removed or Redirected (15 pages)

These are duplicate order forms, event-specific pages now handled by the course/product/booking system, or outdated content.

| Slug | Title | Reason |
|------|-------|--------|
| `anmalningsblankett-stockholm-varen` | Anmälningsblankett Stockholm | Replaced by booking system |
| `anmalningsblankett-att-leva-livet-fullt-ut` | Anmälningsblankett | Replaced by booking system |
| `bestallning-av-cd-medveten-narvaro` | Beställning CD | Replaced by product system |
| `bestallning-av-cd-medveten-narvaro-2` | Beställning CD (dup) | Duplicate order form |
| `bestallning-av-cd-nar-det-gor-ont` | Beställning CD | Replaced by product system |
| `bestallning-ny-manual` | Beställning ny manual | Replaced by product system |
| `bestallning-ny-manual-2` | Beställning ny manual (dup) | Duplicate order form |
| `bestallning-parm-gruppdeltagare` | Beställning pärm | Replaced by product system |
| `stockholm-varen` | Stockholm våren 2026 | Handled by course `course-stockholm-varen-2026` |
| `booster` | ACT Booster | Handled by course `course-booster-2026` |
| `act-grupp-for-ungdomar-13-19-ar` | ACT ungdomar | Handled by course `course-act-ungdomar-2026` |
| `act-samtalskort` | ACT samtalskort | Handled by product `prod_act_samtalskort_sv` |
| `act-samtalskort-norska` | ACT samtalskort norska | Handled by product `prod_act_samtalskort_no` |
| `actonline` | ACTonline | Legacy digital program |
| `infor-pabyggnadsutbildning-for-ungdomar` | Inför påbyggnadsutbildning | Niche pre-training page |

### OBSOLETE — Legacy Group Pages (4 pages)

| Slug | Title | Reason |
|------|-------|--------|
| `grupp-enhetschefer-2016` | Grupp: Enhetschefer 2016 | 10 years old |
| `grupp-stab-metod-och-regionschefer-2016` | Grupp: Stab- metod- regionschefer 2016 | 10 years old |
| `act-inom-sis-och-bup` | ACT inom SiS och BUP | Handled by course `course-act-sis-bup` |
| `prosocial-ledarskapsutbildning` | Prosocial ledarskapsutbildning | Handled by course `course-prosocial-ledarskap` |
| `instruktioner-for-att-kopa-appen-till-flera` | Köpa appen till flera | Very niche app instructions |
| `jag-har-nu-webbapp` | Jag Här Nu webbapp | App info → link in mindfulness page instead |
| `jagharnuiphoneapp` | Jag Här Nu iPhone | App info → link in mindfulness page instead |

---

## Summary

| Category | Count | Action |
|----------|-------|--------|
| **Essential** | 18 | Rich Puck content blocks — PRIORITY |
| **Secondary** | 12 | Light content (PageHeader + RichText) |
| **Archive (media/trainee)** | 19 | Minimal content or PageCards hub |
| **Obsolete** | 23 | Mark unpublished or redirect |
| **Total** | 72 | |

---

## Dynamic Content (Not Pages)

These are handled by their own systems and don't need page content:

**Courses (7):** Rendered by CourseDetail component + CourseList block
- Gruppledarutbildning Stockholm/online våren 2026
- Gruppledarutbildning Norge online
- ACT Booster med Sissela Nutley
- ACT-grupp för ungdomar
- Föreläsningar
- Prosocial ledarskapsutbildning
- ACT inom SiS och BUP

**Products (6):** Rendered by ProductList block
- ACT Manual
- ACT samtalskort (SV)
- ACT samtalskort (NO)
- ACT conversation cards (EN)
- CD Medveten Närvaro
- CD När det gör ont

**Posts (10):** Rendered by PostGrid block + individual BlogPost view

---

## Implementation Priority

### Phase 1: Core Pages (must-have for launch)
1. Homepage (`home-2`)
2. ACT hub + 2 child pages
3. Mindfulness hub + 3 child pages
4. Utbildningar hub + 2 info pages
5. Forskning hub + 2 research pages
6. Material hub
7. Om Fredrik
8. Kontakt

### Phase 2: Supporting Pages
9. Föreläsningar
10. For-dig-som-gar-gruppledarutbildning (trainee portal)
11. Inför gruppledarutbildning
12. Secondary pages with basic content

### Phase 3: Cleanup
13. Unpublish obsolete pages
14. Set up 301 redirects for old URLs
