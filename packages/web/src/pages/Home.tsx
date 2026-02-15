import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourses, getPosts, getMediaUrl } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Home() {
  useDocumentTitle()
  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  })

  const { data: postsData } = useQuery({
    queryKey: ['posts', 3],
    queryFn: () => getPosts(3),
  })

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            ACT och Mindfulness
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Utbildningar och verktyg för att hantera stress och leva ett rikare liv
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/utbildningar"
              className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Se utbildningar
            </Link>
            <Link
              to="/act"
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Vad är ACT?
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Courses */}
      {coursesData?.courses && coursesData.courses.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Kommande utbildningar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesData.courses.slice(0, 3).map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    <div className="text-sm text-gray-500 mb-4">
                      <p>{course.location}</p>
                      <p>{new Date(course.start_date).toLocaleDateString('sv-SE')}</p>
                    </div>
                    <Link
                      to={`/utbildningar/${course.slug}`}
                      className="text-primary-600 font-semibold hover:text-primary-700"
                    >
                      Läs mer &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/utbildningar"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Alla utbildningar
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Latest News */}
      {postsData?.posts && postsData.posts.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Senaste nytt
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {postsData.posts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {post.featured_image && (
                    <img
                      src={getMediaUrl(post.featured_image)}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <time className="text-sm text-gray-500">
                      {new Date(post.published_at).toLocaleDateString('sv-SE')}
                    </time>
                    <h3 className="text-xl font-semibold mt-2 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <Link
                      to={`/nyhet/${post.slug}`}
                      className="text-primary-600 font-semibold hover:text-primary-700"
                    >
                      Läs mer &rarr;
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
