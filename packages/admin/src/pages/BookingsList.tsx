import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getBookings } from '../lib/api'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table'
import { Skeleton } from '../components/ui/skeleton'
import { Eye, Ticket } from 'lucide-react'

export default function BookingsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: getBookings,
  })

  const getPaymentVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'pending': return 'warning'
      case 'refunded': return 'secondary'
      default: return 'destructive'
    }
  }

  const getPaymentLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid'
      case 'pending': return 'Pending'
      case 'refunded': return 'Refunded'
      default: return 'Failed'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h3 text-stone-900">Bookings</h1>
        <p className="text-stone-500 mt-1">View and manage course bookings.</p>
      </div>

      <Card>
        {isLoading ? (
          <CardContent className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        ) : data?.bookings && data.bookings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-100">
                <TableHead>Customer</TableHead>
                <TableHead className="hidden lg:table-cell">Course</TableHead>
                <TableHead className="hidden md:table-cell">Participants</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.bookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-stone-50 transition-colors">
                  <TableCell>
                    <div>
                      <p className="font-medium text-stone-900 text-sm">
                        {booking.customer_name}
                      </p>
                      <p className="text-xs text-stone-500">{booking.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-stone-600 text-sm">
                    {booking.course_title || booking.course_id}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-stone-600 text-sm font-mono">
                    {booking.participants}
                  </TableCell>
                  <TableCell className="text-stone-900 text-sm font-medium">
                    {booking.total_price_sek?.toLocaleString('sv-SE')} kr
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentVariant(booking.payment_status) as "default" | "success" | "warning" | "destructive" | "secondary" | "outline"}>
                      {getPaymentLabel(booking.payment_status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-stone-500 text-sm">
                    {new Date(booking.created_at).toLocaleDateString('sv-SE')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/bokningar/${booking.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Ticket className="h-10 w-10 text-stone-300 mb-3" />
            <p className="text-stone-500">No bookings yet.</p>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
