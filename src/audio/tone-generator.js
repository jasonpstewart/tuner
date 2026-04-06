/**
 * Reference tone playback using OscillatorNode with ADSR envelope.
 *
 * Each call to playTone() creates a fresh OscillatorNode + GainNode pair
 * because OscillatorNode is one-shot (cannot restart after stop()).
 *
 * Waveform is a 5-harmonic additive stack (organ/flute-like) rather than a
 * pure sine: puts energy in the 2-4kHz band where human hearing is most
 * sensitive, and provides overtones at 2f/3f that beat audibly against the
 * instrument's own harmonics — which is how the ear actually resolves pitch
 * error when tuning. A DynamicsCompressorNode on the output smooths transients
 * so master volume can sit higher without clipping.
 */

import { getAudioContext, initAudio } from './audio-context.js';

/** @type {OscillatorNode | null} */
let currentOscillator = null;

/** @type {GainNode | null} */
let currentGain = null;

/** @type {number | null} */
let stopTimeoutId = null;

/** Master volume level (0-1) */
let masterVolume = 0.55;

/**
 * Two harmonic presets, selected by fundamental frequency:
 *
 * - "low"  (fundamental < 250 Hz): rich upper partials so beat energy lands
 *   in the 400 Hz-1 kHz band where the ear is most sensitive. Without this,
 *   a low-E bass at 41 Hz produces beats only at 41 Hz - below peak ear
 *   sensitivity and often below a laptop speaker's low-frequency rolloff.
 * - "high" (fundamental >= 250 Hz): lighter partial stack. The fundamental
 *   is already near the ear's sensitivity peak, so extra upper partials
 *   add critical-band crowding without improving beat audibility.
 *
 * Both capped at 5 partials to limit false beats from inharmonicity mismatch
 * (our PeriodicWave is mathematically pure; real instruments have slightly
 * stretched partials, and the mismatch compounds at higher harmonics).
 */
const LOW_HARMONIC_THRESHOLD = 250;
const LOW_HARMONIC_AMPLITUDES = [0, 1.0, 0.6, 0.4, 0.28, 0.2];
const HIGH_HARMONIC_AMPLITUDES = [0, 1.0, 0.5, 0.25, 0.1, 0.04];

/** @type {PeriodicWave | null} */
let lowHarmonicWave = null;

/** @type {PeriodicWave | null} */
let highHarmonicWave = null;

/** @type {DynamicsCompressorNode | null} */
let outputCompressor = null;

/**
 * Builds (and caches) the additive harmonic waveform for the given frequency.
 * PeriodicWave auto-normalizes the time-domain peak to 1.0.
 *
 * @param {AudioContext} ctx
 * @param {number} frequency - Fundamental frequency in Hz
 * @returns {PeriodicWave}
 */
function getHarmonicWave(ctx, frequency) {
  if (frequency < LOW_HARMONIC_THRESHOLD) {
    if (lowHarmonicWave) return lowHarmonicWave;
    const real = new Float32Array(LOW_HARMONIC_AMPLITUDES.length);
    const imag = new Float32Array(LOW_HARMONIC_AMPLITUDES);
    lowHarmonicWave = ctx.createPeriodicWave(real, imag);
    return lowHarmonicWave;
  }
  if (highHarmonicWave) return highHarmonicWave;
  const real = new Float32Array(HIGH_HARMONIC_AMPLITUDES.length);
  const imag = new Float32Array(HIGH_HARMONIC_AMPLITUDES);
  highHarmonicWave = ctx.createPeriodicWave(real, imag);
  return highHarmonicWave;
}

/**
 * Builds (and caches) a persistent compressor connected to the destination.
 * Per-play gain nodes connect into this instead of directly to destination.
 *
 * @param {AudioContext} ctx
 * @returns {DynamicsCompressorNode}
 */
function getOutputChain(ctx) {
  if (outputCompressor) return outputCompressor;
  const compressor = ctx.createDynamicsCompressor();
  const now = ctx.currentTime;
  compressor.threshold.setValueAtTime(-18, now);
  compressor.knee.setValueAtTime(6, now);
  compressor.ratio.setValueAtTime(3, now);
  compressor.attack.setValueAtTime(0.003, now);
  compressor.release.setValueAtTime(0.1, now);
  compressor.connect(ctx.destination);
  outputCompressor = compressor;
  return outputCompressor;
}

/** Whether a tone is currently playing */
let playing = false;

/**
 * Plays a sine wave at the given frequency with an ADSR envelope.
 * Returns a function that stops the tone early (with release envelope).
 *
 * @param {number} frequency - Frequency in Hz
 * @param {number} [duration=3] - Duration in seconds before auto-stop
 * @returns {Function} A stop function for this tone
 */
export async function playTone(frequency, duration = 3) {
  // Stop any currently playing tone first
  if (playing) {
    stopTone();
  }

  const ctx = await initAudio();
  const now = ctx.currentTime;

  // Fresh oscillator + gain per play (oscillators are one-shot)
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.setPeriodicWave(getHarmonicWave(ctx, frequency));
  oscillator.frequency.setValueAtTime(frequency, now);

  // ADSR envelope
  // Start silent
  gain.gain.setValueAtTime(0, now);
  // Attack: ~50ms linear ramp to master volume
  gain.gain.linearRampToValueAtTime(masterVolume, now + 0.05);
  // Decay: ~100ms exponential decay to sustain level
  const sustainLevel = masterVolume * 0.8;
  gain.gain.exponentialRampToValueAtTime(sustainLevel, now + 0.15);
  // Sustain: holds at sustainLevel (no scheduling needed)

  // Connect: oscillator -> gain -> compressor -> destination
  oscillator.connect(gain);
  gain.connect(getOutputChain(ctx));

  oscillator.start(now);
  currentOscillator = oscillator;
  currentGain = gain;
  playing = true;

  // Notify UI that playback has started
  document.dispatchEvent(
    new CustomEvent('tone-start', { detail: { frequency } })
  );

  // Clean up when oscillator ends (natural stop or forced)
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
    if (currentOscillator === oscillator) {
      currentOscillator = null;
      currentGain = null;
      playing = false;
      document.dispatchEvent(
        new CustomEvent('tone-end', { detail: { frequency } })
      );
    }
  };

  // Auto-stop after duration
  stopTimeoutId = setTimeout(() => {
    if (currentOscillator === oscillator) {
      stopTone();
    }
  }, duration * 1000);

  return stopTone;
}

/**
 * Stops the currently playing tone with a release envelope (~200ms fade out).
 */
export function stopTone() {
  if (stopTimeoutId !== null) {
    clearTimeout(stopTimeoutId);
    stopTimeoutId = null;
  }

  if (!currentOscillator || !currentGain) {
    playing = false;
    return;
  }

  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Release: ~200ms exponential decay to near-zero
  // Cancel any scheduled ramps first
  currentGain.gain.cancelScheduledValues(now);
  currentGain.gain.setValueAtTime(currentGain.gain.value, now);
  // exponentialRampToValueAtTime cannot ramp to 0, use a very small value
  currentGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

  // Stop oscillator after release completes
  currentOscillator.stop(now + 0.2);
}

/**
 * Smoothly updates the frequency of the currently playing tone.
 * No-op if no tone is playing.
 *
 * @param {number} frequency - New frequency in Hz
 */
export function updateToneFrequency(frequency) {
  if (!currentOscillator || !playing) return;

  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Swap PeriodicWave if the frequency crossed the low/high threshold
  currentOscillator.setPeriodicWave(getHarmonicWave(ctx, frequency));

  // Smooth ~30ms ramp to avoid clicks
  currentOscillator.frequency.setValueAtTime(currentOscillator.frequency.value, now);
  currentOscillator.frequency.linearRampToValueAtTime(frequency, now + 0.03);
}

/**
 * Returns true if a tone is currently playing.
 * @returns {boolean}
 */
export function isPlaying() {
  return playing;
}

/**
 * Sets the master volume level for tone playback.
 * @param {number} level - Volume from 0 to 1
 */
export function setVolume(level) {
  masterVolume = Math.max(0, Math.min(1, level));
}
