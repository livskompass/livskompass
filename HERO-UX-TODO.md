# Hero Component UX Improvements

## Issues Identified (2026-03-15)

### Rendering
- [ ] Different presets have inconsistent typography (some use text-display, some text-h1, fullscreen was using sans-serif)
- [ ] Preset changes in settings should immediately update the visual rendering
- [ ] All presets should use consistent serif display font for headings

### Media Handling
- [ ] Background video: need upload button (to media library) OR URL input — not just URL
- [ ] Background image: same — upload from computer, pick from library, OR paste URL
- [ ] Image placeholder should show actual aspect ratio constraints (4:3 for split, 16:9 for full-image, etc.)
- [ ] All uploaded media should save to R2 media library

### Settings UX
- [ ] Preset selector: show visual thumbnails/icons for each layout option instead of dropdown
- [ ] Page picker dropdowns: should NOT auto-open — only show list on focus/click
- [ ] Group settings into sections: Layout | Content | Background | Buttons
- [ ] Show/hide fields based on preset (resolveFields is now wired — verify it works)

### Buttons
- [ ] Primary + Secondary CTA with full customization per button
- [ ] Button style options: filled, outline, ghost, with/without arrow
- [ ] Button size: small, medium, large
- [ ] Link target: page picker for internal, text input for external

### General
- [ ] Clean, not overwhelming — progressive disclosure (basic options first, advanced behind toggle)
- [ ] Consistent with other block settings patterns
