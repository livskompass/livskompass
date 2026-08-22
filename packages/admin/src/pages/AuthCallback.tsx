import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setAuthToken } from '../lib/api'
import { Loader2 } from 'lucide-react'

const WEB_URL = import.meta.env.VITE_WEB_URL || ''

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')

    if (token) {
      setAuthToken(token)

      // Bridge token to the web frontend so inline editing works there too.
      // Must be a TOP-LEVEL navigation: a hidden iframe's localStorage write
      // lands in Chrome's partitioned storage and the site never sees it.
      // The site's /admin-auth stores the token and sends us straight back.
      if (WEB_URL) {
        const ret = `${window.location.origin}/dashboard`
        window.location.replace(`${WEB_URL}/admin-auth?token=${token}&return=${encodeURIComponent(ret)}`)
        return
      }

      navigate('/dashboard', { replace: true })
    } else {
      navigate('/login?error=oauth_failed', { replace: true })
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-zinc-600 animate-spin mx-auto mb-4" />
        <p className="text-zinc-500 text-sm">Signing in...</p>
      </div>
    </div>
  )
}
