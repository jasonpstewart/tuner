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
