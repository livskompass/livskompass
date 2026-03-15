import { InlineRichTextContext } from '@livskompass/shared'
import { TiptapEditor } from './TiptapEditor'

/**
 * Provides InlineRichTextContext to all blocks rendered inside the editor.
 * Injects the TiptapEditor component so shared blocks can use it in admin mode.
 */
export function InlineRichTextProvider({ children }: { children: React.ReactNode }) {
  return (
    <InlineRichTextContext.Provider value={{ Editor: TiptapEditor }}>
      {children}
    </InlineRichTextContext.Provider>
  )
}
