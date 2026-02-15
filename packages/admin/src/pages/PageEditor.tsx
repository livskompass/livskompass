import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPage, createPage, updatePage, deletePage } from '../lib/api'
import PageBuilder from '../components/PageBuilder'
import { Skeleton } from '../components/ui/skeleton'

export default function PageEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = !id

  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-page', id],
    queryFn: () => getPage(id!),
    enabled: !!id,
  })

  const saveMutation = useMutation({
    mutationFn: (saveData: any) =>
      isNew ? createPage(saveData) : updatePage(id!, saveData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] })
      navigate('/sidor')
    },
    onError: (err: Error) => {
      setError(err.message || 'Could not save the page')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deletePage(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] })
      navigate('/sidor')
    },
    onError: (err: Error) => {
      setError(err.message || 'Could not delete the page')
    },
  })

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  const pageData = data?.page
    ? {
        id: (data.page as any).id,
        title: data.page.title,
        slug: data.page.slug,
        meta_description: data.page.meta_description || '',
        parent_slug: data.page.parent_slug || '',
        sort_order: data.page.sort_order || 0,
        status: data.page.status,
        content_blocks: (data.page as any).content_blocks || null,
      }
    : null

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-2">
          {error}
        </div>
      )}

      <PageBuilder
        page={isNew ? null : pageData}
        onSave={(saveData) => {
          setError('')
          saveMutation.mutate(saveData)
        }}
        onDelete={!isNew ? () => deleteMutation.mutate() : undefined}
      />
    </div>
  )
}
