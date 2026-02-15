import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPost, createPost, updatePost, getMediaUrl } from '../lib/api'
import Editor from '../components/Editor'

export default function PostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = !id

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    status: 'draft',
    published_at: '',
  })
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-post', id],
    queryFn: () => getPost(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (data?.post) {
      setFormData({
        title: data.post.title,
        slug: data.post.slug,
        content: data.post.content || '',
        excerpt: data.post.excerpt || '',
        featured_image: data.post.featured_image || '',
        status: data.post.status,
        published_at: data.post.published_at || '',
      })
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      isNew ? createPost(data) : updatePost(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
      navigate('/nyheter')
    },
    onError: (err: Error) => {
      setError(err.message || 'Could not save the post')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const submitData = {
      ...formData,
      published_at: formData.status === 'published' && !formData.published_at
        ? new Date().toISOString()
        : formData.published_at,
    }

    saveMutation.mutate(submitData)
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/nyheter" className="text-gray-500 hover:text-gray-700 mr-4">
            &larr; Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'New post' : 'Edit post'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
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
                    Excerpt
                  </label>
                  <textarea
                    rows={3}
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Short summary shown in listings..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <Editor
                    content={formData.content}
                    onChange={(html) => setFormData({ ...formData, content: html })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium text-gray-900 mb-4">Publishing</h3>
              <div className="space-y-4">
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
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
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

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium text-gray-900 mb-4">Image</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured image (URL)
                </label>
                <input
                  type="url"
                  value={formData.featured_image}
                  onChange={(e) =>
                    setFormData({ ...formData, featured_image: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://..."
                />
                {formData.featured_image && (
                  <img
                    src={getMediaUrl(formData.featured_image)}
                    alt="Preview"
                    className="mt-2 rounded-lg max-h-40 object-cover"
                  />
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium text-gray-900 mb-4">SEO</h3>
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
                <p className="text-xs text-gray-500 mt-1">
                  livskompass.se/nyhet/{formData.slug || 'slug'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
