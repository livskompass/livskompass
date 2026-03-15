import React, { useState, useContext } from 'react'
import { Plus } from 'lucide-react'
import { useFetchJson, useScrollReveal } from '../helpers'
import { useInlineEdit, useEditableText, useInlineEditBlock, InlineArrayOpsContext } from '../context'
import { cn } from '../ui/utils'
import { EditItemBadge } from './EditItemBadge'
import { ArrayItemControls, ArrayDragProvider, AddItemButton } from './ArrayItemControls'

export interface PageCardsProps {
  heading: string
  parentSlug: string
  manualPages: Array<{ title: string; description: string; slug: string; icon: string }>
  columns: 2 | 3 | 4
  showDescription: boolean
  style: 'card' | 'list' | 'minimal'
  emptyText: string
  emptyManualText: string
}

const colMap = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 lg:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' }

/** Extract event handlers from editable props (everything except className) */
function editHandlers(edit: ReturnType<typeof useEditableText>) {
  if (!edit) return {}
  const { className: _, ...rest } = edit
  return rest
}

interface PageData {
  page: { title: string }
  children: Array<{ id: string; slug: string; title: string; meta_description: string }>
}

export function PageCards({
  heading = '',
  parentSlug = '',
  manualPages = [],
  columns = 3,
  showDescription = true,
  style = 'card',
  emptyText = 'No subpages found',
  emptyManualText = 'Add pages manually or specify a parent page',
  id,
}: PageCardsProps & { puck?: { isEditing: boolean }; id?: string }) {
  // Puck editor inline editing (via postMessage)
  const headingPuck = useInlineEdit('heading', heading, id || '')
  // Public site admin editing (via InlineEditBlockContext)
  const headingEditCtx = useEditableText('heading', heading)
  const emptyTextEdit = useEditableText('emptyText', emptyText)
  const emptyManualTextEdit = useEditableText('emptyManualText', emptyManualText)
  // Puck takes priority
  const headingEdit = headingPuck || headingEditCtx

  const { data, loading } = useFetchJson<PageData>(parentSlug ? `/pages/${parentSlug}` : '')

  // For manual pages, fetch each page's data to get title/description
  const manualSlugs = !parentSlug && manualPages.length > 0
    ? manualPages.map((p) => p.slug).filter(Boolean).join(',')
    : ''
  const { data: allPages } = useFetchJson<{ pages: Array<{ id: string; slug: string; title: string; meta_description: string }> }>(
    manualSlugs ? '/pages' : ''
  )

  const revealRef = useScrollReveal()

  const pages = parentSlug && data?.children
    ? data.children.map((p) => ({ id: p.id, title: p.title, description: p.meta_description || '', slug: p.slug, icon: '' }))
    : manualPages.map((p) => {
        // Look up page data from the pages list
        const pageData = allPages?.pages?.find((pg) => pg.slug === p.slug)
        return {
          id: pageData?.id || '',
          title: pageData?.title || p.title || p.slug || '',
          description: pageData?.meta_description || p.description || '',
          slug: p.slug,
          icon: p.icon || '',
        }
      })

  if (loading && parentSlug) {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        <div className={`grid grid-cols-1 ${colMap[columns] || colMap[3]} gap-4`}>
          {Array.from({ length: Math.min(columns, 3) }).map((_, i) => (
            <div key={i} className="rounded-xl border border-stone-200 bg-white overflow-hidden animate-pulse">
              <div className="p-5 space-y-3">
                <div className="h-5 bg-stone-100 rounded w-3/4" />
                <div className="h-4 bg-stone-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (style === 'list') {
    return (
      <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        {(heading || headingEdit) && <h2 {...editHandlers(headingEdit)} className={cn('text-h3 text-stone-800 mb-4 reveal', headingEdit?.className)}>{heading}</h2>}
        <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
          {pages.map((page, i) => (
            <div key={i} className="relative group flex items-center justify-between p-4 bg-white hover:bg-stone-50 transition-colors">
              <EditItemBadge cmsRoute="pages" entityId={page.id} slug={page.slug} label="Edit page" />
              <a href={`/${page.slug}`} className="flex items-center justify-between flex-1">
                <div>
                  <h3 className="font-medium text-stone-800 group-hover:text-forest-600 transition-colors">{page.title}</h3>
                  {showDescription && page.description && <p className="text-sm text-stone-500 mt-0.5">{page.description}</p>}
                </div>
                <svg className="w-5 h-5 text-stone-400 group-hover:text-forest-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (style === 'minimal') {
    return (
      <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        {(heading || headingEdit) && <h2 {...editHandlers(headingEdit)} className={cn('text-h3 text-stone-800 mb-4 reveal', headingEdit?.className)}>{heading}</h2>}
        <div className="flex flex-wrap gap-3">
          {pages.map((page, i) => (
            <a key={i} href={`/${page.slug}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 bg-white text-sm font-medium text-stone-700 hover:border-forest-300 hover:text-forest-600 transition-colors">
              {page.title}
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
      {(heading || headingEdit) && <h2 {...editHandlers(headingEdit)} className={cn('text-h3 text-stone-800 mb-6 reveal', headingEdit?.className)}>{heading}</h2>}
      <ArrayDragProvider fieldName="manualPages">
      <div className={`grid grid-cols-1 ${colMap[columns] || colMap[3]} gap-4 reveal`}>
        {pages.map((page, i) => (
          <ArrayItemControls key={i} fieldName="manualPages" itemIndex={i} totalItems={pages.length}>
          <div className="relative group rounded-xl border border-stone-200 bg-white p-5 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2">
            <EditItemBadge cmsRoute="pages" entityId={page.id} label="Edit page" slug={page.slug} />
            <a href={`/${page.slug}`} className="block">
              <h3 className="font-semibold text-stone-800 group-hover:text-forest-600 transition-colors mb-1">{page.title}</h3>
              {showDescription && page.description && <p className="text-sm text-stone-500 line-clamp-2">{page.description}</p>}
            </a>
          </div>
          </ArrayItemControls>
        ))}
        {pages.length === 0 && (
          <div className="col-span-full text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
            {parentSlug
              ? <span {...editHandlers(emptyTextEdit)} className={emptyTextEdit?.className}>{emptyText}</span>
              : <span {...editHandlers(emptyManualTextEdit)} className={emptyManualTextEdit?.className}>{emptyManualText}</span>
            }
          </div>
        )}
      </div>
      </ArrayDragProvider>
      {!parentSlug && <AddPageButton allPages={allPages?.pages || []} fieldName="manualPages" existingSlugs={manualPages.map(p => p.slug)} />}
    </div>
  )
}

/** Custom "Add page" button that shows a page picker popover on click */
function AddPageButton({ allPages, fieldName, existingSlugs }: {
  allPages: Array<{ id: string; slug: string; title: string; meta_description: string }>
  fieldName: string
  existingSlugs: string[]
}) {
  const editCtx = useInlineEditBlock()
  const arrayOps = useContext(InlineArrayOpsContext)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  if (!editCtx || !arrayOps) return null

  const filtered = allPages
    .filter((p) => !existingSlugs.includes(p.slug))
    .filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase()))

  const handleSelect = (slug: string) => {
    // Add the page to manualPages array
    const { blockIndex } = editCtx
    arrayOps.addItem(blockIndex, fieldName)
    // The addItem creates an empty item — we need to set its slug
    // Use a timeout to let React update, then set the slug on the new item
    setTimeout(() => {
      editCtx.saveBlockProp(blockIndex, `${fieldName}[${existingSlugs.length}].slug`, slug)
    }, 50)
    setOpen(false)
    setSearch('')
  }

  return (
    <div className="relative mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border-2 border-dashed border-blue-300 text-blue-500 text-sm font-medium hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add page
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg border border-zinc-200 shadow-lg z-50 max-h-[300px] overflow-hidden flex flex-col">
          <div className="p-2 border-b border-zinc-100">
            <input
              type="text"
              placeholder="Search pages..."
              className="w-full text-sm px-2.5 py-1.5 rounded-md border border-zinc-200 bg-white outline-none focus:border-blue-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.slice(0, 20).map((p) => (
              <button
                key={p.slug}
                onClick={() => handleSelect(p.slug)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors border-b border-zinc-50 last:border-0"
              >
                <span className="font-medium text-zinc-800">{p.title}</span>
                <span className="text-[10px] text-zinc-400 ml-2">/{p.slug}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-4 text-sm text-zinc-400">No pages found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

