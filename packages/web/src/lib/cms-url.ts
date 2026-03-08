const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || ''

/** Maps content types to their admin route prefixes */
const ADMIN_ROUTES: Record<string, string> = {
  page: 'sidor',
  post: 'nyheter',
  course: 'utbildningar',
  product: 'material',
}

/**
 * Constructs the CMS admin editor URL for a specific entity + block.
 * Returns e.g. http://localhost:3001/sidor/42#block-3
 */
export function getCmsUrl(
  contentType: string,
  entityId: string,
  blockIndex?: number,
): string | null {
  if (!ADMIN_URL) return null

  const route = ADMIN_ROUTES[contentType]
  if (!route) return null

  let url = `${ADMIN_URL}/${route}/${entityId}`

  if (blockIndex != null) {
    url += `#block-${blockIndex}`
  }

  return url
}
