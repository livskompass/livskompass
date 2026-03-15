import { cn } from '../ui/utils'
import { ChevronRight } from 'lucide-react'
import { useEditableText, useInlineEdit } from '../context'

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
  breadcrumbHomeText: string
}

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

function BreadcrumbItemEl({ crumb, index, isLast }: { crumb: BreadcrumbItem; index: number; isLast: boolean }) {
  const labelEdit = useEditableText(`breadcrumbs[${index}].label`, crumb.label)

  return (
    <li className="flex items-center gap-1.5">
      <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
      {isLast ? (
        <span {...editHandlers(labelEdit)} className={cn('text-stone-700 font-medium', labelEdit?.className)}>{crumb.label}</span>
      ) : (
        <a href={crumb.href} className="hover:text-forest-600 transition-colors">
          <span {...editHandlers(labelEdit)} className={labelEdit?.className}>{crumb.label}</span>
        </a>
      )}
    </li>
  )
}

export function PageHeader({
  heading = 'Heading',
  subheading = '',
  alignment = 'left',
  size = 'large',
  showDivider = false,
  breadcrumbs = [],
  breadcrumbHomeText = 'Home',
  id,
}: PageHeaderProps & { puck?: { isEditing: boolean }; id?: string }) {
  // Puck editor inline editing (via postMessage)
  const headingPuck = useInlineEdit('heading', heading, id || '')
  const subheadingPuck = useInlineEdit('subheading', subheading, id || '')

  // Public site admin editing (via InlineEditBlockContext)
  const headingEditCtx = useEditableText('heading', heading)
  const subheadingEditCtx = useEditableText('subheading', subheading)

  // Inline editing for breadcrumb home text
  const homeTextEdit = useEditableText('breadcrumbHomeText', breadcrumbHomeText)

  // Puck takes priority
  const headingEdit = headingPuck || headingEditCtx
  const subheadingEdit = subheadingPuck || subheadingEditCtx
  const hasBreadcrumbs = breadcrumbs && breadcrumbs.length > 0

  const headingProps = editHandlers(headingEdit)
  const subheadingProps = editHandlers(subheadingEdit)

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
              <a href="/" className="hover:text-forest-600 transition-colors">
                <span {...editHandlers(homeTextEdit)} className={homeTextEdit?.className}>{breadcrumbHomeText}</span>
              </a>
            </li>
            {breadcrumbs.map((crumb, i) => (
              <BreadcrumbItemEl key={i} crumb={crumb} index={i} isLast={i === breadcrumbs.length - 1} />
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
            <div className="w-16 h-1 rounded-full bg-forest-300" />
          </div>
        )}
      </div>
    </div>
  )
}
