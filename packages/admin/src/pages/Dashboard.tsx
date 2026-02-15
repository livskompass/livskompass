import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getBookings, getCourses, getContacts, API_BASE } from '../lib/api'

interface StatsResponse {
  stats: {
    pages: number
    posts: number
    courses: number
    bookings: number
    contacts: number
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
  const { data: statsData } = useQuery({
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
    { name: 'Pages', value: statsData?.stats?.pages ?? 0, href: '/sidor' },
    { name: 'Posts', value: statsData?.stats?.posts ?? 0, href: '/nyheter' },
    { name: 'Courses', value: statsData?.stats?.courses ?? 0, href: '/utbildningar' },
    { name: 'Bookings', value: statsData?.stats?.bookings ?? 0, href: '/bokningar' },
  ]

  const unreadContacts = contactsData?.contacts?.filter((c) => !c.read)?.length ?? 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-gray-500">{stat.name}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      {unreadContacts > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-3">📩</span>
            <div>
              <p className="font-medium text-yellow-800">
                {unreadContacts} unread messages
              </p>
              <Link
                to="/meddelanden"
                className="text-sm text-yellow-600 hover:text-yellow-700"
              >
                View messages &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent bookings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent bookings
          </h2>
          {bookingsData?.bookings && bookingsData.bookings.length > 0 ? (
            <div className="space-y-4">
              {bookingsData.bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.customer_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.participants} participants
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      booking.payment_status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {booking.payment_status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No bookings yet</p>
          )}
          <Link
            to="/bokningar"
            className="block mt-4 text-sm text-primary-600 hover:text-primary-700"
          >
            View all bookings &rarr;
          </Link>
        </div>

        {/* Upcoming courses */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming courses
          </h2>
          {coursesData?.courses && coursesData.courses.length > 0 ? (
            <div className="space-y-4">
              {coursesData.courses
                .filter((c) => new Date(c.start_date) >= new Date())
                .slice(0, 5)
                .map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{course.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(course.start_date).toLocaleDateString('sv-SE')} -{' '}
                        {course.location}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {course.current_participants}/{course.max_participants}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming courses</p>
          )}
          <Link
            to="/utbildningar"
            className="block mt-4 text-sm text-primary-600 hover:text-primary-700"
          >
            Manage courses &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
