import { useState, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { History, RotateCcw, X, Clock, ChevronRight, AlertTriangle } from 'lucide-react'
import { getVersions, restoreVersion, type ContentVersion } from '../../lib/api'
import { useEditor } from '../context'

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr + 'Z') // D1 stores UTC
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr + 'Z')
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface VersionHistoryPanelProps {
  open: boolean
  onClose: () => void
}

export function VersionHistoryPanel({ open, onClose }: VersionHistoryPanelProps) {
  const { state, updateData, setEntity } = useEditor()
  const { entity, contentType } = state
  const [restoring, setRestoring] = useState<string | null>(null)
  const [confirmRestore, setConfirmRestore] = useState<ContentVersion | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['versions', contentType, entity?.id],
    queryFn: () => getVersions(contentType, entity!.id),
    enabled: open && !!entity,
  })

  const versions = data?.versions || []

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        if (confirmRestore) {
          setConfirmRestore(null)
        } else {
          onClose()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [open, confirmRestore, onClose])

  const handleRestore = useCallback(async (version: ContentVersion) => {
    if (!entity) return
    setRestoring(version.id)
    try {
      const result = await restoreVersion(version.id)
      if (result.success && result.entity) {
        // Update the editor state with the restored entity
        setEntity(
          { ...result.entity, content_blocks: result.entity.content_blocks },
          contentType,
        )
        // Parse and set the puck data
        if (result.entity.content_blocks) {
          try {
            updateData(JSON.parse(result.entity.content_blocks))
          } catch {
            console.error('Failed to parse restored content_blocks')
          }
        }
        setConfirmRestore(null)
        refetch()
      }
    } catch (err) {
      console.error('Restore failed:', err)
    } finally {
      setRestoring(null)
    }
  }, [entity, contentType, setEntity, updateData, refetch])

  if (!open) return null

  return (
    <div
      className="fixed top-12 right-0 bottom-0 flex flex-col"
      role="dialog"
      aria-label="Version history"
      style={{
        width: 320,
        background: 'var(--editor-surface-glass-heavy)',
        backdropFilter: 'blur(12px)',
        borderLeft: '1px solid var(--editor-border)',
        zIndex: 'var(--z-editor-popover)',
        animation: 'editor-slide-left 200ms ease forwards',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-zinc-500" />
          <span className="text-sm font-semibold text-zinc-700">Version history</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Info */}
      <div className="px-4 py-2 border-b border-zinc-50 text-[11px] text-zinc-400">
        A snapshot is saved each time you publish.
      </div>

      {/* Version list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-zinc-50 animate-pulse" />
            ))}
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Clock className="h-8 w-8 text-zinc-200 mb-3" />
            <p className="text-sm text-zinc-500 font-medium">No versions yet</p>
            <p className="text-xs text-zinc-400 mt-1">
              Versions are created automatically each time you publish.
            </p>
          </div>
        ) : (
          <div className="p-2">
            {versions.map((version, index) => (
              <button
                key={version.id}
                type="button"
                onClick={() => setConfirmRestore(version)}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-zinc-50 transition-colors group flex items-center gap-3"
              >
                <div className="flex-shrink-0">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: index === 0 ? 'var(--editor-green)' : 'var(--editor-neutral-300)',
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-700 truncate">
                    {version.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {formatRelativeTime(version.created_at)}
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Restore confirmation overlay */}
      {confirmRestore && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="mx-4 p-4 rounded-xl border border-zinc-200 bg-white shadow-lg max-w-[280px]">
            <div className="flex items-center gap-2 text-amber-600 mb-3">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-semibold">Restore version?</span>
            </div>
            <p className="text-xs text-zinc-500 mb-1">
              This will replace the current content with the version from:
            </p>
            <p className="text-xs font-medium text-zinc-700 mb-1">
              {confirmRestore.title}
            </p>
            <p className="text-[11px] text-zinc-400 mb-4">
              {formatFullDate(confirmRestore.created_at)}
            </p>
            <p className="text-[11px] text-zinc-400 mb-4">
              The current state will be saved as a snapshot before restoring.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmRestore(null)}
                disabled={!!restoring}
                className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRestore(confirmRestore)}
                disabled={!!restoring}
                className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                style={{ background: 'var(--editor-blue, #2563EB)' }}
              >
                <RotateCcw className={`h-3 w-3 ${restoring ? 'animate-spin' : ''}`} />
                {restoring ? 'Restoring...' : 'Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Trigger button for the top bar */
export function VersionHistoryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
      title="Version history"
    >
      <History className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">History</span>
    </button>
  )
}
