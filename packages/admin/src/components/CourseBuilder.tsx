import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Puck, type Data } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import { emptyPuckData, createEditorOverrides, defaultCourseTemplate } from '@livskompass/shared'
import { getFilteredPuckConfig } from '../lib/puck-filter'
import { MediaPickerField } from './MediaPickerField'
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
import { Settings, Trash2, ExternalLink, Loader2, Check, AlertTriangle } from 'lucide-react'
import { cn, generateSlug } from '../lib/utils'
import type { SaveStatus } from './PageBuilder'

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
  isNew: boolean
  hasDraft?: boolean
  onAutoSave: (data: {
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
  onStatusChange: (data: {
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
  onCreate: (data: {
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
  saveStatus?: SaveStatus
  saveError?: string
  onRetry?: () => void
}

export default function CourseBuilder({ course, isNew, hasDraft = false, onAutoSave, onStatusChange, onCreate, onDelete, saveStatus = 'idle', saveError, onRetry }: CourseBuilderProps) {
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
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false)
  const canTrackDirtyRef = useRef(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({ top: 0, right: 0 })

  // Refs for auto-save
  const puckDataRef = useRef<Data | null>(null)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const stateRef = useRef({ title, slug, description, location, startDate, endDate, priceSek, maxParticipants, registrationDeadline, status })
  stateRef.current = { title, slug, description, location, startDate, endDate, priceSek, maxParticipants, registrationDeadline, status }
  const cbRef = useRef({ onAutoSave, onStatusChange, onCreate })
  cbRef.current = { onAutoSave, onStatusChange, onCreate }

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
      if (hasDraft && (course.status === 'active' || course.status === 'full')) {
        setHasUnpublishedChanges(true)
      }
    }
  }, [course, hasDraft])

  useEffect(() => {
    const timer = setTimeout(() => { canTrackDirtyRef.current = true }, 200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const shouldWarn = saveStatus === 'saving' || (isNew && title.trim().length > 0)
    if (!shouldWarn) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [saveStatus, isNew, title])

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

  useEffect(() => {
    return () => clearTimeout(autoSaveTimerRef.current)
  }, [])

  const editorOverrides = useMemo(() => createEditorOverrides(), [])

  const initialData = useMemo<Data>(() => {
    if (course?.content_blocks) {
      try {
        return JSON.parse(course.content_blocks) as Data
      } catch {
        return emptyPuckData
      }
    }
    if (course?.title) {
      try {
        const safeContent = course.description
          ? course.description.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
          : '<p></p>'
        const template = defaultCourseTemplate
          .replace('__LEGACY_CONTENT__', safeContent)
        return JSON.parse(template) as Data
      } catch {
        return emptyPuckData
      }
    }
    return emptyPuckData
  }, [course?.content_blocks, course?.title, course?.description])

  const assemblePayload = useCallback((s: typeof stateRef.current) => ({
    title: s.title,
    slug: s.slug,
    description: s.description,
    location: s.location,
    start_date: s.startDate,
    end_date: s.endDate,
    price_sek: s.priceSek,
    max_participants: s.maxParticipants,
    registration_deadline: s.registrationDeadline,
    status: s.status,
    content_blocks: JSON.stringify(puckDataRef.current || initialData),
    editor_version: 'puck',
  }), [initialData])

  // Debounced auto-save
  const triggerAutoSave = useCallback(() => {
    if (isNew) return
    clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => {
      const s = stateRef.current
      if (!s.title) return
      cbRef.current.onAutoSave(assemblePayload(s))
    }, 2000)
  }, [isNew, assemblePayload])

  const isLive = status === 'active' || status === 'full'

  const handlePuckChange = useCallback((data: Data) => {
    puckDataRef.current = data
    if (!canTrackDirtyRef.current) return
    if (isLive) setHasUnpublishedChanges(true)
    triggerAutoSave()
  }, [isLive, triggerAutoSave])

  const onSettingsChange = useCallback(() => {
    if (isLive) setHasUnpublishedChanges(true)
    triggerAutoSave()
  }, [isLive, triggerAutoSave])

  // CTA: Create / Activate / Deactivate
  const handleCTA = useCallback(() => {
    clearTimeout(autoSaveTimerRef.current)
    const s = stateRef.current
    const payload = assemblePayload(s)
    if (isNew) {
      cbRef.current.onCreate(payload)
    } else if (s.status === 'active' || s.status === 'full') {
      cbRef.current.onStatusChange({ ...payload, status: 'cancelled' })
    } else {
      cbRef.current.onStatusChange({ ...payload, status: 'active' })
    }
    setHasUnpublishedChanges(false)
  }, [isNew, status, assemblePayload])

  const handlePublishChanges = useCallback(() => {
    clearTimeout(autoSaveTimerRef.current)
    const s = stateRef.current
    const payload = assemblePayload(s)
    cbRef.current.onStatusChange({ ...payload, status: s.status })
    setHasUnpublishedChanges(false)
  }, [assemblePayload])

  const statusBadge = () => {
    switch (status) {
      case 'active':
        return { className: 'bg-emerald-50 text-emerald-600', label: 'Active' }
      case 'full':
        return { className: 'bg-amber-50 text-amber-600', label: 'Full' }
      case 'completed':
        return { className: 'bg-zinc-100 text-zinc-500', label: 'Completed' }
      case 'cancelled':
        return { className: 'bg-red-50 text-red-500', label: 'Cancelled' }
      default:
        return { className: 'bg-zinc-100 text-zinc-500', label: 'Draft' }
    }
  }

  const badge = statusBadge()

  return (
    <div className="h-[100dvh]">
      <Puck
        config={getFilteredPuckConfig('course')}
        data={initialData}
        onChange={handlePuckChange}
        headerTitle={title || 'New course'}
        viewports={[
          { width: 360, label: 'Mobile', icon: 'Smartphone' as any },
          { width: 768, label: 'Tablet' },
          { width: 1280, label: 'Desktop', icon: 'Monitor' as any },
        ]}
        overrides={{
          ...editorOverrides,
          fieldTypes: {
            text: ({ field, value, onChange, children }: any) => {
              if (field?.metadata?.isImage) {
                return <MediaPickerField value={value || ''} onChange={onChange} label={field.label} />
              }
              return children
            },
          },
          headerActions: () => (
            <div className="flex items-center gap-1">
              {saveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 px-2 py-0.5 animate-fade-in">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving…
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded animate-fade-in">
                  <Check className="h-3 w-3" />
                  Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-red-600 px-2 py-0.5 bg-red-50 rounded animate-fade-in"
                  title={saveError}
                >
                  <AlertTriangle className="h-3 w-3" />
                  Failed
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="text-[11px] font-semibold text-red-700 hover:text-red-900 underline underline-offset-2 decoration-red-300 hover:decoration-red-500 ml-0.5 transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </span>
              )}

              {hasUnpublishedChanges && !isNew ? (
                <span className="text-[12px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-600 animate-fade-in">
                  Unpublished changes
                </span>
              ) : (
                <span className={`text-[12px] font-medium px-2 py-0.5 rounded ${badge.className}`}>
                  {badge.label}
                </span>
              )}

              {hasUnpublishedChanges && !isNew ? (
                <>
                  <button
                    onClick={handleCTA}
                    disabled={saveStatus === 'saving'}
                    className="h-8 px-3 text-[13px] font-medium rounded-md bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={handlePublishChanges}
                    disabled={saveStatus === 'saving' || !title.trim()}
                    className="h-8 px-3 text-[13px] font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Publish changes
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCTA}
                  disabled={saveStatus === 'saving' || !title.trim()}
                  className={cn(
                    "h-8 px-3 text-[13px] font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                    isNew
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : isLive
                        ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                  )}
                >
                  {isNew ? 'Create' : isLive ? 'Deactivate' : 'Activate'}
                </button>
              )}

              <span className="w-px h-3.5 bg-zinc-200" />

              {course?.id && slug && (
                <a
                  href={`${window.location.origin.replace(':3001', ':3000').replace('admin', 'web')}/utbildningar/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:text-zinc-700 transition-colors"
                  title="View on site"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              <div ref={settingsRef} className="relative z-50">
                <button
                  ref={buttonRef}
                  onClick={() => {
                    if (!settingsOpen && buttonRef.current) {
                      const rect = buttonRef.current.getBoundingClientRect()
                      const spaceBelow = window.innerHeight - rect.bottom - 16
                      const dropdownMaxH = 500
                      if (spaceBelow < dropdownMaxH) {
                        setDropdownStyle({ bottom: window.innerHeight - rect.top + 8, right: window.innerWidth - rect.right })
                      } else {
                        setDropdownStyle({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
                      }
                    }
                    setSettingsOpen(!settingsOpen)
                  }}
                  className={cn(
                    "inline-flex items-center justify-center h-8 w-8 rounded-md transition-all duration-100",
                    settingsOpen
                      ? "bg-zinc-100 text-zinc-700"
                      : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
                  )}
                  title="Course settings"
                >
                  <Settings className="h-4 w-4" />
                </button>

                {settingsOpen && (
                  <div className="fixed w-96 bg-white rounded-2xl shadow-xl border border-stone-200 z-[200] max-h-[80vh] overflow-y-auto animate-scale-in origin-top-right" style={dropdownStyle}>
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
                              onSettingsChange()
                            }}
                            className="h-9 text-sm"
                            placeholder="Course title"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Slug</Label>
                          <Input
                            value={slug}
                            onChange={(e) => { setSlug(e.target.value); onSettingsChange() }}
                            className="h-9 text-sm"
                            placeholder="url-slug"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Status</Label>
                          <Select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); onSettingsChange() }}
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
                            onChange={(e) => { setLocation(e.target.value); onSettingsChange() }}
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
                              onChange={(e) => { setStartDate(e.target.value); onSettingsChange() }}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-stone-700 mb-1.5 block">End date</Label>
                            <Input
                              type="date"
                              value={endDate}
                              onChange={(e) => { setEndDate(e.target.value); onSettingsChange() }}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Registration deadline</Label>
                          <Input
                            type="date"
                            value={registrationDeadline}
                            onChange={(e) => { setRegistrationDeadline(e.target.value); onSettingsChange() }}
                            className="h-9 text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium text-stone-700 mb-1.5 block">Price (SEK)</Label>
                            <Input
                              type="number"
                              value={priceSek}
                              onChange={(e) => { setPriceSek(Number(e.target.value)); onSettingsChange() }}
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
                              onChange={(e) => { setMaxParticipants(Number(e.target.value)); onSettingsChange() }}
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
                            onChange={(e) => { setDescription(e.target.value); onSettingsChange() }}
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

            </div>
          ),
        }}
      />

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
