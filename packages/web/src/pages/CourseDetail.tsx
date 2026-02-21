import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourse, rewriteMediaUrls } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { CourseContext } from '../lib/context'
import { defaultCourseTemplate } from '@livskompass/shared'
import NotFound from './NotFound'
import BlockRenderer from '../components/BlockRenderer'
import { Card, CardContent } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'

function CourseSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <Skeleton className="h-5 w-36 mb-6" />
      <Skeleton className="h-10 w-3/4 mb-6" />
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  )
}

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => getCourse(slug!),
    enabled: !!slug,
  })

  useDocumentTitle(data?.course?.title)

  if (isLoading) return <CourseSkeleton />
  if (error || !data?.course) return <NotFound />

  const { course } = data
  const courseAny = course as any

  // Determine which blocks to render
  let blocksJson: string
  if (courseAny.content_blocks) {
    // Course has custom Puck blocks
    blocksJson = courseAny.content_blocks
  } else {
    // Use default course template, replacing __LEGACY_CONTENT__ with actual HTML
    blocksJson = defaultCourseTemplate.replace(
      '__LEGACY_CONTENT__',
      course.content ? rewriteMediaUrls(course.content).replace(/"/g, '\\"') : ''
    )
  }

  return (
    <CourseContext.Provider value={courseAny}>
      <BlockRenderer data={blocksJson} />
    </CourseContext.Provider>
  )
}
