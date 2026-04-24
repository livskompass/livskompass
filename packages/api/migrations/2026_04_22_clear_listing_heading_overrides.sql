-- Clear stale _textSizes.heading overrides on listing blocks (CourseList,
-- ProductList, PostGrid) where editors had manually shrunk the section
-- heading to compensate for an old (much larger) default.
--
-- After unifying the typography defaults around text-h3, these overrides
-- now make the section heading SMALLER than the card titles inside the
-- block — visually inconsistent. Clearing the override restores the new
-- text-h3 default so section headings match the block they introduce.
--
-- Hero block heading overrides (h1 on /utbildningar, /material, /nyhet,
-- /act, /mindfulness, etc.) are intentional and left alone.
--
-- Reversible: re-set via the inline editor's text-size picker.

UPDATE pages
SET content_blocks = REPLACE(
      REPLACE(
        REPLACE(content_blocks,
          ',"_textSizes":{"heading":"h4"}', ''),
        ',"_textSizes":{"heading":"body-lg"}', ''),
      '"_textSizes":{"heading":"body-lg"},', '')
WHERE slug IN ('utbildningar', 'material', 'nyhet')
  AND content_blocks LIKE '%_textSizes%';
