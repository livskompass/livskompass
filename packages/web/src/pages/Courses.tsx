import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Courses() {
  useDocumentTitle('Utbildningar')
  const { data, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Utbildningar</h1>
      <p className="text-xl text-gray-600 mb-12">
        Utbildningar i ACT och mindfulness med Fredrik Livheim
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow-md p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : data?.courses && data.courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      course.status === 'full'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {course.status === 'full' ? 'Fullbokad' : 'Platser kvar'}
                  </span>
                  <span className="text-sm text-gray-500">{course.location}</span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {course.title}
                </h2>

                <p className="text-gray-600 mb-4">{course.description}</p>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <div>
                      <p className="font-medium text-gray-900">Datum</p>
                      <p>
                        {new Date(course.start_date).toLocaleDateString('sv-SE')}
                        {course.end_date !== course.start_date && (
                          <> - {new Date(course.end_date).toLocaleDateString('sv-SE')}</>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">Pris</p>
                      <p>{course.price_sek.toLocaleString('sv-SE')} kr</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      to={`/utbildningar/${course.slug}`}
                      className="flex-1 text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Läs mer
                    </Link>
                    {course.status !== 'full' && (
                      <Link
                        to={`/utbildningar/${course.slug}/boka`}
                        className="flex-1 text-center bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                      >
                        Boka plats
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Det finns inga utbildningar planerade just nu.
          </p>
          <p className="text-gray-500 mt-2">
            Kontakta oss för att höras om kommande utbildningar.
          </p>
        </div>
      )}
    </div>
  )
}
