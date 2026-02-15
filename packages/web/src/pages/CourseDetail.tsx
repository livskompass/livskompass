import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourse, rewriteMediaUrls } from '../lib/api'
import { sanitizeHtml } from '../lib/sanitize'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import NotFound from './NotFound'

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
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
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
      <Link
        to="/utbildningar"
        className="text-primary-600 hover:text-primary-700 mb-6 inline-block"
      >
        &larr; Alla utbildningar
      </Link>

      <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Plats</p>
            <p className="font-medium text-gray-900">{course.location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Datum</p>
            <p className="font-medium text-gray-900">
              {new Date(course.start_date).toLocaleDateString('sv-SE')}
              {course.end_date !== course.start_date && (
                <> - {new Date(course.end_date).toLocaleDateString('sv-SE')}</>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Pris</p>
            <p className="font-medium text-gray-900">
              {course.price_sek.toLocaleString('sv-SE')} kr
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Platser</p>
            <p className="font-medium text-gray-900">
              {course.current_participants}/{course.max_participants}
            </p>
          </div>
        </div>

        {course.registration_deadline && (
          <p className="text-sm text-gray-500 mt-4">
            Sista anmälningsdag:{' '}
            {new Date(course.registration_deadline).toLocaleDateString('sv-SE')}
          </p>
        )}
      </div>

      <div
        className="prose prose-lg max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(rewriteMediaUrls(course.content)) }}
      />

      {course.status !== 'full' && course.status !== 'completed' && (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-lg text-gray-700 mb-4">
            Intresserad av att delta?
          </p>
          <Link
            to={`/utbildningar/${course.slug}/boka`}
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Boka plats
          </Link>
        </div>
      )}

      {course.status === 'full' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-lg text-yellow-800">
            Denna utbildning är fullbokad. Kontakta oss för att ställas i kö.
          </p>
        </div>
      )}
    </div>
  )
}
