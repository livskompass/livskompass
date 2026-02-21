import { useFetchJson, useScrollReveal } from '../helpers'

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

interface PageData {
  page: { title: string }
  children: Array<{ slug: string; title: string; meta_description: string }>
}

export function PageCards({
  heading = '',
  parentSlug = '',
  manualPages = [],
  columns = 3,
  showDescription = true,
  style = 'card',
  emptyText = 'Inga undersidor hittades',
  emptyManualText = 'Lägg till sidor manuellt eller ange en föräldersida',
}: PageCardsProps) {
  const { data, loading } = useFetchJson<PageData>(parentSlug ? `/pages/${parentSlug}` : '')

  const revealRef = useScrollReveal()

  const pages = parentSlug && data?.children
    ? data.children.map((p) => ({ title: p.title, description: p.meta_description || '', slug: p.slug, icon: '' }))
    : manualPages

  if (loading && parentSlug) {
    return (
      <div className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        <div className={`grid grid-cols-1 ${colMap[columns] || colMap[3]} gap-4`}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-stone-200 bg-white animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (style === 'list') {
    return (
      <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        {heading && <h2 className="text-h3 text-stone-800 mb-4 reveal">{heading}</h2>}
        <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
          {pages.map((page, i) => (
            <a key={i} href={`/${page.slug}`} className="flex items-center justify-between p-4 bg-white hover:bg-stone-50 transition-colors group">
              <div>
                <h3 className="font-medium text-stone-800 group-hover:text-forest-600 transition-colors">{page.title}</h3>
                {showDescription && page.description && <p className="text-sm text-stone-500 mt-0.5">{page.description}</p>}
              </div>
              <svg className="w-5 h-5 text-stone-400 group-hover:text-forest-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </a>
          ))}
        </div>
      </div>
    )
  }

  if (style === 'minimal') {
    return (
      <div ref={revealRef} className="mx-auto" style={{ maxWidth: 'var(--width-content)', paddingInline: 'var(--container-px)', paddingBlock: 'var(--section-md)' }}>
        {heading && <h2 className="text-h3 text-stone-800 mb-4 reveal">{heading}</h2>}
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
      {heading && <h2 className="text-h3 text-stone-800 mb-6 reveal">{heading}</h2>}
      <div className={`grid grid-cols-1 ${colMap[columns] || colMap[3]} gap-4 reveal`}>
        {pages.map((page, i) => (
          <a key={i} href={`/${page.slug}`} className="rounded-xl border border-stone-200 bg-white p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group block">
            <h3 className="font-semibold text-stone-800 group-hover:text-forest-600 transition-colors mb-1">{page.title}</h3>
            {showDescription && page.description && <p className="text-sm text-stone-500 line-clamp-2">{page.description}</p>}
          </a>
        ))}
        {pages.length === 0 && (
          <div className="col-span-full text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
            {parentSlug ? emptyText : emptyManualText}
          </div>
        )}
      </div>
    </div>
  )
}
