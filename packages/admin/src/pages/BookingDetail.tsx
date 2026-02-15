import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBooking, refundBooking } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Separator } from '../components/ui/separator'
import { Skeleton } from '../components/ui/skeleton'
import { ArrowLeft, Mail, Phone, Building, Calendar, Users, CreditCard, Hash } from 'lucide-react'

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
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!data?.booking) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-gray-500 mb-3">Booking not found.</p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/bokningar">Back to bookings</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { booking } = data

  const getPaymentVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'pending': return 'warning'
      case 'refunded': return 'secondary'
      default: return 'destructive'
    }
  }

  const getBookingVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success'
      case 'pending': return 'warning'
      default: return 'destructive'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/bokningar">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Booking details</h1>
          <p className="text-gray-500 text-sm font-mono">{booking.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Users className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{booking.customer_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a href={`mailto:${booking.customer_email}`} className="font-medium text-primary-600 hover:text-primary-700">
                  {booking.customer_email}
                </a>
              </div>
            </div>
            {booking.customer_phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{booking.customer_phone}</p>
                </div>
              </div>
            )}
            {booking.customer_organization && (
              <div className="flex items-start gap-3">
                <Building className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Organization</p>
                  <p className="font-medium text-gray-900">{booking.customer_organization}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Hash className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Booking number</p>
                <p className="font-mono text-sm text-gray-900">{booking.id}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Course</p>
                <p className="font-medium text-gray-900">
                  {booking.course?.title || booking.course_id}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Number of participants</p>
                <p className="font-medium text-gray-900">{booking.participants}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-semibold text-gray-900 text-lg">
                  {booking.total_price_sek?.toLocaleString('sv-SE')} kr
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Created {new Date(booking.created_at).toLocaleString('sv-SE')}
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Payment status</span>
              <Badge variant={getPaymentVariant(booking.payment_status) as "default" | "success" | "warning" | "destructive" | "secondary" | "outline"}>
                {booking.payment_status === 'paid'
                  ? 'Paid'
                  : booking.payment_status === 'pending'
                  ? 'Pending'
                  : booking.payment_status === 'refunded'
                  ? 'Refunded'
                  : 'Failed'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Booking status</span>
              <Badge variant={getBookingVariant(booking.booking_status) as "default" | "success" | "warning" | "destructive" | "secondary" | "outline"}>
                {booking.booking_status === 'confirmed'
                  ? 'Confirmed'
                  : booking.booking_status === 'pending'
                  ? 'Pending'
                  : 'Cancelled'}
              </Badge>
            </div>

            {booking.payment_status === 'paid' && (
              <>
                <Separator />
                <Button
                  variant="destructive"
                  onClick={handleRefund}
                  disabled={refundMutation.isPending}
                  className="w-full"
                >
                  {refundMutation.isPending ? 'Processing...' : 'Issue refund'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {booking.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                {booking.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
