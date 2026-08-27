import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { API_BASE } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

interface Issue {
  subject: string
  date: string | null
  html: string
}

/**
 * Renders one sent newsletter on the site. The rendered email HTML comes from
 * the API (which proxies Get a Newsletter's preview page) and is shown in a
 * same-origin sandboxed iframe: scripts can't run (no allow-scripts), links
 * open in a new tab, and the frame auto-sizes to the newsletter's height.
 */
export default function NewsletterIssue() {
  const { id } = useParams<{ id: string }>()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(800)

  useDocumentTitle(issue?.subject || 'Nyhetsbrev')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    fetch(`${API_BASE}/newsletter/archive/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Issue) => {
        if (cancelled) return
        setIssue(data)
        setStatus('ready')
      })
      .catch(() => !cancelled && setStatus('error'))
    return () => { cancelled = true }
  }, [id])

  // Auto-size the frame to the email's content. Images load after the
  // document, so re-measure a few times and watch the body for resizes.
  useEffect(() => {
    if (status !== 'ready') return
    const iframe = iframeRef.current
    if (!iframe) return

    const measure = () => {
      const doc = iframe.contentDocument
      if (!doc) return
      const h = Math.max(doc.documentElement?.scrollHeight || 0, doc.body?.scrollHeight || 0)
      if (h > 0) setHeight(h)
    }

    const timers = [300, 1000, 2500, 5000].map((ms) => window.setTimeout(measure, ms))
    let observer: ResizeObserver | null = null
    const onLoad = () => {
      measure()
      const body = iframe.contentDocument?.body
      if (body && typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(measure)
        observer.observe(body)
      }
    }
    iframe.addEventListener('load', onLoad)
    onLoad()
    return () => {
      timers.forEach(clearTimeout)
      observer?.disconnect()
      iframe.removeEventListener('load', onLoad)
    }
  }, [status])

  if (status === 'error') {
    return (
      <div className="mx-auto py-16 text-center" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)' }}>
        <p className="text-muted mb-6">Nyhetsbrevet kunde inte laddas.</p>
        <Link to="/nyhetsbrev" className="text-accent underline">Till alla nyhetsbrev</Link>
      </div>
    )
  }

  // Links inside the newsletter open in a new tab.
  const srcDoc = issue ? issue.html.replace(/<head([^>]*)>/i, '<head$1><base target="_blank">') : ''

  return (
    <div>
      {/* pt-24 clears the fixed site header */}
      <div className="mx-auto pt-24 pb-6" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)' }}>
        <Link to="/nyhetsbrev" className="inline-flex items-center gap-1.5 text-body-sm text-muted hover:text-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Alla nyhetsbrev
        </Link>
      </div>
      {status === 'loading' ? (
        <div className="mx-auto animate-pulse" style={{ maxWidth: '42rem', paddingInline: 'var(--container-px)' }}>
          <div className="h-72 rounded-xl bg-stone-200/60 mb-4" />
          <div className="h-4 w-2/3 rounded bg-stone-200/60 mb-2" />
          <div className="h-4 w-1/2 rounded bg-stone-200/50" />
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          title={issue?.subject || 'Nyhetsbrev'}
          sandbox="allow-same-origin allow-popups"
          srcDoc={srcDoc}
          className="w-full block"
          style={{ border: 0, height }}
        />
      )}
    </div>
  )
}
