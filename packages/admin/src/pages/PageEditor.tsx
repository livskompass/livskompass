import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPage, createPage, updatePage } from '../lib/api'
import Editor from '../components/Editor'
import PageBuilder from '../components/PageBuilder'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import { ArrowLeft, Save, Loader2, Blocks } from 'lucide-react'

export default function PageEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = !id

  // Determine which editor to use
  const [editorMode, setEditorMode] = useState<'legacy' | 'puck' | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    meta_description: '',
    parent_slug: '',
    sort_order: 0,
    status: 'draft',
  })
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-page', id],
    queryFn: () => getPage(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (data?.page) {
      setFormData({
        title: data.page.title,
        slug: data.page.slug,
        content: data.page.content || '',
        meta_description: data.page.meta_description || '',
        parent_slug: data.page.parent_slug || '',
        sort_order: data.page.sort_order || 0,
        status: data.page.status,
      })
      // Detect editor version from existing data
      const page = data.page as any
      if (page.editor_version === 'puck') {
        setEditorMode('puck')
      } else {
        setEditorMode('legacy')
      }
    }
  }, [data])

  // New pages default to Puck
  useEffect(() => {
    if (isNew && editorMode === null) {
      setEditorMode('puck')
    }
  }, [isNew, editorMode])

  const saveMutation = useMutation({
    mutationFn: (saveData: any) =>
      isNew ? createPage(saveData) : updatePage(id!, saveData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] })
      navigate('/sidor')
    },
    onError: (err: Error) => {
      setError(err.message || 'Kunde inte spara sidan')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    saveMutation.mutate({
      ...formData,
      editor_version: 'legacy',
    })
  }

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
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    )
  }

  // ── Puck editor mode ───────────────────────────────────────────────
  if (editorMode === 'puck') {
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
              Tillbaka
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isNew ? 'Ny sida' : 'Redigera sida'}
          </h1>
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
            Blockbyggare
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <PageBuilder
          page={isNew ? null : pageData}
          onSave={handlePuckSave}
        />
      </div>
    )
  }

  // ── Legacy TipTap editor mode ──────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/sidor">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {isNew ? 'Ny sida' : 'Redigera sida'}
        </h1>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
          Klassisk redigerare
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Upgrade banner */}
      {!isNew && editorMode === 'legacy' && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Blocks className="h-5 w-5 text-primary-600" />
            <span className="text-sm text-primary-800">
              Uppgradera till blockbyggaren for att dra och slappa innehall
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditorMode('puck')}
            className="border-primary-300 text-primary-700 hover:bg-primary-100"
          >
            Uppgradera till blockbyggaren
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel *</Label>
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
                    placeholder="Sidtitel"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Innehall</Label>
                  <Editor
                    content={formData.content}
                    onChange={(html) => setFormData({ ...formData, content: html })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Publicering</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="draft">Utkast</option>
                    <option value="published">Publicerad</option>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="w-full"
                >
                  {saveMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sparar...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /> Spara</>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">URL-slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-400">
                    livskompass.se/{formData.slug || 'slug'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta">Metabeskrivning</Label>
                  <Textarea
                    id="meta"
                    rows={3}
                    value={formData.meta_description}
                    onChange={(e) =>
                      setFormData({ ...formData, meta_description: e.target.value })
                    }
                    placeholder="Kort beskrivning for sokresultat..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Hierarki</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="parent">Foraldrasida (slug)</Label>
                  <Input
                    id="parent"
                    value={formData.parent_slug}
                    onChange={(e) =>
                      setFormData({ ...formData, parent_slug: e.target.value })
                    }
                    placeholder="t.ex. mindfulness"
                  />
                  <p className="text-xs text-gray-400">
                    Lamna tomt for toppniva
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort">Sorteringsordning</Label>
                  <Input
                    id="sort"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                    }
                  />
                  <p className="text-xs text-gray-400">
                    Lagre nummer visas forst
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
