import { ArrowRight, ArrowUpRight, ChevronRight, ExternalLink, Download, Mail, Phone, Play } from 'lucide-react'

export const buttonIconMap: Record<string, React.FC<{ className?: string }>> = {
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  'chevron-right': ChevronRight,
  'external-link': ExternalLink,
  'download': Download,
  'mail': Mail,
  'phone': Phone,
  'play': Play,
}

export function resolveButtonIcon(iconName?: string): React.FC<{ className?: string }> | null {
  if (!iconName) return null
  return buttonIconMap[iconName] || null
}

export const buttonVariantClasses: Record<string, string> = {
  primary: 'bg-forest-800 text-white hover:bg-forest-900',
  secondary: 'bg-amber-300 text-forest-800 hover:bg-amber-200',
  outline: 'border-2 border-forest-800 text-forest-800 bg-transparent hover:bg-forest-800 hover:text-white',
  ghost: 'text-forest-800 hover:bg-forest-800/10',
  'primary-inv': 'bg-white text-forest-800 hover:bg-stone-100',
  'outline-inv': 'border-2 border-white text-white bg-transparent hover:bg-white hover:text-forest-800',
}

export function getButtonStyle(
  btnStyles: Record<string, string> | undefined,
  propName: string,
  defaultVariant = 'primary',
  defaultIcon = '',
) {
  let style: { variant?: string; icon?: string } | null = null
  try {
    const raw = btnStyles?.[propName]
    if (raw) style = typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch { /* ignore parse errors */ }
  return {
    variant: style?.variant || defaultVariant,
    variantClass: buttonVariantClasses[style?.variant || defaultVariant] || buttonVariantClasses.primary,
    Icon: resolveButtonIcon(style?.icon ?? defaultIcon),
  }
}
