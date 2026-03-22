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
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'bg-highlight-soft text-brand hover:bg-amber-200',
  outline: 'border-2 border-brand text-brand bg-transparent hover:bg-brand hover:text-white',
  ghost: 'text-brand hover:bg-brand/10',
  'primary-inv': 'bg-white text-brand hover:bg-surface-alt',
  'outline-inv': 'border-2 border-white text-white bg-transparent hover:bg-white hover:text-brand',
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
