import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCourses, deleteCourse } from '../lib/api'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table'
import { Skeleton } from '../components/ui/skeleton'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react'

export default function CoursesList() {
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: getCourses,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
    },
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'full': return 'default'
      case 'completed': return 'secondary'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'full': return 'Full'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 text-stone-900">Courses</h1>
          <p className="text-stone-500 mt-1">Manage courses and workshops.</p>
        </div>
        <Button asChild>
          <Link to="/utbildningar/ny">
            <Plus className="h-4 w-4 mr-2" />
            New course
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
        ) : data?.courses && data.courses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-100">
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.courses.map((course) => (
                <TableRow key={course.id} className="hover:bg-stone-50 transition-colors">
                  <TableCell>
                    <Link
                      to={`/utbildningar/${course.id}`}
                      className="font-medium text-stone-900 hover:text-stone-600 transition-colors"
                    >
                      {course.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-stone-500 text-sm">
                    {new Date(course.start_date).toLocaleDateString('sv-SE')}
                  </TableCell>
                  <TableCell className="text-stone-500 text-sm">
                    {course.location}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono text-stone-600">
                      {course.current_participants}/{course.max_participants}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(course.status) as "default" | "success" | "warning" | "destructive" | "secondary" | "outline"}>
                      {getStatusLabel(course.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/utbildningar/${course.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget({ id: course.id, title: course.title })}
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
            <GraduationCap className="h-10 w-10 text-stone-300 mb-3" />
            <p className="text-stone-500 mb-2">No courses yet</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/utbildningar/ny">Create your first course</Link>
            </Button>
          </CardContent>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete course"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
        }}
      />
    </div>
  )
}
