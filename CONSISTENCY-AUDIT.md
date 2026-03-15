# CMS Consistency Audit

Audit of all 17 admin CMS screens for pattern consistency.

## Screens Audited

1. Dashboard, 2. Pages list, 3. Posts list, 4. Courses list, 5. Bookings list,
6. Booking detail, 7. Products list, 8. Media library, 9. Contact messages,
10. Users list, 11. Settings, 12. Login, 13. Editor top bar, 14. Block panel,
15. Settings popover, 16. Floating toolbar, 17. Entity settings drawer

---

## Established Patterns (Correct Reference)

### Page Headers
- Container: `space-y-6`
- Title: `<h1 className="text-h3 text-zinc-900">`
- Subtitle: `<p className="text-zinc-500 mt-1">`
- Action button: `flex items-center justify-between` wrapper, primary `<Button>` with icon `h-4 w-4 mr-2`

### Tables
- Header row: `<TableRow className="bg-zinc-100">`
- Row hover: `hover:bg-zinc-50 transition-colors`
- Actions column: `<TableHead className="text-right">Actions</TableHead>`
- Action buttons: `variant="ghost" size="sm"`, edit = Pencil icon, delete = Trash2 icon
- Delete button style: `text-red-600 hover:text-red-700 hover:bg-red-50`

### Empty States
- Container: `flex flex-col items-center justify-center py-12 text-center`
- Icon: `h-10 w-10 text-zinc-300 mb-3`
- Text: `text-zinc-500`, no trailing period
- CTA (when applicable): `variant="outline" size="sm"`

### Loading States
- Table skeletons: `p-6 space-y-4` with 5x `<Skeleton className="h-12 w-full" />`
- Page header shown immediately (not behind skeleton)

### Delete Confirmation
- Uses `ConfirmDialog` component
- Title: "Delete [entity type]"
- Description: `Are you sure you want to delete "[name]"? This action cannot be undone.`
- Confirm label: "Delete"

### Feedback Banners
- Success: `bg-zinc-100 border border-zinc-200 text-zinc-700 px-4 py-3 rounded-lg text-sm` + CheckCircle icon
- Error: `bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm`

### Color Palette
- Admin UI: `zinc-*` palette throughout
- Editor chrome: CSS custom properties (`--editor-*`)
- Never use `stone-*` in admin (reserved for brand/web design tokens in CSS variables only)

---

## Issues Found & Fixed

### 1. Dashboard spacing (FIXED)
- **Was**: `space-y-8`
- **Now**: `space-y-6` (matches all other pages)

### 2. Empty state punctuation (FIXED)
- **Was**: BookingsList "No bookings yet." and ContactsList "No messages yet." had trailing periods
- **Now**: No trailing period (matches Pages, Posts, Courses, Products, Media)

### 3. Error/success banner radius (FIXED)
- **Was**: Settings used `rounded-xl` for banners
- **Now**: `rounded-lg` everywhere (matches Login, UsersList)

### 4. UsersList loading state (FIXED)
- **Was**: Full-page skeleton replacing the entire page including header
- **Now**: Header shown immediately, table area shows skeleton rows (matches all other list pages)

### 5. UsersList empty state sizing (FIXED)
- **Was**: `py-8`, icon `h-8 w-8`
- **Now**: `py-12`, icon `h-10 w-10 mb-3` (matches all other list pages)

### 6. UsersList delete terminology (FIXED)
- **Was**: "Remove user" / "Remove"
- **Now**: "Delete user" / "Delete" (matches Pages, Posts, Courses, Products, Media)

### 7. Stone palette leakage in editor components (FIXED)
- **Was**: SettingsPopover, EntitySettingsDrawer, BlockPanel, SlashMenu, BlockInserter, InlineImagePickerProvider, InlineMediaPickerProvider, VersionHistoryPanel, InlineVisualControls, InlineEditor all used `stone-*` Tailwind classes
- **Now**: All editor `.tsx` files use `zinc-*` for Tailwind classes. The `stone` CSS custom properties in `index.css` remain (they are brand design tokens used via `rgb(var(--stone-*))` for the public site preview).

### 8. Duplicated INPUT_CLASS / FieldLabel
- **Status**: NOT FIXED (low priority)
- Both SettingsPopover and EntitySettingsDrawer define identical `INPUT_CLASS` and `FieldLabel`. These could be extracted to a shared file, but the duplication is small and localized.

---

## Patterns That Are Already Consistent (No Changes Needed)

- Page title typography: All screens use `text-h3 text-zinc-900`
- Table header backgrounds: All use `bg-zinc-100`
- Table row hover: All use `hover:bg-zinc-50 transition-colors`
- Action button icon sizing: All use `h-4 w-4`
- Primary action placement: Top-right of page header
- Badge component usage: Consistent across all list views
- Skeleton loading for tables: 5 rows of `h-12` skeletons
- Card-based layout: All list pages wrap tables in `<Card>`
- ConfirmDialog usage: All delete actions use the same component
- AdminLayout sidebar: Consistent nav items, collapse behavior, active state styling

---

## Files Modified

- `packages/admin/src/pages/Dashboard.tsx` — spacing
- `packages/admin/src/pages/BookingsList.tsx` — empty state text
- `packages/admin/src/pages/ContactsList.tsx` — empty state text
- `packages/admin/src/pages/Settings.tsx` — banner radius (4 instances)
- `packages/admin/src/pages/UsersList.tsx` — loading state, empty state, terminology
- `packages/admin/src/editor/components/SettingsPopover.tsx` — stone→zinc
- `packages/admin/src/editor/components/EntitySettingsDrawer.tsx` — stone→zinc
- `packages/admin/src/editor/components/BlockPanel.tsx` — stone→zinc
- `packages/admin/src/editor/components/SlashMenu.tsx` — stone→zinc
- `packages/admin/src/editor/components/BlockInserter.tsx` — stone→zinc
- `packages/admin/src/editor/components/InlineImagePickerProvider.tsx` — stone→zinc
- `packages/admin/src/editor/components/InlineMediaPickerProvider.tsx` — stone→zinc
- `packages/admin/src/editor/components/VersionHistoryPanel.tsx` — stone→zinc
- `packages/admin/src/editor/components/InlineVisualControls.tsx` — stone→zinc
- `packages/admin/src/editor/InlineEditor.tsx` — stone→zinc
