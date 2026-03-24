import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getArchive, unarchiveItem, deletePage, deletePost, deleteCourse, deleteProduct } from '../lib/api'
import type { ArchivedItem } from '../lib/api'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table'
import { Skeleton } from '../components/ui/skeleton'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { Input } from '../components/ui/input'
import { Archive, ArchiveRestore, Trash2, Search, FileText, Newspaper, GraduationCap, ShoppingBag } from 'lucide-react'
import { cn } from '../lib/utils'

const typeConfig: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  page: { label: 'Page', icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  post: { label: 'Post', icon: Newspaper, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  course: { label: 'Course', icon: GraduationCap, color: 'text-green-600 bg-green-50 border-green-200' },
  product: { label: 'Product', icon: ShoppingBag, color: 'text-amber-600 bg-amber-50 border-amber-200' },
}

const deleteFns: Record<string, (id: string) => Promise<any>> = {
  page: deletePage,
  post: deletePost,
  course: deleteCourse,
  product: deleteProduct,
}

export default function ArchivePage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ArchivedItem | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-archive'],
    queryFn: getArchive,
  })

  const unarchiveMutation = useMutation({
    mutationFn: ({ contentType, id }: { contentType: string; id: string }) =>
      unarchiveItem(contentType, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-archive'] })
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] })
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: ({ contentType, id }: { contentType: string; id: string }) =>
      deleteFns[contentType](id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-archive'] })
    },
  })

  const items = data?.items || []
  const q = search.toLowerCase().trim()
  const filtered = items
    .filter(item => !filterType || item.content_type === filterType)
    .filter(item => !q || item.title.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q))
    .sort((a, b) => {
      const aTime = a.updated_at || a.created_at || ''
      const bTime = b.updated_at || b.created_at || ''
      return bTime.localeCompare(aTime)
    })

  const typeCounts = items.reduce((acc, item) => {
    acc[item.content_type] = (acc[item.content_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h3 text-zinc-900">Archive</h1>
        <p className="text-zinc-500 mt-1">Archived pages, posts, courses, and products.</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search archive..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant={filterType === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(null)}
          >
            All ({items.length})
          </Button>
          {Object.entries(typeConfig).map(([type, config]) => {
            const count = typeCounts[type] || 0
            if (count === 0) return null
            return (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(filterType === type ? null : type)}
              >
                <config.icon className="h-3.5 w-3.5 mr-1.5" />
                {config.label}s ({count})
              </Button>
            )
          })}
        </div>
      </div>

      <Card>
        {isLoading ? (
          <CardContent className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        ) : filtered.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-100">
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Archived</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const config = typeConfig[item.content_type]
                return (
                  <TableRow key={`${item.content_type}-${item.id}`} className="hover:bg-zinc-50 transition-colors">
                    <TableCell>
                      <Link
                        to={`/${item.content_type}s/${item.id}`}
                        className="font-medium text-zinc-900 hover:text-zinc-600 transition-colors"
                      >
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border',
                        config?.color
                      )}>
                        {config && <config.icon className="h-3 w-3" />}
                        {config?.label || item.content_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-500 font-mono text-xs">
                      /{item.slug}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm whitespace-nowrap">
                      {(item.updated_at || item.created_at)
                        ? new Date(item.updated_at || item.created_at).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '--'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => unarchiveMutation.mutate({ contentType: item.content_type, id: item.id })}
                          disabled={unarchiveMutation.isPending}
                          title="Restore from archive"
                        >
                          <ArchiveRestore className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(item)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : items.length > 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-10 w-10 text-zinc-300 mb-3" />
            <p className="text-zinc-500 mb-2">No archived items matching "{search}"</p>
          </CardContent>
        ) : (
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Archive className="h-10 w-10 text-zinc-300 mb-3" />
            <p className="text-zinc-500 mb-2">Archive is empty</p>
            <p className="text-zinc-400 text-sm">Draft pages, inactive products, and cancelled courses can be archived from their list views.</p>
          </CardContent>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete permanently"
        description={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete forever"
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate({ contentType: deleteTarget.content_type, id: deleteTarget.id })
        }}
      />
    </div>
  )
}
