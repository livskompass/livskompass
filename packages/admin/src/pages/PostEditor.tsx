import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPost, createPost, updatePost, savePostDraft, deletePost } from '../lib/api'
import PostBuilder from '../components/PostBuilder'
import type { SaveStatus } from '../components/PageBuilder'
import { Skeleton } from '../components/ui/skeleton'

export default function PostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = !id

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState('')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const lastSaveDataRef = useRef<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-post', id],
    queryFn: () => getPost(id!),
    enabled: !!id,
  })

  const autoSaveMutation = useMutation({
    mutationFn: (saveData: any) => {
      lastSaveDataRef.current = saveData
      return savePostDraft(id!, saveData)
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
      return updatePost(id!, saveData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-post', id] })
      setSaveStatus('saved')
      setSaveError('')
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2500)
    },
    onError: (err: Error) => {
      setSaveError(err.message || 'Could not save the post')
      setSaveStatus('error')
    },
  })

  const createMutation = useMutation({
    mutationFn: (saveData: any) => createPost(saveData),
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
      if (result?.post?.id) {
        navigate(`/nyheter/${result.post.id}`, { replace: true })
      }
      setSaveStatus('saved')
      setSaveError('')
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2500)
    },
    onError: (err: Error) => {
      setSaveError(err.message || 'Could not create the post')
      setSaveStatus('error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
      navigate('/nyheter')
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

  const raw = data?.post as any
  const draftData = raw?.draft ? (() => { try { return JSON.parse(raw.draft) } catch { return null } })() : null

  const postData = raw
    ? {
        id: raw.id,
        title: draftData?.title ?? raw.title,
        slug: draftData?.slug ?? raw.slug,
        excerpt: draftData?.excerpt ?? raw.excerpt ?? '',
        featured_image: draftData?.featured_image ?? raw.featured_image ?? null,
        status: raw.status,
        published_at: draftData?.published_at ?? raw.published_at ?? null,
        content: raw.content || '',
        content_blocks: draftData?.content_blocks ?? raw.content_blocks ?? null,
      }
    : null

  const hasDraft = !!raw?.draft

  return (
    <PostBuilder
      post={isNew ? null : postData}
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
