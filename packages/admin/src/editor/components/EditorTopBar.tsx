import { ArrowLeft, Check, Loader2, AlertCircle, Globe } from 'lucide-react'
import { useEditor } from '../context'
import { VersionHistoryButton } from './VersionHistoryPanel'

interface EditorTopBarProps {
  user: { name: string; avatar_url: string; role: string } | null
  onBack: () => void
  onPublish: () => void
  onToggleHistory?: () => void
  isNew?: boolean
}

export function EditorTopBar({ user, onBack, onPublish, onToggleHistory, isNew }: EditorTopBarProps) {
  const { state } = useEditor()
  const { entity, saveStatus, isDirty, isPublished } = state

  return (
    <div
      className="fixed top-0 left-0 right-0 h-12 flex items-center justify-between px-4 border-b"
      style={{
        background: 'var(--editor-surface-glass)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--editor-border)',
        zIndex: 'var(--z-editor-toolbar)',
      }}
    >
      {/* Skip to content link — visible on focus only */}
      <a
        href="#editor-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-14 focus:z-50 focus:px-3 focus:py-1.5 focus:rounded-md focus:text-xs focus:font-medium focus:text-white"
        style={{ background: 'var(--editor-neutral-900)' }}
      >
        Skip to content
      </a>

      {/* Left: Back + Edit badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: 'var(--editor-text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--editor-text-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--editor-text-muted)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="w-px h-5" style={{ background: 'var(--editor-neutral-200)' }} />

        <div className="hidden sm:flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'var(--editor-green)' }}
          />
          <span className="text-xs font-medium" style={{ color: 'var(--editor-text-muted)' }}>
            Editing
          </span>
        </div>

        {entity && (
          <>
            <div className="hidden sm:block w-px h-5" style={{ background: 'var(--editor-neutral-200)' }} />
            <span
              className="text-sm font-medium truncate max-w-[140px] sm:max-w-[300px]"
              style={{ color: 'var(--editor-text-primary)' }}
            >
              {entity.title}
            </span>
          </>
        )}
      </div>

      {/* Center: Save status */}
      <div className="hidden sm:flex items-center gap-2">
        {saveStatus === 'saving' && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--editor-text-subtle)' }}>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Saving...
          </div>
        )}
        {saveStatus === 'saved' && (
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--editor-green)' }}
          >
            <Check className="h-3.5 w-3.5" />
            Saved
          </div>
        )}
        {saveStatus === 'error' && (
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--editor-red)' }}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Save failed
          </div>
        )}
      </div>

      {/* Right: Publish + User */}
      <div className="flex items-center gap-3">
        {onToggleHistory && (
          <VersionHistoryButton onClick={onToggleHistory} />
        )}

        <div className="w-px h-5" style={{ background: 'var(--editor-neutral-200)' }} />

        {isPublished && !isDirty && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              background: 'var(--editor-badge-published-bg)',
              color: 'var(--editor-badge-published-text)',
            }}
          >
            <Globe className="h-3 w-3" />
            Published
          </span>
        )}

        <button
          onClick={onPublish}
          disabled={!isNew && !isDirty && isPublished}
          className="px-3 py-1.5 rounded-md text-xs font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: isDirty || isNew ? 'var(--editor-blue)' : 'var(--editor-neutral-900)',
          }}
        >
          {isNew ? 'Create' : isDirty ? 'Publish Changes' : 'Published'}
        </button>

        {user && (
          <div className="hidden md:contents">
            <div className="w-px h-5" style={{ background: 'var(--editor-neutral-200)' }} />
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-7 h-7 rounded-full"
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                style={{
                  background: 'var(--editor-neutral-200)',
                  color: 'var(--editor-text-secondary)',
                }}
              >
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
