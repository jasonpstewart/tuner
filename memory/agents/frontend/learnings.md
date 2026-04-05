# Learnings: frontend

## Codebase Patterns
- Vite + vanilla JS, no framework. Plain CSS (no Tailwind), flexbox/grid layout.
- SVG-based needle gauge for tuner display — scales cleanly across resolutions.
- Mobile-first responsive: single-column portrait (320px+), controls in fixed footer.

## Gotchas
- Use colorblind-safe palette (blue/orange + lightness variation) — not red/green alone.
- Add arrow up/down icons as secondary sharp/flat indicator beyond color.
- Touch targets must be >= 44px for mobile usability.

## Preferences
- (none yet)

## Cross-Agent Notes
- data agent owns instrument/tuning data — frontend consumes for string selector and instrument picker.
- audio agent provides mic stream and pitch data — frontend displays via gauge and note readout.
