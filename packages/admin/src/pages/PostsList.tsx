import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPosts, deletePost } from '../lib/api'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table'
import { Skeleton } from '../components/ui/skeleton'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { Plus, Pencil, Trash2, Newspaper } from 'lucide-react'

export default function PostsList() {
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: getPosts,
  })

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 text-stone-900">Posts</h1>
          <p className="text-stone-500 mt-1">Manage your blog posts.</p>
        </div>
        <Button asChild>
          <Link to="/nyheter/ny">
            <Plus className="h-4 w-4 mr-2" />
            New post
          </Link>
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <CardContent className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        ) : data?.posts && data.posts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50">
                <TableHead>Title</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Link
                      to={`/nyheter/${post.id}`}
                      className="font-medium text-stone-900 hover:text-forest-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-stone-500 text-sm">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('sv-SE')
                      : <span className="text-stone-400">--</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.status === 'published' ? 'success' : 'warning'}>
                      {post.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/nyheter/${post.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget({ id: post.id, title: post.title })}
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
            <Newspaper className="h-10 w-10 text-stone-300 mb-3" />
            <p className="text-stone-500 mb-2">No posts yet</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/nyheter/ny">Create your first post</Link>
            </Button>
          </CardContent>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete post"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
        }}
      />
    </div>
  )
}
