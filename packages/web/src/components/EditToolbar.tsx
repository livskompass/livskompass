import { ExternalLink, X, Check, Loader2, AlertCircle } from 'lucide-react'

interface EditToolbarProps {
  onHide: () => void
  savingStatus: 'idle' | 'saving' | 'saved' | 'error'
}

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || ''

export default function EditToolbar({ onHide, savingStatus }: EditToolbarProps) {
  const getCmsUrl = () => {
    if (!ADMIN_URL) return null
    const path = window.location.pathname
    if (path.startsWith('/utbildningar/') && path.split('/').length === 3) {
      return `${ADMIN_URL}/utbildningar/${path.split('/')[2]}`
    }
    if (path.startsWith('/nyhet/') && path.split('/').length === 3) {
      return `${ADMIN_URL}/nyheter/${path.split('/')[2]}`
    }
    const slug = path === '/' ? 'hem' : path.slice(1)
    return `${ADMIN_URL}/sidor?slug=${slug}`
  }

  const cmsUrl = getCmsUrl()
  if (!cmsUrl) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 rounded-full bg-stone-900/80 backdrop-blur-md px-2 py-1.5 shadow-2xl border border-white/10">
        {/* Save status indicator */}
        {savingStatus !== 'idle' && (
          <>
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium">
              {savingStatus === 'saving' && (
                <>
                  <Loader2 className="h-3.5 w-3.5 text-white/60 animate-spin" />
                  <span className="text-white/60">Sparar...</span>
                </>
              )}
              {savingStatus === 'saved' && (
                <>
                  <Check className="h-3.5 w-3.5 text-forest-300" />
                  <span className="text-forest-300">Sparat</span>
                </>
              )}
              {savingStatus === 'error' && (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-[#E96B63]" />
                  <span className="text-[#E96B63]">Fel vid sparning</span>
                </>
              )}
            </div>
            <div className="w-px h-5 bg-white/20" />
          </>
        )}

        <a
          href={cmsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Öppna i CMS
        </a>

        <div className="w-px h-5 bg-white/20" />

        <button
          onClick={onHide}
          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Dölj"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
