/**
 * Migration: Convert hardcoded templates to real CMS pages.
 *
 * Run: npx tsx scripts/migrate-templates-to-pages.ts
 *
 * Requires: ADMIN_TOKEN env var (get from localStorage in the admin browser console)
 * Uses: the local dev proxy (localhost:3000) or set API_URL env var
 */

const API_URL = process.env.API_URL || 'http://localhost:3000/api'
const TOKEN = process.env.ADMIN_TOKEN

if (!TOKEN) {
  console.error('Set ADMIN_TOKEN env var. Get it from browser console: localStorage.getItem("admin_token")')
  process.exit(1)
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`,
}

// Pages to create (only if they don't already exist)
const pages = [
  {
    slug: 'nyhet',
    title: 'Nyheter',
    status: 'published',
    meta_description: 'Senaste nyheterna från Livskompass',
    content_blocks: JSON.stringify({
      content: [
        {
          type: 'PageHeader',
          props: {
            id: 'page-header',
            heading: 'Nyheter',
            subheading: 'Senaste nyheterna från Livskompass',
            alignment: 'left',
            size: 'large',
            showDivider: true,
            breadcrumbs: [],
            sectionBg: 'transparent',
          },
        },
        {
          type: 'PostGrid',
          props: {
            id: 'posts',
            heading: '',
            subheading: '',
            count: 20,
            columns: 3,
            showImage: true,
            showExcerpt: true,
            showDate: true,
            cardStyle: 'default',
            cardColor: 'mist',
            sectionBg: 'transparent',
          },
        },
      ],
      root: { props: {} },
      zones: {},
    }),
    editor_version: 'puck',
  },
]

async function checkPageExists(slug: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/pages/${slug}`)
    return res.ok
  } catch {
    return false
  }
}

async function createPage(page: typeof pages[0]) {
  const exists = await checkPageExists(page.slug)
  if (exists) {
    console.log(`  ⏭  Page "${page.slug}" already exists — skipping`)
    return
  }

  const res = await fetch(`${API_URL}/admin/pages`, {
    method: 'POST',
    headers,
    body: JSON.stringify(page),
  })

  if (res.ok) {
    console.log(`  ✓  Created page "${page.title}" (/${page.slug})`)
  } else {
    const err = await res.text()
    console.error(`  ✗  Failed to create "${page.slug}": ${res.status} ${err}`)
  }
}

async function main() {
  console.log(`\nMigrating templates to real pages...\n`)
  console.log(`API: ${API_URL}`)
  console.log(`Pages to create: ${pages.length}\n`)

  for (const page of pages) {
    await createPage(page)
  }

  console.log(`\nDone. Hardcoded template fallbacks can now be removed.\n`)
}

main().catch(console.error)
