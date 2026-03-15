# Inline CMS Editor — Architecture & API Reference

## Overview

Full-screen inline editor at `/inline/{type}/:id` that renders Puck blocks directly on a canvas (no iframe). Users hover, click, and edit content in-place with live auto-save.

Built on top of Puck (`@puckeditor/core` v0.21.1) block definitions from `packages/shared/src/puck-config.tsx`.

## Routes

| Route | Content Type |
|---|---|
| `/inline/sidor/:id` | Page |
| `/inline/nyheter/:id` | Post |
| `/inline/utbildningar/:id` | Course |
| `/inline/material/:id` | Product |

## Architecture

```
InlineEditorPage (route entry)
  └─ EditorProvider (context + auto-save)
       └─ InlineEditorInner
            ├─ EditorTopBar (back, title, save status, publish)
            ├─ BlockList (renders all blocks)
            │    ├─ BlockInserter (+ button between blocks)
            │    └─ EditableBlock (hover/select/edit states, drag handle)
            │         └─ InlineEditBlockContext.Provider
            │              └─ <BlockComponent {...props} />
            ├─ SelectedBlockArrayControls (add items for array blocks)
            ├─ SelectedBlockToolbar → FloatingToolbar
            │    └─ SettingsPopover (gear icon → field editors)
            ├─ RichTextToolbar (formatting for RichText blocks)
            └─ SaveStatusAnnouncer (aria-live region)
```

## Data Flow

```
User edits text → useEditableText onBlur
  → InlineEditBlockContext.saveBlockProp(blockIndex, propName, value)
  → BlockList.saveBlockProp → setNestedProp → updateData(newPuckData)
  → EditorContext.updateDataWithSave → dispatch SET_PUCK_DATA
  → autoSave (1s debounce) → PATCH /api/admin/{type}/{id}
  → conflict detection via updated_at (409 = stale)
```

## Components

### InlineEditorPage
Entry point. Wraps everything in `EditorProvider`. Handles auth check, entity loading, publish.

**Props:** `{ contentType: 'page' | 'post' | 'course' | 'product' }`

### EditorTopBar
Fixed top bar with back button, entity title, save status indicator, publish button.

**Props:** `{ user, onBack, onPublish }`

### BlockList
Renders all Puck blocks from `puckData.content`. Each block is wrapped in:
1. `EditableBlock` — hover/select/edit visual states + drag handle
2. `InlineEditBlockContext.Provider` — bridges inline editing to auto-save

### EditableBlock
Visual wrapper with 4 states: View, Hover (dashed outline), Selected (blue ring), Editing (blue ring).

**Props:** `{ blockId, blockType, blockLabel, blockIndex, onDragStart?, isDragSource?, children }`

Shows drag handle on left edge (hover/select). Block type label badge on top-right.

### FloatingToolbar
Pill-shaped toolbar positioned above selected block via React portal.

**Actions:** Move up/down, duplicate, delete (with confirmation), settings.

### SettingsPopover
Floating panel with field editors for all non-inline block props. Supports all 6 Puck field types:
- `text` — input (or MediaPickerField for `metadata.isImage`)
- `textarea` — textarea
- `select` — dropdown
- `radio` — pill-style toggle buttons
- `number` — numeric input
- `array` — expandable list with add/remove + nested field editors

### BlockInserter
"+" button between blocks. Opens a categorized block picker dropdown with search.

**Categories:** Layout, Content, Marketing, Media, Dynamic, Interactive, Data-bound.

### RichTextToolbar
Dark floating toolbar for formatting RichText block content. Appears when focusing contentEditable inside a RichText block.

**Actions:** Bold, Italic, Underline, Strikethrough, H2, H3, Blockquote, Bullet list, Numbered list, Link, Clear formatting.

### InlineArrayControls
"Add item" button for blocks with array fields (Accordion, FeatureGrid, PricingTable, CardGrid, etc.). Appears below the selected block.

## Hooks

### useEditor()
Returns the full EditorContext: `{ state, dispatch, setEntity, updateData, hoverBlock, selectBlock, enterEdit, exitEdit, setSaveStatus }`

### useEditorState()
Shorthand for `useEditor().state`.

### useHoverIntent()
150ms delayed hover with velocity awareness (>800px/s = skip). Returns `{ onMouseEnter, onMouseLeave, onMouseMove }`.

### useEditorSelection()
Keyboard navigation: Tab/Arrow keys cycle blocks, Enter enters edit mode, ESC exits. Click outside deselects.

### useEditingMode()
Simple wrapper for enter/exit edit mode from context.

### useToolbarPosition(blockId)
Returns `{ x, y, placement }` for positioning the floating toolbar relative to a block. Uses ResizeObserver + rAF for 60fps updates.

### useDragReorder(onReorder)
Zero-dependency drag-and-drop. Returns `{ dragState, dropIndicatorIndex, handleDragStart }`. Uses pointer events, ghost clone, placeholder div, 5px click-vs-drag threshold.

## EditorState

```typescript
interface EditorState {
  entity: ContentEntity | null
  contentType: ContentType
  puckData: Data | null
  hoveredBlockId: string | null
  selectedBlockId: string | null
  editingBlockId: string | null
  editingField: string | null
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  isDirty: boolean
  isPublished: boolean
}
```

## API Endpoints Used

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/auth/me` | Auth check |
| GET | `/api/admin/{type}/{id}` | Load entity |
| PATCH | `/api/admin/{type}/{id}` | Auto-save (1s debounce, conflict detection) |
| PUT | `/api/admin/{type}/{id}` | Publish |
| GET | `/api/admin/media` | Media library listing |
| POST | `/api/admin/media/upload` | Media upload |

## Adding a New Block with Inline Editing

1. **Create the block component** in `packages/shared/src/blocks/MyBlock.tsx`
2. **Use `useEditableText`** for text fields you want editable on canvas:
   ```tsx
   import { useEditableText, useInlineEdit } from '../context'

   export function MyBlock({ heading, id }: Props & { id?: string }) {
     const headingPuck = useInlineEdit('heading', heading, id || '')
     const headingEditCtx = useEditableText('heading', heading)
     const headingEdit = headingPuck || headingEditCtx
     const hEdit = headingEdit ? (() => { const { className: _, ...rest } = headingEdit; return rest })() : {}

     return <h2 {...hEdit} className={headingEdit?.className}>{heading}</h2>
   }
   ```
3. **Register in puck-config.tsx** with field definitions
4. Fields with `type: 'text'` that use `useEditableText` are editable on canvas
5. All other fields appear in the Settings Popover automatically
6. Image fields: add `metadata: { isImage: true }` to get the media picker

## CSS Custom Properties

All editor UI uses `--editor-*` namespaced tokens defined in `packages/admin/src/index.css`:

- Colors: `--editor-blue`, `--editor-red`, `--editor-green`, `--editor-amber`
- Z-index: `--z-editor-block` (10), `--z-editor-toolbar` (100), `--z-editor-popover` (1005)
- Timing: `--editor-duration-fast` (150ms), `--editor-duration-normal` (300ms)
- Animations: `editor-focus-pulse`, `editor-bounce-in`, `editor-slide-down`

## Keyboard Shortcuts

| Key | Action |
|---|---|
| Tab / Arrow Down | Select next block |
| Shift+Tab / Arrow Up | Select previous block |
| Enter | Enter edit mode (focus first contentEditable) |
| Escape | Exit edit → Deselect → (no further action) |
| Cmd+Z | Undo (browser native in contentEditable) |
