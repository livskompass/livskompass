import { Hono } from 'hono'
import Stripe from 'stripe'
import type { Bindings } from '../index'

export const webhookRoutes = new Hono<{ Bindings: Bindings }>()

// Stripe webhook handler
webhookRoutes.post('/', async (c) => {
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

  // Get raw body for signature verification
  const rawBody = await c.req.text()
  const signature = c.req.header('Stripe-Signature')

  if (!signature) {
    return c.json({ error: 'Missing Stripe-Signature header' }, 400)
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, c.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return c.json({ error: 'Invalid signature' }, 400)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.booking_id

      if (!bookingId) {
        console.error('Webhook: No booking_id in session metadata')
        break
      }

      // Idempotency: check if booking is already paid
      const booking = await c.env.DB.prepare(
        'SELECT id, course_id, participants, payment_status FROM bookings WHERE id = ?'
      ).bind(bookingId).first() as {
        id: string
        course_id: string
        participants: number
        payment_status: string
      } | null

      if (!booking) {
        console.error(`Webhook: Booking ${bookingId} not found`)
        break
      }

      if (booking.payment_status === 'paid') {
        // Already processed - skip to avoid double-incrementing
        break
      }

      // Update booking status only - spots were already reserved at booking creation
      await c.env.DB.prepare(`
        UPDATE bookings
        SET payment_status = 'paid',
            booking_status = 'confirmed',
            stripe_payment_intent = ?
        WHERE id = ?
      `).bind(session.payment_intent as string, bookingId).run()

      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.booking_id

      if (!bookingId) break

      // Release reserved spots if booking was still pending
      const expiredBooking = await c.env.DB.prepare(
        'SELECT id, course_id, participants, payment_status FROM bookings WHERE id = ? AND payment_status = \'pending\''
      ).bind(bookingId).first() as { id: string; course_id: string; participants: number; payment_status: string } | null

      if (expiredBooking) {
        await c.env.DB.prepare(`
          UPDATE bookings SET payment_status = 'failed'
          WHERE id = ? AND payment_status = 'pending'
        `).bind(bookingId).run()

        // Release reserved spots
        await c.env.DB.prepare(`
          UPDATE courses
          SET current_participants = MAX(0, current_participants - ?),
              status = CASE
                WHEN status = 'full' AND (current_participants - ?) < max_participants THEN 'active'
                ELSE status
              END
          WHERE id = ?
        `).bind(expiredBooking.participants, expiredBooking.participants, expiredBooking.course_id).run()
      }

      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const bookingId = paymentIntent.metadata?.booking_id

      if (!bookingId) break

      // Release reserved spots if booking was still pending
      const failedBooking = await c.env.DB.prepare(
        'SELECT id, course_id, participants, payment_status FROM bookings WHERE id = ? AND payment_status = \'pending\''
      ).bind(bookingId).first() as { id: string; course_id: string; participants: number; payment_status: string } | null

      if (failedBooking) {
        await c.env.DB.prepare(`
          UPDATE bookings SET payment_status = 'failed'
          WHERE id = ? AND payment_status = 'pending'
        `).bind(bookingId).run()

        // Release reserved spots
        await c.env.DB.prepare(`
          UPDATE courses
          SET current_participants = MAX(0, current_participants - ?),
              status = CASE
                WHEN status = 'full' AND (current_participants - ?) < max_participants THEN 'active'
                ELSE status
              END
          WHERE id = ?
        `).bind(failedBooking.participants, failedBooking.participants, failedBooking.course_id).run()
      }

      break
    }
  }

  return c.json({ received: true })
})
