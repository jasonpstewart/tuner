/**
 * Reference tone playback using OscillatorNode with ADSR envelope.
 *
 * Each call to playTone() creates a fresh OscillatorNode + GainNode pair
 * because OscillatorNode is one-shot (cannot restart after stop()).
 */

import { getAudioContext, initAudio } from './audio-context.js';

/** @type {OscillatorNode | null} */
let currentOscillator = null;

/** @type {GainNode | null} */
let currentGain = null;

/** @type {number | null} */
let stopTimeoutId = null;

/** Master volume level (0-1) */
let masterVolume = 0.3;

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

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, now);

  // ADSR envelope
  // Start silent
  gain.gain.setValueAtTime(0, now);
  // Attack: ~50ms linear ramp to master volume
  gain.gain.linearRampToValueAtTime(masterVolume, now + 0.05);
  // Decay: ~100ms exponential decay to sustain level
  const sustainLevel = masterVolume * (2 / 3);
  gain.gain.exponentialRampToValueAtTime(sustainLevel, now + 0.15);
  // Sustain: holds at sustainLevel (no scheduling needed)

  // Connect: oscillator -> gain -> destination
  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  currentOscillator = oscillator;
  currentGain = gain;
  playing = true;

  // Clean up when oscillator ends (natural stop or forced)
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
    if (currentOscillator === oscillator) {
      currentOscillator = null;
      currentGain = null;
      playing = false;
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
