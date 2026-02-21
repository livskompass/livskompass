const API_BASE = import.meta.env.VITE_API_URL || '/api'

// Derive the media base URL from API_BASE by stripping the /api suffix.
// In production: "https://livskompass-api.livskompass-config.workers.dev"
// In dev: "" (empty string, so relative /media/... paths resolve to the dev proxy)
const MEDIA_BASE = API_BASE.replace(/\/api$/, '')

export function getMediaUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${MEDIA_BASE}${url}`
}

/**
 * Rewrites relative /media/ URLs inside HTML content to absolute URLs.
 * This handles img src, anchor href, and any other attributes that
 * reference /media/ paths in content authored via the CMS (TipTap)
 * or imported from WordPress.
 */
export function rewriteMediaUrls(html: string): string {
  if (!html || !MEDIA_BASE) return html
  // Match src="/media/...", href="/media/...", url(/media/...) patterns
  return html.replace(
    /(src|href|poster)=(["'])(\/media\/)/g,
    `$1=$2${MEDIA_BASE}/media/`
  ).replace(
    /url\(\s*(["']?)(\/media\/)/g,
    `url($1${MEDIA_BASE}/media/`
  )
}

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
export const getPage = (slug: string) => fetchApi<{ page: Page; children: Page[] }>(`/pages/${slug}`)

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

// Inline editing (requires admin session cookie)
export const patchPageBlocks = (pageId: string, contentBlocks: string, updatedAt?: string) =>
  fetch(`${API_BASE}/admin/pages/${pageId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content_blocks: contentBlocks, updated_at: updatedAt }),
  }).then(async (res) => {
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to save')
    return data as { success: boolean; page: Page }
  })

// Types
export interface Page {
  id: string
  slug: string
  title: string
  content: string
  content_blocks: string | null
  editor_version: 'legacy' | 'puck'
  meta_description: string
  parent_slug: string | null
  sort_order: number
}

export interface Post {
  id: string
  slug: string
  title: string
  content: string
  content_blocks: string | null
  editor_version: 'legacy' | 'puck'
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
