# Learnings: audio

## Codebase Patterns
- Project uses Vite + vanilla JS (no framework). Web Audio API is the core dependency.
- pitchy library (McLeod Pitch Method) chosen for pitch detection — returns frequency + clarity score.
- AudioContext must use latencyHint: "interactive" for low-latency tuning feedback.

## Gotchas
- iOS Safari requires AudioContext.resume() after a user gesture — cannot auto-start.
- OscillatorNode cannot be reused after stop() — must create fresh instance per tone play.
- getUserMedia requires HTTPS (or localhost). Request echoCancellation + noiseSuppression in constraints.

## Preferences
- (none yet)

## Cross-Agent Notes
- data agent owns frequency/cents math in src/utils/music.js — audio consumes those utilities.
- frontend agent owns the permission UX flow — audio provides the mic stream API.
