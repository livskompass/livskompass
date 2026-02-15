import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getBookingStatus } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

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
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Ingen bokning hittades
        </h1>
        <Link
          to="/utbildningar"
          className="text-primary-600 hover:text-primary-700"
        >
          &larr; Se utbildningar
        </Link>
      </div>
    )
  }

  if (status === 'cancelled') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Betalning avbruten
        </h1>
        <p className="text-gray-600 mb-8">
          Betalningen avbrotades. Ingen debitering har gjorts.
        </p>
        <Link
          to="/utbildningar"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Tillbaka till utbildningar
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-6"></div>
        <p className="text-gray-600">Bekräftar bokning...</p>
      </div>
    )
  }

  const booking = data?.booking
  const isPaid = booking?.payment_status === 'paid'
  const isPending = booking?.payment_status === 'pending'

  if (isPending) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-6"></div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Behandlar betalning...
        </h1>
        <p className="text-gray-600">
          Vänligen behandlar vi din bokning. Detta tar normalt bara några sekunder.
        </p>
      </div>
    )
  }

  if (isPaid) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tack för din bokning!
        </h1>
        <p className="text-gray-600 mb-8">
          Din bokning är bekräftad. Du kommer att få en bekräftelse via e-post
          med all information om utbildningen.
        </p>
        <div className="bg-gray-50 rounded-lg p-6 text-left mb-8">
          <h2 className="font-semibold text-gray-900 mb-2">Bokningsnummer</h2>
          <p className="text-gray-600 font-mono">{bookingId}</p>
        </div>
        <Link
          to="/"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Till startsidan
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Något gick fel
      </h1>
      <p className="text-gray-600 mb-8">
        Det uppstod ett problem med din betalning. Kontakta oss om du har frågor.
      </p>
      <Link
        to="/kontakt"
        className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
      >
        Kontakta oss
      </Link>
    </div>
  )
}
