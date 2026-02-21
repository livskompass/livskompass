import { createContext, useContext } from 'react'

export interface CourseContextValue {
  id: number
  slug: string
  title: string
  description: string
  location: string
  start_date: string
  end_date: string
  price_sek: number
  max_participants: number
  current_participants: number
  registration_deadline: string | null
  status: 'active' | 'full' | 'completed' | 'cancelled'
  content: string
}

export interface PostContextValue {
  id: number
  slug: string
  title: string
  excerpt: string
  featured_image: string | null
  published_at: string
  content: string
}

export const CourseContext = createContext<CourseContextValue | null>(null)
export const PostContext = createContext<PostContextValue | null>(null)

export function useCourseData(): CourseContextValue | null {
  return useContext(CourseContext)
}

export function usePostData(): PostContextValue | null {
  return useContext(PostContext)
}
