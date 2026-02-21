import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'

const Home = React.lazy(() => import('./pages/Home'))
const Page = React.lazy(() => import('./pages/Page'))
const Courses = React.lazy(() => import('./pages/Courses'))
const CourseDetail = React.lazy(() => import('./pages/CourseDetail'))
const Booking = React.lazy(() => import('./pages/Booking'))
const BookingConfirmation = React.lazy(() => import('./pages/BookingConfirmation'))
const Blog = React.lazy(() => import('./pages/Blog'))
const BlogPost = React.lazy(() => import('./pages/BlogPost'))
const Contact = React.lazy(() => import('./pages/Contact'))
const NotFound = React.lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-100 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-5/6" />
        <div className="h-4 bg-gray-100 rounded w-4/6" />
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
          <Route path="utbildningar" element={<Suspense fallback={<PageLoader />}><Courses /></Suspense>} />
          <Route path="utbildningar/:slug" element={<Suspense fallback={<PageLoader />}><CourseDetail /></Suspense>} />
          <Route path="utbildningar/:slug/boka" element={<Suspense fallback={<PageLoader />}><Booking /></Suspense>} />
          <Route path="utbildningar/bekraftelse" element={<Suspense fallback={<PageLoader />}><BookingConfirmation /></Suspense>} />
          <Route path="nyhet" element={<Suspense fallback={<PageLoader />}><Blog /></Suspense>} />
          <Route path="nyhet/:slug" element={<Suspense fallback={<PageLoader />}><BlogPost /></Suspense>} />
          <Route path="kontakt" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
          <Route path=":slug" element={<Suspense fallback={<PageLoader />}><Page /></Suspense>} />
          <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
