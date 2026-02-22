import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCourse, createCourse, updateCourse, deleteCourse } from '../lib/api'
import CourseBuilder from '../components/CourseBuilder'
import { Skeleton } from '../components/ui/skeleton'

export default function CourseEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = !id

  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-course', id],
    queryFn: () => getCourse(id!),
    enabled: !!id,
  })

  const saveMutation = useMutation({
    mutationFn: (saveData: any) =>
      isNew ? createCourse(saveData) : updateCourse(id!, saveData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      navigate('/utbildningar')
    },
    onError: (err: Error) => {
      setError(err.message || 'Could not save the course')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteCourse(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      navigate('/utbildningar')
    },
    onError: (err: Error) => {
      setError(err.message || 'Could not delete the course')
    },
  })

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  const courseData = data?.course
    ? {
        id: (data.course as any).id,
        title: data.course.title,
        slug: data.course.slug,
        description: data.course.description || '',
        location: data.course.location || '',
        start_date: data.course.start_date?.split('T')[0] || '',
        end_date: data.course.end_date?.split('T')[0] || '',
        price_sek: data.course.price_sek || 0,
        max_participants: data.course.max_participants ?? 20,
        registration_deadline: data.course.registration_deadline?.split('T')[0] || '',
        status: data.course.status,
        content_blocks: (data.course as any).content_blocks || null,
      }
    : null

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-2">
          {error}
        </div>
      )}

      <CourseBuilder
        course={isNew ? null : courseData}
        onSave={(saveData) => {
          setError('')
          saveMutation.mutate(saveData)
        }}
        onDelete={!isNew ? () => deleteMutation.mutate() : undefined}
      />
    </div>
  )
}
