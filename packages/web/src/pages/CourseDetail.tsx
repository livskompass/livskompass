import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourse, rewriteMediaUrls } from '../lib/api'
import { sanitizeHtml } from '../lib/sanitize'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import NotFound from './NotFound'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { Separator } from '../components/ui/separator'
import { ArrowLeft, MapPin, Calendar, Users, CreditCard, Clock } from 'lucide-react'

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => getCourse(slug!),
    enabled: !!slug,
  })

  useDocumentTitle(data?.course?.title)

  if (isLoading) {
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

  if (error || !data?.course) {
    return <NotFound />
  }

  const { course } = data

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Button variant="ghost" className="mb-6 -ml-2 text-gray-600 hover:text-primary-600" asChild>
        <Link to="/utbildningar">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Alla utbildningar
        </Link>
      </Button>

      <div className="flex items-center gap-3 mb-4">
        <Badge variant={course.status === 'full' ? 'destructive' : course.status === 'completed' ? 'secondary' : 'success'}>
          {course.status === 'full' ? 'Fullbokad' : course.status === 'completed' ? 'Genomförd' : 'Platser kvar'}
        </Badge>
      </div>

      <h1 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">{course.title}</h1>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Plats
              </span>
              <span className="font-medium text-gray-900">{course.location}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Datum
              </span>
              <span className="font-medium text-gray-900">
                {new Date(course.start_date).toLocaleDateString('sv-SE')}
                {course.end_date !== course.start_date && (
                  <> - {new Date(course.end_date).toLocaleDateString('sv-SE')}</>
                )}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                Pris
              </span>
              <span className="font-medium text-gray-900">
                {course.price_sek.toLocaleString('sv-SE')} kr
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Platser
              </span>
              <span className="font-medium text-gray-900">
                {course.current_participants}/{course.max_participants}
              </span>
            </div>
          </div>

          {course.registration_deadline && (
            <>
              <Separator className="my-4" />
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Sista anmälningsdag:{' '}
                {new Date(course.registration_deadline).toLocaleDateString('sv-SE')}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <div
        className="prose prose-lg max-w-none mb-10 prose-headings:tracking-tight prose-a:text-primary-600"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(rewriteMediaUrls(course.content)) }}
      />

      {course.status !== 'full' && course.status !== 'completed' && (
        <Card className="bg-gray-50/50 border-primary-100">
          <CardContent className="p-8 text-center">
            <p className="text-lg text-gray-700 mb-5">
              Intresserad av att delta?
            </p>
            <Button size="lg" asChild>
              <Link to={`/utbildningar/${course.slug}/boka`}>
                Boka plats
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {course.status === 'full' && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-8 text-center">
            <p className="text-lg text-yellow-800">
              Denna utbildning är fullbokad. Kontakta oss för att ställas i kö.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
