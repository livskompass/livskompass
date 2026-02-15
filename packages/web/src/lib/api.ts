const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }))
    throw new Error(error.error || 'An error occurred')
  }

  return response.json()
}

// Pages
export const getPages = () => fetchApi<{ pages: Page[] }>('/pages')
export const getPage = (slug: string) => fetchApi<{ page: Page }>(`/pages/${slug}`)

// Posts
export const getPosts = (limit = 10, offset = 0) =>
  fetchApi<{ posts: Post[]; total: number }>(`/posts?limit=${limit}&offset=${offset}`)
export const getPost = (slug: string) => fetchApi<{ post: Post }>(`/posts/${slug}`)

// Courses
export const getCourses = () => fetchApi<{ courses: Course[] }>('/courses')
export const getCourse = (slug: string) => fetchApi<{ course: Course }>(`/courses/${slug}`)

// Products
export const getProducts = (type?: string) =>
  fetchApi<{ products: Product[] }>(`/products${type ? `?type=${type}` : ''}`)

// Bookings
export const createBooking = (data: CreateBookingData) =>
  fetchApi<{ booking: Booking; message: string }>('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const startCheckout = (bookingId: string) =>
  fetchApi<{ checkoutUrl: string }>(`/bookings/${bookingId}/checkout`, {
    method: 'POST',
  })

export const getBookingStatus = (bookingId: string) =>
  fetchApi<{ booking: { id: string; payment_status: string; booking_status: string } }>(
    `/bookings/${bookingId}/status`
  )

// Contact
export const submitContact = (data: ContactFormData) =>
  fetchApi<{ success: boolean; message: string }>('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  })

// Types
export interface Page {
  id: string
  slug: string
  title: string
  content: string
  meta_description: string
  parent_slug: string | null
  sort_order: number
}

export interface Post {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string
  featured_image: string | null
  published_at: string
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
}

export interface Booking {
  id: string
  course_id: string
  customer_name: string
  customer_email: string
  participants: number
  total_price_sek: number
}

export interface CreateBookingData {
  courseId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerOrganization?: string
  participants: number
  notes?: string
}

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
}
