import { useCourseData, useEditableText } from '../context'
import { cn } from '../ui/utils'

export interface CourseHeaderProps {
  subtitle: string
}

function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

export function CourseHeader({ subtitle = '' }: CourseHeaderProps) {
  const course = useCourseData()
  const subtitleEdit = useEditableText('subtitle', subtitle)

  // Block is filtered out of non-course panels, so this null case shouldn't
  // appear in normal admin flow. Return null rather than ugly chrome on public.
  if (!course) return null

  // In admin mode (subtitleEdit is non-null), always render the subtitle <p>
  // so it shows the placeholder via CSS [contenteditable]:empty::before.
  // On public, hide it when empty.
  const isAdmin = Boolean(subtitleEdit)
  const showSubtitle = Boolean(subtitle) || isAdmin

  return (
    <header className="mb-6">
      <h1 className="text-h1 text-heading mb-3">{course.title}</h1>
      {showSubtitle && (
        <p
          {...editHandlers(subtitleEdit)}
          data-placeholder={isAdmin && !subtitle ? 'Lägg till en kort underrubrik…' : undefined}
          className={cn(
            // Lead paragraph: larger than body, lighter weight, secondary colour
            // so the hierarchy title > subtitle > body reads clearly.
            'text-xl font-light leading-relaxed text-secondary min-h-[1.75rem]',
            subtitleEdit?.className,
          )}
        >
          {subtitle}
        </p>
      )}
    </header>
  )
}
