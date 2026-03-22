import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getBookingStatus } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useUIStrings } from '@livskompass/shared'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Home, BookOpen, MessageSquare } from 'lucide-react'

export default function BookingConfirmation() {
  const strings = useUIStrings()
  const s = strings.confirmation
  useDocumentTitle(s.pageTitle)
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('booking')
  const status = searchParams.get('status')

  const { data, isLoading } = useQuery({
    queryKey: ['booking-status', bookingId],
    queryFn: () => getBookingStatus(bookingId!),
    enabled: !!bookingId,
    refetchInterval: (data) => {
      if (data?.state?.data?.booking?.payment_status === 'pending') {
        return 2000
      }
      return false
    },
  })

  if (!bookingId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Card>
          <CardContent className="py-12">
            <h1 className="text-h2 text-foreground-strong mb-4">
              {s.noBookingHeading}
            </h1>
            <Button variant="ghost" className="text-accent" asChild>
              <Link to="/utbildningar">
                <BookOpen className="mr-2 h-4 w-4" />
                {s.seeCourses}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'cancelled') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Card>
          <CardContent className="py-12 px-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-6">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <h1 className="text-h2 text-foreground-strong mb-3">
              {s.cancelledHeading}
            </h1>
            <p className="text-muted mb-8 text-body-lg">
              {s.cancelledMessage}
            </p>
            <Button size="lg" asChild>
              <Link to="/utbildningar">
                <BookOpen className="mr-2 h-4 w-4" />
                {s.backToCourses}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Loader2 className="h-12 w-12 text-accent animate-spin mx-auto mb-6" />
        <p className="text-muted text-body-lg">{s.confirming}</p>
      </div>
    )
  }

  const booking = data?.booking
  const isPaid = booking?.payment_status === 'paid'
  const isPending = booking?.payment_status === 'pending'

  if (isPending) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Loader2 className="h-12 w-12 text-accent animate-spin mx-auto mb-6" />
        <h1 className="text-h2 text-foreground-strong mb-3">
          {s.processingHeading}
        </h1>
        <p className="text-muted text-body-lg" aria-live="polite">
          {s.processingMessage}
        </p>
      </div>
    )
  }

  if (isPaid) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-h2 text-foreground-strong mb-3">
          {s.successHeading}
        </h1>
        <p className="text-muted mb-8 text-body-lg" aria-live="polite">
          {s.successMessage}
        </p>
        <Card className="text-left mb-8">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm text-muted mb-0.5">{s.bookingNumberLabel}</p>
                <p className="font-mono font-medium text-foreground-strong">{bookingId}</p>
              </div>
              <Badge variant="success">{s.confirmedBadge}</Badge>
            </div>
          </CardContent>
        </Card>
        <Button size="lg" asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            {s.toHomepage}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <Card>
        <CardContent className="py-12 px-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-h2 text-foreground-strong mb-3">
            {s.errorHeading}
          </h1>
          <p className="text-muted mb-8 text-body-lg">
            {s.errorMessage}
          </p>
          <Button size="lg" asChild>
            <Link to="/kontakt">
              <MessageSquare className="mr-2 h-4 w-4" />
              {s.contactUs}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
