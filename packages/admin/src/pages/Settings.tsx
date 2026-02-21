import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSettings,
  updateSettings,
  getSiteSettings,
  updateSiteSettings,
  type SiteHeaderConfig,
  type SiteFooterConfig,
} from '../lib/api'
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
} from 'lucide-react'

// ── Default site settings ──

const defaultHeader: SiteHeaderConfig = {
  logoText: 'Livskompass',
  navItems: [
    { label: 'ACT', href: '/act' },
    { label: 'Utbildningar', href: '/utbildningar' },
    { label: 'Material', href: '/material' },
    {
      label: 'Om oss',
      href: '#',
      children: [
        { label: 'Mindfulness', href: '/mindfulness' },
        { label: 'Forskning på metoden', href: '/forskning-pa-metoden' },
        { label: 'Om Fredrik Livheim', href: '/om-fredrik-livheim' },
      ],
    },
    { label: 'Kontakt', href: '/kontakt' },
    { label: 'Nyheter', href: '/nyhet' },
  ],
}

const defaultFooter: SiteFooterConfig = {
  companyName: 'Livskompass',
  tagline: 'ACT och mindfulness utbildningar med Fredrik Livheim',
  contact: { email: 'livheim@gmail.com', phone: '070-694 03 64' },
  columns: [
    {
      heading: 'Länkar',
      links: [
        { label: 'ACT', href: '/act' },
        { label: 'Utbildningar', href: '/utbildningar' },
        { label: 'Material', href: '/material' },
        { label: 'Mindfulness', href: '/mindfulness' },
        { label: 'Forskning', href: '/forskning-pa-metoden' },
        { label: 'Om Fredrik', href: '/om-fredrik-livheim' },
        { label: 'Kontakt', href: '/kontakt' },
        { label: 'Nyheter', href: '/nyhet' },
      ],
    },
  ],
  copyright: '© {year} Livskompass. Alla rättigheter förbehållna.',
}

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
    <div className="border border-stone-200 rounded-lg bg-white">
      <div className="flex items-center gap-2 px-3 py-2">
        <GripVertical className="h-4 w-4 text-stone-300 shrink-0" />
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
          className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
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
          className="p-1 text-stone-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-stone-100 ml-6 space-y-2">
          <p className="text-xs text-stone-500 font-medium">Dropdown items</p>
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
                className="p-0.5 text-stone-400 hover:text-red-500 transition-colors"
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
    <div className="border border-stone-200 rounded-lg bg-white p-3 space-y-3">
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
          className="p-1 text-stone-400 hover:text-red-500 transition-colors"
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
              className="p-0.5 text-stone-400 hover:text-red-500 transition-colors"
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
    }
  }, [siteData])

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
        <h1 className="text-h3 text-stone-900">Settings</h1>
        <p className="text-stone-500 mt-1">Manage site configuration, navigation, and integrations.</p>
      </div>

      {/* ── Site Header & Footer ── */}

      {siteSaved && (
        <div className="flex items-center gap-2 bg-forest-50 border border-forest-200 text-forest-700 px-4 py-3 rounded-xl text-sm">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Header & footer saved!
        </div>
      )}
      {siteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {siteError}
        </div>
      )}

      {/* Header settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PanelTop className="h-4 w-4 text-stone-400" />
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
            <PanelBottom className="h-4 w-4 text-stone-400" />
            Site Footer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <p className="text-xs text-stone-400">
              Use <code className="bg-stone-100 px-1 rounded">{'{year}'}</code> to insert the current year automatically.
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

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSiteSave}
          disabled={saveSiteMutation.isPending}
        >
          {saveSiteMutation.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" /> Save header & footer</>
          )}
        </Button>
      </div>

      <Separator className="my-2" />

      {/* ── General Settings ── */}

      {saved && (
        <div className="flex items-center gap-2 bg-forest-50 border border-forest-200 text-forest-700 px-4 py-3 rounded-xl text-sm">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Settings saved!
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-stone-400" />
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
                <Phone className="h-4 w-4 text-stone-400" />
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
                <CreditCard className="h-4 w-4 text-stone-400" />
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
                <p className="text-xs text-stone-400">Your public Stripe key for payments</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="ga-id" className="flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-stone-400" />
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

          <div className="flex justify-end">
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
