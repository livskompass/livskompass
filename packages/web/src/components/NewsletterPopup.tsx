import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Mail } from 'lucide-react'
import { defaultNewsletter } from '@livskompass/shared'
import { getSiteSettings } from '../lib/api'
import { NewsletterSignup, NEWSLETTER_SUBSCRIBED_KEY } from './NewsletterSignup'

/** Set once the popup has been shown (or dismissed) so it never nags again. */
const POPUP_SEEN_KEY = 'newsletter_popup_seen'

const SHOW_AFTER_MS = 15_000
const SHOW_AFTER_SCROLL = 0.35

function alreadySeen(): boolean {
  try {
    return (
      localStorage.getItem(POPUP_SEEN_KEY) === '1' ||
      localStorage.getItem(NEWSLETTER_SUBSCRIBED_KEY) === '1'
    )
  } catch {
    // localStorage unavailable (private mode) — fail closed, never nag.
    return true
  }
}

export function NewsletterPopup() {
  const [open, setOpen] = useState(false)
  const openedRef = useRef(false)

  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSiteSettings,
    staleTime: 5 * 60 * 1000,
  })
  const cfg = { ...defaultNewsletter, ...(data?.newsletter || {}) }

  useEffect(() => {
    // Wait for settings before arming triggers — the popup may be disabled.
    if (!data || cfg.popupEnabled === false) return
    if (alreadySeen()) return

    const show = () => {
      if (openedRef.current) return
      openedRef.current = true
      setOpen(true)
      try { localStorage.setItem(POPUP_SEEN_KEY, '1') } catch { /* ignore */ }
    }

    const timer = setTimeout(show, SHOW_AFTER_MS)
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable > 200 && window.scrollY / scrollable >= SHOW_AFTER_SCROLL) show()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [data])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
    >
      <div
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          aria-label="Stäng"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5 mb-3">
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-forest-700/10">
            <Mail className="h-[18px] w-[18px] text-forest-700" />
          </span>
          <h2 id="newsletter-popup-title" className="font-display text-h4 text-foreground">
            {cfg.popupTitle}
          </h2>
        </div>
        <p className="text-muted text-body-sm mb-5">{cfg.popupText}</p>
        <NewsletterSignup source="popup" consentText={cfg.consentText} />
      </div>
    </div>
  )
}
