import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSettings,
  updateSettings,
  getSiteSettings,
  updateSiteSettings,
  uploadMedia,
  getMediaUrl,
} from '../lib/api'
import { defaultHeader, defaultFooter, type SiteHeaderConfig, type SiteFooterConfig } from '@livskompass/shared'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Skeleton } from '../components/ui/skeleton'
import { Separator } from '../components/ui/separator'
import {
  Save,
  Loader2,
  Globe,
  Phone,
  CreditCard,
  BarChart3,
  CheckCircle,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  PanelTop,
  PanelBottom,
  Upload,
} from 'lucide-react'

// ── Nav item editor sub-component ──

function NavItemEditor({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: SiteHeaderConfig['navItems'][0]
  index: number
  onChange: (index: number, updated: SiteHeaderConfig['navItems'][0]) => void
  onRemove: (index: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  return (
    <div className="border border-zinc-200 rounded-lg bg-white">
      <div className="flex items-center gap-2 px-3 py-2">
        <GripVertical className="h-4 w-4 text-zinc-300 shrink-0" />
        <Input
          value={item.label}
          onChange={(e) => onChange(index, { ...item, label: e.target.value })}
          className="h-8 text-sm"
          placeholder="Label"
        />
        <Input
          value={item.href}
          onChange={(e) => onChange(index, { ...item, href: e.target.value })}
          className="h-8 text-sm font-mono"
          placeholder="/path"
        />
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded text-zinc-400 hover:text-zinc-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-1"
          title={hasChildren ? 'Edit sub-items' : 'Add sub-items'}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 rounded text-zinc-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-1"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-zinc-100 ml-6 space-y-2">
          <p className="text-xs text-zinc-500 font-medium">Dropdown items</p>
          {(item.children || []).map((child, ci) => (
            <div key={ci} className="flex items-center gap-2">
              <Input
                value={child.label}
                onChange={(e) => {
                  const newChildren = [...(item.children || [])]
                  newChildren[ci] = { ...child, label: e.target.value }
                  onChange(index, { ...item, children: newChildren })
                }}
                className="h-7 text-xs"
                placeholder="Label"
              />
              <Input
                value={child.href}
                onChange={(e) => {
                  const newChildren = [...(item.children || [])]
                  newChildren[ci] = { ...child, href: e.target.value }
                  onChange(index, { ...item, children: newChildren })
                }}
                className="h-7 text-xs font-mono"
                placeholder="/path"
              />
              <button
                type="button"
                onClick={() => {
                  const newChildren = (item.children || []).filter((_, i) => i !== ci)
                  onChange(index, { ...item, children: newChildren.length > 0 ? newChildren : undefined })
                }}
                className="p-0.5 rounded text-zinc-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              const newChildren = [...(item.children || []), { label: '', href: '/' }]
              onChange(index, { ...item, children: newChildren })
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add sub-item
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Footer column editor ──

function FooterColumnEditor({
  column,
  index,
  onChange,
  onRemove,
}: {
  column: SiteFooterConfig['columns'][0]
  index: number
  onChange: (index: number, updated: SiteFooterConfig['columns'][0]) => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="border border-zinc-200 rounded-lg bg-white p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Input
          value={column.heading}
          onChange={(e) => onChange(index, { ...column, heading: e.target.value })}
          className="h-8 text-sm font-medium"
          placeholder="Column heading"
        />
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 rounded text-zinc-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-1"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-1.5">
        {column.links.map((link, li) => (
          <div key={li} className="flex items-center gap-2">
            <Input
              value={link.label}
              onChange={(e) => {
                const newLinks = [...column.links]
                newLinks[li] = { ...link, label: e.target.value }
                onChange(index, { ...column, links: newLinks })
              }}
              className="h-7 text-xs"
              placeholder="Label"
            />
            <Input
              value={link.href}
              onChange={(e) => {
                const newLinks = [...column.links]
                newLinks[li] = { ...link, href: e.target.value }
                onChange(index, { ...column, links: newLinks })
              }}
              className="h-7 text-xs font-mono"
              placeholder="/path"
            />
            <button
              type="button"
              onClick={() => {
                const newLinks = column.links.filter((_, i) => i !== li)
                onChange(index, { ...column, links: newLinks })
              }}
              className="p-0.5 rounded text-zinc-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => {
            const newLinks = [...column.links, { label: '', href: '/' }]
            onChange(index, { ...column, links: newLinks })
          }}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add link
        </Button>
      </div>
    </div>
  )
}

// ── Main Settings page ──

export default function Settings() {
  const queryClient = useQueryClient()

  // General settings state
  const [formData, setFormData] = useState({
    site_name: 'Livskompass',
    site_description: 'ACT and mindfulness training',
    contact_email: 'livheim@gmail.com',
    contact_phone: '070-694 03 64',
    homepage_slug: 'home-2',
    stripe_publishable_key: '',
    google_analytics_id: '',
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Site settings (header/footer) state
  const [header, setHeader] = useState<SiteHeaderConfig>(defaultHeader)
  const [footer, setFooter] = useState<SiteFooterConfig>(defaultFooter)
  const [siteSaved, setSiteSaved] = useState(false)
  const [siteError, setSiteError] = useState('')
  const [siteSettingsLoaded, setSiteSettingsLoaded] = useState(false)
  const [siteDirty, setSiteDirty] = useState(false)
  const siteAutoSaveTimer = useRef<ReturnType<typeof setTimeout>>()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: getSettings,
  })

  const { data: siteData, isLoading: siteLoading } = useQuery({
    queryKey: ['admin-site-settings'],
    queryFn: getSiteSettings,
  })

  useEffect(() => {
    if (data?.settings) {
      setFormData((prev) => ({ ...prev, ...data.settings }))
    }
  }, [data])

  useEffect(() => {
    if (siteData) {
      if (siteData.header) setHeader(siteData.header)
      if (siteData.footer) setFooter(siteData.footer)
      setSiteSettingsLoaded(true)
      setSiteDirty(false)
    }
  }, [siteData])

  // Auto-save site settings with debounce
  useEffect(() => {
    if (!siteSettingsLoaded) return // Don't save on initial load
    setSiteDirty(true)
    clearTimeout(siteAutoSaveTimer.current)
    siteAutoSaveTimer.current = setTimeout(() => {
      setSiteError('')
      saveSiteMutation.mutate({ header, footer })
    }, 1500)
    return () => clearTimeout(siteAutoSaveTimer.current)
  }, [header, footer])

  // General settings save
  const saveMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to save settings')
    },
  })

  // Site settings save
  const saveSiteMutation = useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-site-settings'] })
      setSiteSaved(true)
      setSiteDirty(false)
      setTimeout(() => setSiteSaved(false), 3000)
    },
    onError: (err: Error) => {
      setSiteError(err.message || 'Failed to save site settings')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    saveMutation.mutate(formData)
  }

  const handleSiteSave = () => {
    setSiteError('')
    saveSiteMutation.mutate({ header, footer })
  }

  // Header nav item handlers
  const updateNavItem = (index: number, updated: SiteHeaderConfig['navItems'][0]) => {
    const newItems = [...header.navItems]
    newItems[index] = updated
    setHeader({ ...header, navItems: newItems })
  }

  const removeNavItem = (index: number) => {
    setHeader({ ...header, navItems: header.navItems.filter((_, i) => i !== index) })
  }

  const addNavItem = () => {
    setHeader({
      ...header,
      navItems: [...header.navItems, { label: '', href: '/' }],
    })
  }

  // Footer column handlers
  const updateFooterColumn = (index: number, updated: SiteFooterConfig['columns'][0]) => {
    const newColumns = [...footer.columns]
    newColumns[index] = updated
    setFooter({ ...footer, columns: newColumns })
  }

  const removeFooterColumn = (index: number) => {
    setFooter({ ...footer, columns: footer.columns.filter((_, i) => i !== index) })
  }

  const addFooterColumn = () => {
    setFooter({
      ...footer,
      columns: [...footer.columns, { heading: 'New column', links: [] }],
    })
  }

  if (isLoading || siteLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-h3 text-zinc-900">Settings</h1>
        <p className="text-zinc-500 mt-1">Manage site configuration, navigation, and integrations.</p>
      </div>

      {/* ── Site Header & Footer ── */}
      <h2 className="text-h4 text-zinc-900">Navigation & Structure</h2>

      {siteSaved && (
        <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 text-zinc-700 px-4 py-3 rounded-lg text-sm">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Header & footer saved!
        </div>
      )}
      {siteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {siteError}
        </div>
      )}

      {/* Header settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PanelTop className="h-4 w-4 text-zinc-400" />
            Site Header
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Logo text</Label>
            <Input
              value={header.logoText}
              onChange={(e) => setHeader({ ...header, logoText: e.target.value })}
              placeholder="Livskompass"
            />
          </div>

          <div className="space-y-2">
            <Label>Logo image <span className="text-zinc-400 font-normal">(optional — overrides text)</span></Label>
            <div className="flex items-center gap-2">
              <Input
                value={header.logoUrl || ''}
                onChange={(e) => setHeader({ ...header, logoUrl: e.target.value || undefined })}
                placeholder="Upload or paste URL..."
                className="flex-1"
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-700 text-sm font-medium hover:bg-zinc-50 cursor-pointer transition-colors whitespace-nowrap">
                <Upload className="h-4 w-4" />
                Upload
                <input
                  type="file"
                  accept="image/svg+xml,image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const result = await uploadMedia(file)
                      const url = result.media.url.replace(/^https?:\/\/[^/]+/, '')
                      setHeader({ ...header, logoUrl: url })
                    } catch { /* upload error — silent */ }
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
            {header.logoUrl && (
              <div className="mt-2 rounded-md border border-zinc-200 overflow-hidden">
                <div className="flex gap-0">
                  <div className="flex-1 p-4 flex items-center justify-center" style={{ background: 'repeating-conic-gradient(#e5e5e5 0% 25%, #fff 0% 50%) 50% / 16px 16px' }}>
                    <img src={getMediaUrl(header.logoUrl)} alt="Logo on light" className="h-10 max-w-[220px] object-contain" />
                  </div>
                  <div className="flex-1 p-4 bg-zinc-900 flex items-center justify-center">
                    <img src={getMediaUrl(header.logoUrl)} alt="Logo on dark" className="h-10 max-w-[220px] object-contain" />
                  </div>
                </div>
                <div className="px-3 py-2 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 truncate max-w-[300px]">{header.logoUrl.split('/').pop()}</span>
                  <button
                    type="button"
                    onClick={() => setHeader({ ...header, logoUrl: undefined })}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {header.logoUrl && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Logo size</Label>
                <div className="flex items-center gap-2">
                  {([
                    { value: 'xs', label: 'XS' },
                    { value: 'small', label: 'S' },
                    { value: 'medium', label: 'M' },
                    { value: 'large', label: 'L' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setHeader({ ...header, logoSize: opt.value })}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        (header.logoSize || 'medium') === opt.value
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Dynamic color</Label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="logoDynamic"
                    checked={!!header.logoDynamic}
                    onChange={(e) => setHeader({ ...header, logoDynamic: e.target.checked })}
                    className="rounded border-zinc-300"
                  />
                  <Label htmlFor="logoDynamic" className="cursor-pointer text-zinc-500 font-normal">
                    Follow nav color (dark/light)
                  </Label>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-zinc-400">To add search, add a nav item with href <code className="bg-zinc-100 px-1 rounded">#search</code> — it renders as a search icon. Works in both header nav and footer links.</p>

          <Separator />

          <div className="space-y-2">
            <Label>Nav text color</Label>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { value: '', label: 'Default' },
                { value: 'text-forest-800', label: 'Dark Green' },
                { value: 'text-forest-600', label: 'Green' },
                { value: 'text-white', label: 'White' },
                { value: 'text-stone-950', label: 'Black' },
                { value: 'text-amber-300', label: 'Yellow' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    (header.navColor || '') === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                  }`}
                  onClick={() => setHeader({ ...header, navColor: opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="dynamic-nav-color"
              checked={header.dynamicNavColor || false}
              onChange={(e) => setHeader({ ...header, dynamicNavColor: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <Label htmlFor="dynamic-nav-color" className="text-sm text-zinc-600 cursor-pointer">
              Dynamic nav color (auto-switch based on hero background)
            </Label>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Navigation items</Label>
            <div className="space-y-2">
              {header.navItems.map((item, i) => (
                <NavItemEditor
                  key={i}
                  item={item}
                  index={i}
                  onChange={updateNavItem}
                  onRemove={removeNavItem}
                />
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addNavItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add nav item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PanelBottom className="h-4 w-4 text-zinc-400" />
            Site Footer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Footer logo <span className="text-zinc-400 font-normal">(optional — overrides company name text)</span></Label>
            <div className="flex items-center gap-2">
              <Input
                value={footer.logoUrl || ''}
                onChange={(e) => setFooter({ ...footer, logoUrl: e.target.value || undefined })}
                placeholder="Upload or paste URL..."
                className="flex-1"
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-zinc-200 bg-white text-zinc-700 text-sm font-medium hover:bg-zinc-50 cursor-pointer transition-colors whitespace-nowrap">
                <Upload className="h-4 w-4" />
                Upload
                <input
                  type="file"
                  accept="image/svg+xml,image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const result = await uploadMedia(file)
                      const url = result.media.url.replace(/^https?:\/\/[^/]+/, '')
                      setFooter({ ...footer, logoUrl: url })
                    } catch { /* upload error — silent */ }
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
            {footer.logoUrl && (
              <div className="mt-2 rounded-md border border-zinc-200 overflow-hidden">
                <div className="flex gap-0">
                  <div className="flex-1 p-4 flex items-center justify-center" style={{ background: 'repeating-conic-gradient(#e5e5e5 0% 25%, #fff 0% 50%) 50% / 16px 16px' }}>
                    <img src={getMediaUrl(footer.logoUrl)} alt="Logo on light" className="h-8 max-w-[180px] object-contain" />
                  </div>
                  <div className="flex-1 p-4 bg-zinc-900 flex items-center justify-center">
                    <img src={getMediaUrl(footer.logoUrl)} alt="Logo on dark" className="h-8 max-w-[180px] object-contain" />
                  </div>
                </div>
                <div className="px-3 py-2 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 truncate max-w-[300px]">{footer.logoUrl.split('/').pop()}</span>
                  <button
                    type="button"
                    onClick={() => setFooter({ ...footer, logoUrl: undefined })}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company name</Label>
              <Input
                value={footer.companyName}
                onChange={(e) => setFooter({ ...footer, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                value={footer.tagline}
                onChange={(e) => setFooter({ ...footer, tagline: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Contact section heading</Label>
            <Input
              value={footer.contactHeading || ''}
              onChange={(e) => setFooter({ ...footer, contactHeading: e.target.value })}
              placeholder="Kontakt"
            />
            <p className="text-xs text-zinc-400">Heading shown above the contact info in the footer. Defaults to "Kontakt".</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact email</Label>
              <Input
                value={footer.contact.email}
                onChange={(e) =>
                  setFooter({ ...footer, contact: { ...footer.contact, email: e.target.value } })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Contact phone</Label>
              <Input
                value={footer.contact.phone}
                onChange={(e) =>
                  setFooter({ ...footer, contact: { ...footer.contact, phone: e.target.value } })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Copyright text</Label>
            <Input
              value={footer.copyright}
              onChange={(e) => setFooter({ ...footer, copyright: e.target.value })}
              placeholder="Use {year} for dynamic year"
            />
            <p className="text-xs text-zinc-400">
              Use <code className="bg-zinc-100 px-1 rounded">{'{year}'}</code> to insert the current year automatically.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Footer link columns</Label>
            <div className="space-y-3">
              {footer.columns.map((col, i) => (
                <FooterColumnEditor
                  key={i}
                  column={col}
                  index={i}
                  onChange={updateFooterColumn}
                  onRemove={removeFooterColumn}
                />
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addFooterColumn}>
              <Plus className="h-4 w-4 mr-1" />
              Add column
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Auto-save status bar */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-zinc-200 py-2 px-4 flex items-center justify-between rounded-b-lg">
        <div className="flex items-center gap-2 text-sm">
          {saveSiteMutation.isPending ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" /><span className="text-zinc-500">Saving...</span></>
          ) : siteError ? (
            <><span className="w-2 h-2 rounded-full bg-red-500" /><span className="text-red-600">{siteError}</span></>
          ) : siteSaved ? (
            <><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-green-600">Saved</span></>
          ) : siteDirty ? (
            <><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-amber-600">Unsaved changes</span></>
          ) : (
            <><span className="w-2 h-2 rounded-full bg-zinc-300" /><span className="text-zinc-400">Up to date</span></>
          )}
        </div>
        {siteDirty && !saveSiteMutation.isPending && (
          <Button type="button" size="sm" onClick={handleSiteSave}>
            <Save className="h-3.5 w-3.5 mr-1.5" /> Save now
          </Button>
        )}
      </div>

      <Separator className="my-2" />

      {/* ── General Settings ── */}
      <h2 className="text-h4 text-zinc-900">General Settings</h2>

      {saved && (
        <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 text-zinc-700 px-4 py-3 rounded-lg text-sm">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Settings saved!
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-zinc-400" />
                General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site name</Label>
                <Input
                  id="site-name"
                  value={formData.site_name}
                  onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homepage-slug">Homepage slug</Label>
                <Input
                  id="homepage-slug"
                  value={formData.homepage_slug}
                  onChange={(e) => setFormData({ ...formData, homepage_slug: e.target.value })}
                  placeholder="home-2"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-zinc-400">The page slug that loads as the homepage (e.g. "home-2" from WordPress migration).</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-desc">Description</Label>
                <Textarea
                  id="site-desc"
                  rows={2}
                  value={formData.site_description}
                  onChange={(e) => setFormData({ ...formData, site_description: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-zinc-400" />
                Contact details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-zinc-400" />
                Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-key">Stripe Publishable Key</Label>
                <Input
                  id="stripe-key"
                  value={formData.stripe_publishable_key}
                  onChange={(e) => setFormData({ ...formData, stripe_publishable_key: e.target.value })}
                  className="font-mono text-sm"
                  placeholder="pk_live_..."
                />
                <p className="text-xs text-zinc-400">Your public Stripe key for payments</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="ga-id" className="flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-zinc-400" />
                  Google Analytics ID
                </Label>
                <Input
                  id="ga-id"
                  value={formData.google_analytics_id}
                  onChange={(e) => setFormData({ ...formData, google_analytics_id: e.target.value })}
                  className="font-mono text-sm"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-0 bg-zinc-50 py-3 flex justify-end">
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Save settings</>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
