import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProduct, createProduct, updateProduct, getMediaUrl } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

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
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><Skeleton className="h-96" /></div>
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/material">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {isNew ? 'New product' : 'Edit product'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: isNew ? generateSlug(e.target.value) : formData.slug,
                      })
                    }}
                    placeholder="Product title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ext-url">External link (for purchase or download)</Label>
                  <Input
                    id="ext-url"
                    type="url"
                    value={formData.external_url}
                    onChange={(e) =>
                      setFormData({ ...formData, external_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="img-url">Image URL</Label>
                  <Input
                    id="img-url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                  {formData.image_url && (
                    <img
                      src={getMediaUrl(formData.image_url)}
                      alt="Preview"
                      className="mt-2 rounded-lg max-h-40 object-cover border border-gray-200"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="book">Book</option>
                    <option value="cd">CD</option>
                    <option value="cards">Cards</option>
                    <option value="app">App</option>
                    <option value="download">Download</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (SEK)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price_sek}
                    onChange={(e) =>
                      setFormData({ ...formData, price_sek: parseInt(e.target.value) || 0 })
                    }
                  />
                  <p className="text-xs text-gray-400">Set to 0 for free</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">In stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.in_stock}
                    onChange={(e) =>
                      setFormData({ ...formData, in_stock: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prod-status">Status</Label>
                  <Select
                    id="prod-status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="w-full"
                >
                  {saveMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /> Save</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
