import { ArrowLeft, Check, Loader2, AlertCircle, Globe } from 'lucide-react'
import { useEditor } from '../context'

interface EditorTopBarProps {
  user: { name: string; avatar_url: string; role: string } | null
  onBack: () => void
  onPublish: () => void
}

export function EditorTopBar({ user, onBack, onPublish }: EditorTopBarProps) {
  const { state } = useEditor()
  const { entity, saveStatus, isDirty, isPublished } = state

  return (
    <div
      className="fixed top-0 left-0 right-0 h-12 flex items-center justify-between px-4 border-b"
      style={{
        background: 'var(--editor-toolbar-bg)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(0, 0, 0, 0.06)',
        zIndex: 'var(--z-editor-toolbar)',
      }}
    >
      {/* Left: Back + Edit badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="w-px h-5 bg-stone-200" />

        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'var(--editor-green)' }}
          />
          <span className="text-xs font-medium text-stone-500">Editing</span>
        </div>

        {entity && (
          <>
            <div className="w-px h-5 bg-stone-200" />
            <span className="text-sm font-medium text-stone-900 truncate max-w-[300px]">
              {entity.title}
            </span>
          </>
        )}
      </div>

      {/* Center: Save status */}
      <div className="flex items-center gap-2">
        {saveStatus === 'saving' && (
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
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
          disabled={!isDirty && isPublished}
          className="px-3 py-1.5 rounded-md text-xs font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: isDirty ? 'var(--editor-blue)' : '#18181B',
          }}
        >
          {isDirty ? 'Publish Changes' : 'Published'}
        </button>

        {user && (
          <>
            <div className="w-px h-5 bg-stone-200" />
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-7 h-7 rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-xs font-medium text-stone-600">
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
