import { useCourseData } from '../context'

export interface CourseHeaderProps {
  // Kept as an optional prop so existing saved data with a subtitle value
  // continues to deserialize cleanly. The block no longer renders it — if
  // the admin needs a subtitle, they can drop a RichText or PageHeader below.
  subtitle?: string
}

export function CourseHeader(_props: CourseHeaderProps) {
  const course = useCourseData()
  // Block is filtered out of non-course panels, so this null case shouldn't
  // appear in normal admin flow. Return null rather than chrome on public.
  if (!course) return null

  // No bottom margin on <header> — spacing between blocks inside a column
  // is owned by the parent zone's `flex flex-col gap-*`, so adding mb here
  // would double up and feel loose between title and description.
  return (
    <header>
      <h1 className="text-h1 text-heading">{course.title}</h1>
    </header>
  )
}
