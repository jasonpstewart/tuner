# Learnings: data

## Codebase Patterns
- Hierarchical JSON: instruments[] -> tunings[] -> strings[{name, frequency, midiNote, octave}].
- Music math in src/utils/music.js — all functions accept optional a4 parameter (default 440).
- Note detector in src/audio/note-detector.js — pure function, returns null for invalid input.

## Gotchas
- Ukulele uses re-entrant tuning (G4 higher than C4) — don't assume strings ordered low-to-high. (dispatch: task-11)
- Half-step-down: sharp names internally (D#, G#) but flat names (Eb, Ab) for display field. (dispatch: task-11)
- note-detector direction threshold (5 cents) differs from in-tune threshold (10 cents) — zone where direction is "in-tune" but inTune can be false. (dispatch: task-12)
- Transposing instruments (Bb trumpet, Bb clarinet, etc.) store frequencies as CONCERT pitches — what the microphone actually hears — NEVER written pitches. A Bb trumpet playing written C produces concert Bb; the tuner cares about what the mic captures. (added: 2026-04-05, dispatch: retro-session)
- `midiNote` is the authoritative source for string frequency. The `frequency` field in instruments data is pre-computed at A4=440 for readability, but when A4 changes (432, 442, etc.) every consumer must recompute via `midiToFrequency(midiNote, a4)`. Never use `s.frequency` directly in code paths that must respect A4 overrides (tone playback, cents calculation). `findClosestString` already does this correctly. (added: 2026-04-05, dispatch: retro-session)
- Baritone ukulele (DGBE) is a physically different instrument from soprano/concert/tenor — larger body, linear tuning, same pitches as guitar's top 4 strings. Gets its own top-level instrument entry, NOT a tuning variant of "Ukulele". Mandolin (GDAE fifths) shares pitches with violin but gets its own entry since it's a distinct physical instrument; the double-strung course structure (8 strings, 4 pitches) is documented in the entry's header comment. (added: 2026-04-05, dispatch: retro-session)
