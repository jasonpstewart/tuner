# Learnings: infra

## Codebase Patterns
- Vite with vanilla JS template (npm create vite@latest . -- --template vanilla).
- Project structure: src/, public/, dist/. No framework.
- npm as package manager. Vitest for testing.

## Gotchas
- HTTPS required for getUserMedia — all deployment targets must serve over HTTPS.
- Service worker must use cache-first for app shell, network-first for updates.
- PWA manifest needs 192px + 512px icons for Add to Home Screen.

## Preferences
- (none yet)

## Cross-Agent Notes
- All agents depend on infra scaffolding the project first (task #7).
- Test files in src/__tests__/ — infra owns test config, other agents write test logic.
