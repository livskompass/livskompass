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

      // Bridge token to the web frontend so inline editing works there too
      if (WEB_URL) {
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.src = `${WEB_URL}/admin-auth?token=${token}`
        document.body.appendChild(iframe)
        setTimeout(() => iframe.remove(), 3000)
      }

      navigate('/dashboard', { replace: true })
    } else {
      navigate('/login?error=oauth_failed', { replace: true })
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-stone-600 animate-spin mx-auto mb-4" />
        <p className="text-stone-500 text-sm">Signing in...</p>
      </div>
    </div>
  )
}
