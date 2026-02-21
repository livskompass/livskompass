import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setAuthToken } from '../lib/api'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')

    if (token) {
      setAuthToken(token)
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/login?error=oauth_failed', { replace: true })
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-forest-600 animate-spin mx-auto mb-4" />
        <p className="text-stone-500 text-sm">Signing in...</p>
      </div>
    </div>
  )
}
