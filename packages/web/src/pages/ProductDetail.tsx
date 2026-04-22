import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProduct, rewriteMediaUrls } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ProductContext, defaultProductTemplate } from '@livskompass/shared'
import NotFound from './NotFound'
import BlockRenderer from '../components/BlockRenderer'
import { setPageEditData } from '../components/InlineEditProvider'
import { Skeleton } from '../components/ui/skeleton'

function ProductSkeleton() {
  return (
    <div className="mx-auto px-4 py-16" style={{ maxWidth: 'var(--width-content, 1280px)' }}>
      <Skeleton className="h-5 w-32 mb-6" />
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

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProduct(slug!),
    enabled: !!slug,
  })

  useDocumentTitle(data?.product?.title)

  useEffect(() => {
    const productAny = data?.product as any
    if (productAny?.id && productAny?.content_blocks) {
      setPageEditData({
        pageId: String(productAny.id),
        contentType: 'product',
        contentBlocks: productAny.content_blocks,
        updatedAt: productAny.updated_at || '',
      })
    }
    return () => setPageEditData(null)
  }, [data?.product])

  if (isLoading) return <ProductSkeleton />
  if (error || !data?.product) return <NotFound />

  const { product } = data
  const productAny = product as any

  let blocksJson: string
  if (productAny.content_blocks) {
    blocksJson = productAny.content_blocks
  } else {
    const safeContent = product.description
      ? JSON.stringify(rewriteMediaUrls(product.description)).slice(1, -1)
      : ''
    const safeTitle = JSON.stringify(product.title).slice(1, -1)
    blocksJson = defaultProductTemplate
      .replace('__LEGACY_CONTENT__', safeContent)
      .replace('__PRODUCT_TITLE__', safeTitle)
  }

  return (
    <ProductContext.Provider value={productAny}>
      <BlockRenderer data={blocksJson} />
    </ProductContext.Provider>
  )
}
