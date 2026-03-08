import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProduct, createProduct, updateProduct, saveProductDraft, deleteProduct } from '../lib/api'
import ProductBuilder from '../components/ProductBuilder'
import type { SaveStatus } from '../components/PageBuilder'
import { Skeleton } from '../components/ui/skeleton'

export default function ProductEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = !id

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState('')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const lastSaveDataRef = useRef<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  })

  const autoSaveMutation = useMutation({
    mutationFn: (saveData: any) => {
      lastSaveDataRef.current = saveData
      return saveProductDraft(id!, saveData)
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
      return updateProduct(id!, saveData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] })
      setSaveStatus('saved')
      setSaveError('')
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2500)
    },
    onError: (err: Error) => {
      setSaveError(err.message || 'Could not save the product')
      setSaveStatus('error')
    },
  })

  const createMutation = useMutation({
    mutationFn: (saveData: any) => createProduct(saveData),
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      if (result?.product?.id) {
        navigate(`/material/${result.product.id}`, { replace: true })
      }
      setSaveStatus('saved')
      setSaveError('')
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2500)
    },
    onError: (err: Error) => {
      setSaveError(err.message || 'Could not create the product')
      setSaveStatus('error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      navigate('/material')
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

  const raw = data?.product as any
  const draftData = raw?.draft ? (() => { try { return JSON.parse(raw.draft) } catch { return null } })() : null

  const productData = raw
    ? {
        id: raw.id,
        title: draftData?.title ?? raw.title,
        slug: draftData?.slug ?? raw.slug,
        description: draftData?.description ?? raw.description ?? '',
        type: draftData?.type ?? raw.type ?? 'book',
        price_sek: draftData?.price_sek ?? raw.price_sek ?? 0,
        external_url: draftData?.external_url ?? raw.external_url ?? '',
        image_url: draftData?.image_url ?? raw.image_url ?? '',
        in_stock: draftData?.in_stock ?? raw.in_stock ?? 1,
        status: raw.status,
        content_blocks: draftData?.content_blocks ?? raw.content_blocks ?? null,
      }
    : null

  const hasDraft = !!raw?.draft

  return (
    <ProductBuilder
      product={isNew ? null : productData}
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
