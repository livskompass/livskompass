import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-display',
        'text-h1',
        'text-h2',
        'text-h3',
        'text-h4',
        'text-body-lg',
        'text-body',
        'text-body-sm',
        'text-caption',
        'text-overline',
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Single source of truth for å/ä/ö → a/o normalization. Reused by both the
// strict `generateSlug` (used at title-derived slug seeding and on-blur
// finalisation) and the looser `liveSanitizeSlug` (used as the live onChange
// filter on the slug input). Keeps the diacritic map from drifting between
// the two passes.
function normalizeDiacritics(input: string): string {
  return input
    .replace(/[åÅ]/g, (c) => (c === 'å' ? 'a' : 'A'))
    .replace(/[äÄ]/g, (c) => (c === 'ä' ? 'a' : 'A'))
    .replace(/[öÖ]/g, (c) => (c === 'ö' ? 'o' : 'O'))
}

export function generateSlug(title: string): string {
  return normalizeDiacritics(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Looser, live-edit-friendly slug filter. Diacritic-normalises, lowercases,
 * and replaces any out-of-set character with `-`, but preserves transient
 * trailing/leading dashes and double-dashes so users can type multi-word
 * slugs letter-by-letter ("getting-" stays "getting-" until they finish).
 *
 * Use this on every keystroke; run `generateSlug` on blur (or before save)
 * to collapse the result to the strict `[a-z0-9-]+` shape with no leading,
 * trailing, or repeated dashes.
 */
export function liveSanitizeSlug(input: string): string {
  return normalizeDiacritics(input)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
}
