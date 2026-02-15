# WordPress Migration Plan — livskompass.se

**Created**: 2026-02-15
**Source**: `/Volumes/SPACE 2/Ints design AB /2026/livskompass/livskompassse.WordPress.2026-02-04.xml`
**WordPress version**: 6.0.11 | **Export date**: 2026-02-04

---

## Source Data Summary

The XML export contains **848 items total**. After analysis, only **81 content items + ~240 media files** need migration. The rest is WordPress bloat (old private pages, orphaned media, plugin data, nav menus).

### Migrate (81 items)

| Type | Count | Notes |
|------|-------|-------|
| Published pages | 70 | 2 are empty (home-2, vad-ar-medveten-narvaro) |
| Published posts | 11 | All have real content |

### Skip (525 items)

| Type | Count | Reason |
|------|-------|--------|
| Private pages | 64 | Old expired registration forms (2014–2025) |
| Private posts | 3 | Old event announcements |
| Orphaned attachments | 369 | Not referenced in any published content |
| Nav menu items | 43 | Navigation rebuilt in new frontend |
| Contact forms (wpcf7) | 36 | New contact system exists |
| Plugin data | 9 | iThemes Security, ml-slider, wp_global_styles |
| Draft pages | 1 | Old registration form |

### Media Files

**609 total attachments** in the export. Only **240 are referenced** in published content.

#### By file type (all 609):

| Extension | Count | % |
|-----------|-------|---|
| .pdf | 257 | 42% |
| .pptx | 128 | 21% |
| .docx | 55 | 9% |
| .jpg | 51 | 8% |
| .mp4 | 27 | 4% |
| .doc | 18 | 3% |
| .ppt | 15 | 2% |
| .png | 13 | 2% |
| .mov | 13 | 2% |
| .jpeg | 10 | 2% |
| .mp3 | 6 | 1% |
| .key | 6 | 1% |
| .xlsx | 5 | <1% |
| .flv | 4 | <1% |
| .avi | 1 | <1% |

Heavily document-oriented (73% are PDFs/Office docs). Only 12% are images.

#### Media edge cases:

- **~205 media URLs** are referenced in page/post content but have NO matching attachment record in the export. Mostly old 2012–2013 uploads whose attachment records were lost. These must be fetched directly from the live server.
- **Mixed protocols**: 309 URLs use `http://`, 287 use `https://`. Some use `www.livskompass.se`, others `livskompass.se`.
- **Thumbnail variants**: 29 hardcoded thumbnail URLs in content (e.g., `-150x150.jpg`, `-724x1024.jpg`).
- **URL-encoded Swedish chars**: Some paths contain `%CC%88` (combining diacritics).

---

## Published Pages (70)

Hierarchical structure with indentation showing parent-child:

```
/act                                    ACT
  /vad-ar-act                           Vad är ACT?
  /om-detta-gruppformat-av-act          Om detta gruppformat av ACT
/act-grupp-for-ungdomar-13-19-ar        ACT-grupp för ungdomar 13-19 år
/act-pa-norska                          ACT på norska
/act-samtalskort                        ACT samtalskort
/act-samtalskort-norska                 ACT samtalskort - norska
/actonline                              ACTonline
/anmalningsblankett-stockholm-varen     Anmälningsblankett Stockholm våren 2026
/bestallning-av-cd-medveten-narvaro     Beställning av CD Medveten närvaro
/booster                                ACT Booster med Sissela Nutley
/forskning-pa-metoden                   Forskning på metoden
  /forskning-pa-detta-gruppformat-av-act-i-sverige
  /internationell-forskning-pa-ett-liknande-gruppformat-av-act
/home-2                                 Home (EMPTY — uses page builder)
/infor-gruppledarutbildning             Inför gruppledarutbildning
  /rekryteringsmaterial
/infor-pabyggnadsutbildning-for-ungdomar
/kontakt                                Kontakt
/material                               Material
  /act-conversation-cards
  /ahorarkopior-fran-forelasningar-med-fredrik-livheim
  /arbetsmaterial-att-ladda-hem
  /tidningsartiklar-om-denna-act-intervention   (ACT i media)
    /internationell-media-om-act
    /media-om-detta-act-gruppformat
    /ovrig-svensk-media-om-act
/material-for-act-att-leva-livet-fullt-ut
/material-for-group-leaders
/mindfulness                            Mindfulness
  /cd-skivor-medveten-narvaro-skivor-ovningar
    /cd-medveten-narvaro
      /bestallning-av-cd-medveten-narvaro-2
    /cd-nar-det-gor-ont-medveten-narvaro-yin-yoga
      /bestallning-av-cd-nar-det-gor-ont
  /instruktioner-for-att-kopa-appen-till-flera
  /jag-har-nu-webbapp
  /jagharnuiphoneapp
  /ovningar-for-kursdeltagare
  /ovningar-i-medveten-narvaro
  /tips-nar-du-ovar-medveten-narvaro
  /vad-ar-medveten-narvaro              (near-empty — only 22 chars)
/norge                                  Utdanning - online (Norwegian)
/om-fredrik-livheim                     Om Fredrik Livheim
/pressbilder                            Pressbilder
/stockholm-varen                        Stockholm - våren 2026
/utbildningar                           Utbildningar
  /act-inom-sis-och-bup
  /allman-information-om-gruppledarutbildningen
  /anmalningsblankett-att-leva-livet-fullt-ut
  /for-dig-som-gar-gruppledarutbildning
    /act-7-traffar
    /actonline-losenord
    /bestallning-ny-manual (x2 pages)
    /bestallning-parm-gruppdeltagare
    /filmer
    /filmer-till-act-kursen
    /matformular
    /ovrigt-material
    /pafyllnadsutbildningar
    /rekryteringsmaterial
    /traff-1 through /traff-5
  /forelasningar
  /infor-gruppledarutbildning-malmo
  /prosocial-ledarskapsutbildning
    /grupp-enhetschefer-2016
    /grupp-stab-metod-och-regionschefer-2016
```

## Published Posts (11)

| Date | Slug | Title |
|------|------|-------|
| 2013-04-29 | boken-mindful-employee... | Köp boken Mindful Employee |
| 2014-03-07 | act-i-grupp-effektivt... | ACT i grupp effektivt för stressade ungdomar |
| 2015-02-26 | fredrik-livheim-pratar... | Fredrik Livheim pratar om ACT i Nyhetsmorgon |
| 2016-09-25 | ova-medveten-narvaro... | Öva medveten närvaro med vår webbapp Jag Har Nu |
| 2017-01-19 | tid-att-leva-ute-nu... | Tid att leva |
| 2017-04-28 | fredrik-livheim-intervjuad-tv4 | Fredrik Livheim intervjuad i TV4 |
| 2019-02-20 | fredriks-doktorsavhandling... | Fredriks doktorsavhandling |
| 2019-07-31 | nyinspelade-filmer | Nyinspelade filmer |
| 2023-02-05 | tid-att-leva-testad... | "Tid att leva" testad i vetenskaplig studie |
| 2023-12-23 | fredrik-livheim-kollega | Fredrik Livheim medverkar i Kollega |
| 2025-12-08 | anmal-dig-till-utbildningar | Anmäl dig till kommande utbildningar |

---

## Migration Script Steps

### Step 1: Parse XML
- Extract all `<item>` elements
- Filter to published pages + published posts + referenced attachments only

### Step 2: Import Pages → D1
- Insert 70 published pages into `pages` table
- Map `wp:post_name` → `slug`
- Map `wp:post_parent` → `parent_slug` (resolve parent ID to slug)
- Map `content:encoded` → `content` (HTML)
- Set `status = 'published'`
- Preserve `wp:menu_order` → `sort_order`

### Step 3: Import Posts → D1
- Insert 11 published posts into `posts` table
- Map `wp:post_name` → `slug`
- Map `content:encoded` → `content`
- Map `pubDate` → `published_at`
- Extract featured image from `_thumbnail_id` postmeta

### Step 4: Download & Upload Media → R2
- Download 240 referenced attachments from `wp:attachment_url`
- Try fetching ~205 additional files referenced in content from live server
- Upload each to R2 bucket with key: `uploads/{year}/{month}/{filename}`
- Insert records into `media` table
- Skip WordPress thumbnail variants — only upload originals

### Step 5: Rewrite Content URLs
- Replace all `wp-content/uploads/...` URLs in page/post content with R2 URLs
- Normalize `http://` → `https://`
- Normalize `www.livskompass.se` → `media.livskompass.se`
- Handle URL-encoded Swedish characters

### Step 6: Validate
- Verify all pages/posts inserted correctly
- Verify all media URLs in content resolve to valid R2 objects
- Report any broken links or missing files

---

## 301 Redirect Map (old WordPress → new)

To be generated after migration. Key mappings:

```
# Posts: WordPress /{slug}/ → new /nyhet/{slug}
# Pages: most keep same slug under generic /:slug route
# Attachments: /wp-content/uploads/... → media.livskompass.se/uploads/...
```
