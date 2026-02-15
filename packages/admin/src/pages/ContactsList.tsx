import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getContacts, markContactRead, deleteContact, Contact } from '../lib/api'

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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : data?.contacts && data.contacts.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {data.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleSelect(contact)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedContact?.id === contact.id ? 'bg-primary-50' : ''
                    } ${!contact.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          {!contact.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                          )}
                          <p className="font-medium text-gray-900 truncate">
                            {contact.name}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {contact.email}
                        </p>
                        {contact.subject && (
                          <p className="text-sm text-gray-700 mt-1 truncate">
                            {contact.subject}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {contact.message}
                        </p>
                      </div>
                      <time className="text-xs text-gray-400 whitespace-nowrap ml-4">
                        {new Date(contact.created_at).toLocaleDateString('sv-SE')}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No messages yet.
              </div>
            )}
          </div>
        </div>

        {/* Detail */}
        <div>
          {selectedContact ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedContact.name}
                  </h3>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {selectedContact.email}
                  </a>
                  {selectedContact.phone && (
                    <p className="text-sm text-gray-500">{selectedContact.phone}</p>
                  )}
                </div>
                <time className="text-xs text-gray-400">
                  {new Date(selectedContact.created_at).toLocaleString('sv-SE')}
                </time>
              </div>

              {selectedContact.subject && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="font-medium text-gray-900">
                    {selectedContact.subject}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Message</p>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject || 'Your message'}`}
                  className="flex-1 text-center bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Reply
                </a>
                <button
                  onClick={() => handleDelete(selectedContact.id)}
                  className="px-4 bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
              Select a message to read it
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
