# Learnings: infra

## Codebase Patterns
- Vite + vanilla JS, npm, no framework. src/, public/, dist/ structure.
- Vitest for testing — works out of box with Vite 8, ESM imports.
- Service worker in public/ (Vite serves it at root without plugin config).

## Gotchas
- HTTPS required for getUserMedia — all deployment must serve HTTPS.
- PWA: SVG icons work for dev but Android Add-to-Home-Screen prefers rasterized PNGs. (dispatch: task-19)
- npm create vite doesn't work in non-interactive shells — manual package.json + index.html is more reliable. (dispatch: task-7)
- LAN dev access for microphone testing: set `server.host: true` in vite.config.js AND use `@vitejs/plugin-basic-ssl` for a self-signed cert. getUserMedia requires HTTPS or localhost; LAN IPs are neither. Each device needs to accept the cert warning once. (added: 2026-04-05, dispatch: retro-session)
- Service worker registration MUST be gated on `import.meta.env.PROD`. Dev reloads served from a stale SW cache is a recurring footgun that only manifests after the SW is already registered (so the first fix requires a hard-refresh). In dev, actively unregister existing registrations AND clear cache keys on load to handle the one-time cleanup for users who already have the old SW. (added: 2026-04-05, dispatch: retro-session)

## Process
- Pre-commit hooks may batch-commit staged changes from multiple agents. Verify post-commit. (dispatch: task-17)
- Commit incrementally during long sessions — do not batch 30+ files across 10+ logical changes until session end. A session crash or context compaction loses uncommitted work. Landing per-meeting or per-feature creates recovery points and makes review tractable. (added: 2026-04-05, dispatch: retro-session)
