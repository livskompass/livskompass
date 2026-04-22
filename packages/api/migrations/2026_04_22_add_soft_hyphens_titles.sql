-- Insert soft hyphens (U+00AD) into long Swedish compound titles so they
-- break at correct syllable boundaries on cards. Soft hyphens are invisible
-- in source but tell the browser where breaks are allowed.
--
-- Reversible: REPLACE(title, char(0x00ad), '') strips them all.

-- pages 'pafyllnadsutbildningar': Påfyllnadsutbildningar → Påfyllnads·utbildningar
UPDATE pages SET title = 'Påfyllnads­utbildningar' WHERE id = 'XPzR9dgnVvcvnFGzQN_TO';

-- pages 'infor-gruppledarutbildning-malmo': Inför gruppledarutbildning - Malmö → Inför gruppledar·utbildning - Malmö
UPDATE pages SET title = 'Inför gruppledar­utbildning - Malmö' WHERE id = '08G9h8aDj-1sv6waAJKOc';

-- pages 'infor-pabyggnadsutbildning-for-ungdomar': Inför påbyggnadsutbildning för ungdomar → Inför påbyggnads·utbildning för ungdomar
UPDATE pages SET title = 'Inför påbyggnads­utbildning för ungdomar' WHERE id = 'E2E7N04j8CMbAdmL10kVk';

-- pages 'rekryteringsmaterial': Rekryteringsmaterial → Rekryterings·material
UPDATE pages SET title = 'Rekryterings­material' WHERE id = 'AqLaXGS2IPbe1ZN7MrXuP';

-- pages 'infor-gruppledarutbildning': Inför gruppledarutbildning → Inför gruppledar·utbildning
UPDATE pages SET title = 'Inför gruppledar­utbildning' WHERE id = 'f8PrLSoWYyHIqpHw3-jMs';

-- pages 'anmalningsblankett-att-leva-livet-fullt-ut': Anmälningsblankett - Att leva livet fullt ut - våren 2026 → Anmälnings·blankett - Att leva livet fullt ut - våren 2026
UPDATE pages SET title = 'Anmälnings­blankett - Att leva livet fullt ut - våren 2026' WHERE id = 'DzEKOzlun5wxi3ERPSNR8';

-- pages 'allman-information-om-gruppledarutbildningen': Allmän information om gruppledarutbildningen → Allmän information om gruppledar·utbildningen
UPDATE pages SET title = 'Allmän information om gruppledar­utbildningen' WHERE id = 'IxIL4fjzt__e2gOrJWWvF';

-- pages 'rekryteringsmaterial-infor-gruppledarutbildning': Rekryteringsmaterial → Rekryterings·material
UPDATE pages SET title = 'Rekryterings­material' WHERE id = '8FT24jBPb9vtwdrRNAvY1';

-- pages 'anmalningsblankett-stockholm-varen': Anmälningsblankett Stockholm våren 2026 → Anmälnings·blankett Stockholm våren 2026
UPDATE pages SET title = 'Anmälnings­blankett Stockholm våren 2026' WHERE id = 'uuiSwoyDwk9sZ1FrM82mq';

-- courses 'stockholm-varen': Gruppledarutbildning Stockholm/online, våren 2026 → Gruppledar·utbildning Stockholm/online, våren 2026
UPDATE courses SET title = 'Gruppledar­utbildning Stockholm/online, våren 2026' WHERE id = 'course-stockholm-varen-2026';

-- courses 'norge': Gruppledarutbildning Norge online, vår 2026 → Gruppledar·utbildning Norge online, vår 2026
UPDATE courses SET title = 'Gruppledar­utbildning Norge online, vår 2026' WHERE id = 'course-norge-online-2026';

-- courses 'prosocial-ledarskapsutbildning': Prosocial – ledarskapsutbildning → Prosocial – ledarskaps·utbildning
UPDATE courses SET title = 'Prosocial – ledarskaps­utbildning' WHERE id = 'course-prosocial-ledarskap';

