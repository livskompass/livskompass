-- Promote PageCards manualPages.description into page.meta_description
-- so PageCards.tsx can drop the fallback (single source of truth: the page itself).
--
-- For each (target_slug, description) found across PageCards blocks, if the target
-- page has empty meta_description, set it. Skipped if the page already has one.
--
-- Reversible: take a backup of meta_description before re-running.

UPDATE pages SET meta_description = 'Guidade övningar för både nybörjare och erfarna utövare.', updated_at = datetime('now')
  WHERE slug = 'ovningar-i-medveten-narvaro' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'En introduktion till mindfulness – vad det är, hur det fungerar och vad forskningen säger.', updated_at = datetime('now')
  WHERE slug = 'vad-ar-medveten-narvaro' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Praktiska tips för att göra mindfulness till en del av din vardag.', updated_at = datetime('now')
  WHERE slug = 'tips-nar-du-ovar-medveten-narvaro' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Översikt över programmets sju träffar och deras innehåll.', updated_at = datetime('now')
  WHERE slug = 'act-7-traffar' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Introduktion och livslinjeövning', updated_at = datetime('now')
  WHERE slug = 'traff-1-2' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Värderingar och engagerat handlande', updated_at = datetime('now')
  WHERE slug = 'traff-2' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Acceptans och defusion', updated_at = datetime('now')
  WHERE slug = 'traff-3' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Mindfulness och självmedkänsla', updated_at = datetime('now')
  WHERE slug = 'traff-4' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Booster och uppföljning', updated_at = datetime('now')
  WHERE slug = 'traff-5-valfritt' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Inspelade filmer att använda i dina grupper', updated_at = datetime('now')
  WHERE slug = 'filmer' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Kompletterande filmmaterial', updated_at = datetime('now')
  WHERE slug = 'filmer-till-act-kursen' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Formulär för att mäta utfall och effekt', updated_at = datetime('now')
  WHERE slug = 'matformular' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Material för att rekrytera deltagare till dina grupper', updated_at = datetime('now')
  WHERE slug = 'rekryteringsmaterial' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Ytterligare resurser och verktyg', updated_at = datetime('now')
  WHERE slug = 'ovrigt-material' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Booster-utbildningar och vidareutveckling', updated_at = datetime('now')
  WHERE slug = 'pafyllnadsutbildningar' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Gratis nedladdningsbart material för ACT-gruppledare och deltagare.', updated_at = datetime('now')
  WHERE slug = 'arbetsmaterial-att-ladda-hem' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Översikt av tidningsartiklar och medieinslag om ACT-gruppformatet.', updated_at = datetime('now')
  WHERE slug = 'tidningsartiklar-om-denna-act-intervention' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Material från Fredriks föreläsningar.', updated_at = datetime('now')
  WHERE slug = 'ahorarkopior-fran-forelasningar-med-fredrik-livheim' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Svenska artiklar och inslag om gruppformatet «Att leva livet fullt ut».', updated_at = datetime('now')
  WHERE slug = 'media-om-detta-act-gruppformat' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Internationella artiklar och inslag om ACT.', updated_at = datetime('now')
  WHERE slug = 'internationell-media-om-act' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Övriga svenska medieinslag om ACT och mindfulness.', updated_at = datetime('now')
  WHERE slug = 'ovrig-svensk-media-om-act' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'En grundlig introduktion till Acceptance and Commitment Therapy – teori, forskning och praktik.', updated_at = datetime('now')
  WHERE slug = 'vad-ar-act' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Läs om det svenska ACT-gruppformatet som utvecklats av Fredrik Livheim och som används av hundratals gruppledare.', updated_at = datetime('now')
  WHERE slug = 'om-detta-gruppformat-av-act' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Studier på det svenska ACT-gruppformatet, inklusive Fredrik Livheims doktorsavhandling.', updated_at = datetime('now')
  WHERE slug = 'forskning-pa-detta-gruppformat-av-act-i-sverige' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Översikt av internationella studier på liknande ACT-gruppformat.', updated_at = datetime('now')
  WHERE slug = 'internationell-forskning-pa-ett-liknande-gruppformat-av-act' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Läs om innehåll, upplägg, målgrupp och förkunskaper för gruppledarutbildningen.', updated_at = datetime('now')
  WHERE slug = 'allman-information-om-gruppledarutbildningen' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Fredrik Livheim håller föreläsningar om ACT, stress och psykisk hälsa.', updated_at = datetime('now')
  WHERE slug = 'forelasningar' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Resurser och material för dig som redan gått gruppledarutbildningen.', updated_at = datetime('now')
  WHERE slug = 'for-dig-som-gar-gruppledarutbildning' AND (meta_description IS NULL OR meta_description = '');

UPDATE pages SET meta_description = 'Praktisk information och förberedelser inför din utbildning.', updated_at = datetime('now')
  WHERE slug = 'infor-gruppledarutbildning' AND (meta_description IS NULL OR meta_description = '');

