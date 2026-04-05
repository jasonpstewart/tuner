---
name: Integration Wiring Task Required
description: Every sprint that builds multiple modules must include a final task to wire them together in the app entry point
strength: must
freshness: 2026-04-04
paths: ["src/main.js"]
promoted-from: audio/learnings, frontend/learnings, team/decisions
---

When decomposing work into component tasks (/blossom, /sprint, or manual), always create an explicit "Wire end-to-end pipeline in [entry point]" task that:

1. Is blocked by ALL component tasks (runs last)
2. Imports all new modules and connects their APIs (event listeners, callbacks, data flow)
3. Is assigned to a single agent who reads ALL component module exports before writing
4. Includes acceptance criteria: "The feature works when tested manually"

Components built in isolation do not self-connect. The entry point (main.js) is the integration layer and must be treated as a first-class task, not an afterthought.
