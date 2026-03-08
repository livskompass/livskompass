import { type ReactNode } from 'react'
import { Pencil } from 'lucide-react'
import { useInlineEdit } from './InlineEditProvider'
import { getCmsUrl } from '../lib/cms-url'

interface EditableBlockProps {
  children: ReactNode
  blockType: string
  blockIndex: number
}

/** Human-friendly Swedish block type labels */
const BLOCK_LABELS: Record<string, string> = {
  Hero: 'Hero',
  RichText: 'Text',
  Image: 'Bild',
  Columns: 'Kolumner',
  Separator: 'Separator',
  CTABanner: 'CTA',
  CardGrid: 'Kort',
  Testimonial: 'Citat',
  Buttons: 'Knappar',
  PostGrid: 'Inlägg',
  PageCards: 'Sidkort',
  NavigationMenu: 'Meny',
  ImageGallery: 'Galleri',
  Video: 'Video',
  ContactForm: 'Kontakt',
  AccordionFAQ: 'FAQ',
}

export default function EditableBlock({ children, blockType, blockIndex }: EditableBlockProps) {
  const { isAdmin, pageData } = useInlineEdit()

  if (!isAdmin) return <>{children}</>

  const cmsUrl = pageData
    ? getCmsUrl(pageData.contentType, pageData.pageId, blockIndex)
    : null
  const label = BLOCK_LABELS[blockType] || blockType

  const handleClick = () => {
    if (cmsUrl) {
      window.open(cmsUrl, '_blank')
    }
  }

  return (
    <div className="group/edit relative">
      {children}

      {/* Dashed border overlay */}
      <div className="absolute inset-0 rounded-lg border-[1.5px] border-dashed border-forest-600 pointer-events-none opacity-0 group-hover/edit:opacity-50 transition-opacity duration-200" />

      {/* Edit button */}
      <button
        onClick={handleClick}
        className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2.5 py-1 bg-forest-600 text-white rounded-full text-[13px] font-medium leading-snug shadow-sm cursor-pointer border-none opacity-0 -translate-y-1 group-hover/edit:opacity-100 group-hover/edit:translate-y-0 transition-all duration-200"
        title={`Redigera ${label} i CMS`}
      >
        <Pencil className="w-3.5 h-3.5" />
        Redigera {label}
      </button>
    </div>
  )
}
