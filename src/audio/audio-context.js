/**
 * Singleton AudioContext with iOS Safari gesture handling.
 *
 * iOS Safari creates AudioContext in "suspended" state and requires
 * a user gesture to resume it. Call initAudio() from a click/touch
 * handler to ensure the context is running.
 */

/** @type {AudioContext | null} */
let audioContext = null;

/**
 * Returns the singleton AudioContext, creating it on first call.
 * @returns {AudioContext}
 */
export function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext({ latencyHint: 'interactive' });
  }
  return audioContext;
}

/**
 * Creates the AudioContext (if needed) and resumes it if suspended.
 * Call this from a user-gesture handler (click/touch) to satisfy
 * the iOS Safari autoplay policy.
 * @returns {Promise<AudioContext>} Resolves when the context state is 'running'.
 */
export async function initAudio() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  return ctx;
}

/**
 * Returns true if the AudioContext exists and its state is 'running'.
 * @returns {boolean}
 */
export function isAudioReady() {
  return audioContext !== null && audioContext.state === 'running';
}
