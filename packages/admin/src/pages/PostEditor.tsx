import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPost, createPost, updatePost, deletePost } from '../lib/api'
import PostBuilder from '../components/PostBuilder'
import { Skeleton } from '../components/ui/skeleton'

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

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Skeleton className="h-8 w-48" />
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
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-2">
          {error}
        </div>
      )}

      <PostBuilder
        post={isNew ? null : postData}
        onSave={(saveData) => {
          setError('')
          saveMutation.mutate(saveData)
        }}
        onDelete={!isNew ? () => deleteMutation.mutate() : undefined}
      />
    </div>
  )
}
