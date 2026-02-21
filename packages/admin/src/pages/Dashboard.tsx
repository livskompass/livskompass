import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getBookings, getCourses, getContacts, API_BASE } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import {
  FileText,
  Newspaper,
  GraduationCap,
  Ticket,
  Mail,
  ArrowRight,
  Users,
  TrendingUp,
} from 'lucide-react'

interface StatsResponse {
  stats: {
    publishedPages: number
    publishedPosts: number
    activeCourses: number
    paidBookings: number
    unreadContacts: number
  }
}

async function getStats(): Promise<StatsResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('admin_token')
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}/admin/stats`, { headers })
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

export default function Dashboard() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getStats,
  })
  const { data: bookingsData } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: getBookings,
  })
  const { data: coursesData } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: getCourses,
  })
  const { data: contactsData } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: getContacts,
  })

  const stats = [
    { name: 'Pages', value: statsData?.stats?.publishedPages ?? 0, href: '/sidor', icon: FileText, color: 'text-forest-600 bg-forest-50' },
    { name: 'Posts', value: statsData?.stats?.publishedPosts ?? 0, href: '/nyheter', icon: Newspaper, color: 'text-forest-700 bg-forest-50' },
    { name: 'Courses', value: statsData?.stats?.activeCourses ?? 0, href: '/utbildningar', icon: GraduationCap, color: 'text-forest-500 bg-forest-50' },
    { name: 'Bookings', value: statsData?.stats?.paidBookings ?? 0, href: '/bokningar', icon: Ticket, color: 'text-amber-500 bg-amber-50' },
  ]

  const unreadContacts = contactsData?.contacts?.filter((c) => !c.read)?.length ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h3 text-stone-900">Dashboard</h1>
        <p className="text-stone-500 mt-1">Overview of your website content and activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.name} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-stone-300" />
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
                )}
                <p className="text-sm text-stone-500">{stat.name}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Unread Messages Alert */}
      {unreadContacts > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Mail className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-stone-800">
                  {unreadContacts} {unreadContacts === 1 ? 'unread message' : 'unread messages'}
                </p>
                <Link
                  to="/meddelanden"
                  className="text-sm text-amber-600 hover:text-amber-500 inline-flex items-center gap-1"
                >
                  View messages <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Ticket className="h-4 w-4 text-stone-400" />
                Recent bookings
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/bokningar" className="text-xs text-stone-500 hover:text-stone-900 inline-flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {bookingsData?.bookings && bookingsData.bookings.length > 0 ? (
              <div className="space-y-3">
                {bookingsData.bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-stone-900 truncate">
                        {booking.customer_name}
                      </p>
                      <p className="text-xs text-stone-500">
                        <Users className="h-3 w-3 inline mr-1" />
                        {booking.participants} participants
                      </p>
                    </div>
                    <Badge
                      variant={
                        booking.payment_status === 'paid'
                          ? 'success'
                          : booking.payment_status === 'pending'
                          ? 'warning'
                          : 'destructive'
                      }
                    >
                      {booking.payment_status === 'paid' ? 'Paid' : booking.payment_status === 'pending' ? 'Pending' : 'Failed'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-400 text-center py-6">No bookings yet</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Courses */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-stone-400" />
                Upcoming courses
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/utbildningar" className="text-xs text-stone-500 hover:text-stone-900 inline-flex items-center gap-1">
                  Manage <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {coursesData?.courses && coursesData.courses.length > 0 ? (
              <div className="space-y-3">
                {coursesData.courses
                  .filter((c) => new Date(c.start_date) >= new Date())
                  .slice(0, 5)
                  .map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-stone-900 truncate">
                          {course.title}
                        </p>
                        <p className="text-xs text-stone-500">
                          {new Date(course.start_date).toLocaleDateString('sv-SE')} &middot; {course.location}
                        </p>
                      </div>
                      <span className="text-xs text-stone-500 font-mono ml-3">
                        {course.current_participants}/{course.max_participants}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-stone-400 text-center py-6">No upcoming courses</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
