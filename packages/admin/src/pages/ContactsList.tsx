import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getContacts, markContactRead, deleteContact, Contact } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { Skeleton } from '../components/ui/skeleton'
import { Mail, Trash2, Reply, Clock } from 'lucide-react'
import { cn } from '../lib/utils'

export default function ContactsList() {
  const queryClient = useQueryClient()
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: getContacts,
  })

  const markReadMutation = useMutation({
    mutationFn: markContactRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] })
      setSelectedContact(null)
    },
  })

  const handleSelect = (contact: Contact) => {
    setSelectedContact(contact)
    if (!contact.read) {
      markReadMutation.mutate(contact.id)
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Messages</h1>
        <p className="text-gray-500 mt-1">Contact form submissions and inquiries.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2">
          <Card>
            {isLoading ? (
              <CardContent className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </CardContent>
            ) : data?.contacts && data.contacts.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {data.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleSelect(contact)}
                    className={cn(
                      "p-4 cursor-pointer transition-colors",
                      selectedContact?.id === contact.id
                        ? 'bg-primary-50/50'
                        : !contact.read
                        ? 'bg-blue-50/30 hover:bg-blue-50/50'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!contact.read && (
                            <span className="w-2 h-2 bg-primary-600 rounded-full shrink-0" />
                          )}
                          <p className={cn(
                            "text-sm truncate",
                            !contact.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                          )}>
                            {contact.name}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {contact.email}
                        </p>
                        {contact.subject && (
                          <p className="text-sm text-gray-700 mt-1 truncate">
                            {contact.subject}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {contact.message}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <time className="text-xs text-gray-400">
                          {new Date(contact.created_at).toLocaleDateString('sv-SE')}
                        </time>
                        {!contact.read && (
                          <Badge variant="default" className="text-[10px] px-1.5">New</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Mail className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-gray-500">No messages yet.</p>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Detail */}
        <div>
          {selectedContact ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{selectedContact.name}</CardTitle>
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      {selectedContact.email}
                    </a>
                    {selectedContact.phone && (
                      <p className="text-sm text-gray-500 mt-0.5">{selectedContact.phone}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {new Date(selectedContact.created_at).toLocaleString('sv-SE')}
                </div>

                {selectedContact.subject && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Subject</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedContact.subject}
                    </p>
                  </div>
                )}

                <Separator />

                <div>
                  <p className="text-xs text-gray-500 mb-2">Message</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedContact.message}
                  </p>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <a href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject || 'Your message'}`}>
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(selectedContact.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Mail className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">Select a message to read it</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
