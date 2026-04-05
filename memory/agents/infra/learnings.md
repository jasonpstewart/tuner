# Learnings: infra

## Codebase Patterns
- Vite + vanilla JS, npm, no framework. src/, public/, dist/ structure.
- Vitest for testing — works out of box with Vite 8, ESM imports.
- Service worker in public/ (Vite serves it at root without plugin config).
- `public/sw.js` derives its base path from `self.registration.scope` rather than `import.meta.env.BASE_URL` — files under `public/` are copied verbatim and are not processed by Vite, so build-time env substitution does not apply. This makes the same code work at `/` (dev) and `/tuner/` (GitHub Pages). (added: 2026-04-05, dispatch: tk-243a.2)
- Tuner deploys to GitHub Pages via `.github/workflows/deploy.yml` using the official actions/configure-pages + upload-pages-artifact + deploy-pages pipeline. Build job runs `npm ci && npm test && npm run build`; tests gate the deploy. Node 20, concurrency group `pages` with `cancel-in-progress: false`. (added: 2026-04-05, dispatch: tk-243a.3)

## Gotchas
- HTTPS required for getUserMedia — all deployment must serve HTTPS.
- PWA: SVG icons work for dev but Android Add-to-Home-Screen prefers rasterized PNGs. (dispatch: task-19)
- npm create vite doesn't work in non-interactive shells — manual package.json + index.html is more reliable. (dispatch: task-7)
- LAN dev access for microphone testing: set `server.host: true` in vite.config.js AND use `@vitejs/plugin-basic-ssl` for a self-signed cert. getUserMedia requires HTTPS or localhost; LAN IPs are neither. Each device needs to accept the cert warning once. (added: 2026-04-05, dispatch: retro-session)
- Service worker registration MUST be gated on `import.meta.env.PROD`. Dev reloads served from a stale SW cache is a recurring footgun that only manifests after the SW is already registered (so the first fix requires a hard-refresh). In dev, actively unregister existing registrations AND clear cache keys on load to handle the one-time cleanup for users who already have the old SW. (added: 2026-04-05, dispatch: retro-session)
- For PWAs that must pick up new deploys, the app shell (`index.html`, `manifest.json`, unhashed icons, the bare directory) must be served **network-first** with cache as offline fallback. **Cache-first is only safe for content-hashed Vite `assets/*` output** because those filenames are immutable. Always bump `CACHE_NAME` when changing SW logic so old clients re-run install/activate. Navigation-mode requests should fall back to precached `index.html` when offline so deep links still boot the SPA. (added: 2026-04-05, dispatch: tk-243a.2)
- GitHub Pages Actions deploys require a one-time manual step — repo **Settings → Pages → Source must be set to "GitHub Actions"** before the first workflow run, otherwise `actions/deploy-pages` fails with a permissions error. Document this in the workflow header comment so future humans (including the repo owner on first deploy) don't have to debug it. (added: 2026-04-05, dispatch: tk-243a.3)
- `npm ci` on Linux CI can fail with "Missing: @emnapi/core from lock file" (or similar missing peer deps) when the lockfile was generated on macOS arm64. Root cause: native-binding packages like `@rolldown/binding-linux-*` declare `@napi-rs/wasm-runtime` → `@emnapi/*` as peer deps, but npm on macOS skips resolving them because the linux binding isn't installed locally. Fix: regenerate lockfile with platform targeting — `rm package-lock.json && npm install --package-lock-only --os=linux --cpu=x64 --libc=glibc --include=optional`. Running plain `npm install` afterward on macOS will strip the entries again, so use `npm ci` for local dev and repeat the targeted regen whenever a dep is added. (added: 2026-04-05, dispatch: tk-243a.3-ci-followup)

## Process
- Pre-commit hooks may batch-commit staged changes from multiple agents. Verify post-commit. (dispatch: task-17)
- Commit incrementally during long sessions — do not batch 30+ files across 10+ logical changes until session end. A session crash or context compaction loses uncommitted work. Landing per-meeting or per-feature creates recovery points and makes review tractable. (added: 2026-04-05, dispatch: retro-session)
