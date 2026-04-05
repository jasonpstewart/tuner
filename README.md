# Tuner

A web-based instrument tuner that listens on your microphone and shows whether you're sharp or flat. Works on mobile and desktop.

## Features

- **Real-time pitch detection** using the McLeod Pitch Method (via [pitchy](https://github.com/ianprime0509/pitchy))
- **SVG needle gauge** with colorblind-safe visual feedback (teal/amber/orange + directional arrows)
- **Multiple instruments**: Guitar (6-string), Bass (4 & 5-string), Ukulele, Baritone Ukulele, Violin, Viola, Cello, Trumpet (Bb), Clarinet (Bb)
- **Alternate tunings**: Drop D, Open G, DADGAD, Half-step down for guitar; Low G and D-tuning (ADF#B) for ukulele
- **Chromatic mode**: Detect any note without selecting an instrument
- **Reference tone playback**: Tap the speaker icon on any string to hear a reference tone for up to 30 seconds, with a pulsing visual indicator on the active button. Tones use a 5-harmonic additive synthesis with a frequency-selected partial stack and dynamics compression, designed to make off-tune beats clearly audible rather than to mimic an instrument's timbre.
- **Configurable A4 reference pitch**: 420-460 Hz (default 440, presets for 432/442)
- **PWA**: Install to home screen, works offline
- **Mobile-first**: Responsive layout, touch-friendly controls, iOS Safari audio support
- **Accessible**: ARIA labels, screen reader support, keyboard navigation, `prefers-reduced-motion` support

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser. Click "Start Tuning" and grant microphone access.

The dev server also binds to `0.0.0.0` with a self-signed HTTPS certificate (via `@vitejs/plugin-basic-ssl`), so you can load the app on another device on your LAN using the "Network" URL Vite prints at startup. You'll need to accept the cert warning once per device; after that, microphone access works the same as on localhost.

> Microphone access requires HTTPS or localhost.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
  audio/
    audio-context.js    # AudioContext singleton + iOS gesture handling
    microphone.js       # Mic capture via getUserMedia
    pitch-detector.js   # Pitch detection loop using pitchy
    note-detector.js    # Frequency -> note/string matching
    tone-generator.js   # Reference tone playback (OscillatorNode + ADSR)
  data/
    instruments.js      # Instrument tuning presets (frequencies, MIDI notes)
  ui/
    tuner-gauge.js      # SVG needle gauge component
    string-selector.js  # Instrument picker + string buttons
    permission-flow.js  # Microphone permission UX
    settings.js         # A4 reference pitch settings
  utils/
    music.js            # Music math (MIDI/freq conversion, cents, note names)
  styles/
    main.css            # Layout + responsive breakpoints
    gauge.css           # Tuner gauge styles
    controls.css        # Buttons, dropdowns, settings panel
  __tests__/
    music.test.js       # Music utility tests (30 tests)
    note-detector.test.js # Note detection tests (22 tests)
  main.js               # App entry point
public/
  manifest.json         # PWA manifest
  sw.js                 # Service worker (cache-first)
  icon-192.svg          # App icon (192x192)
  icon-512.svg          # App icon (512x512)
```

## Tech Stack

- **Vite** — Build tool + dev server
- **Vanilla JS** — No framework
- **Plain CSS** — No CSS framework
- **pitchy** — Pitch detection (McLeod Pitch Method)
- **Web Audio API** — Microphone capture + tone generation
- **Vitest** — Unit testing

## Browser Support

Requires a modern browser with Web Audio API and getUserMedia support:
- Chrome 64+
- Firefox 76+
- Safari 14.1+
- Edge 79+

iOS Safari requires a user gesture to start audio (handled automatically).

## License

MIT
