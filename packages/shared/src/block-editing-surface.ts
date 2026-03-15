/**
 * Block Editing Surface Classification
 *
 * Every block falls into one of two editing surfaces:
 *
 * 'inline' — All content is edited directly on the canvas.
 *   Click text to edit, click images to replace, use visual controls for layout.
 *   Badge: pencil icon + "Edit inline"
 *
 * 'linked' — Contains items that link to separate editor pages.
 *   Cards/items open their own editor in a new tab. Headings may still be inline.
 *   Badge: external-link icon + "Edit items separately"
 *
 * This classification is the single source of truth — used by:
 * - FloatingToolbar (block-level badge)
 * - BlockPanel (label per block in the sidebar)
 * - EditableBlock on public site (admin overlay)
 */

export type EditingSurface = 'inline' | 'linked'

/**
 * Classification of all block types by their primary editing surface.
 *
 * 'inline': Everything editable on the canvas (text, images, settings).
 * 'linked': Contains data-bound items that open separate editors.
 */
export const BLOCK_EDITING_SURFACE: Record<string, EditingSurface> = {
  // Layout — inline only
  Columns: 'inline',
  SeparatorBlock: 'inline',
  Spacer: 'inline',

  // Content — inline only
  Hero: 'inline',
  RichText: 'inline',
  ImageBlock: 'inline',
  Accordion: 'inline',
  PageHeader: 'inline',
  PersonCard: 'inline',
  FeatureGrid: 'inline',
  StatsCounter: 'inline',

  // Marketing — inline only
  CTABanner: 'inline',
  CardGrid: 'inline', // manual cards are inline; dynamic source is linked, but default is inline
  Testimonial: 'inline',
  ButtonGroup: 'inline',
  PricingTable: 'inline',

  // Media — inline only
  ImageGallery: 'inline',
  VideoEmbed: 'inline',
  AudioEmbed: 'inline',
  FileEmbed: 'inline',
  EmbedBlock: 'inline',

  // Dynamic — linked (items open separate editors)
  CourseList: 'linked',
  ProductList: 'linked',
  PostGrid: 'linked',
  PageCards: 'linked',
  NavigationMenu: 'inline',

  // Interactive — inline (form fields editable on canvas)
  ContactForm: 'inline',
  BookingForm: 'inline',

  // Data-bound — linked (shows data from parent entity)
  CourseInfo: 'linked',
  BookingCTA: 'inline',
  PostHeader: 'inline',
}

/** Get the editing surface for a block type. Defaults to 'inline'. */
export function getEditingSurface(blockType: string): EditingSurface {
  return BLOCK_EDITING_SURFACE[blockType] || 'inline'
}

/** Human-readable label for each surface type */
export const SURFACE_LABELS: Record<EditingSurface, string> = {
  inline: 'Edit on canvas',
  linked: 'Items open separately',
}
