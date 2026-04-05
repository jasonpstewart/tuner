---
name: Browser Verification Required
description: UI and audio features must be verified in the browser, not just via build checks
strength: should
freshness: 2026-04-04
paths: ["src/ui/**", "src/audio/**", "src/styles/**"]
promoted-from: frontend/learnings, team/decisions
---

After implementing a UI or audio feature, verify it works at runtime:

1. Run `npm run dev` to start the dev server
2. Open the browser and test the feature visually/functionally
3. Report observations in the agent's reflection

"Build passes" only validates syntax and imports. CSS transform-origin conflicts, SVG rendering bugs, audio playback issues, and event wiring gaps are invisible to static analysis and only surface at runtime.
