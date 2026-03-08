import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCourse, createCourse, updateCourse, saveCourseDraft, deleteCourse } from '../lib/api'
import CourseBuilder from '../components/CourseBuilder'
import type { SaveStatus } from '../components/PageBuilder'
import { Skeleton } from '../components/ui/skeleton'

export default function CourseEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = !id

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState('')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const lastSaveDataRef = useRef<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-course', id],
    queryFn: () => getCourse(id!),
    enabled: !!id,
  })

  const autoSaveMutation = useMutation({
    mutationFn: (saveData: any) => {
      lastSaveDataRef.current = saveData
      return saveCourseDraft(id!, saveData)
    },
    onSuccess: () => {
      setSaveStatus('saved')
      setSaveError('')
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2500)
    },
    onError: (err: Error) => {
      setSaveError(err.message || 'Could not save draft')
      setSaveStatus('error')
    },
  })

  const statusChangeMutation = useMutation({
    mutationFn: (saveData: any) => {
      lastSaveDataRef.current = saveData
      return updateCourse(id!, saveData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      queryClient.invalidateQueries({ queryKey: ['admin-course', id] })
      setSaveStatus('saved')
      setSaveError('')
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2500)
    },
    onError: (err: Error) => {
      setSaveError(err.message || 'Could not save the course')
      setSaveStatus('error')
    },
  })

  const createMutation = useMutation({
    mutationFn: (saveData: any) => createCourse(saveData),
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      if (result?.course?.id) {
        navigate(`/utbildningar/${result.course.id}`, { replace: true })
      }
      setSaveStatus('saved')
      setSaveError('')
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2500)
    },
    onError: (err: Error) => {
      setSaveError(err.message || 'Could not create the course')
      setSaveStatus('error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteCourse(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      navigate('/utbildningar')
    },
  })

  const handleAutoSave = useCallback((saveData: any) => {
    setSaveError('')
    setSaveStatus('saving')
    autoSaveMutation.mutate(saveData)
  }, [autoSaveMutation])

  const handleStatusChange = useCallback((saveData: any) => {
    setSaveError('')
    setSaveStatus('saving')
    statusChangeMutation.mutate(saveData)
  }, [statusChangeMutation])

  const handleCreate = useCallback((saveData: any) => {
    setSaveError('')
    setSaveStatus('saving')
    createMutation.mutate(saveData)
  }, [createMutation])

  const handleRetry = () => {
    if (lastSaveDataRef.current) {
      setSaveError('')
      setSaveStatus('saving')
      autoSaveMutation.mutate(lastSaveDataRef.current)
    }
  }

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  const raw = data?.course as any
  const draftData = raw?.draft ? (() => { try { return JSON.parse(raw.draft) } catch { return null } })() : null

  const courseData = raw
    ? {
        id: raw.id,
        title: draftData?.title ?? raw.title,
        slug: draftData?.slug ?? raw.slug,
        description: draftData?.description ?? raw.description ?? '',
        location: draftData?.location ?? raw.location ?? '',
        start_date: draftData?.start_date ?? (raw.start_date?.split('T')[0] || ''),
        end_date: draftData?.end_date ?? (raw.end_date?.split('T')[0] || ''),
        price_sek: draftData?.price_sek ?? raw.price_sek ?? 0,
        max_participants: draftData?.max_participants ?? raw.max_participants ?? 20,
        registration_deadline: draftData?.registration_deadline ?? (raw.registration_deadline?.split('T')[0] || ''),
        status: raw.status,
        content_blocks: draftData?.content_blocks ?? raw.content_blocks ?? null,
      }
    : null

  const hasDraft = !!raw?.draft

  return (
    <CourseBuilder
      course={isNew ? null : courseData}
      isNew={isNew}
      hasDraft={hasDraft}
      onAutoSave={handleAutoSave}
      onStatusChange={handleStatusChange}
      onCreate={handleCreate}
      onDelete={!isNew ? () => deleteMutation.mutate() : undefined}
      saveStatus={saveStatus}
      saveError={saveError}
      onRetry={handleRetry}
    />
  )
}
