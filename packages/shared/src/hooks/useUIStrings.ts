import { useQuery } from '@tanstack/react-query'
import { UI_STRINGS, type UIStrings } from '../ui-strings'

function deepMerge<T extends Record<string, any>>(defaults: T, overrides: Partial<T>): T {
  const result = { ...defaults }
  for (const key of Object.keys(overrides) as (keyof T)[]) {
    const val = overrides[key]
    if (val && typeof val === 'object' && !Array.isArray(val) && typeof defaults[key] === 'object') {
      result[key] = deepMerge(defaults[key] as any, val as any)
    } else if (val !== undefined) {
      result[key] = val as T[keyof T]
    }
  }
  return result
}

async function fetchUIStrings(): Promise<Partial<UIStrings>> {
  const apiBase = (typeof window !== 'undefined' && (window as any).__PUCK_API_BASE__) || '/api'
  const res = await fetch(`${apiBase}/site-settings/ui-strings`)
  if (!res.ok) return {}
  const data = await res.json()
  return data.strings || {}
}

/**
 * Hook that fetches customizable UI strings from the API,
 * falling back to built-in defaults from ui-strings.ts.
 *
 * Uses React Query with 5-minute stale time.
 */
export function useUIStrings(): UIStrings {
  const { data: customStrings } = useQuery({
    queryKey: ['ui-strings'],
    queryFn: fetchUIStrings,
    staleTime: 5 * 60 * 1000,
  })

  if (!customStrings || Object.keys(customStrings).length === 0) {
    return UI_STRINGS
  }

  return deepMerge(UI_STRINGS, customStrings)
}
