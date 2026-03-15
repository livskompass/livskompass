import { type ReactNode } from 'react'
import { Pencil, ExternalLink } from 'lucide-react'
import { getEditingSurface } from '@livskompass/shared'
import { useInlineEdit } from './InlineEditProvider'
import { getCmsUrl } from '../lib/cms-url'

interface EditableBlockProps {
  children: ReactNode
  blockType: string
  blockIndex: number
}

/** Human-friendly block type labels (CMS UI = English) */
const BLOCK_LABELS: Record<string, string> = {
  Hero: 'Hero',
  RichText: 'Text',
  ImageBlock: 'Image',
  Columns: 'Columns',
  SeparatorBlock: 'Separator',
  CTABanner: 'CTA',
  CardGrid: 'Cards',
  Testimonial: 'Testimonial',
  ButtonGroup: 'Buttons',
  PostGrid: 'Posts',
  PageCards: 'Page Cards',
  NavigationMenu: 'Menu',
  ImageGallery: 'Gallery',
  VideoEmbed: 'Video',
  AudioEmbed: 'Audio',
  FileEmbed: 'File',
  EmbedBlock: 'Embed',
  ContactForm: 'Contact',
  BookingForm: 'Booking',
  Accordion: 'FAQ',
  PageHeader: 'Header',
  PersonCard: 'Person',
  FeatureGrid: 'Features',
  StatsCounter: 'Stats',
  PricingTable: 'Pricing',
  CourseList: 'Courses',
  ProductList: 'Products',
  CourseInfo: 'Course Info',
  BookingCTA: 'Booking CTA',
  PostHeader: 'Post Header',
  Spacer: 'Spacer',
}

export default function EditableBlock({ children, blockType, blockIndex }: EditableBlockProps) {
  const { isAdmin, editUiVisible, pageData } = useInlineEdit()

  if (!isAdmin || !editUiVisible) return <>{children}</>

  const cmsUrl = pageData
    ? getCmsUrl(pageData.contentType, pageData.pageId, blockIndex)
    : null
  const label = BLOCK_LABELS[blockType] || blockType
  const surface = getEditingSurface(blockType)
  const isLinked = surface === 'linked'

  const handleClick = () => {
    if (cmsUrl) {
      window.open(cmsUrl, '_blank')
    }
  }

  return (
    <div className="group/edit relative">
      {children}

      {/* Dashed border overlay */}
      <div className="absolute inset-0 rounded-lg border-[1.5px] border-dashed border-blue-500 pointer-events-none opacity-0 group-hover/edit:opacity-50 transition-opacity duration-200" />

      {/* Edit button */}
      <button
        onClick={handleClick}
        className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-full text-[13px] font-medium leading-snug shadow-sm cursor-pointer border-none opacity-0 -translate-y-1 group-hover/edit:opacity-100 group-hover/edit:translate-y-0 transition-all duration-200"
        title={isLinked ? `Edit ${label} items in CMS` : `Edit ${label} in CMS`}
      >
        {isLinked ? <ExternalLink className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
        {isLinked ? `Edit ${label}` : `Edit ${label}`}
      </button>
    </div>
  )
}
