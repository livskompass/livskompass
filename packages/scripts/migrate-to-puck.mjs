#!/usr/bin/env node
/**
 * Migrate all pages and posts from legacy HTML to Puck format.
 * Wraps existing HTML content in a RichText block.
 *
 * Usage: node packages/scripts/migrate-to-puck.mjs
 * (Run from project root, requires wrangler auth)
 */

import { execSync } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'

const DB_NAME = 'livskompass-db'
const WRANGLER_DIR = 'packages/api'
const TEMP_SQL = join(WRANGLER_DIR, '_migrate_temp.sql')

/** Run a SELECT query using --command (works well for simple queries) */
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

/** Run UPDATE/INSERT statements using --file (avoids shell escaping issues with HTML) */
function d1Execute(sql) {
  writeFileSync(TEMP_SQL, sql, 'utf8')
  const cmd = `cd ${WRANGLER_DIR} && npx wrangler d1 execute ${DB_NAME} --remote --file=_migrate_temp.sql --json 2>/dev/null`
  try {
    execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
  } catch (e) {
    console.error('SQL execution error:', e.message?.slice(0, 200))
  }
}

function createPuckData(htmlContent) {
  if (!htmlContent || htmlContent.trim() === '') {
    return JSON.stringify({
      content: [],
      root: { props: {} },
      zones: {},
    })
  }

  return JSON.stringify({
    content: [
      {
        type: 'RichText',
        props: {
          id: `RichText-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          content: htmlContent,
          maxWidth: 'medium',
        },
      },
    ],
    root: { props: {} },
    zones: {},
  })
}

function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL'
  return "'" + str.replace(/'/g, "''") + "'"
}

async function migrate() {
  console.log('Fetching legacy pages...')
  const pages = d1Select("SELECT id, slug, content FROM pages WHERE editor_version IS NULL OR editor_version = 'legacy'")
  console.log(`Found ${pages.length} pages to migrate`)

  if (pages.length > 0) {
    const statements = pages.map((page) => {
      const puckData = createPuckData(page.content)
      return `UPDATE pages SET content_blocks = ${escapeSQL(puckData)}, editor_version = 'puck' WHERE id = ${escapeSQL(page.id)};`
    })

    // Execute in batches of 5 to avoid overly large SQL files
    for (let i = 0; i < statements.length; i += 5) {
      const batch = statements.slice(i, i + 5)
      d1Execute(batch.join('\n'))
      for (let j = i; j < Math.min(i + 5, pages.length); j++) {
        console.log(`  ✓ ${pages[j].slug}`)
      }
    }
  }

  console.log('\nFetching legacy posts...')
  const posts = d1Select("SELECT id, slug, content FROM posts WHERE editor_version IS NULL OR editor_version = 'legacy'")
  console.log(`Found ${posts.length} posts to migrate`)

  if (posts.length > 0) {
    const statements = posts.map((post) => {
      const puckData = createPuckData(post.content)
      return `UPDATE posts SET content_blocks = ${escapeSQL(puckData)}, editor_version = 'puck' WHERE id = ${escapeSQL(post.id)};`
    })

    for (let i = 0; i < statements.length; i += 5) {
      const batch = statements.slice(i, i + 5)
      d1Execute(batch.join('\n'))
      for (let j = i; j < Math.min(i + 5, posts.length); j++) {
        console.log(`  ✓ ${posts[j].slug}`)
      }
    }
  }

  // Cleanup temp file
  try { unlinkSync(TEMP_SQL) } catch {}

  console.log('\nMigration complete!')

  // Verify
  const remainingPages = d1Select("SELECT COUNT(*) as cnt FROM pages WHERE editor_version IS NULL OR editor_version = 'legacy'")
  const remainingPosts = d1Select("SELECT COUNT(*) as cnt FROM posts WHERE editor_version IS NULL OR editor_version = 'legacy'")
  console.log(`Remaining legacy pages: ${remainingPages[0]?.cnt || 0}`)
  console.log(`Remaining legacy posts: ${remainingPosts[0]?.cnt || 0}`)
}

migrate().catch(console.error)
