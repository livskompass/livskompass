import { useEffect } from 'react'
import { injectPreviewCSS } from '../inject-preview-css'
import { usePropUpdateListener } from '../inline-edit-bridge'
import { ComponentToolbar } from './ComponentToolbar'

export function createEditorOverrides() {
  return {
    iframe: ({ children, document: iframeDoc }: any) => {
      usePropUpdateListener()
      useEffect(() => {
        if (!iframeDoc) return
        injectPreviewCSS(iframeDoc)
      }, [iframeDoc])
      return <>{children}</>
    },
    componentOverlay: ComponentToolbar,
  }
}
