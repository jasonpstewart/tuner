/**
 * Pitch detection module using the pitchy library (McLeod Pitch Method).
 *
 * Consumes an AnalyserNode (from microphone.js) and runs a
 * requestAnimationFrame loop that calls back with { frequency, clarity }
 * on each frame where a confident pitch is found.
 */

import { PitchDetector } from 'pitchy';
import { getAudioContext } from './audio-context.js';

/** Minimum frequency considered musically useful (Hz). */
const MIN_FREQUENCY = 20;

/** Maximum frequency considered musically useful (Hz). */
const MAX_FREQUENCY = 5000;

/** @type {number} Minimum clarity (0-1) to report a pitch. */
let clarityThreshold = 0.85;

/** @type {number | null} requestAnimationFrame handle. */
let rafId = null;

/** @type {boolean} */
let detecting = false;

/**
 * Starts a pitch-detection loop on the given AnalyserNode.
 *
 * On each animation frame the detector reads time-domain data from the
 * analyser, runs pitchy's McLeod algorithm, and — when clarity exceeds
 * the threshold and the frequency is in the musical range — invokes the
 * callback with `{ frequency, clarity }`.
 *
 * @param {AnalyserNode} analyserNode - The analyser to read audio from.
 * @param {(result: { frequency: number, clarity: number }) => void} callback
 */
export function startPitchDetection(analyserNode, callback) {
  if (detecting) return;

  const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
  const inputBuffer = new Float32Array(analyserNode.fftSize);
  const sampleRate = getAudioContext().sampleRate;

  detecting = true;

  function loop() {
    if (!detecting) return;

    analyserNode.getFloatTimeDomainData(inputBuffer);
    const [pitch, clarity] = detector.findPitch(inputBuffer, sampleRate);

    if (
      clarity >= clarityThreshold &&
      pitch >= MIN_FREQUENCY &&
      pitch <= MAX_FREQUENCY
    ) {
      callback({ frequency: pitch, clarity });
    }

    rafId = requestAnimationFrame(loop);
  }

  rafId = requestAnimationFrame(loop);
}

/**
 * Stops the pitch-detection loop.
 */
export function stopPitchDetection() {
  detecting = false;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/**
 * Returns true if the detection loop is currently running.
 * @returns {boolean}
 */
export function isDetecting() {
  return detecting;
}

/**
 * Sets the minimum clarity required to report a pitch.
 * @param {number} threshold - A value between 0 and 1 (default 0.85).
 */
export function setClarityThreshold(threshold) {
  clarityThreshold = threshold;
}
