import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPage, createPage, updatePage, deletePage } from '../lib/api'
import PageBuilder from '../components/PageBuilder'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'

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

  const handlePuckSave = (saveData: {
    title: string
    slug: string
    meta_description: string
    parent_slug: string
    sort_order: number
    status: string
    content_blocks: string
    editor_version: string
  }) => {
    setError('')
    saveMutation.mutate(saveData)
  }

  if (!isNew && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
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
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/sidor">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {isNew ? 'New page' : 'Edit page'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <PageBuilder
        page={isNew ? null : pageData}
        onSave={handlePuckSave}
        onDelete={!isNew ? () => deleteMutation.mutate() : undefined}
      />
    </div>
  )
}
