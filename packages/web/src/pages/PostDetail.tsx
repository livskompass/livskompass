import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPost, rewriteMediaUrls } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { PostContext } from '../lib/context'
import { defaultPostTemplate } from '@livskompass/shared'
import NotFound from './NotFound'
import BlockRenderer from '../components/BlockRenderer'
import { Skeleton } from '../components/ui/skeleton'

function PostSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <Skeleton className="h-5 w-32 mb-6" />
      <Skeleton className="h-5 w-24 mb-3" />
      <Skeleton className="h-12 w-3/4 mb-8" />
      <Skeleton className="h-72 w-full rounded-xl mb-8" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  )
}

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPost(slug!),
    enabled: !!slug,
  })

  useDocumentTitle(data?.post?.title)

  if (isLoading) return <PostSkeleton />
  if (error || !data?.post) return <NotFound />

  const { post } = data
  const postAny = post as any

  // Determine which blocks to render
  let blocksJson: string
  if (postAny.content_blocks) {
    // Post has custom Puck blocks
    blocksJson = postAny.content_blocks
  } else {
    // Use default post template, replacing __LEGACY_CONTENT__ with actual HTML
    blocksJson = defaultPostTemplate.replace(
      '__LEGACY_CONTENT__',
      post.content ? rewriteMediaUrls(post.content).replace(/"/g, '\\"') : ''
    )
  }

  return (
    <PostContext.Provider value={postAny}>
      <BlockRenderer data={blocksJson} />
    </PostContext.Provider>
  )
}
