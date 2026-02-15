import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProduct, createProduct, updateProduct, getMediaUrl } from '../lib/api'

export default function ProductEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = !id

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    type: 'book',
    price_sek: 0,
    external_url: '',
    image_url: '',
    in_stock: 1,
    status: 'active',
  })
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (data?.product) {
      setFormData({
        title: data.product.title,
        slug: data.product.slug,
        description: data.product.description || '',
        type: data.product.type,
        price_sek: data.product.price_sek || 0,
        external_url: data.product.external_url || '',
        image_url: data.product.image_url || '',
        in_stock: data.product.in_stock,
        status: data.product.status,
      })
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      isNew ? createProduct(data) : updateProduct(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      navigate('/material')
    },
    onError: (err: Error) => {
      setError(err.message || 'Could not save the product')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    saveMutation.mutate(formData)
  }

  const generateSlug = (title: string) => {
    return title
      .replace(/[åÅ]/g, (c) => c === 'å' ? 'a' : 'A')
      .replace(/[äÄ]/g, (c) => c === 'ä' ? 'a' : 'A')
      .replace(/[öÖ]/g, (c) => c === 'ö' ? 'o' : 'O')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/material" className="text-gray-500 hover:text-gray-700 mr-4">
          &larr; Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'New product' : 'Edit product'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: isNew ? generateSlug(e.target.value) : formData.slug,
                    })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL-slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External link (for purchase or download)
                </label>
                <input
                  type="url"
                  value={formData.external_url}
                  onChange={(e) =>
                    setFormData({ ...formData, external_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://..."
                />
                {formData.image_url && (
                  <img
                    src={getMediaUrl(formData.image_url)}
                    alt="Preview"
                    className="mt-2 rounded-lg max-h-40 object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium text-gray-900 mb-4">Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="book">Book</option>
                    <option value="cd">CD</option>
                    <option value="cards">Cards</option>
                    <option value="app">App</option>
                    <option value="download">Download</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (SEK)
                  </label>
                  <input
                    type="number"
                    value={formData.price_sek}
                    onChange={(e) =>
                      setFormData({ ...formData, price_sek: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Set to 0 for free</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    In stock
                  </label>
                  <input
                    type="number"
                    value={formData.in_stock}
                    onChange={(e) =>
                      setFormData({ ...formData, in_stock: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
