import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link as LinkIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Check,
  X,
  ArrowLeft,
} from 'lucide-react'

interface TiptapEditorProps {
  content: string
  onSave: (html: string) => void
  onCancel: () => void
  className?: string
  placeholder?: string
}

/** Sanitize pasted HTML — strip inline styles, classes, data-* attrs, font/span wrappers */
function cleanPastedHTML(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html

  div.querySelectorAll('*').forEach((el) => {
    // Preserve color style, strip everything else
    const color = (el as HTMLElement).style?.color
    el.removeAttribute('style')
    if (color) (el as HTMLElement).style.color = color
    el.removeAttribute('class')
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-')) {
        el.removeAttribute(attr.name)
      }
    })
  })

  // Unwrap font elements but keep spans (Tiptap uses spans for text color)
  div.querySelectorAll('font').forEach((el) => {
    const parent = el.parentNode
    while (el.firstChild) {
      parent?.insertBefore(el.firstChild, el)
    }
    parent?.removeChild(el)
  })

  return div.innerHTML
}

export function TiptapEditor({ content, onSave, onCancel, className, placeholder }: TiptapEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const linkInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
    ],
    content,
    editorProps: {
      attributes: {
        class: className || '',
      },
      transformPastedHTML: cleanPastedHTML,
    },
    onBlur({ editor, event }) {
      // Don't save if focus moved to the toolbar
      const related = (event as FocusEvent).relatedTarget as HTMLElement
      if (related?.closest('.tiptap-toolbar')) return

      const html = editor.getHTML()
      onSave(html)
    },
  })

  // Auto-focus on mount
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      // Small delay to let the editor mount
      const t = setTimeout(() => editor.commands.focus('end'), 50)
      return () => clearTimeout(t)
    }
  }, [editor])

  // Handle ESC to cancel
  useEffect(() => {
    if (!editor) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onCancel()
      }
    }
    const el = wrapperRef.current
    el?.addEventListener('keydown', handleKeyDown)
    return () => el?.removeEventListener('keydown', handleKeyDown)
  }, [editor, onCancel])

  // Update toolbar position when editor state changes
  useEffect(() => {
    if (!editor || !wrapperRef.current) return

    const updatePos = () => {
      if (!editor.isFocused) {
        setToolbarPos(null)
        return
      }
      const el = wrapperRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setToolbarPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      })
    }

    // Listen for selection changes and editor updates
    editor.on('selectionUpdate', updatePos)
    editor.on('focus', updatePos)
    editor.on('blur', ({ event }) => {
      const related = (event as FocusEvent).relatedTarget as HTMLElement
      if (related?.closest('.tiptap-toolbar')) return
      setToolbarPos(null)
    })
    updatePos()

    return () => {
      editor.off('selectionUpdate', updatePos)
      editor.off('focus', updatePos)
    }
  }, [editor])

  // Link handling
  const handleLink = useCallback(() => {
    if (!editor) return
    const existing = editor.getAttributes('link').href || ''
    setLinkUrl(existing)
    setShowLinkInput(true)
    setTimeout(() => linkInputRef.current?.focus(), 50)
  }, [editor])

  const applyLink = useCallback(() => {
    if (!editor) return
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    }
    setShowLinkInput(false)
    setLinkUrl('')
  }, [editor, linkUrl])

  const cancelLink = useCallback(() => {
    setShowLinkInput(false)
    setLinkUrl('')
    editor?.commands.focus()
  }, [editor])

  const handleDone = useCallback(() => {
    if (!editor) return
    onSave(editor.getHTML())
  }, [editor, onSave])

  if (!editor) return null

  const portalRoot = document.getElementById('editor-portals') || document.body

  return (
    <div ref={wrapperRef}>
      <EditorContent
        editor={editor}
        className={!content ? 'tiptap-empty' : undefined}
        data-placeholder={placeholder}
      />

      {/* Floating toolbar */}
      {toolbarPos &&
        createPortal(
          <div
            className="fixed tiptap-toolbar pointer-events-auto"
            style={{
              left: Math.max(8, Math.min(toolbarPos.x - (showLinkInput ? 130 : 190), window.innerWidth - (showLinkInput ? 260 : 380) - 8)),
              top: toolbarPos.y,
              transform: 'translateY(-100%)',
              zIndex: 'var(--z-editor-popover)',
              animation: 'editor-bounce-in 100ms var(--editor-ease) forwards',
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div
              className="flex items-center gap-px rounded-lg px-1 py-0.5"
              style={{
                background: 'var(--editor-surface-dark)',
                backdropFilter: 'blur(8px)',
                boxShadow: 'var(--editor-shadow-dark)',
              }}
              role="toolbar"
              aria-label="Text formatting"
            >
              {showLinkInput ? (
                <div className="flex items-center gap-1 px-1">
                  <input
                    ref={linkInputRef}
                    type="url"
                    placeholder="https://..."
                    className="text-xs bg-transparent text-white outline-none w-36 px-1"
                    style={{ color: 'var(--editor-text-on-dark-hover)' }}
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') applyLink()
                      if (e.key === 'Escape') cancelLink()
                    }}
                  />
                  <TbBtn icon={<Check className="h-3 w-3" />} label="Apply link" onClick={applyLink} />
                  <TbBtn icon={<X className="h-3 w-3" />} label="Cancel" onClick={cancelLink} />
                </div>
              ) : (
                <>
                  <TbBtn icon={<Bold className="h-3.5 w-3.5" />} label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} />
                  <TbBtn icon={<Italic className="h-3.5 w-3.5" />} label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} />
                  <TbBtn icon={<UnderlineIcon className="h-3.5 w-3.5" />} label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} />
                  <TbBtn icon={<Strikethrough className="h-3.5 w-3.5" />} label="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} />

                  <TbDiv />

                  <TbBtn icon={<Heading2 className="h-3.5 w-3.5" />} label="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} />
                  <TbBtn icon={<Heading3 className="h-3.5 w-3.5" />} label="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} />
                  <TbBtn icon={<Quote className="h-3.5 w-3.5" />} label="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} />

                  <TbDiv />

                  <TbBtn icon={<List className="h-3.5 w-3.5" />} label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} />
                  <TbBtn icon={<ListOrdered className="h-3.5 w-3.5" />} label="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} />

                  <TbDiv />

                  <TbBtn icon={<LinkIcon className="h-3.5 w-3.5" />} label="Link" onClick={handleLink} active={editor.isActive('link')} />

                  <TbDiv />

                  {/* Text color swatches */}
                  {[
                    { color: null, label: 'Default', css: 'bg-stone-800' },
                    { color: '#ffffff', label: 'White', css: 'bg-white border border-zinc-300' },
                    { color: 'rgb(0, 70, 56)', label: 'Brand', css: 'bg-[#004638]' },
                    { color: 'rgb(20, 110, 90)', label: 'Accent', css: 'bg-[#146E5A]' },
                    { color: 'rgb(255, 233, 98)', label: 'Yellow', css: 'bg-[#FFE962]' },
                    { color: 'rgb(138, 132, 122)', label: 'Muted', css: 'bg-[#8A847A]' },
                  ].map((swatch) => (
                    <button
                      key={swatch.label}
                      type="button"
                      onClick={() => {
                        if (swatch.color === null) {
                          editor.chain().focus().unsetColor().run()
                        } else {
                          editor.chain().focus().setColor(swatch.color).run()
                        }
                      }}
                      className={`w-5 h-5 rounded-full shrink-0 ${swatch.css} ${
                        (swatch.color === null && !editor.getAttributes('textStyle').color) ||
                        editor.getAttributes('textStyle').color === swatch.color
                          ? 'ring-2 ring-white ring-offset-1 ring-offset-zinc-800'
                          : ''
                      }`}
                      title={swatch.label}
                    />
                  ))}

                  <TbDiv />

                  <TbBtn icon={<ArrowLeft className="h-3.5 w-3.5" />} label="Done" onClick={handleDone} />
                </>
              )}
            </div>
          </div>,
          portalRoot,
        )}
    </div>
  )
}

function TbBtn({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      className="flex items-center justify-center w-7 h-7 rounded-md transition-colors"
      style={{
        background: active ? 'var(--editor-surface-active-dark)' : 'transparent',
        color: active ? 'var(--editor-text-on-dark-active)' : 'var(--editor-text-on-dark)',
      }}
      onClick={onClick}
      aria-label={label}
      title={label}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = 'var(--editor-text-on-dark-hover)'
          e.currentTarget.style.background = 'var(--editor-surface-hover-dark)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = active ? 'var(--editor-text-on-dark-active)' : 'var(--editor-text-on-dark)'
        e.currentTarget.style.background = active ? 'var(--editor-surface-active-dark)' : 'transparent'
      }}
    >
      {icon}
    </button>
  )
}

function TbDiv() {
  return <div className="w-px h-4 mx-0.5" style={{ background: 'var(--editor-neutral-600)' }} />
}
