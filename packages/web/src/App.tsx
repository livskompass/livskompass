import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DEFAULT_HOMEPAGE_SLUG } from '@livskompass/shared'
import { getSiteSettings } from './lib/api'
import Layout from './components/Layout'
import InlineEditProvider from './components/InlineEditProvider'

const UniversalPage = React.lazy(() => import('./pages/UniversalPage'))
const CourseDetail = React.lazy(() => import('./pages/CourseDetail'))
// BookingPage removed — booking form is now inline on course detail page
const BookingConfirmation = React.lazy(() => import('./pages/BookingConfirmation'))
const PostDetail = React.lazy(() => import('./pages/PostDetail'))
const NotFound = React.lazy(() => import('./pages/NotFound'))
const DesignSystem = React.lazy(() => import('./pages/DesignSystem'))

/** Redirect old /utbildningar/:slug/boka to /utbildningar/:slug#boka */
function BookingRedirect() {
  const { slug } = useParams<{ slug: string }>()
  return <Navigate to={`/utbildningar/${slug}#boka`} replace />
}

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

function App() {
  return (
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
          <Route path="utbildningar/:slug/boka" element={<BookingRedirect />} />
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
  )
}

export default App
