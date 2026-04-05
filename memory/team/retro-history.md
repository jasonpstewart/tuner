# Retrospective History

## Retro: 2026-04-04
- Tasks completed: 15 (full epic)
- New learnings: 18 across 4 members
- Pruned/archived: 0 entries
- Bugs found post-sprint: 3 critical (play-tone wiring, tuning pipeline wiring, SVG rotation axis)
- Key insight: Component-level sprint dispatch without an explicit integration wiring task leaves the app non-functional. Every sprint needs a final "wire it all together" task + browser smoke testing.
- Action: Added sprint quality rules to MEMORY.md (integration task requirement, smoke testing, model selection)

## Retro: 2026-04-05 (direct-execution session, no sprint dispatch)
- Tasks completed: 12 distinct feature/refactor chunks across 4 agent domains (audio, frontend, data, infra)
- Commits this session: 0 (all work uncommitted at retro time — the single biggest concern)
- New learnings: 13 across 4 members (audio: 4, frontend: 5, data: 3, infra: 3)
- Meeting dispatches: 8 panelists across 3 design meetings (tone waveform, chromatic button value, string-button merge)
- Key insight: Meetings with opposed-role panels (UX minimalist vs reliability skeptic) produced genuine architectural improvements — the `selected` vs `detected` separation and the dual-readout gauge were both convergent findings that neither panelist alone would have reached. Meetings justified their cost on architectural decisions; direct execution was right for small well-scoped edits.
- Key insight: Fact-checking the user's premise against actual code BEFORE dispatching a meeting prevented at least one wasted thread (the "Chromatic button is just a highlight toggle" misconception was caught by reading note-detector.js first).
- Key insight: Piano tuning precedent (200 years of empirical beating-upper-partials practice) is a more durable grounding for reference-tone design than any abstract "richer sounds better" argument. Cite empirical precedents, not intuitions.
- Ongoing concern: TODO.md and memory/epics/tuner-001/epic.md are stale — every checkbox still `[ ]` but every task shipped months ago per git log. Needs `/consolidate` pass.
- Action: Commit the uncommitted session work in logical batches NOW before any handoff or context compaction. See retro report action items.

## Retro: 2026-04-05 (production-deploy epic — handoff-resumed session)
- Tasks completed: 8 (full tk-243a epic: base path, SW rewrite, GH Actions, manifest polish, LICENSE, README, verification, epic close)
- Commits this session: 9 (2 feat, 2 fix, 1 ci, 4 chore; 22% fix rate — 1 planned, 1 genuine CI ambush)
- New learnings: 5 in infra (network-first shell pattern, public/ not Vite-processed, GH Pages pipeline structure, first-run manual prerequisite, macOS→linux lockfile peer deps); others unchanged
- Pruned/archived: 0 (all files well under caps: audio 25, frontend 24, infra 22, data 14)
- Dispatches: 2 sprint agents (both P0, both parallel worktrees, both completed high-confidence in <70s); 3 P2 polish tasks executed inline by orchestrator
- Key insight: **Pre-framed handoff notes are force multipliers.** The prior session's handoff note pre-resolved the 3 open questions with recommendations + rationale. This session accepted the recommendations and executed; zero time spent re-litigating decisions. Validates the /handoff pattern for multi-session epics.
- Key insight: **Strict /sprint dispatch for P0 critical path, inline execution for P2 polish tail** — clean A/B this session. Sprint paid for its overhead on the 2 large P0s (parallel worktrees, structured reflection, learning capture). The 3 small P2s (manifest polish, LICENSE, README edit) would have cost more in agent-spawn + merge-coordination overhead than in direct execution. Confirms workflow-selection.md rule.
- Key insight: **`npm ci` cross-platform lockfile peer-dep ambush** — macOS-generated lockfiles silently omit linux-only native-binding peer deps (e.g., `@emnapi/*` reached via `@rolldown/binding-linux-*`). Only surfaces on Linux CI. Fix recipe is `npm install --package-lock-only --os=linux --cpu=x64 --libc=glibc --include=optional`. Generic JS ecosystem footgun — will recur on any Node project deploying to linux CI from a macOS dev box. Captured in infra learnings.
- Key insight: **Root-cause-fix the lockfile; don't switch CI to `npm install`.** Temptation was to change `npm ci` → `npm install` in the workflow (looser). Rejected because it masks drift between manifest and lockfile. Fixed lockfile instead. This is the right default when a CI tool is complaining about a real inconsistency.
- Action: Created tk-1f37 — add `npm run lockfile:linux` script so the recipe is one command instead of institutional knowledge.
