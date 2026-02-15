export const API_BASE = import.meta.env.VITE_API_URL || '/api'

let authToken: string | null = localStorage.getItem('admin_token')

export function setAuthToken(token: string | null) {
  authToken = token
  if (token) {
    localStorage.setItem('admin_token', token)
  } else {
    localStorage.removeItem('admin_token')
  }
}

export function getAuthToken() {
  return authToken
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  })

  if (response.status === 401) {
    setAuthToken(null)
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }))
    throw new Error(error.error || 'An error occurred')
  }

  return response.json()
}

// Auth
export const logout = () =>
  fetchApi<{ success: boolean }>('/auth/logout', { method: 'POST' })

export const getMe = () => fetchApi<{ user: User }>('/auth/me')

// Users (admin only)
export const getUsers = () => fetchApi<{ users: User[] }>('/auth/users')

export const createUser = (data: { email: string; name?: string; role?: string }) =>
  fetchApi<{ user: User }>('/auth/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateUser = (id: string, data: { role?: string; name?: string }) =>
  fetchApi<{ success: boolean }>(`/auth/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const deleteUser = (id: string) =>
  fetchApi<{ success: boolean }>(`/auth/users/${id}`, { method: 'DELETE' })

// Pages
export const getPages = () => fetchApi<{ pages: Page[] }>('/admin/pages')
export const getPage = (id: string) => fetchApi<{ page: Page }>(`/admin/pages/${id}`)
export const createPage = (data: Partial<Page>) =>
  fetchApi<{ page: Page }>('/admin/pages', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const updatePage = (id: string, data: Partial<Page>) =>
  fetchApi<{ page: Page }>(`/admin/pages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const deletePage = (id: string) =>
  fetchApi<{ success: boolean }>(`/admin/pages/${id}`, { method: 'DELETE' })

// Posts
export const getPosts = () => fetchApi<{ posts: Post[] }>('/admin/posts')
export const getPost = (id: string) => fetchApi<{ post: Post }>(`/admin/posts/${id}`)
export const createPost = (data: Partial<Post>) =>
  fetchApi<{ post: Post }>('/admin/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const updatePost = (id: string, data: Partial<Post>) =>
  fetchApi<{ post: Post }>(`/admin/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const deletePost = (id: string) =>
  fetchApi<{ success: boolean }>(`/admin/posts/${id}`, { method: 'DELETE' })

// Courses
export const getCourses = () => fetchApi<{ courses: Course[] }>('/admin/courses')
export const getCourse = (id: string) => fetchApi<{ course: Course }>(`/admin/courses/${id}`)
export const createCourse = (data: Partial<Course>) =>
  fetchApi<{ course: Course }>('/admin/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const updateCourse = (id: string, data: Partial<Course>) =>
  fetchApi<{ course: Course }>(`/admin/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const deleteCourse = (id: string) =>
  fetchApi<{ success: boolean }>(`/admin/courses/${id}`, { method: 'DELETE' })

// Bookings
export const getBookings = () => fetchApi<{ bookings: Booking[] }>('/admin/bookings')
export const getBooking = (id: string) => fetchApi<{ booking: Booking }>(`/admin/bookings/${id}`)
export const updateBooking = (id: string, data: Partial<Booking>) =>
  fetchApi<{ booking: Booking }>(`/admin/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const refundBooking = (id: string) =>
  fetchApi<{ success: boolean }>(`/admin/bookings/${id}/refund`, { method: 'POST' })

// Products
export const getProducts = () => fetchApi<{ products: Product[] }>('/admin/products')
export const getProduct = (id: string) => fetchApi<{ product: Product }>(`/admin/products/${id}`)
export const createProduct = (data: Partial<Product>) =>
  fetchApi<{ product: Product }>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const updateProduct = (id: string, data: Partial<Product>) =>
  fetchApi<{ product: Product }>(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const deleteProduct = (id: string) =>
  fetchApi<{ success: boolean }>(`/admin/products/${id}`, { method: 'DELETE' })

// Media
export const getMedia = () => fetchApi<{ media: Media[] }>('/admin/media')
export const uploadMedia = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/admin/media/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  return response.json() as Promise<{ media: Media }>
}
export const deleteMedia = (id: string) =>
  fetchApi<{ success: boolean }>(`/admin/media/${id}`, { method: 'DELETE' })

// Contacts
export const getContacts = () => fetchApi<{ contacts: Contact[] }>('/admin/contacts')
export const markContactRead = (id: string) =>
  fetchApi<{ success: boolean }>(`/admin/contacts/${id}/read`, { method: 'PUT' })
export const deleteContact = (id: string) =>
  fetchApi<{ success: boolean }>(`/admin/contacts/${id}`, { method: 'DELETE' })

// Settings
export const getSettings = () => fetchApi<{ settings: Record<string, string> }>('/admin/settings')
export const updateSettings = (settings: Record<string, string>) =>
  fetchApi<{ success: boolean }>('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  })

// Types
export interface User {
  id: string
  email: string
  name: string
  role: string
  avatar_url?: string
  created_at?: string
}

export interface Page {
  id: string
  slug: string
  title: string
  content: string
  meta_description: string
  parent_slug: string | null
  sort_order: number
  status: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string
  featured_image: string | null
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  slug: string
  title: string
  description: string
  content: string
  location: string
  start_date: string
  end_date: string
  price_sek: number
  max_participants: number
  current_participants: number
  registration_deadline: string
  status: string
  created_at: string
}

export interface Booking {
  id: string
  course_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_organization: string
  participants: number
  total_price_sek: number
  stripe_payment_intent: string | null
  stripe_session_id: string | null
  payment_status: string
  booking_status: string
  notes: string
  created_at: string
  course?: Course
}

export interface Product {
  id: string
  slug: string
  title: string
  description: string
  type: string
  price_sek: number | null
  external_url: string | null
  image_url: string | null
  in_stock: number
  status: string
  created_at: string
}

export interface Media {
  id: string
  filename: string
  r2_key: string
  url: string
  type: string
  size_bytes: number
  alt_text: string
  created_at: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  read: boolean
  created_at: string
}
