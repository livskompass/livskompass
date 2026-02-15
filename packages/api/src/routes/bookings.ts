import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import Stripe from 'stripe'
import type { Bindings } from '../index'

export const bookingsRoutes = new Hono<{ Bindings: Bindings }>()

// Create a new booking
bookingsRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const { courseId, customerName, customerEmail, customerPhone, customerOrganization, participants, notes } = body

  // Validate required fields
  if (!customerName || !customerEmail || !courseId || !participants) {
    return c.json({ error: 'Namn, e-post, kurs-ID och antal deltagare krävs' }, 400)
  }

  if (!customerEmail.includes('@')) {
    return c.json({ error: 'Ogiltig e-postadress' }, 400)
  }

  if (typeof participants !== 'number' || participants < 1) {
    return c.json({ error: 'Antal deltagare måste vara minst 1' }, 400)
  }

  // Validate course exists
  const course = await c.env.DB.prepare(`
    SELECT id, price_sek, status FROM courses WHERE id = ? AND status = 'active'
  `).bind(courseId).first()

  if (!course) {
    return c.json({ error: 'Course not found or not available' }, 404)
  }

  // Atomically reserve spots - prevents race condition where concurrent bookings overbook.
  // The UPDATE only affects a row if there are enough spots remaining.
  const reserveResult = await c.env.DB.prepare(`
    UPDATE courses
    SET current_participants = current_participants + ?,
        status = CASE
          WHEN current_participants + ? >= max_participants THEN 'full'
          ELSE status
        END
    WHERE id = ? AND status = 'active' AND current_participants + ? <= max_participants
  `).bind(participants, participants, courseId, participants).run()

  if (!reserveResult.meta.rows_written) {
    return c.json({ error: 'Not enough spots available' }, 400)
  }

  const id = nanoid()
  const totalPrice = (course.price_sek as number) * participants

  await c.env.DB.prepare(`
    INSERT INTO bookings (id, course_id, customer_name, customer_email, customer_phone,
                         customer_organization, participants, total_price_sek, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, courseId, customerName, customerEmail, customerPhone, customerOrganization, participants, totalPrice, notes).run()

  return c.json({
    booking: { id, courseId, customerName, customerEmail, participants, totalPrice },
    message: 'Booking created. Proceed to checkout.'
  }, 201)
})

// Start Stripe checkout
bookingsRoutes.post('/:id/checkout', async (c) => {
  const bookingId = c.req.param('id')

  const booking = await c.env.DB.prepare(`
    SELECT b.*, c.title as course_title, c.slug as course_slug
    FROM bookings b
    JOIN courses c ON b.course_id = c.id
    WHERE b.id = ?
  `).bind(bookingId).first()

  if (!booking) {
    return c.json({ error: 'Booking not found' }, 404)
  }

  if (booking.payment_status === 'paid') {
    return c.json({ error: 'Booking already paid' }, 400)
  }

  const totalPriceSek = booking.total_price_sek as number
  if (!totalPriceSek || totalPriceSek <= 0) {
    return c.json({ error: 'Invalid booking price' }, 400)
  }

  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'sek',
        product_data: {
          name: booking.course_title as string,
          description: `Bokning: ${booking.participants} deltagare`,
        },
        unit_amount: totalPriceSek * 100, // Convert to öre
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${c.env.SITE_URL}/utbildningar/bekraftelse?booking=${bookingId}`,
    cancel_url: `${c.env.SITE_URL}/utbildningar/${booking.course_slug}`,
    customer_email: booking.customer_email as string,
    metadata: {
      booking_id: bookingId,
    },
  })

  // Update booking with session ID
  await c.env.DB.prepare(`
    UPDATE bookings SET stripe_session_id = ? WHERE id = ?
  `).bind(session.id, bookingId).run()

  return c.json({ checkoutUrl: session.url })
})

// Get booking status
bookingsRoutes.get('/:id/status', async (c) => {
  const bookingId = c.req.param('id')

  const booking = await c.env.DB.prepare(`
    SELECT id, payment_status, booking_status FROM bookings WHERE id = ?
  `).bind(bookingId).first()

  if (!booking) {
    return c.json({ error: 'Booking not found' }, 404)
  }

  return c.json({ booking })
})
