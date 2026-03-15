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

  const { data, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: !!token,
    retry: false,
  })

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-600 border-t-transparent"></div>
      </div>
    )
  }

  if (error || !data?.user) {
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
        {/* Full-screen inline editor — no AdminLayout chrome */}
        <Route path="/pages/new" element={<ProtectedRoute><InlineEditorPage contentType="page" /></ProtectedRoute>} />
        <Route path="/pages/:id" element={<ProtectedRoute><InlineEditorPage contentType="page" /></ProtectedRoute>} />
        <Route path="/posts/new" element={<ProtectedRoute><InlineEditorPage contentType="post" /></ProtectedRoute>} />
        <Route path="/posts/:id" element={<ProtectedRoute><InlineEditorPage contentType="post" /></ProtectedRoute>} />
        <Route path="/courses/new" element={<ProtectedRoute><InlineEditorPage contentType="course" /></ProtectedRoute>} />
        <Route path="/courses/:id" element={<ProtectedRoute><InlineEditorPage contentType="course" /></ProtectedRoute>} />
        <Route path="/products/new" element={<ProtectedRoute><InlineEditorPage contentType="product" /></ProtectedRoute>} />
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
