import './styles/main.css'
import './styles/controls.css'
import './styles/gauge.css'
import { createStringSelector, getSelectedTuning, getSelectedStringIndex, setDetectedString } from './ui/string-selector.js'
import { createPermissionFlow, onStart, onStop } from './ui/permission-flow.js'
import { createSettings, getReferencePitch } from './ui/settings.js'
import { playTone, stopTone } from './audio/tone-generator.js'
import { startPitchDetection, stopPitchDetection } from './audio/pitch-detector.js'
import { detectNote } from './audio/note-detector.js'
import { midiToFrequency } from './utils/music.js'
import { create as createGauge } from './ui/tuner-gauge.js'

/** Cents threshold for painting the detector "hearing this" ring on a string button. */
const DETECTED_STRING_THRESHOLD_CENTS = 50
/** Cents threshold for the binary in-tune dot on the detected string button. */
const IN_TUNE_DOT_THRESHOLD_CENTS = 10

// ── Mount UI components ───────────────────────────────────────────────

const headerEl = document.querySelector('.app-header')
if (headerEl) {
  createSettings(headerEl)
}

const stringSelectorEl = document.querySelector('.string-selector')
if (stringSelectorEl) {
  createStringSelector(stringSelectorEl)
}

// Create gauge in the gauge container
const gaugeContainer = document.querySelector('.gauge-container')
const gauge = gaugeContainer ? createGauge(gaugeContainer) : null

// ── Tuning pipeline ───────────────────────────────────────────────────

const actionButtonsEl = document.querySelector('.action-buttons')
if (actionButtonsEl) {
  createPermissionFlow(actionButtonsEl)

  onStart((analyser) => {
    startPitchDetection(analyser, ({ frequency, clarity }) => {
      const a4 = getReferencePitch()
      const tuningStrings = getSelectedTuning().strings
      const selectedIdx = getSelectedStringIndex()

      // Always compute the nearest-string match for the detector ring hint,
      // but the cents value shown on the gauge comes from the user-selected
      // string when one is pinned — detection never overrides user intent.
      const result = detectNote(frequency, tuningStrings, a4)
      if (!result || !gauge) return

      // Resolve the tuning target: user selection wins; otherwise the
      // detector's closest-string guess (within DETECTED_STRING_THRESHOLD_CENTS)
      // drives cents; otherwise fall back to chromatic cents.
      let targetString = null
      let cents = result.cents
      let inTune = result.inTune

      if (selectedIdx >= 0 && tuningStrings[selectedIdx]) {
        targetString = tuningStrings[selectedIdx]
        // Recompute cents relative to the user's pinned string, not the
        // detector's closest guess. Resolve target frequency from midiNote
        // so cents respect the current A4 reference (432, 440, 442, etc.).
        const targetFreq = midiToFrequency(targetString.midiNote, a4)
        const ratio = result.frequency / targetFreq
        cents = 1200 * Math.log2(ratio)
        inTune = Math.abs(cents) <= IN_TUNE_DOT_THRESHOLD_CENTS
      } else if (
        result.closestString &&
        result.stringCents != null &&
        Math.abs(result.stringCents) <= DETECTED_STRING_THRESHOLD_CENTS
      ) {
        targetString = result.closestString
        cents = result.stringCents
        inTune = result.inTune
      }

      gauge.update({
        cents,
        note: result.note,
        octave: result.octave,
        frequency: result.frequency,
        inTune,
        targetString: targetString ? targetString.name : null,
      })

      // Detector ring: always reflects the closest-string guess, independent
      // of the user's selection. Only paint it if the detected pitch is
      // within the threshold — otherwise the user is clearly playing
      // something off-preset and the ring would be misleading.
      let detectedIdx = -1
      let dotInTune = false
      if (
        result.closestString &&
        result.stringCents != null &&
        Math.abs(result.stringCents) <= DETECTED_STRING_THRESHOLD_CENTS
      ) {
        detectedIdx = tuningStrings.indexOf(result.closestString)
        dotInTune = Math.abs(result.stringCents) <= IN_TUNE_DOT_THRESHOLD_CENTS
      }
      setDetectedString(detectedIdx, dotInTune)
    })
  })

  onStop(() => {
    stopPitchDetection()
    setDetectedString(-1, false)
    if (gauge) {
      gauge.update({ cents: 0, note: '--', octave: '', frequency: 0, inTune: false, targetString: null })
    }
  })
}

// ── Event wiring ──────────────────────────────────────────────────────

// String selector now dispatches explicit play-tone and stop-tone events.
// play-tone: start a tone at the given frequency (replaces any currently
// playing tone — playTone itself handles the stop-first semantics).
// stop-tone: halt the current tone without starting a new one.
document.addEventListener('play-tone', (e) => {
  playTone(e.detail.frequency, 30)
})
document.addEventListener('stop-tone', () => {
  stopTone()
})

// ── Service worker ────────────────────────────────────────────────────

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
  } else {
    // In dev, ensure any previously-installed SW is removed so reloads aren't served from cache.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister())
    })
    if (window.caches) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)))
    }
  }
}
