import { useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

/** Get the API base URL from window.__PUCK_API_BASE__ or default to /api */
export function getApiBase(): string {
  return (typeof window !== 'undefined' && (window as any).__PUCK_API_BASE__) || '/api'
}

/** Derive media base URL by stripping /api suffix from the API base */
export function getMediaBase(): string {
  return getApiBase().replace(/\/api$/, '')
}

/** Resolve a potentially relative /media/ URL to an absolute URL.
 *  Also rewrites legacy absolute URLs that point to the wrong domain
 *  (e.g. livskompass-web.pages.dev/media/...) to use the API base. */
export function resolveMediaUrl(url: string): string {
  if (!url) return ''
  // Fix legacy absolute URLs stored with the wrong (frontend) domain
  const mediaPathMatch = url.match(/^https?:\/\/[^/]+(\/media\/.+)$/)
  if (mediaPathMatch) {
    return `${getMediaBase()}${mediaPathMatch[1]}`
  }
  if (url.startsWith('/')) return `${getMediaBase()}${url}`
  return url
}

/** Pull the course's banner image out of its Puck `content_blocks` JSON.
 *  The course template places a canonical ImageBlock with `id: 'course-image'`
 *  at the top — we look for that first, then fall back to the first
 *  ImageBlock with a non-empty `src`. Returns null if nothing usable is
 *  found or the JSON is malformed. Safe to call on every card render. */
export function extractCourseImage(contentBlocks: string | null | undefined): string | null {
  if (!contentBlocks) return null
  try {
    const data = JSON.parse(contentBlocks)
    const blocks = Array.isArray(data?.content) ? data.content : []
    const canonical = blocks.find(
      (b: any) => b?.type === 'ImageBlock' && b?.props?.id === 'course-image' && b?.props?.src,
    )
    if (canonical?.props?.src) return canonical.props.src as string
    const fallback = blocks.find((b: any) => b?.type === 'ImageBlock' && b?.props?.src)
    return fallback?.props?.src ?? null
  } catch {
    return null
  }
}

/** Rewrite relative /media/ URLs inside HTML strings to absolute URLs */
export function rewriteHtmlMediaUrls(html: string): string {
  if (!html) return html
  const base = getMediaBase()
  if (!base) return html
  return html
    .replace(/(src|href|poster)=(["'])(\/media\/)/g, `$1=$2${base}/media/`)
    .replace(/url\(\s*(["']?)(\/media\/)/g, `url($1${base}/media/`)
}

/**
 * Scroll-triggered reveal animation hook.
 * Observes a container element and adds 'reveal-visible' class to `.reveal` children
 * when they enter the viewport. Supports staggered animations via `.reveal-stagger-N`.
 * Skips animation inside Puck editor (iframe context).
 */
export function useScrollReveal(): React.RefCallback<HTMLElement> {
  const observerRef = useRef<IntersectionObserver | null>(null)

  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
  }, [])

  useEffect(() => cleanup, [cleanup])

  return useCallback((node: HTMLElement | null) => {
    cleanup()

    if (!node) return

    // Skip in Puck editor — elements are already visible via CSS override
    if (typeof window !== 'undefined' && window.frameElement !== null) return

    // Check for reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const revealElements = node.querySelectorAll('.reveal')
    if (revealElements.length === 0) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            observerRef.current?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    )

    revealElements.forEach((el) => observerRef.current?.observe(el))
  }, [cleanup])
}

/** React hook for fetching JSON data from the API with React Query */
export function useFetchJson<T>(endpoint: string): { data: T | null; loading: boolean } {
  const { data, isLoading } = useQuery<T>({
    queryKey: ['puck-block', endpoint],
    queryFn: () => fetch(`${getApiBase()}${endpoint}`).then((r) => r.json()),
    enabled: !!endpoint,
  })
  return { data: data ?? null, loading: isLoading && !!endpoint }
}

// ── Date formatting ──
//
// One Swedish format used everywhere visitors see a date. Short month names so
// it stays compact on cards. Year only when needed for ranges spanning years.
//
//   formatSwedishDate('2026-03-16')                     → '16 mars 2026'
//   formatSwedishDateRange('2026-03-16', '2026-04-27')  → '16 mars – 27 apr. 2026'
//   formatSwedishDateRange('2026-12-30', '2027-01-05')  → '30 dec. 2026 – 5 jan. 2027'
//   formatSwedishDateRange('2026-03-16', null)          → '16 mars 2026'

const DATE_OPTS: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }

export function formatSwedishDate(date: string | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('sv-SE', { ...DATE_OPTS, year: 'numeric' })
}

export function formatSwedishDateRange(start: string | null | undefined, end: string | null | undefined): string {
  if (!start) return ''
  const s = new Date(start)
  if (!end) return s.toLocaleDateString('sv-SE', { ...DATE_OPTS, year: 'numeric' })
  const e = new Date(end)
  if (s.getFullYear() !== e.getFullYear()) {
    return `${s.toLocaleDateString('sv-SE', { ...DATE_OPTS, year: 'numeric' })} – ${e.toLocaleDateString('sv-SE', { ...DATE_OPTS, year: 'numeric' })}`
  }
  if (s.getTime() === e.getTime()) {
    return s.toLocaleDateString('sv-SE', { ...DATE_OPTS, year: 'numeric' })
  }
  return `${s.toLocaleDateString('sv-SE', DATE_OPTS)} – ${e.toLocaleDateString('sv-SE', { ...DATE_OPTS, year: 'numeric' })}`
}
