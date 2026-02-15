import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSettings, updateSettings } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Skeleton } from '../components/ui/skeleton'
import { Separator } from '../components/ui/separator'
import { Save, Loader2, Globe, Phone, CreditCard, BarChart3, CheckCircle } from 'lucide-react'

export default function Settings() {
  const queryClient = useQueryClient()

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

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: getSettings,
  })

  useEffect(() => {
    if (data?.settings) {
      setFormData((prev) => ({
        ...prev,
        ...data.settings,
      }))
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
    onError: (err: Error) => {
      setError(err.message || 'Could not save settings')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    saveMutation.mutate(formData)
  }

  if (isLoading) {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your site configuration and integrations.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Settings have been saved!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* General settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site name</Label>
                <Input
                  id="site-name"
                  value={formData.site_name}
                  onChange={(e) =>
                    setFormData({ ...formData, site_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site-desc">Description</Label>
                <Textarea
                  id="site-desc"
                  rows={2}
                  value={formData.site_description}
                  onChange={(e) =>
                    setFormData({ ...formData, site_description: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
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
                  onChange={(e) =>
                    setFormData({ ...formData, contact_email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_phone: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Integration settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-key">Stripe Publishable Key</Label>
                <Input
                  id="stripe-key"
                  value={formData.stripe_publishable_key}
                  onChange={(e) =>
                    setFormData({ ...formData, stripe_publishable_key: e.target.value })
                  }
                  className="font-mono text-sm"
                  placeholder="pk_live_..."
                />
                <p className="text-xs text-gray-400">
                  Your public Stripe key for payments
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="ga-id" className="flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-gray-400" />
                  Google Analytics ID
                </Label>
                <Input
                  id="ga-id"
                  value={formData.google_analytics_id}
                  onChange={(e) =>
                    setFormData({ ...formData, google_analytics_id: e.target.value })
                  }
                  className="font-mono text-sm"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saveMutation.isPending}
            >
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
