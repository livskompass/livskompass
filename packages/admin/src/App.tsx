import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMe, getAuthToken } from './lib/api'

import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import PagesList from './pages/PagesList'
import PostsList from './pages/PostsList'
import CoursesList from './pages/CoursesList'
import BookingsList from './pages/BookingsList'
import BookingDetail from './pages/BookingDetail'
import ProductsList from './pages/ProductsList'
import MediaLibrary from './pages/MediaLibrary'
import ContactsList from './pages/ContactsList'
import UsersList from './pages/UsersList'
import Settings from './pages/Settings'
import InlineEditorPage from './editor/InlineEditor'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getAuthToken()
  const [timedOut, setTimedOut] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Safety timeout — don't block forever on slow API
  useEffect(() => {
    if (!isLoading) return
    const timer = setTimeout(() => setTimedOut(true), 5000)
    return () => clearTimeout(timer)
  }, [isLoading])

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (isLoading && !timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-zinc-300 border-t-zinc-600"></div>
          Loading...
        </div>
      </div>
    )
  }

  if (error || (!data?.user && !timedOut)) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* Full-screen inline editor — /new routes skip ProtectedRoute (editor has own auth) */}
        <Route path="/pages/new" element={<InlineEditorPage contentType="page" />} />
        <Route path="/posts/new" element={<InlineEditorPage contentType="post" />} />
        <Route path="/courses/new" element={<InlineEditorPage contentType="course" />} />
        <Route path="/products/new" element={<InlineEditorPage contentType="product" />} />
        <Route path="/pages/:id" element={<ProtectedRoute><InlineEditorPage contentType="page" /></ProtectedRoute>} />
        <Route path="/posts/:id" element={<ProtectedRoute><InlineEditorPage contentType="post" /></ProtectedRoute>} />
        <Route path="/courses/:id" element={<ProtectedRoute><InlineEditorPage contentType="course" /></ProtectedRoute>} />
        <Route path="/products/:id" element={<ProtectedRoute><InlineEditorPage contentType="product" /></ProtectedRoute>} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pages" element={<PagesList />} />
          <Route path="posts" element={<PostsList />} />
          <Route path="courses" element={<CoursesList />} />
          <Route path="bookings" element={<BookingsList />} />
          <Route path="bookings/:id" element={<BookingDetail />} />
          <Route path="products" element={<ProductsList />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="messages" element={<ContactsList />} />
          <Route path="users" element={<UsersList />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
