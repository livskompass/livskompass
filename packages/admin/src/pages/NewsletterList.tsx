import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNewsletterSignups, deleteNewsletterSignup } from '../lib/api'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { Copy, Check, Download, Trash2, MailPlus } from 'lucide-react'

export default function NewsletterList() {
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-newsletter'],
    queryFn: getNewsletterSignups,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNewsletterSignup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-newsletter'] })
    },
  })

  const signups = data?.signups ?? []

  const copyAll = async () => {
    await navigator.clipboard.writeText(signups.map((s) => s.email).join(', '))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCsv = () => {
    const rows = [['email', 'signed_up_at', 'source'], ...signups.map((s) => [s.email, s.created_at, s.source ?? ''])]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'newsletter-signups.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-h3 text-zinc-900">Newsletter</h1>
          <p className="text-zinc-500 mt-1">
            Email addresses collected from the newsletter signup form. Copy or export the list to
            update your mailing list manually.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyAll} disabled={signups.length === 0}>
            {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
            {copied ? 'Copied!' : 'Copy all emails'}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCsv} disabled={signups.length === 0}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <CardContent className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        ) : signups.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {signups.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">{s.email}</p>
                  <p className="text-xs text-zinc-400">
                    {new Date(s.created_at + 'Z').toLocaleString('sv-SE')}
                    {s.source ? ` · ${s.source}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteId(s.id)}
                  className="p-1.5 rounded text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                  title="Remove from list"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <CardContent className="p-12 flex flex-col items-center text-center gap-2">
            <MailPlus className="h-8 w-8 text-zinc-300" />
            <p className="text-zinc-500 text-sm">No signups yet.</p>
          </CardContent>
        )}
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Remove signup"
        description="Remove this email address from the newsletter list? This cannot be undone."
        confirmLabel="Remove"
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
