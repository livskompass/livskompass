import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMe, getAuthToken } from './lib/api'

import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import PagesList from './pages/PagesList'
import PageEditor from './pages/PageEditor'
import PostsList from './pages/PostsList'
import PostEditor from './pages/PostEditor'
import CoursesList from './pages/CoursesList'
import CourseEditor from './pages/CourseEditor'
import BookingsList from './pages/BookingsList'
import BookingDetail from './pages/BookingDetail'
import ProductsList from './pages/ProductsList'
import ProductEditor from './pages/ProductEditor'
import MediaLibrary from './pages/MediaLibrary'
import ContactsList from './pages/ContactsList'
import UsersList from './pages/UsersList'
import Settings from './pages/Settings'

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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-forest-600 border-t-transparent"></div>
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
          <Route path="sidor" element={<PagesList />} />
          <Route path="sidor/ny" element={<PageEditor />} />
          <Route path="sidor/:id" element={<PageEditor />} />
          <Route path="nyheter" element={<PostsList />} />
          <Route path="nyheter/ny" element={<PostEditor />} />
          <Route path="nyheter/:id" element={<PostEditor />} />
          <Route path="utbildningar" element={<CoursesList />} />
          <Route path="utbildningar/ny" element={<CourseEditor />} />
          <Route path="utbildningar/:id" element={<CourseEditor />} />
          <Route path="bokningar" element={<BookingsList />} />
          <Route path="bokningar/:id" element={<BookingDetail />} />
          <Route path="material" element={<ProductsList />} />
          <Route path="material/ny" element={<ProductEditor />} />
          <Route path="material/:id" element={<ProductEditor />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="meddelanden" element={<ContactsList />} />
          <Route path="anvandare" element={<UsersList />} />
          <Route path="installningar" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
