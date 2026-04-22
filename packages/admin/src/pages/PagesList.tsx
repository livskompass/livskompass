import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPages, deletePage, duplicatePage, getSettings, archiveItem } from '../lib/api'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table'
import { Skeleton } from '../components/ui/skeleton'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { Input } from '../components/ui/input'
import { Plus, Pencil, Trash2, Copy, FileText, Search, Archive } from 'lucide-react'

export default function PagesList() {
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: getPages,
  })

  const { data: settingsData } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: getSettings,
  })
  const _homepageSlug = (settingsData?.settings as any)?.homepage_slug || (Array.isArray(settingsData?.settings) ? (settingsData.settings as any[]).find((s: any) => s.key === 'homepage_slug')?.value : null) || 'home-2'

  const deleteMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] })
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: duplicatePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveItem('page', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] })
      queryClient.invalidateQueries({ queryKey: ['admin-archive'] })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 text-zinc-900">Pages</h1>
          <p className="text-zinc-500 mt-1">Manage your web pages.</p>
        </div>
        <Button asChild>
          <Link to="/pages/new">
            <Plus className="h-4 w-4 mr-2" />
            New page
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-sm"
        />
      </div>

      <Card>
        {isLoading ? (
          <CardContent className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        ) : data?.pages && data.pages.length > 0 ? (() => {
          const q = search.toLowerCase().trim()
          const filtered = [...data.pages]
            .filter(p => !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
            .sort((a, b) => {
              // Homepage always first
              if (a.slug === _homepageSlug) return -1
              if (b.slug === _homepageSlug) return 1
              // Then by last edited (most recent first)
              const aTime = a.updated_at || a.created_at || ''
              const bTime = b.updated_at || b.created_at || ''
              return bTime.localeCompare(aTime)
            })
          return filtered.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-100">
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Last edited</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((page) => (
                <TableRow key={page.id} className="hover:bg-zinc-50 transition-colors">
                  <TableCell>
                    <Link
                      to={`/pages/${page.slug}`}
                      className="font-medium text-zinc-900 hover:text-zinc-600 transition-colors"
                    >
                      {page.title}
                    </Link>
                    {page.slug === _homepageSlug && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Homepage
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-500 font-mono text-xs">
                    /{page.slug}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm whitespace-nowrap">
                    {page.updated_at
                      ? new Date(page.updated_at).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : <span className="text-zinc-400">--</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.status === 'published' ? 'success' : 'warning'}>
                      {page.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/pages/${page.slug}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicateMutation.mutate(page.id)}
                        disabled={duplicateMutation.isPending}
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {page.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => archiveMutation.mutate(page.id)}
                          disabled={archiveMutation.isPending}
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget({ id: page.id, title: page.title })}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          ) : (
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-10 w-10 text-zinc-300 mb-3" />
              <p className="text-zinc-500 mb-2">No pages matching "{search}"</p>
            </CardContent>
          )
        })() : (
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-10 w-10 text-zinc-300 mb-3" />
            <p className="text-zinc-500 mb-2">No pages yet</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/pages/new">Create your first page</Link>
            </Button>
          </CardContent>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete page"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
        }}
      />
    </div>
  )
}
