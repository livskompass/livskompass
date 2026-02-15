import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getCourse, createBooking, startCheckout } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import NotFound from './NotFound'

export default function Booking() {
  const { slug } = useParams<{ slug: string }>()

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerOrganization: '',
    participants: 1,
    notes: '',
  })
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => getCourse(slug!),
    enabled: !!slug,
  })

  useDocumentTitle(data?.course ? `Boka ${data.course.title}` : 'Boka plats')

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: async (data) => {
      try {
        const checkout = await startCheckout(data.booking.id)
        window.location.href = checkout.checkoutUrl
      } catch (err) {
        setError('Kunde inte starta betalningen. Försök igen.')
      }
    },
    onError: (err: Error) => {
      setError(err.message || 'Något gick fel. Försök igen.')
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        </div>
      </div>
    )
  }

  if (!data?.course) {
    return <NotFound />
  }

  const { course } = data

  if (course.status === 'full' || course.status === 'completed') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Kan inte boka
        </h1>
        <p className="text-gray-600 mb-6">
          {course.status === 'full'
            ? 'Denna utbildning är fullbokad.'
            : 'Denna utbildning har redan genomförts.'}
        </p>
        <Link
          to="/utbildningar"
          className="text-primary-600 hover:text-primary-700"
        >
          &larr; Se andra utbildningar
        </Link>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    bookingMutation.mutate({
      courseId: course.id,
      ...formData,
    })
  }

  const totalPrice = course.price_sek * formData.participants

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        to={`/utbildningar/${slug}`}
        className="text-primary-600 hover:text-primary-700 mb-6 inline-block"
      >
        &larr; Tillbaka
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Boka plats</h1>
      <p className="text-xl text-gray-600 mb-8">{course.title}</p>

      <div className="bg-gray-50 rounded-lg p-4 mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Datum</span>
          <span className="font-medium">
            {new Date(course.start_date).toLocaleDateString('sv-SE')}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Plats</span>
          <span className="font-medium">{course.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Pris per person</span>
          <span className="font-medium">
            {course.price_sek.toLocaleString('sv-SE')} kr
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
            Namn *
          </label>
          <input
            type="text"
            id="customerName"
            required
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
            E-post *
          </label>
          <input
            type="email"
            id="customerEmail"
            required
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefon
          </label>
          <input
            type="tel"
            id="customerPhone"
            value={formData.customerPhone}
            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="customerOrganization" className="block text-sm font-medium text-gray-700 mb-1">
            Organisation/företag
          </label>
          <input
            type="text"
            id="customerOrganization"
            value={formData.customerOrganization}
            onChange={(e) => setFormData({ ...formData, customerOrganization: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">
            Antal deltagare *
          </label>
          <select
            id="participants"
            value={formData.participants}
            onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {Array.from(
              { length: Math.min(10, course.max_participants - course.current_participants) },
              (_, i) => i + 1
            ).map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Meddelande
          </label>
          <textarea
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Eventuella frågor eller önskemål..."
          />
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between text-lg font-semibold mb-6">
            <span>Totalt att betala</span>
            <span>{totalPrice.toLocaleString('sv-SE')} kr</span>
          </div>

          <button
            type="submit"
            disabled={bookingMutation.isPending}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bookingMutation.isPending ? 'Bearbetar...' : 'Gå till betalning'}
          </button>

          <p className="text-sm text-gray-500 text-center mt-4">
            Du kommer att dirigeras till Stripe för säker betalning
          </p>
        </div>
      </form>
    </div>
  )
}
