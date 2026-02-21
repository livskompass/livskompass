import { useFetchJson } from '../helpers'

export interface PageCardsProps {
  heading: string
  parentSlug: string
  manualPages: Array<{ title: string; description: string; slug: string; icon: string }>
  columns: 2 | 3 | 4
  showDescription: boolean
  style: 'card' | 'list' | 'minimal'
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
}: PageCardsProps) {
  const { data, loading } = useFetchJson<PageData>(parentSlug ? `/pages/${parentSlug}` : '')

  const pages = parentSlug && data?.children
    ? data.children.map((p) => ({ title: p.title, description: p.meta_description || '', slug: p.slug, icon: '' }))
    : manualPages

  if (loading && parentSlug) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className={`grid grid-cols-1 ${colMap[columns] || colMap[3]} gap-4`}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-neutral-200 bg-white animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (style === 'list') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {heading && <h2 className="font-heading text-2xl font-bold text-neutral-800 mb-4 tracking-tight">{heading}</h2>}
        <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
          {pages.map((page, i) => (
            <a key={i} href={`/${page.slug}`} className="flex items-center justify-between p-4 bg-white hover:bg-neutral-50 transition-colors group">
              <div>
                <h3 className="font-medium text-neutral-800 group-hover:text-primary-600 transition-colors">{page.title}</h3>
                {showDescription && page.description && <p className="text-sm text-neutral-500 mt-0.5">{page.description}</p>}
              </div>
              <svg className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </a>
          ))}
        </div>
      </div>
    )
  }

  if (style === 'minimal') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {heading && <h2 className="font-heading text-2xl font-bold text-neutral-800 mb-4 tracking-tight">{heading}</h2>}
        <div className="flex flex-wrap gap-3">
          {pages.map((page, i) => (
            <a key={i} href={`/${page.slug}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:border-primary-300 hover:text-primary-600 transition-colors">
              {page.title}
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {heading && <h2 className="font-heading text-2xl font-bold text-neutral-800 mb-6 tracking-tight">{heading}</h2>}
      <div className={`grid grid-cols-1 ${colMap[columns] || colMap[3]} gap-4`}>
        {pages.map((page, i) => (
          <a key={i} href={`/${page.slug}`} className="rounded-xl border border-neutral-200 bg-white p-5 card-hover group block">
            <h3 className="font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors mb-1">{page.title}</h3>
            {showDescription && page.description && <p className="text-sm text-neutral-500 line-clamp-2">{page.description}</p>}
          </a>
        ))}
        {pages.length === 0 && (
          <div className="col-span-full text-center py-12 text-neutral-400 border-2 border-dashed border-neutral-200 rounded-lg">
            {parentSlug ? 'Inga undersidor hittades' : 'Lägg till sidor manuellt eller ange en föräldersida'}
          </div>
        )}
      </div>
    </div>
  )
}
