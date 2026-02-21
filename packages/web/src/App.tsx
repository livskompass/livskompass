import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import InlineEditProvider from './components/InlineEditProvider'

const UniversalPage = React.lazy(() => import('./pages/UniversalPage'))
const CourseDetail = React.lazy(() => import('./pages/CourseDetail'))
const BookingPage = React.lazy(() => import('./pages/BookingPage'))
const BookingConfirmation = React.lazy(() => import('./pages/BookingConfirmation'))
const PostDetail = React.lazy(() => import('./pages/PostDetail'))
const NotFound = React.lazy(() => import('./pages/NotFound'))

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

function App() {
  return (
    <BrowserRouter>
      <InlineEditProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Home: page with slug "home-2" (from WordPress migration) */}
          <Route index element={<Suspense fallback={<PageLoader />}><UniversalPage slug="home-2" /></Suspense>} />

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
  )
}

export default App
