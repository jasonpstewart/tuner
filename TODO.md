# Epic: Tuner — Web-Based Instrument Tuner

A statically served web application that listens on the microphone and shows if you are sharp or flat to the closest string. Supports playing reference tones. Mobile-friendly.

## P0 — Core

- [x] SPIKE: Audio capture & pitch detection
- [x] SPIKE: UI/UX & mobile-responsive tuner display
- [x] SPIKE: Tone generation & playback
- [x] SPIKE: Instrument data & tuning presets
- [x] SPIKE: Project tooling & static site setup
- [ ] #7 Scaffold Vite project with vanilla JS
- [ ] #8 Implement AudioContext initialization with iOS gesture handling <!-- depends on: #7 -->
- [ ] #9 Implement microphone capture with getUserMedia <!-- depends on: #8 -->
- [ ] #10 Implement pitch detection with pitchy library <!-- depends on: #9 -->
- [ ] #11 Build instrument tuning data model <!-- depends on: #7 -->
- [ ] #12 Build note detection and closest-string matching <!-- depends on: #10, #11 -->
- [ ] #13 Build SVG tuner gauge display <!-- depends on: #7 -->
- [ ] #14 Build mobile-first responsive layout <!-- depends on: #7 -->
- [ ] #15 Build string selector and instrument picker UI <!-- depends on: #11, #14 -->

## P1 — Important

- [ ] #16 Implement reference tone playback with OscillatorNode <!-- depends on: #8, #11 -->
- [ ] #17 Build microphone permission UX flow <!-- depends on: #9, #14 -->
- [ ] #18 Add ARIA labels and screen reader support <!-- depends on: #13, #15 -->
- [ ] #19 Add PWA support (manifest.json + service worker) <!-- depends on: #14 -->

## P2 — Nice to Have

- [ ] #20 Add configurable reference pitch (A4 = 432-444 Hz) <!-- depends on: #11, #16 -->
- [ ] #21 Add Vitest for unit testing pitch/music utilities <!-- depends on: #11, #12 -->
