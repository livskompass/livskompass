import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DEFAULT_HOMEPAGE_SLUG } from '@livskompass/shared'
import { getSiteSettings } from './lib/api'
import Layout from './components/Layout'
import InlineEditProvider from './components/InlineEditProvider'

const UniversalPage = React.lazy(() => import('./pages/UniversalPage'))
const CourseDetail = React.lazy(() => import('./pages/CourseDetail'))
const BookingPage = React.lazy(() => import('./pages/BookingPage'))
const BookingConfirmation = React.lazy(() => import('./pages/BookingConfirmation'))
const PostDetail = React.lazy(() => import('./pages/PostDetail'))
const NotFound = React.lazy(() => import('./pages/NotFound'))
const DesignSystem = React.lazy(() => import('./pages/DesignSystem'))

function PageLoader() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-stone-100 rounded w-3/4" />
        <div className="h-4 bg-stone-100 rounded w-full" />
        <div className="h-4 bg-stone-100 rounded w-5/6" />
        <div className="h-4 bg-stone-100 rounded w-4/6" />
      </div>
    </div>
  )
}

function HomepageRoute() {
  const { data: siteData } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSiteSettings,
    staleTime: 5 * 60 * 1000,
  })
  const slug = siteData?.homepage_slug || DEFAULT_HOMEPAGE_SLUG
  return <Suspense fallback={<PageLoader />}><UniversalPage slug={slug} /></Suspense>
}

/** Accepts ?token=xxx from OAuth callback or admin-auth bridge and stores it */
function AuthBridge() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      localStorage.setItem('admin_token', token)
      navigate('/', { replace: true })
      window.location.reload()
    } else {
      navigate('/', { replace: true })
    }
  }, [searchParams, navigate])
  return null
}

const SITE_PASSWORD = 'livskompass2026'

function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = React.useState(() => sessionStorage.getItem('site-auth') === 'true')
  const [input, setInput] = React.useState('')
  const [error, setError] = React.useState(false)

  if (authenticated) return <>{children}</>

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#C7DDDC' }}>
      <div className="bg-white rounded-[16px] p-8 shadow-lg max-w-sm w-full mx-4">
        <h1 className="text-xl font-semibold text-forest-800 mb-2">Livskompass</h1>
        <p className="text-sm text-stone-500 mb-6">This site is under development. Enter password to continue.</p>
        <form onSubmit={(e) => {
          e.preventDefault()
          if (input === SITE_PASSWORD) {
            sessionStorage.setItem('site-auth', 'true')
            setAuthenticated(true)
          } else {
            setError(true)
          }
        }}>
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false) }}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-[12px] border border-stone-200 text-sm outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600/20 mb-3"
            autoFocus
          />
          {error && <p className="text-red-500 text-xs mb-3">Wrong password</p>}
          <button type="submit" className="w-full bg-forest-800 text-white rounded-[16px] py-3 text-sm font-medium hover:bg-forest-900 transition-colors">
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}

function App() {
  return (
    <PasswordGate>
    <BrowserRouter>
      <InlineEditProvider>
      <Routes>
        {/* Admin auth — stores token from OAuth redirect or admin bridge */}
        <Route path="/admin-auth" element={<AuthBridge />} />
        <Route path="/auth/callback" element={<AuthBridge />} />
        <Route path="/" element={<Layout />}>
          {/* Home: resolved from site settings, fallback to DEFAULT_HOMEPAGE_SLUG */}
          <Route index element={<HomepageRoute />} />

          {/* Design system */}
          <Route path="design-system" element={<Suspense fallback={<PageLoader />}><DesignSystem /></Suspense>} />

          {/* Listing pages: block-based pages */}
          <Route path="utbildningar" element={<Suspense fallback={<PageLoader />}><UniversalPage slug="utbildningar" /></Suspense>} />
          <Route path="nyhet" element={<Suspense fallback={<PageLoader />}><UniversalPage slug="nyhet" /></Suspense>} />
          <Route path="kontakt" element={<Suspense fallback={<PageLoader />}><UniversalPage slug="kontakt" /></Suspense>} />
          <Route path="material" element={<Suspense fallback={<PageLoader />}><UniversalPage slug="material" /></Suspense>} />

          {/* Detail pages: context-wrapped renderers */}
          <Route path="utbildningar/:slug" element={<Suspense fallback={<PageLoader />}><CourseDetail /></Suspense>} />
          <Route path="utbildningar/:slug/boka" element={<Suspense fallback={<PageLoader />}><BookingPage /></Suspense>} />
          <Route path="utbildningar/bekraftelse" element={<Suspense fallback={<PageLoader />}><BookingConfirmation /></Suspense>} />

          {/* Blog detail */}
          <Route path="nyhet/:slug" element={<Suspense fallback={<PageLoader />}><PostDetail /></Suspense>} />

          {/* Catch-all: generic page by slug */}
          <Route path=":slug" element={<Suspense fallback={<PageLoader />}><UniversalPage /></Suspense>} />

          {/* 404 */}
          <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
        </Route>
      </Routes>
      </InlineEditProvider>
    </BrowserRouter>
    </PasswordGate>
  )
}

export default App
