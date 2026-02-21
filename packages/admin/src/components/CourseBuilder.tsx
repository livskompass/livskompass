import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Puck, type Data } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import { emptyPuckData, injectPreviewCSS } from '@livskompass/shared'
import { getFilteredPuckConfig } from '../lib/puck-filter'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog'
import { Settings, Trash2, ExternalLink } from 'lucide-react'
import { cn } from '../lib/utils'

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
        return { className: 'bg-forest-50 text-forest-700 border-forest-200', label: 'Active' }
      case 'full':
        return { className: 'bg-stone-100 text-stone-700 border-stone-200', label: 'Full' }
      case 'completed':
        return { className: 'bg-stone-100 text-stone-500 border-stone-200', label: 'Completed' }
      case 'cancelled':
        return { className: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled' }
      default:
        return { className: 'bg-amber-50 text-amber-600 border-amber-200', label: 'Draft' }
    }
  }

  const badge = statusBadge()

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Puck
        config={getFilteredPuckConfig('course')}
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
              {/* View on site */}
              {course?.id && slug && (
                <a
                  href={`${window.location.origin.replace('admin', 'web')}/utbildningar/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors text-xs font-medium"
                  title="View on site"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View
                </a>
              )}

              {/* Status badge */}
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.className}`}
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
                  className={cn(
                    "inline-flex items-center justify-center h-8 w-8 rounded-lg border transition-all duration-150",
                    settingsOpen
                      ? "border-forest-300 bg-forest-50 text-forest-700"
                      : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                  )}
                  title="Course settings"
                >
                  <Settings className="h-4 w-4" />
                </button>

                {settingsOpen && (
                  <div className="fixed w-80 bg-white rounded-2xl shadow-xl border border-stone-200 z-[9999] max-h-[80vh] overflow-y-auto animate-scale-in origin-top-right" style={{ top: dropdownStyle.top, right: dropdownStyle.right }}>
                    <div className="p-5 space-y-5">
                      <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Course settings</h3>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Title</Label>
                          <Input
                            value={title}
                            onChange={(e) => {
                              setTitle(e.target.value)
                              if (!course?.id) setSlug(generateSlug(e.target.value))
                            }}
                            className="h-9 text-sm"
                            placeholder="Course title"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Slug</Label>
                          <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="h-9 text-sm"
                            placeholder="url-slug"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Status</Label>
                          <Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-9 text-sm"
                          >
                            <option value="active">Active</option>
                            <option value="full">Full</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Location</Label>
                          <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="h-9 text-sm"
                            placeholder="Stockholm, Online, etc."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Start date</Label>
                            <Input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-stone-700 mb-1.5 block">End date</Label>
                            <Input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Registration deadline</Label>
                          <Input
                            type="date"
                            value={registrationDeadline}
                            onChange={(e) => setRegistrationDeadline(e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Price (SEK)</Label>
                            <Input
                              type="number"
                              value={priceSek}
                              onChange={(e) => setPriceSek(Number(e.target.value))}
                              className="h-9 text-sm"
                              placeholder="0"
                              min={0}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Max participants</Label>
                            <Input
                              type="number"
                              value={maxParticipants}
                              onChange={(e) => setMaxParticipants(Number(e.target.value))}
                              className="h-9 text-sm"
                              placeholder="0"
                              min={0}
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Description</Label>
                          <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-0 resize-none"
                            rows={2}
                            placeholder="Short description for listings..."
                          />
                        </div>
                      </div>

                      {onDelete && (
                        <div className="border-t border-stone-200 pt-4">
                          <button
                            onClick={() => {
                              setSettingsOpen(false)
                              setDeleteOpen(true)
                            }}
                            className="flex items-center justify-center gap-2 w-full text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg px-4 py-2.5 transition-colors"
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
