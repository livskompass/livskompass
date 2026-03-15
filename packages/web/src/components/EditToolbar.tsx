import { ExternalLink, X, Check, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { UI_STRINGS } from '@livskompass/shared'
import { getCmsUrl } from '../lib/cms-url'
import { useInlineEdit } from './InlineEditProvider'

interface EditToolbarProps {
  onHide: () => void
  savingStatus: 'idle' | 'saving' | 'saved' | 'error'
  editUiVisible?: boolean
  onToggleEditUi?: () => void
}

export default function EditToolbar({ onHide, savingStatus, editUiVisible = true, onToggleEditUi }: EditToolbarProps) {
  const { pageData } = useInlineEdit()
  const cmsUrl = pageData
    ? getCmsUrl(pageData.contentType, pageData.pageId)
    : null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 rounded-full bg-zinc-900/80 backdrop-blur-md px-2 py-1.5 shadow-2xl border border-white/10">
        {/* Edit mode badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-300">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          {UI_STRINGS.editToolbar.editMode}
        </span>
        <div className="w-px h-5 bg-white/20" />

        {/* Save status indicator */}
        {savingStatus !== 'idle' && (
          <>
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium">
              {savingStatus === 'saving' && (
                <>
                  <Loader2 className="h-3.5 w-3.5 text-white/60 animate-spin" />
                  <span className="text-white/60">{UI_STRINGS.editToolbar.saving}...</span>
                </>
              )}
              {savingStatus === 'saved' && (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                  <span className="text-emerald-300">{UI_STRINGS.editToolbar.saved}</span>
                </>
              )}
              {savingStatus === 'error' && (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-red-400">{UI_STRINGS.editToolbar.saveError}</span>
                </>
              )}
            </div>
            <div className="w-px h-5 bg-white/20" />
          </>
        )}

        {/* Toggle edit UI visibility */}
        {onToggleEditUi && (
          <>
            <button
              onClick={onToggleEditUi}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title={editUiVisible ? 'Hide edit overlays' : 'Show edit overlays'}
            >
              {editUiVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {editUiVisible ? 'Hide overlays' : 'Show overlays'}
            </button>
            <div className="w-px h-5 bg-white/20" />
          </>
        )}

        <a
          href={cmsUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {UI_STRINGS.editToolbar.openInCMS}
        </a>

        <div className="w-px h-5 bg-white/20" />

        <button
          onClick={onHide}
          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title={UI_STRINGS.editToolbar.hide}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
