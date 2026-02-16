import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Puck, type Data } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import { puckConfig, emptyPuckData, injectPreviewCSS } from '@livskompass/shared'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog'
import { Settings, Trash2 } from 'lucide-react'

interface CourseBuilderProps {
  course: {
    id?: string
    title: string
    slug: string
    description: string
    location: string
    start_date: string
    end_date: string
    price_sek: number
    max_participants: number
    registration_deadline: string
    status: string
    content_blocks?: string | null
  } | null
  onSave: (data: {
    title: string
    slug: string
    description: string
    location: string
    start_date: string
    end_date: string
    price_sek: number
    max_participants: number
    registration_deadline: string
    status: string
    content_blocks: string
    editor_version: string
  }) => void
  onDelete?: () => void
}

export default function CourseBuilder({ course, onSave, onDelete }: CourseBuilderProps) {
  const [title, setTitle] = useState(course?.title || '')
  const [slug, setSlug] = useState(course?.slug || '')
  const [description, setDescription] = useState(course?.description || '')
  const [location, setLocation] = useState(course?.location || '')
  const [startDate, setStartDate] = useState(course?.start_date || '')
  const [endDate, setEndDate] = useState(course?.end_date || '')
  const [priceSek, setPriceSek] = useState(course?.price_sek ?? 0)
  const [maxParticipants, setMaxParticipants] = useState(course?.max_participants ?? 0)
  const [registrationDeadline, setRegistrationDeadline] = useState(course?.registration_deadline || '')
  const [status, setStatus] = useState(course?.status || 'active')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, right: 0 })

  useEffect(() => {
    if (course) {
      setTitle(course.title)
      setSlug(course.slug)
      setDescription(course.description || '')
      setLocation(course.location || '')
      setStartDate(course.start_date || '')
      setEndDate(course.end_date || '')
      setPriceSek(course.price_sek ?? 0)
      setMaxParticipants(course.max_participants ?? 0)
      setRegistrationDeadline(course.registration_deadline || '')
      setStatus(course.status)
    }
  }, [course])

  useEffect(() => {
    if (!settingsOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [settingsOpen])

  const generateSlug = (t: string) =>
    t
      .replace(/[åÅ]/g, (c) => (c === 'å' ? 'a' : 'A'))
      .replace(/[äÄ]/g, (c) => (c === 'ä' ? 'a' : 'A'))
      .replace(/[öÖ]/g, (c) => (c === 'ö' ? 'o' : 'O'))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const initialData = useMemo<Data>(() => {
    if (course?.content_blocks) {
      try {
        return JSON.parse(course.content_blocks) as Data
      } catch {
        return emptyPuckData
      }
    }
    return emptyPuckData
  }, [course?.content_blocks])

  const handlePublish = useCallback(
    (data: Data) => {
      onSave({
        title,
        slug,
        description,
        location,
        start_date: startDate,
        end_date: endDate,
        price_sek: priceSek,
        max_participants: maxParticipants,
        registration_deadline: registrationDeadline,
        status,
        content_blocks: JSON.stringify(data),
        editor_version: 'puck',
      })
    },
    [title, slug, description, location, startDate, endDate, priceSek, maxParticipants, registrationDeadline, status, onSave],
  )

  const statusBadge = () => {
    switch (status) {
      case 'active':
        return { className: 'bg-green-100 text-green-700', label: 'Active' }
      case 'full':
        return { className: 'bg-blue-100 text-blue-700', label: 'Full' }
      case 'completed':
        return { className: 'bg-gray-100 text-gray-700', label: 'Completed' }
      case 'cancelled':
        return { className: 'bg-red-100 text-red-700', label: 'Cancelled' }
      default:
        return { className: 'bg-yellow-100 text-yellow-700', label: 'Draft' }
    }
  }

  const badge = statusBadge()

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Puck
        config={puckConfig}
        data={initialData}
        onPublish={handlePublish}
        headerTitle={title || 'New course'}
        viewports={[
          { width: 360, label: 'Mobile', icon: 'Smartphone' as any },
          { width: 768, label: 'Tablet' },
          { width: 1280, label: 'Desktop', icon: 'Monitor' as any },
        ]}
        overrides={{
          iframe: ({ children, document: iframeDoc }) => {
            useEffect(() => {
              if (!iframeDoc) return
              injectPreviewCSS(iframeDoc)
            }, [iframeDoc])
            return <>{children}</>
          },
          headerActions: ({ children }) => (
            <div className="flex items-center gap-2">
              {/* Status badge */}
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}
              >
                {badge.label}
              </span>

              {/* Settings dropdown */}
              <div ref={settingsRef} className="relative z-[999]">
                <button
                  ref={buttonRef}
                  onClick={() => {
                    if (!settingsOpen && buttonRef.current) {
                      const rect = buttonRef.current.getBoundingClientRect()
                      setDropdownStyle({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
                    }
                    setSettingsOpen(!settingsOpen)
                  }}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  title="Course settings"
                >
                  <Settings className="h-4 w-4" />
                </button>

                {settingsOpen && (
                  <div className="fixed w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] max-h-[80vh] overflow-y-auto" style={{ top: dropdownStyle.top, right: dropdownStyle.right }}>
                    <div className="p-4 space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900">Course settings</h3>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Title</Label>
                          <Input
                            value={title}
                            onChange={(e) => {
                              setTitle(e.target.value)
                              if (!course?.id) setSlug(generateSlug(e.target.value))
                            }}
                            className="h-8 text-sm"
                            placeholder="Course title"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Slug</Label>
                          <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="h-8 text-sm"
                            placeholder="url-slug"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Status</Label>
                          <Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-8 text-sm"
                          >
                            <option value="active">Active</option>
                            <option value="full">Full</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Location</Label>
                          <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="h-8 text-sm"
                            placeholder="Stockholm, Online, etc."
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Start date</Label>
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">End date</Label>
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Registration deadline</Label>
                          <Input
                            type="date"
                            value={registrationDeadline}
                            onChange={(e) => setRegistrationDeadline(e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Price (SEK)</Label>
                          <Input
                            type="number"
                            value={priceSek}
                            onChange={(e) => setPriceSek(Number(e.target.value))}
                            className="h-8 text-sm"
                            placeholder="0"
                            min={0}
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Max participants</Label>
                          <Input
                            type="number"
                            value={maxParticipants}
                            onChange={(e) => setMaxParticipants(Number(e.target.value))}
                            className="h-8 text-sm"
                            placeholder="0"
                            min={0}
                          />
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 mb-1 block">Description</Label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                            rows={2}
                            placeholder="Short description for listings..."
                          />
                        </div>
                      </div>

                      {onDelete && (
                        <div className="border-t border-gray-100 pt-3">
                          <button
                            onClick={() => {
                              setSettingsOpen(false)
                              setDeleteOpen(true)
                            }}
                            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete course
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Puck's built-in Publish/Save button */}
              {children}
            </div>
          ),
        }}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteOpen(false)
                onDelete?.()
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
