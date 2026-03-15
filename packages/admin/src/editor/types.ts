// ── Puck-compatible Data type (local definition to avoid @puckeditor/core dependency) ──

export interface Data {
  content: Array<{ type: string; props: Record<string, any> }>
  root: { props: Record<string, any> }
  zones?: Record<string, Array<{ type: string; props: Record<string, any> }>>
}

// ── Content Types ──

export type ContentType = 'page' | 'post' | 'course' | 'product'

export interface ContentEntity {
  id: string
  slug: string
  title: string
  status: string
  content_blocks: string | null
  editor_version: string | null
  updated_at: string
  draft: string | null
}

// ── Editor State ──

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export type PublishState = 'draft' | 'published' | 'unpublished-changes'

export interface EditorState {
  /** The content entity being edited */
  entity: ContentEntity | null
  contentType: ContentType
  /** Parsed Puck data */
  puckData: Data | null
  /** Currently hovered block index */
  hoveredBlockId: string | null
  /** Currently selected block index */
  selectedBlockId: string | null
  /** Block + field currently being edited inline */
  editingBlockId: string | null
  editingField: string | null
  /** Auto-save status */
  saveStatus: SaveStatus
  /** Whether the editor is in "dirty" state (unsaved changes since last draft save) */
  isDirty: boolean
  /** Whether the content has been published since last edit */
  isPublished: boolean
  /** Whether draft content differs from published content */
  hasDraftChanges: boolean
  /** Derived publish state: draft | published | unpublished-changes */
  publishState: PublishState
}

// ── Editor Actions ──

export type EditorAction =
  | { type: 'SET_ENTITY'; entity: ContentEntity; contentType: ContentType }
  | { type: 'SET_PUCK_DATA'; data: Data }
  | { type: 'SET_HOVERED'; blockId: string | null }
  | { type: 'SET_SELECTED'; blockId: string | null }
  | { type: 'ENTER_EDIT'; blockId: string; field: string }
  | { type: 'EXIT_EDIT' }
  | { type: 'SET_SAVE_STATUS'; status: SaveStatus }
  | { type: 'MARK_DIRTY' }
  | { type: 'MARK_CLEAN' }
  | { type: 'MARK_PUBLISHED' }
  | { type: 'SET_DRAFT_STATE'; hasDraftChanges: boolean }
  | { type: 'UNDO' }
  | { type: 'REDO' }

// ── Component Props ──

export interface EditableBlockProps {
  /** The Puck block component type name */
  blockType: string
  /** Index in the content array */
  blockIndex: number
  /** Unique block ID from Puck */
  blockId: string
  /** The block's props */
  blockProps: Record<string, unknown>
  /** Whether this block is hovered */
  isHovered: boolean
  /** Whether this block is selected */
  isSelected: boolean
  /** Whether this block is being edited */
  isEditing: boolean
  children: React.ReactNode
}

export interface FloatingToolbarProps {
  /** The selected block's bounding rect */
  blockRect: DOMRect | null
  /** Block type label to display */
  blockType: string
  /** Block index for reorder/delete actions */
  blockIndex: number
  /** Total number of blocks (for disabling up/down) */
  totalBlocks: number
  /** Callbacks */
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
  onSettings: () => void
}

export interface EditorTopBarProps {
  /** User info from auth */
  user: { name: string; avatar_url: string; role: string } | null
  /** Page title (editable) */
  title: string
  onTitleChange: (title: string) => void
  /** Save status */
  saveStatus: SaveStatus
  /** Publish action */
  onPublish: () => void
  /** Whether content is published */
  isPublished: boolean
  /** Back navigation */
  onBack: () => void
}

export interface BlockInserterProps {
  /** Position between blocks (index = insert before this index) */
  insertIndex: number
  /** Callback when a block type is chosen */
  onInsert: (blockType: string) => void
}

// ── Field Classification ──

export interface FieldMetadata {
  /** Whether this field can be edited inline on the canvas */
  inline: boolean
  /** Field type for determining edit UI */
  editType: 'text' | 'richtext' | 'image' | 'select' | 'array' | 'number' | 'radio' | 'custom'
  /** Human-readable label */
  label: string
}

/** Map of block type → field name → metadata */
export type FieldClassification = Record<string, Record<string, FieldMetadata>>
