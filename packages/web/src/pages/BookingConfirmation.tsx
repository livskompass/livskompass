import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getBookingStatus } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Home, BookOpen, MessageSquare } from 'lucide-react'

export default function BookingConfirmation() {
  useDocumentTitle('Bokningsbekräftelse')
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
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Card>
          <CardContent className="py-12">
            <h1 className="text-h2 text-stone-900 mb-4">
              Ingen bokning hittades
            </h1>
            <Button variant="ghost" className="text-forest-600" asChild>
              <Link to="/utbildningar">
                <BookOpen className="mr-2 h-4 w-4" />
                Se utbildningar
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'cancelled') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Card>
          <CardContent className="py-12 px-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-6">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <h1 className="text-h2 text-stone-900 mb-3">
              Betalning avbruten
            </h1>
            <p className="text-stone-500 mb-8 text-lg">
              Betalningen avbrotades. Ingen debitering har gjorts.
            </p>
            <Button size="lg" asChild>
              <Link to="/utbildningar">
                <BookOpen className="mr-2 h-4 w-4" />
                Tillbaka till utbildningar
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Loader2 className="h-12 w-12 text-forest-600 animate-spin mx-auto mb-6" />
        <p className="text-stone-500 text-lg">Bekräftar bokning...</p>
      </div>
    )
  }

  const booking = data?.booking
  const isPaid = booking?.payment_status === 'paid'
  const isPending = booking?.payment_status === 'pending'

  if (isPending) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Loader2 className="h-12 w-12 text-forest-600 animate-spin mx-auto mb-6" />
        <h1 className="text-h2 text-stone-900 mb-3">
          Behandlar betalning...
        </h1>
        <p className="text-stone-500 text-lg" aria-live="polite">
          Vi behandlar din bokning. Vänligen vänta...
        </p>
      </div>
    )
  }

  if (isPaid) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-h2 text-stone-900 mb-3">
          Tack för din bokning!
        </h1>
        <p className="text-stone-500 mb-8 text-lg" aria-live="polite">
          Din bokning är bekräftad. Spara ditt bokningsnummer. Kontakta oss vid frågor.
        </p>
        <Card className="text-left mb-8">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500 mb-0.5">Bokningsnummer</p>
                <p className="font-mono font-medium text-stone-900">{bookingId}</p>
              </div>
              <Badge variant="success">Bekräftad</Badge>
            </div>
          </CardContent>
        </Card>
        <Button size="lg" asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Till startsidan
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <Card>
        <CardContent className="py-12 px-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-h2 text-stone-900 mb-3">
            Något gick fel
          </h1>
          <p className="text-stone-500 mb-8 text-lg">
            Det uppstod ett problem med din betalning. Kontakta oss om du har frågor.
          </p>
          <Button size="lg" asChild>
            <Link to="/kontakt">
              <MessageSquare className="mr-2 h-4 w-4" />
              Kontakta oss
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
