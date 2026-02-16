import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPages, deletePage } from '../lib/api'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table'
import { Skeleton } from '../components/ui/skeleton'
import { Plus, Pencil, Trash2, FileText } from 'lucide-react'

export default function PagesList() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: getPages,
  })

  const deleteMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] })
    },
  })

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pages</h1>
          <p className="text-gray-500 mt-1">Manage your web pages.</p>
        </div>
        <Button asChild>
          <Link to="/sidor/ny">
            <Plus className="h-4 w-4 mr-2" />
            New page
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
        ) : data?.pages && data.pages.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <Link
                      to={`/sidor/${page.id}`}
                      className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {page.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-500 font-mono text-xs">
                    /{page.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.status === 'published' ? 'success' : 'warning'}>
                      {page.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/sidor/${page.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(page.id, page.title)}
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
            <FileText className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-500 mb-2">No pages yet</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/sidor/ny">Create your first page</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
