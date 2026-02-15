import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBooking, refundBooking } from '../lib/api'

export default function BookingDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-booking', id],
    queryFn: () => getBooking(id!),
    enabled: !!id,
  })

  const refundMutation = useMutation({
    mutationFn: () => refundBooking(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-booking', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
    },
  })

  const handleRefund = () => {
    if (window.confirm('Are you sure you want to issue a refund? This cannot be undone.')) {
      refundMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!data?.booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Booking not found.</p>
        <Link to="/bokningar" className="text-primary-600 hover:text-primary-700">
          Back to bookings
        </Link>
      </div>
    )
  }

  const { booking } = data

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/bokningar" className="text-gray-500 hover:text-gray-700 mr-4">
          &larr; Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Booking details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="font-medium text-gray-900">{booking.customer_name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900">
                <a href={`mailto:${booking.customer_email}`} className="text-primary-600">
                  {booking.customer_email}
                </a>
              </dd>
            </div>
            {booking.customer_phone && (
              <div>
                <dt className="text-sm text-gray-500">Phone</dt>
                <dd className="font-medium text-gray-900">{booking.customer_phone}</dd>
              </div>
            )}
            {booking.customer_organization && (
              <div>
                <dt className="text-sm text-gray-500">Organization</dt>
                <dd className="font-medium text-gray-900">{booking.customer_organization}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking info</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Booking number</dt>
              <dd className="font-mono text-gray-900">{booking.id}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Course</dt>
              <dd className="font-medium text-gray-900">
                {booking.course?.title || booking.course_id}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Number of participants</dt>
              <dd className="font-medium text-gray-900">{booking.participants}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Total</dt>
              <dd className="font-medium text-gray-900">
                {booking.total_price_sek?.toLocaleString('sv-SE')} kr
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Date</dt>
              <dd className="font-medium text-gray-900">
                {new Date(booking.created_at).toLocaleString('sv-SE')}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
          <dl className="space-y-3">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500">Payment status</dt>
              <dd>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    booking.payment_status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : booking.payment_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : booking.payment_status === 'refunded'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {booking.payment_status === 'paid'
                    ? 'Paid'
                    : booking.payment_status === 'pending'
                    ? 'Pending'
                    : booking.payment_status === 'refunded'
                    ? 'Refunded'
                    : 'Failed'}
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500">Booking status</dt>
              <dd>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    booking.booking_status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : booking.booking_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {booking.booking_status === 'confirmed'
                    ? 'Confirmed'
                    : booking.booking_status === 'pending'
                    ? 'Pending'
                    : 'Cancelled'}
                </span>
              </dd>
            </div>
          </dl>

          {booking.payment_status === 'paid' && (
            <div className="mt-6 pt-4 border-t">
              <button
                onClick={handleRefund}
                disabled={refundMutation.isPending}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {refundMutation.isPending ? 'Processing...' : 'Refund'}
              </button>
            </div>
          )}
        </div>

        {booking.notes && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Message</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{booking.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
