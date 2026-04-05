# Epic: Tuner — Web-Based Instrument Tuner

**Epic ID**: tuner-001
**Created**: 2026-04-04
**Source**: /blossom
**Goal**: Bootstrap a new project "Tuner" — a statically served web app that is an instrument tuner. Listens on microphone, shows sharp/flat to closest string, can play reference tones. Mobile-friendly.

## Spike Findings

### Items

1. **Scaffold Vite project with vanilla JS** — Vite provides HMR, fast dev server, optimized production builds. Vanilla template, no framework overhead.
   - source: vite.config.js, package.json
   - confidence: CONFIRMED
   - priority: P0
   - depends-on: none
   - agent: backend-implementation

2. **Implement AudioContext initialization with iOS gesture handling** — AudioContext with latencyHint: "interactive". iOS Safari requires resume() after user gesture.
   - source: src/audio/AudioContextManager.js
   - confidence: CONFIRMED
   - priority: P0
   - depends-on: #7
   - agent: backend-implementation

3. **Implement microphone capture with getUserMedia** — Promise-based MediaDevices API with echo cancellation + noise suppression constraints.
   - source: src/audio/MicrophoneInput.js
   - confidence: CONFIRMED
   - priority: P0
   - depends-on: #8
   - agent: backend-implementation

4. **Implement pitch detection with pitchy library** — McLeod Pitch Method via pitchy. Returns frequency + clarity score. AnalyserNode with 4096 FFT size.
   - source: src/audio/PitchDetector.js
   - confidence: CONFIRMED
   - priority: P0
   - depends-on: #9
   - agent: backend-implementation

5. **Build instrument tuning data model** — Hierarchical JSON: instruments → tunings → strings. 6 instruments, alternate guitar tunings, chromatic mode. Utility functions for MIDI/freq/cents conversion.
   - source: src/data/instruments.js, src/utils/music.js
   - confidence: CONFIRMED
   - priority: P0
   - depends-on: #7
   - agent: backend-implementation

6. **Build note detection and closest-string matching** — Frequency → nearest note via freqToMidi. Cents deviation: 1200 × log2(detected/target). In-tune threshold: ±10 cents.
   - source: src/audio/NoteDetector.js
   - confidence: CONFIRMED
   - priority: P0
   - depends-on: #10, #11
   - agent: backend-implementation

7. **Build SVG tuner gauge display** — SVG needle gauge, -50 to +50 cents. Colorblind-safe (blue/orange + arrows). Note name, octave, frequency, cents readout.
   - source: src/ui/TunerGauge.js, src/styles/gauge.css
   - confidence: CONFIRMED
   - priority: P0
   - depends-on: #7
   - agent: frontend-implementation

8. **Build mobile-first responsive layout** — Single-column portrait for mobile. Gauge fills screen. Controls in fixed footer. Plain CSS, flexbox/grid. Touch targets ≥44px.
   - source: src/styles/main.css, index.html
   - confidence: CONFIRMED
   - priority: P0
   - depends-on: #7
   - agent: frontend-implementation

9. **Build string selector and instrument picker UI** — Button grid for strings. Dropdown for instrument/tuning. Chromatic mode toggle.
   - source: src/ui/StringSelector.js, src/ui/InstrumentPicker.js
   - confidence: CONFIRMED
   - priority: P0
   - depends-on: #11, #14
   - agent: frontend-implementation

10. **Implement reference tone playback with OscillatorNode** — Sine wave + GainNode ADSR envelope. Fresh oscillator per play. Play/stop per string.
    - source: src/audio/ToneGenerator.js
    - confidence: CONFIRMED
    - priority: P1
    - depends-on: #8, #11
    - agent: backend-implementation

11. **Build microphone permission UX flow** — Start button (not auto-request). Permission states: waiting/granted/denied/no-HTTPS.
    - source: src/ui/PermissionFlow.js
    - confidence: CONFIRMED
    - priority: P1
    - depends-on: #9, #14
    - agent: frontend-implementation

12. **Add ARIA labels and screen reader support** — aria-live for tuning feedback. aria-label on all controls. Text alternatives for color.
    - source: all UI components
    - confidence: CONFIRMED
    - priority: P1
    - depends-on: #13, #15
    - agent: frontend-implementation

13. **Add PWA support (manifest.json + service worker)** — Cache-first for app shell. Offline use. Add to Home Screen.
    - source: public/manifest.json, src/sw.js
    - confidence: CONFIRMED
    - priority: P1
    - depends-on: #14
    - agent: frontend-implementation

14. **Add configurable reference pitch (A4 = 432-444 Hz)** — Settings UI. Recalculates frequencies dynamically. Default 440Hz.
    - source: src/ui/Settings.js, src/utils/music.js
    - confidence: CONFIRMED
    - priority: P2
    - depends-on: #11, #16
    - agent: frontend-implementation

15. **Add Vitest for unit testing pitch/music utilities** — Unit tests for math utilities, note detection, edge cases.
    - source: vitest.config.js, src/__tests__/
    - confidence: CONFIRMED
    - priority: P2
    - depends-on: #11, #12
    - agent: test-coverage

## Priority Order

1. #7 Scaffold Vite project
2. #8 AudioContext + iOS gesture
3. #11 Instrument tuning data model
4. #9 Microphone capture
5. #13 SVG tuner gauge
6. #14 Mobile-first layout
7. #10 Pitch detection (pitchy)
8. #12 Note detection + string matching
9. #15 String selector + instrument picker
10. #16 Reference tone playback
11. #17 Permission UX flow
12. #18 ARIA + screen reader
13. #19 PWA support
14. #20 Configurable reference pitch
15. #21 Vitest unit tests

## Task IDs

| Task ID | Title | Priority | Status | Assigned Agent |
|---------|-------|----------|--------|----------------|
| #7  | Scaffold Vite project with vanilla JS | P0 | open | backend-implementation |
| #8  | Implement AudioContext + iOS gesture | P0 | open | backend-implementation |
| #9  | Implement microphone capture | P0 | open | backend-implementation |
| #10 | Implement pitch detection (pitchy) | P0 | open | backend-implementation |
| #11 | Build instrument tuning data model | P0 | open | backend-implementation |
| #12 | Build note detection + string matching | P0 | open | backend-implementation |
| #13 | Build SVG tuner gauge display | P0 | open | frontend-implementation |
| #14 | Build mobile-first responsive layout | P0 | open | frontend-implementation |
| #15 | Build string selector + instrument picker | P0 | open | frontend-implementation |
| #16 | Implement reference tone playback | P1 | open | backend-implementation |
| #17 | Build microphone permission UX flow | P1 | open | frontend-implementation |
| #18 | Add ARIA + screen reader support | P1 | open | frontend-implementation |
| #19 | Add PWA support | P1 | open | frontend-implementation |
| #20 | Add configurable reference pitch | P2 | open | frontend-implementation |
| #21 | Add Vitest unit tests | P2 | open | test-coverage |

## Critical Path

#7 → #8 → #9 → #10 → #12 (scaffold → audio context → mic → pitch detection → note matching)

## Parallel Opportunities

After #7 completes, these can run in parallel:
- **Audio track**: #8 → #9 → #10
- **Data track**: #11
- **UI track**: #13, #14
