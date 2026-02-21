#!/usr/bin/env node

/**
 * Migration script: Convert hardcoded page routes to block-based pages.
 *
 * Creates or updates page records in D1 with content_blocks JSON,
 * replacing the need for hardcoded React components (Home.tsx, Courses.tsx, etc.)
 *
 * Usage:
 *   node packages/scripts/migrate-pages-to-blocks.mjs > packages/scripts/migration-pages-blocks.sql
 *   npx wrangler d1 execute livskompass-db --remote --file=packages/scripts/migration-pages-blocks.sql
 */

import { randomUUID } from 'crypto'

function puckData(blocks) {
  return JSON.stringify({
    content: blocks.map((b, i) => ({
      type: b.type,
      props: { id: b.id || `${b.type.toLowerCase()}-${i}`, ...b.props },
    })),
    root: { props: {} },
    zones: {},
  }).replace(/'/g, "''")
}

const pages = [
  {
    slug: 'hem',
    title: 'Startsidan',
    status: 'published',
    sort_order: 0,
    parent_slug: null,
    meta_description: 'Livskompass — ACT och mindfulness utbildningar med Fredrik Livheim',
    blocks: [
      {
        type: 'Hero',
        id: 'hero',
        props: {
          heading: 'Livskompass',
          subheading: 'ACT och mindfulness utbildningar med legitimerad psykolog Fredrik Livheim. Evidensbaserade metoder för ett rikare liv.',
          variant: 'gradient',
          backgroundColor: 'primary',
          textAlignment: 'center',
          ctaPrimaryText: 'Se utbildningar',
          ctaPrimaryLink: '/utbildningar',
          ctaSecondaryText: 'Om ACT',
          ctaSecondaryLink: '/act',
          fullHeight: 'auto',
          backgroundImage: '',
        },
      },
      {
        type: 'Spacer',
        id: 'spacer-1',
        props: { size: 'medium' },
      },
      {
        type: 'CourseList',
        id: 'courses',
        props: {
          heading: 'Kommande utbildningar',
          maxItems: 3,
          columns: 2,
          showBookButton: true,
          compactMode: true,
        },
      },
      {
        type: 'Spacer',
        id: 'spacer-2',
        props: { size: 'medium' },
      },
      {
        type: 'PostGrid',
        id: 'latest-posts',
        props: {
          heading: 'Senaste nyheterna',
          subheading: '',
          count: 3,
          columns: 3,
          showImage: true,
          showExcerpt: true,
          showDate: true,
          cardStyle: 'default',
        },
      },
      {
        type: 'Spacer',
        id: 'spacer-3',
        props: { size: 'large' },
      },
      {
        type: 'CTABanner',
        id: 'cta',
        props: {
          heading: 'Redo att börja?',
          description: 'Boka din plats på nästa utbildning i ACT eller mindfulness.',
          buttonText: 'Se utbildningar',
          buttonLink: '/utbildningar',
          variant: 'primary',
          backgroundColor: 'primary',
          alignment: 'center',
          fullWidth: true,
        },
      },
    ],
  },
  {
    slug: 'utbildningar',
    title: 'Utbildningar',
    status: 'published',
    sort_order: 2,
    parent_slug: null,
    meta_description: 'ACT och mindfulness utbildningar med Fredrik Livheim. Gruppledarutbildningar, workshops och föreläsningar.',
    blocks: [
      {
        type: 'PageHeader',
        id: 'header',
        props: {
          heading: 'Utbildningar',
          subheading: 'ACT och mindfulness utbildningar med Fredrik Livheim',
          alignment: 'left',
          size: 'large',
          showDivider: true,
        },
      },
      {
        type: 'CourseList',
        id: 'all-courses',
        props: {
          heading: '',
          maxItems: 0,
          columns: 2,
          showBookButton: true,
          compactMode: false,
        },
      },
    ],
  },
  {
    slug: 'nyhet',
    title: 'Nyheter',
    status: 'published',
    sort_order: 8,
    parent_slug: null,
    meta_description: 'Nyheter och uppdateringar från Livskompass.',
    blocks: [
      {
        type: 'PageHeader',
        id: 'header',
        props: {
          heading: 'Nyheter',
          subheading: 'Senaste nytt från Livskompass',
          alignment: 'left',
          size: 'large',
          showDivider: true,
        },
      },
      {
        type: 'PostGrid',
        id: 'all-posts',
        props: {
          heading: '',
          subheading: '',
          count: 20,
          columns: 3,
          showImage: true,
          showExcerpt: true,
          showDate: true,
          cardStyle: 'default',
        },
      },
    ],
  },
  {
    slug: 'kontakt',
    title: 'Kontakt',
    status: 'published',
    sort_order: 7,
    parent_slug: null,
    meta_description: 'Kontakta Fredrik Livheim och Livskompass.',
    blocks: [
      {
        type: 'PageHeader',
        id: 'header',
        props: {
          heading: 'Kontakt',
          subheading: 'Har du frågor? Hör av dig!',
          alignment: 'left',
          size: 'large',
          showDivider: true,
        },
      },
      {
        type: 'ContactForm',
        id: 'contact-form',
        props: {
          heading: 'Skicka ett meddelande',
          description: 'Fyll i formuläret nedan så återkommer vi så snart vi kan.',
          showPhone: true,
          showSubject: true,
          layout: 'split',
          contactName: 'Fredrik Livheim',
          contactTitle: 'Legitimerad psykolog och ACT-utbildare',
          contactEmail: 'livheim@gmail.com',
          contactPhone: '070-694 03 64',
        },
      },
    ],
  },
  {
    slug: 'material',
    title: 'Material',
    status: 'published',
    sort_order: 3,
    parent_slug: null,
    meta_description: 'Böcker, CD-skivor, kort och annat material om ACT och mindfulness.',
    blocks: [
      {
        type: 'PageHeader',
        id: 'header',
        props: {
          heading: 'Material',
          subheading: 'Böcker, CD-skivor, kort och annat material om ACT och mindfulness',
          alignment: 'left',
          size: 'large',
          showDivider: true,
        },
      },
      {
        type: 'ProductList',
        id: 'all-products',
        props: {
          heading: '',
          filterType: '',
          columns: 3,
        },
      },
    ],
  },
]

// Generate SQL
console.log('-- Migration: Convert hardcoded pages to block-based pages')
console.log('-- Generated: ' + new Date().toISOString())
console.log('-- Run: npx wrangler d1 execute livskompass-db --remote --file=packages/scripts/migration-pages-blocks.sql')
console.log('')

for (const page of pages) {
  const id = randomUUID().slice(0, 21)
  const blocksJson = puckData(page.blocks)

  console.log(`-- Page: ${page.slug}`)
  console.log(`INSERT INTO pages (id, slug, title, content, content_blocks, editor_version, meta_description, parent_slug, sort_order, status)`)
  console.log(`SELECT '${id}', '${page.slug}', '${page.title.replace(/'/g, "''")}', NULL, '${blocksJson}', 'puck', '${(page.meta_description || '').replace(/'/g, "''")}', ${page.parent_slug ? `'${page.parent_slug}'` : 'NULL'}, ${page.sort_order}, '${page.status}'`)
  console.log(`WHERE NOT EXISTS (SELECT 1 FROM pages WHERE slug = '${page.slug}');`)
  console.log('')
  console.log(`UPDATE pages SET content_blocks = '${blocksJson}', editor_version = 'puck', updated_at = datetime('now')`)
  console.log(`WHERE slug = '${page.slug}' AND (content_blocks IS NULL OR editor_version != 'puck');`)
  console.log('')
}

console.log('-- Migration complete')
