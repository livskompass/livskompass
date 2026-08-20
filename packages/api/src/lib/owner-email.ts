import type { Bindings } from '../index'

/**
 * Send a notification email to the site owner via Resend.
 *
 * Recipient: the "Contact details" email in admin General Settings
 * (settings.contact_email), falling back to the CONTACT_NOTIFY_EMAIL env var.
 * Requires the RESEND_API_KEY secret — without it, sending is skipped and
 * logged. Callers run this via waitUntil: failures are logged, never surfaced
 * to the visitor.
 */
export async function sendOwnerEmail(
  env: Bindings,
  { subject, text, replyTo }: { subject: string; text: string; replyTo?: string },
) {
  if (!env.RESEND_API_KEY) {
    console.error(`Owner email skipped (no RESEND_API_KEY): ${subject}`)
    return
  }

  const setting = await env.DB.prepare(
    `SELECT value FROM settings WHERE key = 'contact_email'`
  ).first<{ value: string }>().catch(() => null)
  const to = setting?.value || env.CONTACT_NOTIFY_EMAIL
  if (!to || !to.includes('@')) {
    console.error('Owner email skipped: no recipient (set Contact details email in admin Settings, or CONTACT_NOTIFY_EMAIL)')
    return
  }

  try {
    const res = await fetch(env.RESEND_API_URL || 'https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL || 'Livskompass <onboarding@resend.dev>',
        to: [to],
        ...(replyTo ? { reply_to: [replyTo] } : {}),
        subject,
        text,
      }),
    })
    if (!res.ok) {
      console.error(`Owner email failed: ${res.status} ${await res.text().catch(() => '')}`)
    }
  } catch (err) {
    console.error('Owner email failed:', err)
  }
}
