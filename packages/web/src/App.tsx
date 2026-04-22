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
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'))
const NotFound = React.lazy(() => import('./pages/NotFound'))
const DesignSystem = React.lazy(() => import('./pages/DesignSystem'))

/**
 * Legacy slugs from the WordPress migration that now live as typed content
 * (course or product). Source of truth for both dev <Navigate> redirects below
 * and the production _redirects file. Keep in sync.
 */
const LEGACY_REDIRECTS: Record<string, string> = {
  forelasningar: '/utbildningar/forelasningar',
  norge: '/utbildningar/norge',
  'act-grupp-for-ungdomar-13-19-ar': '/utbildningar/act-grupp-for-ungdomar-13-19-ar',
  'stockholm-varen': '/utbildningar/stockholm-varen',
  'cd-medveten-narvaro': '/material/cd-medveten-narvaro',
  'act-samtalskort-norska': '/material/act-samtalskort-norska',
  'act-samtalskort': '/material/act-samtalskort',
  'bestallning-av-cd-medveten-narvaro': '/bestallning-av-cd-medveten-narvaro-2',
  'rekryteringsmaterial-infor-gruppledarutbildning': '/rekryteringsmaterial',
}

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

          {/* Material (product) detail */}
          <Route path="material/:slug" element={<Suspense fallback={<PageLoader />}><ProductDetail /></Suspense>} />

          {/* Legacy WP slugs that became typed content — mirrors prod _redirects for dev */}
          {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
            <Route key={from} path={from} element={<Navigate to={to} replace />} />
          ))}

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
