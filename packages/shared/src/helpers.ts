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

/** Resolve a potentially relative /media/ URL to an absolute URL */
export function resolveMediaUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${getMediaBase()}${url}`
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
