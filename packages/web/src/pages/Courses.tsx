import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { Separator } from '../components/ui/separator'
import { Calendar, MapPin, CreditCard } from 'lucide-react'

export default function Courses() {
  useDocumentTitle('Utbildningar')
  const { data, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Utbildningar</h1>
        <p className="text-xl text-gray-500 max-w-2xl">
          Utbildningar i ACT och mindfulness med Fredrik Livheim
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-24 mb-3" />
                <Skeleton className="h-7 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-px w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.courses && data.courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.courses.map((course) => (
            <Card
              key={course.id}
              className="hover:shadow-md transition-all duration-200 group"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={course.status === 'full' ? 'destructive' : 'success'}>
                    {course.status === 'full' ? 'Fullbokad' : 'Platser kvar'}
                  </Badge>
                  {course.location && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{course.location}</span>
                    </div>
                  )}
                </div>

                <CardTitle className="text-2xl group-hover:text-primary-600 transition-colors">
                  {course.title}
                </CardTitle>

                <CardDescription className="text-base">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Separator className="mb-4" />
                <div className="flex justify-between items-center text-sm mb-4">
                  <div>
                    <p className="text-gray-500 mb-1 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Datum
                    </p>
                    <p className="font-medium text-gray-900">
                      {course.start_date
                        ? <>
                            {new Date(course.start_date).toLocaleDateString('sv-SE')}
                            {course.end_date && course.end_date !== course.start_date && (
                              <> - {new Date(course.end_date).toLocaleDateString('sv-SE')}</>
                            )}
                          </>
                        : 'Kontakta oss'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 mb-1 flex items-center gap-1.5 justify-end">
                      <CreditCard className="h-3.5 w-3.5" />
                      Pris
                    </p>
                    <p className="font-medium text-gray-900">
                      {course.price_sek ? `${course.price_sek.toLocaleString('sv-SE')} kr` : 'Kontakta oss'}
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="gap-3">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to={`/utbildningar/${course.slug}`}>
                    Läs mer
                  </Link>
                </Button>
                {course.status !== 'full' && (
                  <Button className="flex-1" asChild>
                    <Link to={`/utbildningar/${course.slug}/boka`}>
                      Boka plats
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="max-w-lg mx-auto">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 text-lg mb-2">
              Det finns inga utbildningar planerade just nu.
            </p>
            <p className="text-gray-400">
              Kontakta oss för att höras om kommande utbildningar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
