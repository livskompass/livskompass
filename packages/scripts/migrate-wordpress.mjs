#!/usr/bin/env node

/**
 * WordPress → Livskompass Migration Script
 *
 * Usage:
 *   node migrate-wordpress.mjs              # Full migration (pages + posts + media)
 *   node migrate-wordpress.mjs --dry-run    # Parse & report only, no DB writes
 *   node migrate-wordpress.mjs --pages-only # Only migrate pages & posts to D1
 *   node migrate-wordpress.mjs --media-only # Only download & upload media to R2
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { nanoid } from 'nanoid';
import { execSync } from 'child_process';
import { join, extname, basename } from 'path';

// ─── Config ──────────────────────────────────────────────────────────────────

const XML_PATH = '/Volumes/SPACE 2/Ints design AB /2026/livskompass/livskompassse.WordPress.2026-02-04.xml';
const D1_DB = 'livskompass-db';
const R2_BUCKET = 'livskompass-media';
const MEDIA_BASE_URL = 'https://media.livskompass.se';
const DOWNLOAD_DIR = '/tmp/livskompass-media-download';
const SQL_OUTPUT = join(import.meta.dirname, 'migration-output.sql');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const PAGES_ONLY = args.includes('--pages-only');
const USE_LOCAL = args.includes('--local');
const D1_TARGET = USE_LOCAL ? '--local' : '--remote';
const MEDIA_ONLY = args.includes('--media-only');

// ─── Parse XML ───────────────────────────────────────────────────────────────

console.log('📄 Parsing WordPress XML export...');

const xmlData = readFileSync(XML_PATH, 'utf-8');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  cdataPropName: '__cdata',
  // Preserve CDATA content
  isArray: (name) => name === 'item' || name === 'wp:postmeta' || name === 'wp:comment' || name === 'category',
});

const parsed = parser.parse(xmlData);
const channel = parsed.rss.channel;
const items = channel.item || [];

console.log(`   Found ${items.length} total items\n`);

// ─── Helper functions ────────────────────────────────────────────────────────

function getCdata(val) {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val.__cdata != null) return String(val.__cdata);
  if (typeof val === 'object' && val['#text'] != null) return String(val['#text']);
  return String(val);
}

function getPostMeta(item, key) {
  const metas = item['wp:postmeta'];
  if (!metas) return null;
  const metaArr = Array.isArray(metas) ? metas : [metas];
  for (const m of metaArr) {
    const k = getCdata(m['wp:meta_key']);
    if (k === key) return getCdata(m['wp:meta_value']);
  }
  return null;
}

function escSql(str) {
  if (str == null) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function getMediaType(filename) {
  const ext = extname(filename).toLowerCase();
  const map = {
    '.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.gif': 'image', '.webp': 'image', '.svg': 'image',
    '.pdf': 'pdf',
    '.mp4': 'video', '.mov': 'video', '.avi': 'video', '.flv': 'video', '.webm': 'video',
    '.mp3': 'audio', '.wav': 'audio', '.ogg': 'audio',
    '.doc': 'document', '.docx': 'document', '.ppt': 'document', '.pptx': 'document',
    '.xls': 'document', '.xlsx': 'document', '.key': 'document',
  };
  return map[ext] || 'other';
}

// ─── Categorize items ────────────────────────────────────────────────────────

const pages = [];
const posts = [];
const attachments = [];
const skipped = { private: 0, draft: 0, nav: 0, plugin: 0, revision: 0 };

// Build a map of WP post_id → item for resolving parent relationships and thumbnails
const itemById = new Map();
for (const item of items) {
  const wpId = getCdata(item['wp:post_id']);
  itemById.set(wpId, item);
}

for (const item of items) {
  const postType = getCdata(item['wp:post_type']);
  const status = getCdata(item['wp:status']);

  if (postType === 'page' && status === 'publish') {
    pages.push(item);
  } else if (postType === 'post' && status === 'publish') {
    posts.push(item);
  } else if (postType === 'attachment') {
    attachments.push(item);
  } else if (status === 'private') {
    skipped.private++;
  } else if (status === 'draft' || status === 'auto-draft') {
    skipped.draft++;
  } else if (postType === 'nav_menu_item') {
    skipped.nav++;
  } else if (['wpcf7_contact_form', 'itsec-dash-card', 'itsec-dashboard', 'wp_global_styles', 'ml-slider'].includes(postType)) {
    skipped.plugin++;
  } else if (postType === 'revision') {
    skipped.revision++;
  }
}

console.log('📊 Content breakdown:');
console.log(`   Published pages:  ${pages.length}`);
console.log(`   Published posts:  ${posts.length}`);
console.log(`   Attachments:      ${attachments.length}`);
console.log(`   Skipped private:  ${skipped.private}`);
console.log(`   Skipped draft:    ${skipped.draft}`);
console.log(`   Skipped nav:      ${skipped.nav}`);
console.log(`   Skipped plugin:   ${skipped.plugin}`);
console.log(`   Skipped revision: ${skipped.revision}`);
console.log();

// ─── Build attachment URL map (for rewriting content URLs) ───────────────────

const attachmentUrlMap = new Map(); // old WP URL → new R2 URL
const attachmentsByWpId = new Map(); // WP post_id → attachment info

for (const att of attachments) {
  const wpId = getCdata(att['wp:post_id']);
  const wpUrl = getCdata(att['wp:attachment_url']);
  const filePath = getPostMeta(att, '_wp_attached_file');

  if (wpUrl && filePath) {
    const r2Key = `uploads/${filePath}`;
    const r2Url = `${MEDIA_BASE_URL}/${r2Key}`;

    attachmentsByWpId.set(wpId, { wpUrl, filePath, r2Key, r2Url, wpId });
    attachmentUrlMap.set(wpUrl, r2Url);

    // Also map http variant
    if (wpUrl.startsWith('https://')) {
      attachmentUrlMap.set(wpUrl.replace('https://', 'http://'), r2Url);
    }
    // Also map www variant
    if (wpUrl.includes('://livskompass.se')) {
      attachmentUrlMap.set(wpUrl.replace('://livskompass.se', '://www.livskompass.se'), r2Url);
    }
    if (wpUrl.includes('://www.livskompass.se')) {
      attachmentUrlMap.set(wpUrl.replace('://www.livskompass.se', '://livskompass.se'), r2Url);
    }
  }
}

console.log(`🔗 Built URL map: ${attachmentUrlMap.size} URL variants mapped\n`);

// ─── Build WP path → slug map for internal link rewriting ────────────────────

const wpPathToSlug = new Map();

for (const page of pages) {
  const slug = getCdata(page['wp:post_name']);
  const wpUrl = getCdata(page.link);
  if (!slug || !wpUrl) continue;
  try {
    const u = new URL(wpUrl);
    const path = u.pathname;
    wpPathToSlug.set(path, slug);
    wpPathToSlug.set(path.replace(/\/$/, ''), slug);
    if (!path.endsWith('/')) wpPathToSlug.set(path + '/', slug);
  } catch(e) {}
}

// Handle ACTonline case-sensitivity issue
wpPathToSlug.set('/ACTonline', 'actonline');
wpPathToSlug.set('/ACTonline/', 'actonline');

console.log(`🔗 Built internal link map: ${wpPathToSlug.size} path → slug mappings\n`);

// ─── Collect all media URLs referenced in content ────────────────────────────

function findMediaUrlsInContent(html) {
  const urls = new Set();
  // Match URLs pointing to wp-content/uploads
  const regex = /https?:\/\/(?:www\.)?livskompass\.se\/wp-content\/uploads\/[^\s"'<>)\]]+/gi;
  const matches = html.match(regex) || [];
  for (const url of matches) {
    // Clean trailing punctuation
    const cleaned = url.replace(/[.,;:!?)]+$/, '');
    urls.add(cleaned);
  }
  return urls;
}

// ─── Convert WordPress shortcodes to HTML ────────────────────────────────────

function convertShortcodes(html) {
  if (!html) return html;

  let result = html;

  // [caption id="..." align="..." width="..."]<img ...> Caption text[/caption]
  // → <figure><img ...><figcaption>Caption text</figcaption></figure>
  result = result.replace(
    /\[caption[^\]]*\](.*?<img[^>]+>)\s*(.*?)\[\/caption\]/gi,
    '<figure>$1<figcaption>$2</figcaption></figure>'
  );

  // [contact-form-7 ...] → strip entirely (new contact form exists)
  result = result.replace(/\[contact-form-7[^\]]*\]/gi, '');

  // [gallery ...] → strip (no gallery component in new frontend)
  result = result.replace(/\[gallery[^\]]*\]/gi, '');

  // [embed]url[/embed] → just keep the URL
  result = result.replace(/\[embed\](.*?)\[\/embed\]/gi, '$1');

  // Strip any remaining unknown shortcodes
  result = result.replace(/\[\/?\w+[^\]]*\]/g, '');

  return result;
}

// ─── Rewrite media URLs in HTML content ──────────────────────────────────────

function rewriteContentUrls(html) {
  if (!html) return html;

  let result = html;

  // Sort URLs by length (longest first) to avoid partial replacements
  const sortedEntries = [...attachmentUrlMap.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [oldUrl, newUrl] of sortedEntries) {
    result = result.split(oldUrl).join(newUrl);
  }

  // Also handle any remaining wp-content/uploads URLs that weren't in the attachment map
  // Replace the base URL pattern
  result = result.replace(
    /https?:\/\/(?:www\.)?livskompass\.se\/wp-content\/uploads\//gi,
    `${MEDIA_BASE_URL}/uploads/`
  );

  // ── Rewrite internal page/post links ──
  // Match URLs pointing to livskompass.se (not wp-content, not media)
  result = result.replace(
    /https?:\/\/(?:www\.)?livskompass\.se(\/[^"'\s<>]*?)(?=["'\s<>])/gi,
    (fullMatch, pathPart) => {
      // Don't touch wp-content or media URLs (already handled)
      if (pathPart.toLowerCase().startsWith('/wp-content/')) return fullMatch;
      if (pathPart.toLowerCase().startsWith('/wp-')) return fullMatch;

      // Strip &amp; tracking garbage
      let cleanPath = pathPart.split('&amp;')[0];

      // Preserve hash fragments
      let hashPart = '';
      const hashIdx = cleanPath.indexOf('#');
      if (hashIdx >= 0) {
        hashPart = cleanPath.slice(hashIdx);
        cleanPath = cleanPath.slice(0, hashIdx);
      }

      // Try exact lookup in our WP path → slug map
      const slug = wpPathToSlug.get(cleanPath) || wpPathToSlug.get(cleanPath + '/');

      if (slug) {
        return '/' + slug + hashPart;
      }

      // Homepage
      if (cleanPath === '/' || cleanPath === '') {
        return '/' + hashPart;
      }

      // Fallback: use the last path segment as slug
      const segments = cleanPath.replace(/\/$/, '').split('/').filter(Boolean);
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1].toLowerCase();
        return '/' + lastSegment + hashPart;
      }

      return fullMatch;
    }
  );

  return result;
}

// ─── Resolve parent slugs for pages ──────────────────────────────────────────

function resolveParentSlug(item) {
  const parentId = getCdata(item['wp:post_parent']);
  if (!parentId || parentId === '0') return null;

  const parent = itemById.get(parentId);
  if (!parent) return null;

  return getCdata(parent['wp:post_name']) || null;
}

// ─── Resolve featured image URL ─────────────────────────────────────────────

function resolveFeaturedImage(item) {
  const thumbnailId = getPostMeta(item, '_thumbnail_id');
  if (!thumbnailId) return null;

  const att = attachmentsByWpId.get(thumbnailId);
  if (att) return att.r2Url;

  // Fallback: check the item map
  const thumbItem = itemById.get(thumbnailId);
  if (thumbItem) {
    const url = getCdata(thumbItem['wp:attachment_url']);
    return attachmentUrlMap.get(url) || url;
  }

  return null;
}

// ─── Generate SQL for pages ─────────────────────────────────────────────────

function generatePagesSql() {
  const statements = [];
  const seenSlugs = new Set();

  for (const page of pages) {
    const id = nanoid();
    let slug = getCdata(page['wp:post_name']);
    const title = getCdata(page.title);
    const rawContent = getCdata(page['content:encoded']);
    const content = rewriteContentUrls(convertShortcodes(rawContent));
    const parentSlug = resolveParentSlug(page);
    const menuOrder = parseInt(getCdata(page['wp:menu_order'])) || 0;
    const createdAt = getCdata(page['wp:post_date_gmt']);

    // Skip pages with no slug
    if (!slug) {
      console.log(`   ⚠️  Skipping page with no slug: "${title}"`);
      continue;
    }

    // Handle duplicate slugs by appending parent context
    if (seenSlugs.has(slug)) {
      const oldSlug = slug;
      slug = parentSlug ? `${slug}-${parentSlug}` : `${slug}-2`;
      console.log(`   ⚠️  Duplicate slug "${oldSlug}" → renamed to "${slug}"`);
    }
    seenSlugs.add(slug);

    statements.push(
      `INSERT INTO pages (id, slug, title, content, parent_slug, sort_order, status, created_at, updated_at) VALUES (${escSql(id)}, ${escSql(slug)}, ${escSql(title)}, ${escSql(content)}, ${escSql(parentSlug)}, ${menuOrder}, 'published', ${escSql(createdAt)}, ${escSql(createdAt)});`
    );
  }

  return statements;
}

// ─── Generate SQL for posts ─────────────────────────────────────────────────

function generatePostsSql() {
  const statements = [];

  for (const post of posts) {
    const id = nanoid();
    const slug = getCdata(post['wp:post_name']);
    const title = getCdata(post.title);
    const rawContent = getCdata(post['content:encoded']);
    const content = rewriteContentUrls(convertShortcodes(rawContent));
    const excerpt = getCdata(post['excerpt:encoded']) || null;
    const featuredImage = resolveFeaturedImage(post);
    const publishedAt = getCdata(post['wp:post_date_gmt']);

    if (!slug) {
      console.log(`   ⚠️  Skipping post with no slug: "${title}"`);
      continue;
    }

    statements.push(
      `INSERT INTO posts (id, slug, title, content, excerpt, featured_image, status, published_at, created_at, updated_at) VALUES (${escSql(id)}, ${escSql(slug)}, ${escSql(title)}, ${escSql(content)}, ${escSql(excerpt)}, ${escSql(featuredImage)}, 'published', ${escSql(publishedAt)}, ${escSql(publishedAt)}, ${escSql(publishedAt)});`
    );
  }

  return statements;
}

// ─── Find all media URLs actually used in content ───────────────────────────

function collectReferencedMedia() {
  const allUrls = new Set();

  for (const page of pages) {
    const content = getCdata(page['content:encoded']);
    for (const url of findMediaUrlsInContent(content)) {
      allUrls.add(url);
    }
  }
  for (const post of posts) {
    const content = getCdata(post['content:encoded']);
    for (const url of findMediaUrlsInContent(content)) {
      allUrls.add(url);
    }
  }

  return allUrls;
}

// ─── Generate media download list ───────────────────────────────────────────

function buildMediaDownloadList() {
  const referencedUrls = collectReferencedMedia();
  const downloads = []; // { sourceUrl, r2Key, filename }
  const seen = new Set();

  // 1. Attachments that are referenced in content
  for (const att of attachmentsByWpId.values()) {
    // Check if this attachment is referenced
    const isReferenced = referencedUrls.has(att.wpUrl) ||
      [...referencedUrls].some(u =>
        u.includes(att.filePath) ||
        att.wpUrl.includes(u.split('/uploads/').pop() || '___nomatch___')
      );

    if (isReferenced && !seen.has(att.r2Key)) {
      seen.add(att.r2Key);
      downloads.push({
        sourceUrl: att.wpUrl,
        r2Key: att.r2Key,
        filename: basename(att.filePath),
      });
    }
  }

  // 2. URLs referenced in content but not in attachment list
  //    Try to build r2Key from URL path
  for (const url of referencedUrls) {
    const match = url.match(/wp-content\/uploads\/(.+)$/);
    if (match) {
      const filePath = decodeURIComponent(match[1]);
      const r2Key = `uploads/${filePath}`;
      if (!seen.has(r2Key)) {
        // Skip thumbnail variants (e.g., image-150x150.jpg)
        if (/\-\d+x\d+\.\w+$/.test(filePath)) continue;

        seen.add(r2Key);
        downloads.push({
          sourceUrl: url.startsWith('http://') ? url.replace('http://', 'https://') : url,
          r2Key,
          filename: basename(filePath),
        });
      }
    }
  }

  return downloads;
}

// ─── Generate media table SQL ───────────────────────────────────────────────

function generateMediaSql(downloads) {
  const statements = [];

  for (const dl of downloads) {
    const id = nanoid();
    const type = getMediaType(dl.filename);
    const url = `${MEDIA_BASE_URL}/${dl.r2Key}`;

    statements.push(
      `INSERT INTO media (id, filename, r2_key, url, type, alt_text) VALUES (${escSql(id)}, ${escSql(dl.filename)}, ${escSql(dl.r2Key)}, ${escSql(url)}, ${escSql(type)}, NULL);`
    );
  }

  return statements;
}

// ─── Download & upload media files ──────────────────────────────────────────

async function downloadAndUploadMedia(downloads) {
  if (!existsSync(DOWNLOAD_DIR)) {
    mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }

  let success = 0;
  let failed = 0;
  const failures = [];

  console.log(`\n📥 Downloading & uploading ${downloads.length} media files...\n`);

  for (let i = 0; i < downloads.length; i++) {
    const dl = downloads[i];
    const localPath = join(DOWNLOAD_DIR, dl.r2Key.replace(/\//g, '_'));
    const progress = `[${i + 1}/${downloads.length}]`;

    try {
      // Download
      process.stdout.write(`${progress} ⬇️  ${dl.filename}...`);

      const response = await fetch(dl.sourceUrl, {
        redirect: 'follow',
        headers: { 'User-Agent': 'Livskompass-Migration/1.0' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      writeFileSync(localPath, buffer);

      // Upload to R2
      process.stdout.write(` ⬆️  R2...`);
      execSync(
        `wrangler r2 object put "${R2_BUCKET}/${dl.r2Key}" --file="${localPath}" --content-type="${guessMimeType(dl.filename)}"`,
        { stdio: 'pipe', cwd: join(import.meta.dirname, '../api') }
      );

      console.log(` ✅ (${formatBytes(buffer.length)})`);
      success++;

      // Clean up local file
      execSync(`rm "${localPath}"`);
    } catch (err) {
      console.log(` ❌ ${err.message}`);
      failed++;
      failures.push({ file: dl.filename, url: dl.sourceUrl, error: err.message });
    }
  }

  console.log(`\n📊 Media upload results: ${success} success, ${failed} failed`);
  if (failures.length > 0) {
    console.log('\n❌ Failed files:');
    for (const f of failures) {
      console.log(`   ${f.file}: ${f.error}`);
      console.log(`   URL: ${f.url}`);
    }

    // Write failures to file for review
    writeFileSync(
      join(import.meta.dirname, 'media-failures.json'),
      JSON.stringify(failures, null, 2)
    );
    console.log(`\n   Full failure list saved to media-failures.json`);
  }

  return { success, failed, failures };
}

function guessMimeType(filename) {
  const ext = extname(filename).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.avi': 'video/x-msvideo',
    '.flv': 'video/x-flv', '.webm': 'video/webm',
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.key': 'application/x-iwork-keynote-sff',
  };
  return types[ext] || 'application/octet-stream';
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ─── Execute SQL via wrangler ───────────────────────────────────────────────

function executeSql(statements, label) {
  if (statements.length === 0) {
    console.log(`   No ${label} to insert.`);
    return;
  }

  // Write SQL to file and execute via wrangler
  const sqlFile = join(import.meta.dirname, `_migration_${label}.sql`);
  writeFileSync(sqlFile, statements.join('\n'));

  console.log(`   Executing ${statements.length} ${label} inserts...`);
  try {
    const output = execSync(
      `wrangler d1 execute ${D1_DB} --file="${sqlFile}" --remote`,
      { stdio: 'pipe', cwd: join(import.meta.dirname, '../api'), encoding: 'utf-8' }
    );
    console.log(`   ✅ ${label} inserted successfully`);

    // Clean up temp SQL file
    execSync(`rm "${sqlFile}"`);
  } catch (err) {
    console.error(`   ❌ Failed to insert ${label}:`);
    console.error(err.stderr || err.message);
    console.log(`   SQL saved to: ${sqlFile}`);
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN MODE — no changes will be made\n' : '');

  // Generate SQL
  const pageSql = generatePagesSql();
  const postSql = generatePostsSql();
  const downloads = buildMediaDownloadList();
  const mediaSql = generateMediaSql(downloads);

  console.log(`\n📝 Generated SQL:`);
  console.log(`   ${pageSql.length} page inserts`);
  console.log(`   ${postSql.length} post inserts`);
  console.log(`   ${downloads.length} media files to download/upload`);
  console.log(`   ${mediaSql.length} media record inserts`);

  if (DRY_RUN) {
    // Write all SQL to output file for review
    const allSql = [
      '-- Pages', ...pageSql, '',
      '-- Posts', ...postSql, '',
      '-- Media records', ...mediaSql,
    ].join('\n');
    writeFileSync(SQL_OUTPUT, allSql);
    console.log(`\n📄 SQL written to: ${SQL_OUTPUT}`);
    console.log('\n🔍 Dry run complete. Review the SQL file, then run without --dry-run.');
    return;
  }

  if (!MEDIA_ONLY) {
    // Insert pages
    console.log('\n📄 Migrating pages...');
    executeSql(pageSql, 'pages');

    // Insert posts
    console.log('\n📰 Migrating posts...');
    executeSql(postSql, 'posts');
  }

  if (!PAGES_ONLY) {
    // Download and upload media
    const mediaResult = await downloadAndUploadMedia(downloads);

    // Insert media records for successful uploads
    if (mediaResult.success > 0) {
      console.log('\n💾 Inserting media records...');
      // Filter out failed ones
      const failedFiles = new Set(mediaResult.failures.map(f => f.file));
      const successMediaSql = mediaSql.filter(sql => {
        return !failedFiles.has(sql.match(/filename[^']*'([^']+)'/)?.[1]);
      });
      executeSql(successMediaSql, 'media');
    }
  }

  console.log('\n✅ Migration complete!');
  console.log('\nNext steps:');
  console.log('  1. Verify pages:  wrangler d1 execute livskompass-db --command "SELECT slug, title FROM pages LIMIT 10" --remote');
  console.log('  2. Verify posts:  wrangler d1 execute livskompass-db --command "SELECT slug, title FROM posts LIMIT 10" --remote');
  console.log('  3. Verify media:  wrangler r2 object list livskompass-media --prefix uploads/');
}

main().catch(err => {
  console.error('\n💥 Migration failed:', err);
  process.exit(1);
});
