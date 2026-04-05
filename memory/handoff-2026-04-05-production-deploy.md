# Session Handoff: 2026-04-05 — Production Deploy Prep

**Context:** Long development session (~6 hours, 11 commits) touching audio synthesis, UI refactoring, new instruments, PWA infrastructure, task tracker adoption, and production deploy planning. Session ended at **Overloaded** context level (~50+ files read, ~13+ agent dispatches across design meetings and retros). Handed off before executing the production deploy so it gets fresh context.

**Next session entry point:** `tk ready` — shows the work front. The epic is `tk-243a`, and the P0 blocker is `tk-243a.1`. Start there.

---

## What Got Done This Session

**Audio / tone generation:**
- Replaced pure sine reference tones with 5-harmonic additive `PeriodicWave` synthesis, frequency-split into two presets (<250 Hz rich upper partials, ≥250 Hz lighter stack). Rationale: beat audibility via shared upper partials in the 1–4 kHz ear sensitivity peak — grounded in 200 years of aural piano tuning practice, not timbre matching.
- Added persistent module-scoped `DynamicsCompressorNode` between per-play gain nodes and destination.
- Dispatched `tone-start` / `tone-end` events on document so UI can reflect playback state.
- 30-second maximum tone duration (replacing original 3s default).

**UI / UX refactor:**
- Merged string-select and play-tone buttons into one tap target per string with an explicit state machine (tap idle → select+play; tap playing → stop; tap other → switch).
- Split the conflated `activeStringIndex` into **`selectedStringIndex`** (sticky, user-tap) and **`detectedStringIndex`** (transient, pitch-detector). Detection NEVER sets selection and NEVER triggers tones — this preserves the manual-pin escape hatch.
- Removed the Chromatic mode toggle. Replaced with a dual-readout gauge that always shows both the user's tuning target (as "→ G3") and the detected chromatic note.
- Added an "Any Note" escape button (dashed border, italic label) to clear pinned selection and revert the gauge to pure chromatic mode. Fixed a gap the merge introduced: sticky selection had no way out.
- `prefers-reduced-motion` support for the `.playing` pulse.
- Binary in-tune dot on string buttons (glance indicator; precise cents stay in the gauge).

**Instruments / data:**
- Added Trumpet (Bb), Clarinet (Bb), Mandolin, Baritone Ukulele as new top-level instruments.
- Added ukulele alternate tunings: Low G (linear), D-tuning (ADF#B).
- Added Bb3 as lowest reference note on both Trumpet and Clarinet.
- Transposing instruments store **concert pitches** (what the mic hears), not written pitches.

**A4 reference-pitch consistency fix:**
- Every consumer (tone playback, cents calculation, detector-ring fallback) now recomputes frequency from `midiNote` via `midiToFrequency(midi, a4)` at use time. Never uses the hardcoded `s.frequency` field.
- String-selector listens for `reference-pitch-change` and live-restarts any playing tone at the new pitch when the A4 slider moves.

**Infrastructure:**
- `vite.config.js`: `server.host: true` + `@vitejs/plugin-basic-ssl` for LAN HTTPS dev.
- Service worker registration gated to `import.meta.env.PROD` with active unregister + cache-clear in dev.

**Tooling / process:**
- Adopted **tacks** (`tk` CLI) as canonical task tracker. `TODO.md` and `memory/epics/tuner-001/epic.md` are now legacy — do NOT extend. CLAUDE.md has a new Task Tracking section documenting this.
- Ran `/retro` — captured 13 durable learnings across all 4 team agents (audio, frontend, data, infra) and persisted a new user-level `workflow-selection.md` memory about when to skip `/drive`, `/sprint`, `/blossom` machinery.
- Ran `/tend` — renewed freshness on both project rules (`browser-verification.md`, `integration-wiring.md`); no demotions, no promotions (4 candidates deferred for survival-criteria — re-evaluate next retro).

---

## Key Decisions Made

| Decision | Rationale | Rejected Alternatives |
|---|---|---|
| Additive 5-partial PeriodicWave reference tones | Aural piano-tuning precedent (200 years of beating upper partials); beats at 3f and 5f land in the ear's 1–4 kHz sensitivity peak | Pure sine (inaudible on laptop speakers at low register); per-family timbres strings/brass/clarinet (timbre theater — the benefit is upper-partial energy, not instrument character) |
| Frequency-split waveform (<250 Hz rich, ≥250 Hz lighter) | Low-fundamental instruments need partials to reach sensitivity peak; high-fundamental instruments need lighter stacks to avoid critical-band crowding | Single universal waveform (missed the laptop-speaker-rolloff problem at low end); three family-specific waveforms (rejected as timbre theater) |
| Merged string-button + play-button with explicit tap state machine | Clear single-tap semantics; reclaims visual real estate | Long-press for play (fails on hybrid touch+trackpad devices — `pointer:` media queries switch mid-session); tap-twice-to-play (silent-first-tap breaks first-impression mental model) |
| `selectedStringIndex` vs `detectedStringIndex` orthogonal split | Detection must never override user intent; preserves manual-pin escape hatch | Auto-fallback mode inference (pitch detector's 5–15¢ frame-to-frame noise causes flicker on the canonical detuned-string case) |
| Dual-readout gauge (target + chromatic note simultaneously) | Collapses mode distinction — both pieces of info always visible | Keeping Chromatic toggle with better label ("Any Note") — rejected as still requiring mode knowledge |
| **Re-added "Any Note" escape button** | Sticky selection needs explicit deselect path | (Mid-session correction — we removed the button, discovered the gap, put it back with a distinct visual style) |
| `tacks` (tk CLI) as canonical task tracker | User installed the plugin specifically for this project; local SQLite backlog travels with the repo | Continuing with stale `TODO.md` (was lying — every box shipped per git log); `memory/epics/*/epic.md` format (superseded by tacks) |
| **Inline decompose instead of blossom spike dispatch** for production deploy work | Goal was well-defined per blossom's own don't-use-when list; session was already Overloaded | Running 4 spike agents to read files I could read in 30 seconds directly (wasteful overhead) |
| **Hand off before executing the production deploy** | Session Overloaded; base-path fix has subtle correctness consequences that deserve fresh context | Pushing through in this session (quality risk on nuanced parts — SW routing rules, base-path edge cases) |

---

## Patterns & Discoveries

- **`midiNote` is the authoritative source for A4-adjustable frequencies**, not the pre-computed `frequency` field in instruments data. Always recompute via `midiToFrequency(midiNote, a4)` at use time. The `s.frequency` field exists only for readability in the data file.
- **Meetings with opposed-role panels** (UX minimalist + reliability skeptic) produce genuine architectural insight. Similar-role pairs produce polite reinforcement.
- **Fact-check user premises against code before dispatching meetings.** Reading `note-detector.js` before the Chromatic button meeting caught the "it's just a highlight toggle" misconception and saved a misdirected debate.
- **"Buttons show static identity, gauge shows dynamic state"** — both meeting panelists converged on this independently. Cents numbers and direction arrows belong in one big gauge, not six tiny buttons.
- **Commit incrementally in long sessions.** This session ran 12 feature chunks across 6 hours with zero commits until the retro forced a batched commit pass. Risk of loss was high.
- **Critical path-subpath finding:** GitHub Pages serves at `/tuner/`, not at root. Every absolute URL in the project will 404 in production until base-path fix lands. This is documented in `tk-243a.1` as the P0 blocker.

---

## In-Progress Work

**None.** All 11 commits this session are landed and pushed. All 10 tasks in the tacks backlog are `open` (none claimed or in-progress).

---

## Uncommitted Changes

**None.** Working tree is clean, `origin/main` is up to date with local.

---

## Blocked Work

Within the production-deploy epic (`tk-243a`):

| Task | Status | Blocked By |
|---|---|---|
| `tk-243a.2` Rewrite SW cache strategy | P0 open | `tk-243a.1` (need final scope paths) |
| `tk-243a.3` Add GitHub Actions workflow | P0 open | `tk-243a.1` (dist/ must be internally consistent) |
| `tk-243a.4` Polish manifest.json | P2 open | `tk-243a.1` (for `id` and `scope` values) |
| `tk-243a.6` README production link | P2 open | `tk-243a.3` (URL must actually work before we link it) |
| `tk-243a.7` Post-deploy verification | P1 open | All other children of `tk-243a` |

**The only unblocked P0 is `tk-243a.1`.** That's the entry point for the next session.

---

## Resumable Agents

None. All dispatched agents (meeting panelists, retro readers) completed. No in-flight Task agents.

---

## Open Questions (requiring decisions in the next session)

**1. Subpath path-rewriting strategy for `public/sw.js`**
   - *Where:* `public/sw.js` — the `APP_SHELL` array and the fetch handler's routing logic
   - *Decision needed:* how should the SW learn its base path?
   - *Options:*
     - **(a) `self.registration.scope`** — runtime property the browser provides; works at any scope without build-time knowledge. Cleanest for portability.
     - **(b) Inject `import.meta.env.BASE_URL`** — build-time injection. Requires Vite to process `public/sw.js` (it doesn't by default — public assets are copied verbatim). Would need to move the SW into `src/` and import it differently, or use a Vite plugin.
     - **(c) Hardcode `/tuner/`** — simplest, fragile if the repo ever moves to a different GitHub user or gets renamed.
   - *Criteria:* prefer (a) unless there's a Vite idiomatic reason for (b). Hardcode (c) is the last resort.
   - *Recommendation (to verify):* (a) self.registration.scope.

**2. First-deploy ordering between repo settings and workflow commit**
   - *Where:* GitHub repo settings (Pages source) + the first push to main after committing `.github/workflows/deploy.yml`
   - *Decision needed:* which happens first?
   - *Options:*
     - **(a) Commit workflow first** → first workflow run fails → user changes Pages source to "GitHub Actions" → re-run.
     - **(b) Change Pages source first** (the setting exists even without any workflow) → commit workflow → first run succeeds.
   - *Criteria:* (b) is cleaner. Document it in the README step-by-step so the user doesn't have to debug the first-run failure.
   - *Recommendation:* (b), with a clear note in README / commit message.

**3. `CACHE_NAME` versioning strategy for SW rewrite**
   - *Where:* `public/sw.js` line 1 — currently `const CACHE_NAME = 'tuner-v1';`
   - *Decision needed:* how is the cache name bumped per deploy?
   - *Options:*
     - **(a) Manual bump** — developer increments `v1` → `v2` → `v3` when they want to force cache invalidation. Simplest, but easy to forget.
     - **(b) Build-hash injection** — Vite injects a hash from `package.json` version or git SHA into the SW at build time. Requires SW to be processed by Vite (same concern as question 1 option b).
     - **(c) Always bump on every build** — use a timestamp. Every deploy invalidates everything. Wasteful but reliable.
   - *Criteria:* with the new network-first-for-shell strategy, `CACHE_NAME` matters less — the shell is always fetched fresh online, and hashed-asset caching is inherently immutable. A manual bump is probably enough because the failure mode (stale assets) is rare with hashed filenames.
   - *Recommendation:* (a) manual bump, documented in CLAUDE.md as "when you change the SW's own logic, bump `CACHE_NAME`."

**4. Is there a reason the current scripts/ doesn't have a `deploy` npm script?**
   - *Where:* `package.json` scripts section
   - *Decision needed:* should `npm run deploy` be added as a shortcut for something?
   - *Recommendation:* no — GitHub Actions does the deploying. Local `deploy` would just be `git push`.

---

## Recommended Next Steps (in order)

1. **Run `tk ready`** to confirm the work front. Expected output: `tk-243a.1` (P0), `tk-243a.5` (P2 LICENSE), `tk-a723` / `tk-984d` (P2 retro leftovers), and the epic itself.

2. **Read the full description of `tk-243a.1`** via `tk show tk-243a.1`. It lists the five files that need base-path-aware edits and the local verification step.

3. **Start with `tk-243a.1`** — the base path fix. Before touching anything:
   - Read `public/sw.js`, `public/manifest.json`, `index.html`, `vite.config.js` side-by-side.
   - Decide on **Open Question #1** (SW scope strategy) — recommended: `self.registration.scope`.
   - Implement: add `base: '/tuner/'` to `vite.config.js`; rewrite absolute paths in `index.html` and `manifest.json`; refactor `sw.js` to use scope-relative paths.
   - Verify locally: `npm run build`, then serve `dist/` at a subpath. One way: `mkdir -p /tmp/serve/tuner && cp -r dist/* /tmp/serve/tuner/ && (cd /tmp/serve && python3 -m http.server 8080)` → visit http://localhost:8080/tuner/.

4. **After `tk-243a.1` lands**, the wave-1 parallel work front opens: `tk-243a.2` (SW rewrite), `tk-243a.3` (GitHub Actions workflow), `tk-243a.4` (manifest polish). These can be done in any order.

5. **`tk-243a.5` (MIT LICENSE)** can be done at any time. It has no dependencies. Consider knocking it out early as a warmup. Copyright holder: Jason Stewart, year 2026.

6. **Manual prerequisite before first deploy:** change GitHub repo settings → Pages → Source to "GitHub Actions". Do this before the first push that contains `.github/workflows/deploy.yml`. See Open Question #2.

7. **After the first successful deploy**, run `tk-243a.6` (add production URL to README) and `tk-243a.7` (verification — install as PWA, Lighthouse audit, test update-on-reload).

8. **Outside the epic**, `tk-a723` and `tk-984d` are leftover retro action items:
   - `tk-a723`: walk `TODO.md` and `memory/epics/tuner-001/epic.md`, mark the 15 completed items done with commit SHAs (or delete the files now that tacks is the tracker).
   - `tk-984d`: add the selected/detected index-split invariant to `CLAUDE.md` Gotchas.

---

## Risks & Warnings

- **Base path rewriting is subtle.** Four files need coordinated changes. Missing one will cause silent 404s that only show up in devtools Network tab. The verification step (serve locally at a subpath) is critical.
- **The current `sw.js` uses cache-first for `.js/.css/.svg`.** Anyone who installs the PWA from an earlier build (or during the transition period if we deploy a broken version) will be stuck on the cached version until we land the network-first rewrite + they get online again. Since nothing has been deployed yet, this is only a risk if first-deploy ships before `tk-243a.2` lands. **Ship `tk-243a.2` in the same deploy as the first working version** so the initial SW is already network-first.
- **`skipWaiting()` + `clients.claim()` take effect immediately on activation.** This is the desired behavior (updates apply on next reload) but it means any bug in the new SW is immediately live for all users — there's no gradual rollout. Test carefully before deploying.
- **Vite's `base` config affects `import.meta.env.BASE_URL`** which is used in any runtime code that resolves URLs. Grep the codebase for `BASE_URL` after the base-path fix to make sure nothing relies on root assumptions.
- **Transposing instrument frequencies are concert pitches.** If future work touches trumpet or clarinet tuning, don't get confused — `Bb3` in the data is 233.08 Hz (concert Bb3), not what the player sees on their sheet music.
- **Session context is Overloaded at handoff time.** This handoff note is the primary vehicle for context transfer. Don't try to reconstruct decisions from git log alone — the reasoning (not just the outcomes) is captured here and in the two retro entries in `memory/team/retro-history.md`.

---

## Pointers for the Incoming Session

- **Entry:** `tk ready`
- **Epic overview:** `tk show tk-243a`
- **First task details:** `tk show tk-243a.1`
- **Project conventions:** `CLAUDE.md` (Task Tracking section, Gotchas)
- **Architectural rationale for recent refactors:** `memory/team/retro-history.md` (2026-04-05 entry) + `memory/agents/frontend/learnings.md` (State & Mode Patterns section)
- **Workflow discipline:** `~/.claude/projects/-Users-jason-code-tuner/memory/workflow-selection.md` (when to skip heavy workflow machinery)
