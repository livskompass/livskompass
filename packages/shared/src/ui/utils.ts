import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Custom typography utilities (defined in packages/web/src/index.css and
// packages/admin/src/index.css) all start with `text-` — same prefix as Tailwind
// text-color utilities (text-brand, text-foreground, etc). Without this,
// twMerge groups them together and drops the typography class whenever a color
// class is in the same cn() call: `cn('text-h3', 'text-brand')` →
// 'text-brand' only, headings render at body size.
//
// Register the typography classes as their own font-size group so they coexist
// with text-color classes.
const TYPOGRAPHY_CLASSES = [
  'text-display', 'text-h1', 'text-h2', 'text-h3', 'text-h4',
  'text-body-lg', 'text-body', 'text-body-sm', 'text-caption', 'text-overline',
]

const customMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': TYPOGRAPHY_CLASSES,
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return customMerge(clsx(inputs))
}
