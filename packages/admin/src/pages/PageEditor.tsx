import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPage, createPage, updatePage, savePageDraft, deletePage } from '../lib/api'
import PageBuilder from '../components/PageBuilder'
import type { SaveStatus } from '../components/PageBuilder'
import { Skeleton } from '../components/ui/skeleton'

export default function PageEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = !id

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState('')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const lastSaveDataRef = useRef<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-page', id],
    queryFn: () => getPage(id!),
    enabled: !!id,
  })

  // Auto-save → writes to draft column only (public site unaffected)
  const autoSaveMutation = useMutation({
    mutationFn: (saveData: any) => {
      lastSaveDataRef.current = saveData
      return savePageDraft(id!, saveData)
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

  // Publish / Unpublish → writes to main columns + clears draft (goes live)
  const statusChangeMutation = useMutation({
    mutationFn: (saveData: any) => {
      lastSaveDataRef.current = saveData
      return updatePage(id!, saveData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] })
      queryClient.invalidateQueries({ queryKey: ['admin-page', id] })
      setSaveStatus('saved')
      setSaveError('')
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2500)
    },
    onError: (err: Error) => {
      setSaveError(err.message || 'Could not save the page')
      setSaveStatus('error')
    },
  })

  // Create new item → writes to main columns
  const createMutation = useMutation({
    mutationFn: (saveData: any) => createPage(saveData),
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] })
      if (result?.page?.id) {
        navigate(`/sidor/${result.page.id}`, { replace: true })
      }
      setSaveStatus('saved')
      setSaveError('')
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2500)
    },
    onError: (err: Error) => {
      setSaveError(err.message || 'Could not create the page')
      setSaveStatus('error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deletePage(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] })
      navigate('/sidor')
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

  // If server has a draft, use draft data for editing (draft = unpublished changes)
  const raw = data?.page as any
  const draftData = raw?.draft ? (() => { try { return JSON.parse(raw.draft) } catch { return null } })() : null

  const pageData = raw
    ? {
        id: raw.id,
        title: draftData?.title ?? raw.title,
        slug: draftData?.slug ?? raw.slug,
        meta_description: draftData?.meta_description ?? raw.meta_description ?? '',
        parent_slug: draftData?.parent_slug ?? raw.parent_slug ?? '',
        sort_order: draftData?.sort_order ?? raw.sort_order ?? 0,
        status: raw.status, // always use live status for badge/CTA
        content: raw.content || '',
        content_blocks: draftData?.content_blocks ?? raw.content_blocks ?? null,
      }
    : null

  const hasDraft = !!raw?.draft

  return (
    <PageBuilder
      page={isNew ? null : pageData}
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
