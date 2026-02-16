#!/usr/bin/env node
/**
 * Intelligent migration of legacy HTML content to structured Puck blocks.
 *
 * Parses HTML with cheerio and converts elements into appropriate Puck
 * components: Hero, RichText, ImageBlock, VideoEmbed, Testimonial, PageCards, CTABanner.
 *
 * Handles messy WordPress HTML: loose text nodes, images in <a> tags,
 * alignright/alignleft classes, missing <p> wrappers.
 *
 * Usage:
 *   node packages/scripts/migrate-to-puck.mjs                    # migrate all pages
 *   node packages/scripts/migrate-to-puck.mjs --dry-run           # preview without saving
 *   node packages/scripts/migrate-to-puck.mjs --slug=act          # migrate single page
 *   node packages/scripts/migrate-to-puck.mjs --slug=act --dry-run
 *   node packages/scripts/migrate-to-puck.mjs --force             # re-migrate already-migrated pages
 *
 * Run from project root. Requires wrangler auth for remote D1 access.
 */

import { execSync } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import * as cheerio from 'cheerio'

const DB_NAME = 'livskompass-db'
const WRANGLER_DIR = 'packages/api'
const TEMP_SQL = join(WRANGLER_DIR, '_migrate_temp.sql')

// Parse CLI flags
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const FORCE = args.includes('--force')
const slugArg = args.find(a => a.startsWith('--slug='))
const SLUG_FILTER = slugArg ? slugArg.split('=')[1] : null

// Hub pages that have child pages — get Hero + intro + PageCards
const HUB_SLUGS = new Set([
  'act', 'forskning-pa-metoden', 'material', 'mindfulness', 'utbildningar',
  'cd-skivor-medveten-narvaro-skivor-ovningar', 'tidningsartiklar-om-denna-act-intervention',
  'for-dig-som-gar-gruppledarutbildning',
])

// Special pages with custom block layouts
const SPECIAL_PAGES = {
  'kontakt': 'contact',
  'om-fredrik-livheim': 'about',
}

// ── D1 helpers ──

function d1Select(sql) {
  const escaped = sql.replace(/"/g, '\\"')
  const cmd = `cd ${WRANGLER_DIR} && npx wrangler d1 execute ${DB_NAME} --remote --command "${escaped}" --json 2>/dev/null`
  const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
  try {
    const parsed = JSON.parse(output)
    return parsed[0]?.results || []
  } catch {
    console.error('Failed to parse SELECT:', output.slice(0, 200))
    return []
  }
}

function d1Execute(sql) {
  writeFileSync(TEMP_SQL, sql, 'utf8')
  const cmd = `cd ${WRANGLER_DIR} && npx wrangler d1 execute ${DB_NAME} --remote --file=_migrate_temp.sql --json 2>/dev/null`
  try {
    execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
  } catch (e) {
    console.error('SQL execution error:', e.message?.slice(0, 200))
  }
}

function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL'
  return "'" + str.replace(/'/g, "''") + "'"
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// ── WordPress HTML preprocessor ──

/**
 * WordPress exports messy HTML: loose text nodes between tags, images
 * inside <a> wrappers, no <p> wrapping. This normalizes it into proper
 * block-level elements that cheerio can iterate cleanly.
 */
function preprocessWordPressHtml(html) {
  if (!html) return ''

  // Normalize line breaks: WordPress uses double newlines as paragraph breaks
  // First, replace \r\n with \n
  let h = html.replace(/\r\n/g, '\n')

  // Split by double newlines to find paragraph boundaries
  // But preserve existing block-level elements
  const blockTags = /^<\s*(p|div|h[1-6]|ul|ol|table|figure|blockquote|iframe|hr|section|article|form|pre)/i

  const lines = h.split(/\n{2,}/)
  const processed = lines.map(line => {
    const trimmed = line.trim()
    if (!trimmed) return ''
    // Already wrapped in a block element? Keep as-is
    if (blockTags.test(trimmed)) return trimmed
    // Single newlines within a paragraph → <br>
    const withBr = trimmed.replace(/\n/g, '<br>\n')
    return `<p>${withBr}</p>`
  })

  return processed.filter(Boolean).join('\n')
}

/**
 * Check if a cheerio element contains an image (directly or wrapped in <a>).
 * Returns the image info or null.
 */
function extractImage($, $el) {
  const tag = $el.prop('tagName')?.toLowerCase()

  // Direct <img>
  if (tag === 'img') {
    return {
      src: $el.attr('src') || '',
      alt: $el.attr('alt') || '',
      caption: '',
      alignment: getAlignment($el),
      link: '',
    }
  }

  // <figure> containing <img>
  if (tag === 'figure') {
    const img = $el.find('img').first()
    if (img.length) {
      return {
        src: img.attr('src') || '',
        alt: img.attr('alt') || '',
        caption: $el.find('figcaption').text().trim(),
        alignment: getAlignment(img) || getAlignment($el),
        link: '',
      }
    }
  }

  // <a> wrapping only an <img> (WordPress pattern)
  if (tag === 'a') {
    const children = $el.children()
    const img = $el.find('img')
    if (img.length && $el.text().trim() === '') {
      return {
        src: img.attr('src') || '',
        alt: img.attr('alt') || '',
        caption: '',
        alignment: getAlignment(img),
        link: $el.attr('href') || '',
      }
    }
  }

  // <p> or <div> containing only an image (or <a><img></a>)
  if (tag === 'p' || tag === 'div') {
    const textContent = $el.clone().find('img, a:has(img)').remove().end().text().trim()
    if (!textContent) {
      const img = $el.find('img').first()
      if (img.length) {
        const parentA = img.closest('a')
        return {
          src: img.attr('src') || '',
          alt: img.attr('alt') || '',
          caption: '',
          alignment: getAlignment(img) || getAlignment($el),
          link: parentA.length ? parentA.attr('href') || '' : '',
        }
      }
    }
  }

  return null
}

function getAlignment($el) {
  const cls = $el.attr('class') || ''
  if (cls.includes('alignright')) return 'right'
  if (cls.includes('alignleft')) return 'left'
  if (cls.includes('aligncenter')) return 'center'
  return ''
}

/**
 * Check if element is a video iframe
 */
function extractVideo($el) {
  const tag = $el.prop('tagName')?.toLowerCase()
  let iframe = null

  if (tag === 'iframe') iframe = $el
  else iframe = $el.find('iframe').first()

  if (!iframe?.length) return null

  const src = iframe.attr('src') || ''
  if (src.includes('youtube') || src.includes('youtu.be') || src.includes('vimeo')) {
    return { url: src }
  }
  return null
}

// ── HTML → Puck block conversion ──

function htmlToPuckBlocks(html, page) {
  if (!html || html.trim() === '') {
    return []
  }

  // Preprocess WordPress HTML to normalize structure
  const normalized = preprocessWordPressHtml(html)
  const $ = cheerio.load(normalized, { decodeEntities: false })
  const body = $('body')
  const blocks = []

  const pageTitle = page.title || ''
  let heroSubheading = page.meta_description || ''

  // Check for leading h1/h2 — extract for hero
  const firstEl = body.children().first()
  if (firstEl.length) {
    const tag = firstEl.prop('tagName')?.toLowerCase()
    if (tag === 'h1' || tag === 'h2') {
      const headingText = firstEl.text().trim()
      if (headingText === pageTitle) {
        // Title duplicated — remove it, grab next element as subheading
        const nextEl = firstEl.next()
        if (nextEl.length) {
          const nextTag = nextEl.prop('tagName')?.toLowerCase()
          if (nextTag === 'p' || nextTag === 'strong') {
            heroSubheading = nextEl.text().trim()
            nextEl.remove()
          }
        }
        firstEl.remove()
      } else {
        heroSubheading = headingText
        firstEl.remove()
      }
    }
  }

  // Also check if first element is a <p> with <strong> (WordPress subtitle pattern)
  // BUT only if it doesn't contain images — don't eat image content
  const newFirst = body.children().first()
  if (newFirst.length) {
    const tag = newFirst.prop('tagName')?.toLowerCase()
    const hasImages = newFirst.find('img').length > 0
    if (tag === 'p' && !hasImages && newFirst.find('strong').length && newFirst.text().trim().length < 200) {
      // Short bold paragraph = likely a subtitle
      if (!heroSubheading) {
        heroSubheading = newFirst.text().trim()
        newFirst.remove()
      }
    }
  }

  // Hero block
  blocks.push({
    type: 'Hero',
    props: {
      id: `Hero-${uid()}`,
      heading: pageTitle,
      subheading: heroSubheading,
      variant: 'gradient',
      backgroundColor: 'primary',
      backgroundImage: '',
      textAlignment: 'center',
      ctaPrimaryText: '',
      ctaPrimaryLink: '',
      ctaSecondaryText: '',
      ctaSecondaryLink: '',
      fullHeight: 'auto',
    },
  })

  // ── Special: contact page ──
  if (SPECIAL_PAGES[page.slug] === 'contact') {
    const remainingHtml = body.html()?.trim()
    if (remainingHtml) blocks.push(makeRichText(remainingHtml))
    blocks.push({
      type: 'ContactFormBlock',
      props: {
        id: `ContactFormBlock-${uid()}`,
        heading: 'Kontakta oss',
        description: 'Har du frågor? Hör av dig så återkommer vi så snart vi kan.',
        showPhone: true,
        showSubject: true,
      },
    })
    return blocks
  }

  // ── Special: about page → Columns (image + text) ──
  if (SPECIAL_PAGES[page.slug] === 'about') {
    // Extract leading figure/image for side-by-side layout
    const leadImg = body.find('figure, img, a > img').first()
    let aboutImage = null
    if (leadImg.length) {
      const imgEl = leadImg.prop('tagName')?.toLowerCase() === 'img' ? leadImg : leadImg.find('img').first()
      if (imgEl.length) {
        aboutImage = {
          src: imgEl.attr('src') || '',
          alt: imgEl.attr('alt') || '',
          caption: leadImg.prop('tagName')?.toLowerCase() === 'figure' ? leadImg.find('figcaption').text().trim() : '',
        }
        // Remove the figure/image from flow
        const figParent = imgEl.closest('figure')
        if (figParent.length) figParent.remove()
        else imgEl.closest('a').length ? imgEl.closest('a').remove() : imgEl.remove()
      }
    }

    if (aboutImage) {
      blocks.push({
        type: 'ImageBlock',
        props: {
          id: `ImageBlock-${uid()}`,
          src: aboutImage.src,
          alt: aboutImage.alt,
          caption: aboutImage.caption,
          size: 'medium',
          alignment: 'center',
          rounded: 'large',
          link: '',
        },
      })
    }

    // Rest as RichText
    const remaining = body.html()?.trim()
    if (remaining) blocks.push(makeRichText(remaining))
    return blocks
  }

  // ── Hub pages: intro + PageCards ──
  if (HUB_SLUGS.has(page.slug)) {
    // Collect non-link content as intro
    const children = body.children().toArray()
    let intro = ''
    for (const el of children) {
      const $el = $(el)
      const tag = el.tagName?.toLowerCase()

      // Skip pure link lists (these become PageCards)
      if (tag === 'p' || tag === 'a') {
        const links = $el.find('a')
        const text = $el.text().trim()
        // If the element is just a link or contains mostly links, skip it
        if (tag === 'a' || (links.length > 0 && !text.replace(links.text(), '').trim())) {
          $el.remove()
          continue
        }
      }
      // Stop at headings after intro content
      if ((tag === 'h2' || tag === 'h3') && intro.trim()) break

      intro += $.html($el)
      $el.remove()
    }
    if (intro.trim()) blocks.push(makeRichText(intro))

    blocks.push({
      type: 'PageCards',
      props: {
        id: `PageCards-${uid()}`,
        heading: '',
        parentSlug: page.slug,
        manualPages: [],
        columns: 2,
        showDescription: true,
        style: 'card',
      },
    })

    const remaining = body.html()?.trim()
    if (remaining) blocks.push(makeRichText(remaining))
    return blocks
  }

  // ── Content pages: iterate elements and extract blocks ──
  const allChildren = body.children().toArray()
  let richTextBuffer = ''

  for (const el of allChildren) {
    const $el = $(el)
    const tag = el.tagName?.toLowerCase()

    // Skip fully empty elements
    const hasContent = $el.text().trim() || $el.find('img, iframe').length
    if (!hasContent) continue

    // 1. Check for video iframes
    const video = extractVideo($el)
    if (video) {
      flushRichText()
      blocks.push({
        type: 'VideoEmbed',
        props: {
          id: `VideoEmbed-${uid()}`,
          url: video.url,
          aspectRatio: '16:9',
          caption: '',
        },
      })
      continue
    }

    // 2. Check for standalone image (img, figure, a>img, p>img, p>a>img)
    const image = extractImage($, $el)
    if (image) {
      flushRichText()
      blocks.push({
        type: 'ImageBlock',
        props: {
          id: `ImageBlock-${uid()}`,
          src: image.src,
          alt: image.alt,
          caption: image.caption,
          size: 'full',
          alignment: image.alignment || 'center',
          rounded: 'small',
          link: image.link || '',
        },
      })
      continue
    }

    // 3. Check for paragraph/element that CONTAINS an image mixed with text
    //    → separate the image out, keep text in RichText
    if ($el.find('img').length) {
      // Collect all images first
      const imgs = $el.find('img').toArray().map(imgNode => {
        const $img = $(imgNode)
        const $parentA = $img.closest('a')
        const imgData = {
          src: $img.attr('src') || '',
          alt: $img.attr('alt') || '',
          alignment: getAlignment($img),
          link: $parentA.length && !$parentA.text().trim() ? $parentA.attr('href') || '' : '',
        }
        // Remove the image (and its wrapping <a> if it's an image-only link)
        if ($parentA.length && !$parentA.text().trim()) {
          $parentA.remove()
        } else {
          $img.remove()
        }
        return imgData
      })

      // Add remaining text (without images) to RichText
      const textHtml = $.html($el).trim()
      if (textHtml && $el.text().trim()) {
        richTextBuffer += textHtml
      }
      flushRichText()

      // Add each extracted image as an ImageBlock
      for (const imgData of imgs) {
        blocks.push({
          type: 'ImageBlock',
          props: {
            id: `ImageBlock-${uid()}`,
            src: imgData.src,
            alt: imgData.alt,
            caption: '',
            size: 'full',
            alignment: imgData.alignment || 'center',
            rounded: 'small',
            link: imgData.link,
          },
        })
      }
      continue
    }

    // 4. Blockquotes → Testimonial
    if (tag === 'blockquote') {
      flushRichText()
      const quoteText = $el.find('p').first().text().trim() || $el.text().trim()
      const cite = $el.find('cite, footer').text().trim()
      blocks.push({
        type: 'Testimonial',
        props: {
          id: `Testimonial-${uid()}`,
          quote: quoteText,
          author: cite.replace(/^—\s*/, ''),
          role: '',
          avatar: '',
          style: 'card',
        },
      })
      continue
    }

    // 5. Everything else → accumulate into RichText buffer
    richTextBuffer += $.html($el)
  }

  // Flush remaining
  flushRichText()

  // Add CTA banner for content pages with enough content
  if (blocks.length >= 3) {
    blocks.push({
      type: 'CTABanner',
      props: {
        id: `CTABanner-${uid()}`,
        heading: 'Intresserad av att lära dig mer?',
        description: 'Utforska våra utbildningar och material',
        buttonText: 'Se utbildningar',
        buttonLink: '/utbildningar',
        variant: 'primary',
        backgroundColor: 'primary',
        alignment: 'center',
        fullWidth: true,
      },
    })
  }

  return blocks

  function flushRichText() {
    const cleaned = richTextBuffer.trim()
    if (cleaned) {
      blocks.push(makeRichText(cleaned))
      richTextBuffer = ''
    }
  }
}

function makeRichText(html) {
  return {
    type: 'RichText',
    props: {
      id: `RichText-${uid()}`,
      content: html.trim(),
      maxWidth: 'medium',
    },
  }
}

// ── Main migration ──

async function migrate() {
  console.log(`\n🔄 Puck Migration — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)
  if (SLUG_FILTER) console.log(`   Filtering: slug = ${SLUG_FILTER}`)
  if (FORCE) console.log(`   Force: re-migrating already-migrated pages`)
  console.log('')

  let where = FORCE
    ? "WHERE 1=1"
    : "WHERE (editor_version IS NULL OR editor_version = 'legacy' OR content_blocks IS NULL)"
  if (SLUG_FILTER) {
    where += ` AND slug = '${SLUG_FILTER.replace(/'/g, "''")}'`
  }

  console.log('Fetching pages...')
  const pages = d1Select(`SELECT id, slug, title, content, meta_description, parent_slug FROM pages ${where}`)
  console.log(`Found ${pages.length} pages to migrate\n`)

  if (pages.length === 0) {
    console.log('Nothing to migrate. Use --force to re-migrate already-migrated pages.')
    return
  }

  const results = { success: 0, error: 0 }

  for (const page of pages) {
    try {
      const puckBlocks = htmlToPuckBlocks(page.content, page)
      const puckData = JSON.stringify({
        content: puckBlocks,
        root: { props: {} },
        zones: {},
      })

      if (DRY_RUN) {
        console.log(`📄 ${page.slug} → ${puckBlocks.length} blocks:`)
        for (const block of puckBlocks) {
          const preview = block.type === 'RichText'
            ? ` (${block.props.content.length} chars)`
            : block.type === 'Hero'
            ? ` "${block.props.heading}"`
            : block.type === 'PageCards'
            ? ` parentSlug=${block.props.parentSlug}`
            : block.type === 'ImageBlock'
            ? ` ${block.props.src.split('/').pop()} align=${block.props.alignment}`
            : ''
          console.log(`   • ${block.type}${preview}`)
        }
        console.log('')
        results.success++
      } else {
        const sql = `UPDATE pages SET content_blocks = ${escapeSQL(puckData)}, editor_version = 'puck' WHERE id = ${escapeSQL(page.id)};`
        d1Execute(sql)
        console.log(`  ✓ ${page.slug} → ${puckBlocks.length} blocks`)
        results.success++
      }
    } catch (err) {
      console.error(`  ✗ ${page.slug}: ${err.message}`)
      results.error++
    }
  }

  // Also migrate posts (Hero + RichText)
  console.log('\nFetching posts...')
  let postWhere = FORCE
    ? "WHERE 1=1"
    : "WHERE (editor_version IS NULL OR editor_version = 'legacy' OR content_blocks IS NULL)"
  if (SLUG_FILTER) {
    postWhere += ` AND slug = '${SLUG_FILTER.replace(/'/g, "''")}'`
  }
  const posts = d1Select(`SELECT id, slug, title, content, excerpt FROM posts ${postWhere}`)
  console.log(`Found ${posts.length} posts to migrate\n`)

  for (const post of posts) {
    try {
      const postBlocks = []
      postBlocks.push({
        type: 'Hero',
        props: {
          id: `Hero-${uid()}`,
          heading: post.title || '',
          subheading: post.excerpt || '',
          variant: 'gradient',
          backgroundColor: 'primary',
          backgroundImage: '',
          textAlignment: 'center',
          ctaPrimaryText: '',
          ctaPrimaryLink: '',
          ctaSecondaryText: '',
          ctaSecondaryLink: '',
          fullHeight: 'auto',
        },
      })
      if (post.content?.trim()) {
        // Also preprocess and extract images from posts
        const normalized = preprocessWordPressHtml(post.content)
        const $ = cheerio.load(normalized, { decodeEntities: false })
        const body = $('body')
        // Extract leading images from post content
        const firstImg = body.children().first()
        const image = firstImg.length ? extractImage($, firstImg) : null
        if (image) {
          firstImg.remove()
          postBlocks.push({
            type: 'ImageBlock',
            props: {
              id: `ImageBlock-${uid()}`,
              src: image.src,
              alt: image.alt,
              caption: image.caption || '',
              size: 'full',
              alignment: 'center',
              rounded: 'small',
              link: image.link || '',
            },
          })
        }
        const remaining = body.html()?.trim()
        if (remaining) postBlocks.push(makeRichText(remaining))
      }

      const puckData = JSON.stringify({
        content: postBlocks,
        root: { props: {} },
        zones: {},
      })

      if (DRY_RUN) {
        console.log(`📰 ${post.slug} → ${postBlocks.length} blocks`)
        results.success++
      } else {
        const sql = `UPDATE posts SET content_blocks = ${escapeSQL(puckData)}, editor_version = 'puck' WHERE id = ${escapeSQL(post.id)};`
        d1Execute(sql)
        console.log(`  ✓ ${post.slug} → ${postBlocks.length} blocks`)
        results.success++
      }
    } catch (err) {
      console.error(`  ✗ ${post.slug}: ${err.message}`)
      results.error++
    }
  }

  try { unlinkSync(TEMP_SQL) } catch {}

  console.log(`\n${DRY_RUN ? '🔍 Dry run' : '✅ Migration'} complete!`)
  console.log(`   Success: ${results.success}`)
  console.log(`   Errors:  ${results.error}`)

  if (!DRY_RUN) {
    const remainingPages = d1Select("SELECT COUNT(*) as cnt FROM pages WHERE editor_version IS NULL OR editor_version = 'legacy'")
    const remainingPosts = d1Select("SELECT COUNT(*) as cnt FROM posts WHERE editor_version IS NULL OR editor_version = 'legacy'")
    console.log(`   Remaining legacy pages: ${remainingPages[0]?.cnt || 0}`)
    console.log(`   Remaining legacy posts: ${remainingPosts[0]?.cnt || 0}`)
  }
}

migrate().catch(console.error)
