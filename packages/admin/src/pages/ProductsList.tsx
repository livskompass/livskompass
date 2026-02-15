import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, deleteProduct, getMediaUrl } from '../lib/api'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table'
import { Skeleton } from '../components/ui/skeleton'
import { Plus, Pencil, Trash2, ShoppingBag } from 'lucide-react'

export default function ProductsList() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: getProducts,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p className="text-gray-500 mt-1">Manage books, CDs, and other materials.</p>
        </div>
        <Button asChild>
          <Link to="/material/ny">
            <Plus className="h-4 w-4 mr-2" />
            New product
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
        ) : data?.products && data.products.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.image_url && (
                        <img
                          src={getMediaUrl(product.image_url)}
                          alt=""
                          className="h-9 w-9 rounded-md object-cover border border-gray-200"
                        />
                      )}
                      <Link
                        to={`/material/${product.id}`}
                        className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {product.title}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {product.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {product.price_sek
                      ? `${product.price_sek.toLocaleString('sv-SE')} kr`
                      : <span className="text-gray-400">Free</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'active' ? 'success' : 'secondary'}>
                      {product.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/material/${product.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id, product.title)}
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
            <ShoppingBag className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-500 mb-2">No products yet</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/material/ny">Add your first product</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
