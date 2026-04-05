# Learnings: audio

## Codebase Patterns
- Web Audio API is the core dependency. pitchy (McLeod Pitch Method) for pitch detection.
- AudioContext singleton with lazy creation + explicit init for iOS gesture handling.
- Module APIs: audio-context.js (getAudioContext/initAudio), microphone.js (startMicrophone/getAnalyserNode), pitch-detector.js (startPitchDetection), tone-generator.js (playTone/stopTone).

## Gotchas
- iOS Safari: AudioContext starts suspended, must call resume() after user gesture. (dispatch: task-8)
- OscillatorNode is one-shot — create fresh instance per tone play. (dispatch: task-16)
- AnalyserNode must NOT connect to ctx.destination — source->analyser only, avoids feedback loops. (dispatch: task-9)
- exponentialRampToValueAtTime cannot target 0 — use 0.0001 as floor. cancelScheduledValues before new ramps. (dispatch: task-16)
- PitchDetector.forFloat32Array(fftSize) must match AnalyserNode's fftSize (4096). sampleRate from AudioContext. (dispatch: task-10)

## Cross-Module Integration
- String selector dispatches CustomEvent('play-tone') on document — wire listener in main.js. (dispatch: retro-bug-1)
- Settings dispatches CustomEvent('reference-pitch-change') on document — pass a4 to detectNote(). (dispatch: task-20)
- Integration wiring (main.js) must be an explicit task — modules don't self-connect. (dispatch: retro)
- Tone generator dispatches `tone-start` and `tone-end` CustomEvents on document (detail includes frequency). UI uses these to reflect playback state on whatever control triggered the tone. `onended` fires on all termination paths (auto-stop timer, manual stop, replacement by a new tone). (added: 2026-04-05, dispatch: retro-session)

## Reference Tone Design
- Beat audibility, not timbre matching, is the reference tone's job. A 1Hz fundamental mistuning becomes a 3Hz beat at the 3rd partial and a 5Hz beat at the 5th — both land in the 1-4kHz band where ears are ~20dB more sensitive (ISO 226 equal-loudness). Aural piano tuning (Jorgensen 1991) is 200 years of empirical evidence for this. Never pure sines. (added: 2026-04-05, dispatch: retro-session)
- Waveform selection by fundamental frequency, not by instrument family: under 250Hz → rich 5-partial stack (1.0, 0.6, 0.4, 0.28, 0.2) so beat energy reaches the sensitivity peak and is reproducible on laptop speakers (150Hz rolloff); ≥250Hz → lighter stack (1.0, 0.5, 0.25, 0.1, 0.04) to avoid critical-band crowding. Cap at 5 partials to limit false beats from inharmonicity mismatch (our PeriodicWave is mathematically pure; real instruments have stretched partials). (added: 2026-04-05, dispatch: retro-session)
- Architecture: cache both PeriodicWave presets AND a single persistent DynamicsCompressorNode at module scope. Per-play `osc -> gain` connects into the shared compressor, not directly to destination. PeriodicWave auto-normalizes time-domain peak to 1.0, so no manual coefficient scaling needed. (added: 2026-04-05, dispatch: retro-session)
- When A4 reference pitch changes at runtime, recompute the played tone frequency from `midiNote` via `midiToFrequency(midi, a4)`. Never cache the 440-based `s.frequency` from instruments data as authoritative — midiNote is the source of truth. (added: 2026-04-05, dispatch: retro-session)
