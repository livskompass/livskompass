import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPost, createPost, updatePost, deletePost } from '../lib/api'
import PostBuilder from '../components/PostBuilder'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'

export default function PostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = !id

  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-post', id],
    queryFn: () => getPost(id!),
    enabled: !!id,
  })

  const saveMutation = useMutation({
    mutationFn: (saveData: any) =>
      isNew ? createPost(saveData) : updatePost(id!, saveData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
      navigate('/nyheter')
    },
    onError: (err: Error) => {
      setError(err.message || 'Could not save the post')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
      navigate('/nyheter')
    },
    onError: (err: Error) => {
      setError(err.message || 'Could not delete the post')
    },
  })

  const handleSave = (saveData: {
    title: string
    slug: string
    excerpt: string
    featured_image: string
    status: string
    published_at: string
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

  const postData = data?.post
    ? {
        id: (data.post as any).id,
        title: data.post.title,
        slug: data.post.slug,
        excerpt: data.post.excerpt || '',
        featured_image: data.post.featured_image || null,
        status: data.post.status,
        published_at: data.post.published_at || null,
        content_blocks: (data.post as any).content_blocks || null,
      }
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/nyheter">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {isNew ? 'New post' : 'Edit post'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <PostBuilder
        post={isNew ? null : postData}
        onSave={handleSave}
        onDelete={!isNew ? () => deleteMutation.mutate() : undefined}
      />
    </div>
  )
}
