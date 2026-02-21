import { cn } from '../ui/utils'
import { ChevronRight } from 'lucide-react'
import { useEditableText } from '../context'

export interface BreadcrumbItem {
  label: string
  href: string
}

export interface PageHeaderProps {
  heading: string
  subheading: string
  alignment: 'left' | 'center'
  size: 'small' | 'large'
  showDivider: boolean
  breadcrumbs: BreadcrumbItem[]
}

export function PageHeader({
  heading = 'Rubrik',
  subheading = '',
  alignment = 'left',
  size = 'large',
  showDivider = false,
  breadcrumbs = [],
}: PageHeaderProps) {
  const headingEdit = useEditableText('heading', heading)
  const subheadingEdit = useEditableText('subheading', subheading)
  const hasBreadcrumbs = breadcrumbs && breadcrumbs.length > 0

  // Build editable props with merged classNames
  const headingProps = headingEdit
    ? {
        contentEditable: headingEdit.contentEditable,
        suppressContentEditableWarning: headingEdit.suppressContentEditableWarning,
        onBlur: headingEdit.onBlur,
        onKeyDown: headingEdit.onKeyDown,
      }
    : {}

  const subheadingProps = subheadingEdit
    ? {
        contentEditable: subheadingEdit.contentEditable,
        suppressContentEditableWarning: subheadingEdit.suppressContentEditableWarning,
        onBlur: subheadingEdit.onBlur,
        onKeyDown: subheadingEdit.onKeyDown,
      }
    : {}

  return (
    <div
      className="mx-auto"
      style={{
        maxWidth: 'var(--width-content)',
        paddingInline: 'var(--container-px)',
        paddingTop: 'var(--section-md)',
        paddingBottom: 'var(--section-xs)',
      }}
    >
      {hasBreadcrumbs && (
        <nav aria-label="Breadcrumb" className="mb-5 reveal">
          <ol className="flex items-center gap-1.5 text-body-sm text-stone-500">
            <li>
              <a href="/" className="hover:text-forest-600 transition-colors">Hem</a>
            </li>
            {breadcrumbs.map((crumb, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-stone-700 font-medium">{crumb.label}</span>
                ) : (
                  <a href={crumb.href} className="hover:text-forest-600 transition-colors">{crumb.label}</a>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className={cn(alignment === 'center' && 'text-center')}>
        <h1
          {...headingProps}
          className={cn(
            'font-display tracking-tight text-forest-950 reveal',
            hasBreadcrumbs ? 'reveal-stagger-1' : '',
            size === 'large' ? 'text-h1' : 'text-h2',
            headingEdit?.className,
          )}
        >
          {heading}
        </h1>
        {(subheading || subheadingEdit) && (
          <p
            {...subheadingProps}
            className={cn(
              'mt-4 text-body-lg text-stone-600 leading-relaxed reveal',
              hasBreadcrumbs ? 'reveal-stagger-2' : 'reveal-stagger-1',
              size === 'large' ? 'max-w-3xl' : 'max-w-2xl',
              alignment === 'center' && 'mx-auto',
              subheadingEdit?.className,
            )}
          >
            {subheading}
          </p>
        )}
        {showDivider && (
          <div
            className={cn(
              'mt-6 reveal',
              hasBreadcrumbs ? 'reveal-stagger-3' : 'reveal-stagger-2',
              alignment === 'center' && 'flex justify-center',
            )}
          >
            <div className="w-16 h-1 rounded-full bg-forest-300 origin-left animate-line-expand" />
          </div>
        )}
      </div>
    </div>
  )
}
