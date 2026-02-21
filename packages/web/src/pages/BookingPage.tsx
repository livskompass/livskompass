import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getCourse, createBooking, startCheckout } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { CourseContext } from '../lib/context'
import NotFound from './NotFound'
import BlockRenderer from '../components/BlockRenderer'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Separator } from '../components/ui/separator'
import { Skeleton } from '../components/ui/skeleton'
import { Badge } from '../components/ui/badge'
import { ArrowLeft, Calendar, MapPin, CreditCard, Lock } from 'lucide-react'

function BookingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <Skeleton className="h-5 w-24 mb-6" />
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-5 w-64 mb-8" />
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BookingPage() {
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
      } catch {
        setError('Kunde inte starta betalningen. Försök igen.')
      }
    },
    onError: (err: Error) => {
      setError(err.message || 'Något gick fel. Försök igen.')
    },
  })

  if (isLoading) return <BookingSkeleton />
  if (!data?.course) return <NotFound />

  const { course } = data
  const courseAny = course as any

  // If course has custom booking page content_blocks, render via Puck with context
  // (This is a future feature — courses can customize their booking page layout)
  if (courseAny.booking_blocks) {
    return (
      <CourseContext.Provider value={courseAny}>
        <BlockRenderer data={courseAny.booking_blocks} />
      </CourseContext.Provider>
    )
  }

  // Default booking form (same as old Booking.tsx)
  const available = (course.max_participants || 0) - (course.current_participants || 0)

  if (course.status === 'full' || course.status === 'completed' || available <= 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Card className="inline-block w-full">
          <CardContent className="py-12 px-8">
            <Badge variant={course.status === 'completed' ? 'secondary' : 'destructive'} className="mb-4">
              {course.status === 'completed' ? 'Genomförd' : 'Fullbokad'}
            </Badge>
            <h1 className="text-h2 text-stone-900 mb-3">
              Kan inte boka
            </h1>
            <p className="text-stone-500 mb-6">
              {course.status === 'completed'
                ? 'Denna utbildning har redan genomförts.'
                : 'Denna utbildning är fullbokad.'}
            </p>
            <Button variant="ghost" className="text-forest-600" asChild>
              <Link to="/utbildningar">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Se andra utbildningar
              </Link>
            </Button>
          </CardContent>
        </Card>
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

  const priceSek = course.price_sek || 0
  const totalPrice = priceSek * formData.participants

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Button variant="ghost" className="mb-6 -ml-2 text-stone-600 hover:text-forest-600" asChild>
        <Link to={`/utbildningar/${slug}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tillbaka
        </Link>
      </Button>

      <h1 className="text-h2 text-stone-900 mb-2">Boka plats</h1>
      <p className="text-xl text-stone-500 mb-8">{course.title}</p>

      <Card className="mb-8">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {course.start_date && (
              <div className="flex items-center gap-2 text-stone-600">
                <Calendar className="h-4 w-4 text-stone-400" />
                <span>{new Date(course.start_date).toLocaleDateString('sv-SE')}</span>
              </div>
            )}
            {course.location && (
              <div className="flex items-center gap-2 text-stone-600">
                <MapPin className="h-4 w-4 text-stone-400" />
                <span>{course.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-stone-600">
              <CreditCard className="h-4 w-4 text-stone-400" />
              <span>{priceSek.toLocaleString('sv-SE')} kr/person</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Dina uppgifter</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="customerName">Namn *</Label>
              <Input
                type="text"
                id="customerName"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">E-post *</Label>
              <Input
                type="email"
                id="customerEmail"
                required
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Telefon</Label>
              <Input
                type="tel"
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerOrganization">Organisation/företag</Label>
              <Input
                type="text"
                id="customerOrganization"
                value={formData.customerOrganization}
                onChange={(e) => setFormData({ ...formData, customerOrganization: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="participants">Antal deltagare *</Label>
              <select
                id="participants"
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })}
                className="flex h-12 w-full px-4 rounded-md border-[1.5px] border-stone-300 bg-white text-stone-800 focus:outline-none focus:border-forest-400 focus:ring-[3px] focus:ring-forest-500/10 transition-colors"
              >
                {Array.from(
                  { length: Math.min(10, available) },
                  (_, i) => i + 1
                ).map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Meddelande</Label>
              <Textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Eventuella frågor eller önskemål..."
              />
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-semibold">
              <span>Totalt att betala</span>
              <span>{totalPrice.toLocaleString('sv-SE')} kr</span>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={bookingMutation.isPending}
            >
              {bookingMutation.isPending ? 'Bearbetar...' : 'Gå till betalning'}
            </Button>

            <p className="text-xs text-stone-400 text-center flex items-center justify-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              Du kommer att dirigeras till Stripe för säker betalning
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
