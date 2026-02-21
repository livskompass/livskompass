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

/** React hook for fetching JSON data from the API with React Query */
export function useFetchJson<T>(endpoint: string): { data: T | null; loading: boolean } {
  const { data, isLoading } = useQuery<T>({
    queryKey: ['puck-block', endpoint],
    queryFn: () => fetch(`${getApiBase()}${endpoint}`).then((r) => r.json()),
    enabled: !!endpoint,
  })
  return { data: data ?? null, loading: isLoading && !!endpoint }
}
