import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourses, getPosts, getMediaUrl } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ArrowRight, Calendar, MapPin } from 'lucide-react'

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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2Nmg2di02aC02em0wIDEydjZoNnYtNmgtNnptLTEyLTZ2Nmg2di02aC02em0wIDEydjZoNnYtNmgtNnptMCAxMnY2aDZ2LTZoLTZ6bTAtMzZ2Nmg2di02aC02em0tMTIgMjR2Nmg2di02aC02em0wIDEydjZoNnYtNmgtNnptMC0yNHY2aDZ2LTZoLTZ6bTAtMTJ2Nmg2di02aC02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            ACT och Mindfulness
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Utbildningar och verktyg för att hantera stress och leva ett rikare liv
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50 font-semibold text-base h-12 px-8" asChild>
              <Link to="/utbildningar">
                Se utbildningar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-2 border-white/80 text-white hover:bg-white/10 bg-transparent font-semibold text-base h-12 px-8" asChild>
              <Link to="/act">
                Vad är ACT?
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Upcoming Courses */}
      {coursesData?.courses && coursesData.courses.length > 0 && (
        <section className="py-20 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Kommande utbildningar
              </h2>
              <p className="text-gray-500 text-lg">Boka din plats på nästa utbildningstillfälle</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesData.courses.slice(0, 3).map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-all duration-200 group">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={course.status === 'full' ? 'destructive' : 'success'}>
                        {course.status === 'full' ? 'Fullbokad' : 'Platser kvar'}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary-600 transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
                      {course.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{course.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(course.start_date).toLocaleDateString('sv-SE')}</span>
                      </div>
                    </div>
                    <Button variant="ghost" className="p-0 h-auto font-semibold text-primary-600 hover:text-primary-700 hover:bg-transparent" asChild>
                      <Link to={`/utbildningar/${course.slug}`}>
                        Läs mer
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button size="lg" asChild>
                <Link to="/utbildningar">
                  Alla utbildningar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Latest News */}
      {postsData?.posts && postsData.posts.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Senaste nytt
              </h2>
              <p className="text-gray-500 text-lg">Nyheter om ACT, mindfulness och våra utbildningar</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {postsData.posts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-md transition-all duration-200 group">
                  {post.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={getMediaUrl(post.featured_image)}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit">
                      {new Date(post.published_at).toLocaleDateString('sv-SE')}
                    </Badge>
                    <CardTitle className="text-xl group-hover:text-primary-600 transition-colors mt-2">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 mb-4 line-clamp-3">{post.excerpt}</p>
                    <Button variant="ghost" className="p-0 h-auto font-semibold text-primary-600 hover:text-primary-700 hover:bg-transparent" asChild>
                      <Link to={`/nyhet/${post.slug}`}>
                        Läs mer
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
