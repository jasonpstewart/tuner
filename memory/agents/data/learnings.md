# Learnings: data

## Codebase Patterns
- Hierarchical JSON data model: instruments[] -> tunings[] -> strings[{name, frequency, midiNote, octave}].
- Frequency formula: f = 440 * 2^((n-69)/12) where n is MIDI note number.
- Cents deviation: 1200 * log2(detected/target). In-tune threshold: +/-10 cents.

## Gotchas
- Ukulele uses re-entrant tuning (G4 is higher than C4) — don't assume strings are low-to-high.
- A4 = 440Hz is default but must be configurable (432-444 Hz range) — all frequencies recalculate dynamically.

## Preferences
- (none yet)

## Cross-Agent Notes
- audio agent consumes music math utilities for pitch detection and note matching.
- frontend agent consumes instrument data for string selector and instrument picker UI.
