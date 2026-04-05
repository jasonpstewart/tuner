# Team Decisions

## Architecture
- Vite + vanilla JS, no framework. Plain CSS. Static hosting.
- Web Audio API for mic capture + tone generation. pitchy library for pitch detection.
- SVG gauge for tuner display. Mobile-first responsive layout.

## Conventions
- Every sprint must include an explicit integration wiring task as the final task in the dependency chain. (added: 2026-04-04, source: retro)
- Agents must smoke-test UI features in the browser (npm run dev), not just verify build passes. (added: 2026-04-04, source: retro)
- Use opus model for integration tasks and complex UI/SVG work. (added: 2026-04-04, source: retro)
