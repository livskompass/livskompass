import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAuthToken, API_BASE } from '../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

export default function Login() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const error = searchParams.get('error')

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (getAuthToken()) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_BASE}/auth/google`
  }

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'oauth_failed':
        return 'Google sign-in failed. Please try again.'
      case 'token_failed':
        return 'Could not verify your sign-in. Please try again.'
      case 'no_email':
        return 'No email address could be retrieved from your Google account.'
      case 'not_authorized':
        return 'You do not have access to admin. Contact the administrator.'
      case 'oauth_error':
        return 'An error occurred during sign-in. Please try again.'
      default:
        return null
    }
  }

  const errorMessage = getErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Livskompass</h1>
          <p className="text-gray-500 mt-1 text-sm">Admin Dashboard</p>
        </div>

        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {errorMessage}
              </div>
            )}

            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full h-11 gap-3 font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            <p className="text-xs text-gray-400 text-center mt-5">
              Only authorized users can sign in.
              <br />
              Contact the administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
