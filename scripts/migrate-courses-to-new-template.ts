/**
 * Migration: Convert every course's `content_blocks` to the new course template
 * (banner image → spacer → CourseHeader/RichText/CourseInfo + BookingForm → spacer).
 *
 * The course's existing `description` (or legacy `content` HTML) is injected
 * into the RichText slot inside the new template, so editorial copy is
 * preserved. Any custom block layout the admin added will be REPLACED — this
 * is an intentional bulk reset.
 *
 * Run:
 *   ADMIN_TOKEN=xxx npx tsx scripts/migrate-courses-to-new-template.ts
 *   ADMIN_TOKEN=xxx npx tsx scripts/migrate-courses-to-new-template.ts --dry-run
 *
 * Get the token from the admin browser console:
 *   localStorage.getItem('admin_token')
 *
 * Defaults to localhost:3000 proxy. Override with API_URL for prod:
 *   API_URL=https://livskompass-api.livskompass-config.workers.dev/api \
 *     ADMIN_TOKEN=xxx npx tsx scripts/migrate-courses-to-new-template.ts
 */

import { defaultCourseTemplate } from '../packages/shared/src/templates'

const API_URL = process.env.API_URL || 'http://localhost:3000/api'
const TOKEN = process.env.ADMIN_TOKEN
const DRY_RUN = process.argv.includes('--dry-run')

if (!TOKEN) {
  console.error('Set ADMIN_TOKEN env var. Get it from browser console: localStorage.getItem("admin_token")')
  process.exit(1)
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
}

interface Course {
  id: string
  slug: string
  title: string
  description?: string | null
  content?: string | null
  content_blocks?: string | null
  editor_version?: string | null
  location?: string | null
  start_date?: string | null
  end_date?: string | null
  price_sek?: number | null
  max_participants?: number | null
  registration_deadline?: string | null
  status?: string | null
}

/** Build the new template JSON for one course, injecting its legacy HTML into
 *  the RichText slot via the __LEGACY_CONTENT__ placeholder. */
function buildNewContentBlocks(course: Course): string {
  const legacyHtml = course.description || course.content || ''
  // JSON-escape the HTML so it's safe to drop into the stringified template.
  const safe = legacyHtml ? JSON.stringify(legacyHtml).slice(1, -1) : ''
  return defaultCourseTemplate.replace('__LEGACY_CONTENT__', safe)
}

async function main() {
  console.log(`\n→ Fetching courses from ${API_URL}`)
  const listRes = await fetch(`${API_URL}/admin/courses`, { headers })
  if (!listRes.ok) {
    console.error(`List failed: ${listRes.status} ${listRes.statusText}`)
    const body = await listRes.text()
    console.error(body)
    process.exit(1)
  }
  const listData = (await listRes.json()) as { courses: Course[] }
  const courses = listData.courses || []
  console.log(`  Found ${courses.length} course(s)`)

  if (DRY_RUN) {
    console.log('\n*** DRY-RUN MODE — no changes will be written ***\n')
  }

  let ok = 0
  let skipped = 0
  let failed = 0

  for (const summary of courses) {
    const label = `${summary.slug} (${summary.title})`

    // Fetch full course (list endpoint may not include description/content).
    const detailRes = await fetch(`${API_URL}/admin/courses/${summary.id}`, { headers })
    if (!detailRes.ok) {
      console.log(`  ✗ ${label} — fetch failed (${detailRes.status})`)
      failed++
      continue
    }
    const detail = (await detailRes.json()) as { course: Course }
    const course = detail.course

    // Skip if already migrated — detect by presence of CourseHeader block.
    if (course.content_blocks && course.content_blocks.includes('"CourseHeader"')) {
      console.log(`  — ${label} — already on new template, skipping`)
      skipped++
      continue
    }

    const newBlocks = buildNewContentBlocks(course)

    if (DRY_RUN) {
      console.log(`  · ${label} — would update (${(course.content_blocks || '').length} → ${newBlocks.length} chars)`)
      ok++
      continue
    }

    // PUT updates the full course. Include every nullable column as explicit
    // null so the server's INSERT/UPDATE bindings never see `undefined`.
    const putBody = {
      slug: course.slug,
      title: course.title,
      description: course.description ?? null,
      content: course.content ?? null,
      editor_version: 'puck',
      location: course.location ?? null,
      start_date: course.start_date ?? null,
      end_date: course.end_date ?? null,
      price_sek: course.price_sek ?? null,
      max_participants: course.max_participants ?? null,
      registration_deadline: course.registration_deadline ?? null,
      status: course.status ?? 'draft',
      content_blocks: newBlocks,
    }

    const putRes = await fetch(`${API_URL}/admin/courses/${course.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(putBody),
    })

    if (!putRes.ok) {
      const errBody = await putRes.text()
      console.log(`  ✗ ${label} — update failed (${putRes.status}): ${errBody}`)
      failed++
      continue
    }

    console.log(`  ✓ ${label} — migrated`)
    ok++
  }

  console.log(`\nDone: ${ok} migrated, ${skipped} skipped, ${failed} failed.\n`)
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
