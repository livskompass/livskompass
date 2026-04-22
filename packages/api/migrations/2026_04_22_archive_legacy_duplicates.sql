-- Cleanup: archive WP-migrated pages that duplicate typed content (course/product),
-- and clear parent_slug values pointing at typed-listing namespaces.
--
-- Reversible:
--   - Pages are SOFT-archived (status='archived'), not deleted. Restore via:
--       UPDATE pages SET status = 'draft' WHERE id IN (...);
--   - parent_slug values that get cleared are listed below in the WHERE clauses.
--
-- After applying, verify each redirect in packages/web/public/_redirects works:
--   /forelasningar -> /utbildningar/forelasningar
--   /norge -> /utbildningar/norge
--   /act-grupp-for-ungdomar-13-19-ar -> /utbildningar/act-grupp-for-ungdomar-13-19-ar
--   /stockholm-varen -> /utbildningar/stockholm-varen
--   /cd-medveten-narvaro -> /material/cd-medveten-narvaro
--   /act-samtalskort -> /material/act-samtalskort
--   /act-samtalskort-norska -> /material/act-samtalskort-norska

BEGIN TRANSACTION;

-- 1) Archive 4 page-course duplicates (course is canonical, has booking + dates).
UPDATE pages SET status = 'archived', updated_at = datetime('now')
WHERE slug IN ('forelasningar', 'norge', 'act-grupp-for-ungdomar-13-19-ar', 'stockholm-varen')
  AND status != 'archived';

-- 2) Archive 3 page-product duplicates (product is canonical, /material/:slug renders rich content).
UPDATE pages SET status = 'archived', updated_at = datetime('now')
WHERE slug IN ('cd-medveten-narvaro', 'act-samtalskort', 'act-samtalskort-norska')
  AND status != 'archived';

-- 3) Clear parent_slug on pages whose parent points at a reserved typed namespace.
-- These pages live at /<slug> regardless (URLs are flat), so the field is misleading data
-- inherited from WordPress hierarchy that no longer applies.
UPDATE pages SET parent_slug = NULL, updated_at = datetime('now')
WHERE parent_slug IN ('utbildningar', 'nyhet', 'material');

-- 4) Clear orphan parent_slug pointing at a now-archived page.
-- bestallning-av-cd-medveten-narvaro-2 had parent=cd-medveten-narvaro which is being archived.
UPDATE pages SET parent_slug = NULL, updated_at = datetime('now')
WHERE parent_slug = 'cd-medveten-narvaro';

COMMIT;
