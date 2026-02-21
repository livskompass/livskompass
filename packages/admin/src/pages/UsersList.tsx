import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, createUser, updateUser, deleteUser, getMe, User } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table'
import { Skeleton } from '../components/ui/skeleton'
import { Plus, Trash2, Users as UsersIcon, X, ShieldAlert } from 'lucide-react'

export default function UsersList() {
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('editor')
  const [error, setError] = useState('')

  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getUsers,
  })

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setShowAddForm(false)
      setNewEmail('')
      setNewName('')
      setNewRole('editor')
      setError('')
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to add user')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { role?: string } }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    createMutation.mutate({
      email: newEmail,
      name: newName,
      role: newRole,
    })
  }

  const handleRoleChange = (user: User, newRole: string) => {
    if (window.confirm(`Change role for ${user.email} to ${newRole}?`)) {
      updateMutation.mutate({ id: user.id, data: { role: newRole } })
    }
  }

  const handleDelete = (user: User) => {
    if (window.confirm(`Remove user ${user.email}? They will no longer be able to sign in.`)) {
      deleteMutation.mutate(user.id)
    }
  }

  const currentUser = meData?.user

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Check if current user is admin
  if (currentUser?.role !== 'admin') {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-center gap-3 p-4">
          <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-stone-700">
            You don't have permission to manage users.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-h3 text-stone-900">Users</h1>
          <p className="text-stone-500 mt-1">Manage admin access and roles.</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add user
        </Button>
      </div>

      {/* Add user form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Add new user</CardTitle>
                <CardDescription>
                  Enter the user's email address. They can sign in with Google
                  next time they visit admin.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setShowAddForm(false); setError('') }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="First Last"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  id="role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Administrator</option>
                </Select>
                <p className="text-xs text-stone-500">
                  Administrators can manage other users.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Adding...' : 'Add'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowAddForm(false); setError('') }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users list */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50/50">
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt=""
                        className="w-9 h-9 rounded-full"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center">
                        <span className="text-stone-500 font-medium text-sm">
                          {user.name?.[0] || user.email[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-900 text-sm">
                          {user.name || 'Unknown'}
                        </span>
                        {user.id === currentUser?.id && (
                          <Badge variant="outline" className="text-[10px]">You</Badge>
                        )}
                      </div>
                      <div className="text-xs text-stone-500">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user, e.target.value)}
                    disabled={user.id === currentUser?.id}
                    className="w-32 h-8 text-xs"
                  >
                    <option value="editor">Editor</option>
                    <option value="admin">Administrator</option>
                  </Select>
                </TableCell>
                <TableCell className="text-stone-500 text-sm">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString('sv-SE')
                    : '--'}
                </TableCell>
                <TableCell className="text-right">
                  {user.id !== currentUser?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(!data?.users || data.users.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <UsersIcon className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-stone-500">No users found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
