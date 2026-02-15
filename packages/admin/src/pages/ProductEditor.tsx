import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProduct, createProduct, updateProduct, deleteProduct } from '../lib/api'
import ProductBuilder from '../components/ProductBuilder'
import { Skeleton } from '../components/ui/skeleton'

export default function ProductEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = !id

  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  })

  const saveMutation = useMutation({
    mutationFn: (saveData: any) =>
      isNew ? createProduct(saveData) : updateProduct(id!, saveData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      navigate('/material')
    },
    onError: (err: Error) => {
      setError(err.message || 'Could not save the product')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      navigate('/material')
    },
    onError: (err: Error) => {
      setError(err.message || 'Could not delete the product')
    },
  })

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  const productData = data?.product
    ? {
        id: (data.product as any).id,
        title: data.product.title,
        slug: data.product.slug,
        description: data.product.description || '',
        type: data.product.type || 'book',
        price_sek: data.product.price_sek || 0,
        external_url: data.product.external_url || '',
        image_url: data.product.image_url || '',
        in_stock: data.product.in_stock ?? 1,
        status: (data.product as any).status || 'active',
        content_blocks: (data.product as any).content_blocks || null,
      }
    : null

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-2">
          {error}
        </div>
      )}

      <ProductBuilder
        product={isNew ? null : productData}
        onSave={(saveData) => {
          setError('')
          saveMutation.mutate(saveData)
        }}
        onDelete={!isNew ? () => deleteMutation.mutate() : undefined}
      />
    </div>
  )
}
