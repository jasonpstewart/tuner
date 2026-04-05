/**
 * Microphone capture module.
 *
 * Requests mic access via getUserMedia, connects to the AudioContext,
 * and exposes an AnalyserNode for downstream pitch detection.
 */

import { getAudioContext, initAudio } from './audio-context.js';

/** @typedef {'inactive' | 'requesting' | 'active' | 'denied' | 'error'} MicrophoneState */

/** @type {MicrophoneState} */
let state = 'inactive';

/** @type {MediaStream | null} */
let mediaStream = null;

/** @type {MediaStreamAudioSourceNode | null} */
let sourceNode = null;

/** @type {AnalyserNode | null} */
let analyserNode = null;

/**
 * Requests microphone permission, connects the stream to the AudioContext,
 * and returns the AnalyserNode for pitch detection consumers.
 *
 * Calls initAudio() first to ensure the AudioContext is running
 * (satisfies iOS Safari gesture requirement).
 *
 * @returns {Promise<AnalyserNode>}
 * @throws {Error} If microphone access is denied or unavailable.
 */
export async function startMicrophone() {
  // Already active — return existing analyser
  if (state === 'active' && analyserNode) {
    return analyserNode;
  }

  state = 'requesting';

  try {
    // Ensure AudioContext is running (iOS gesture handling)
    await initAudio();

    // Request mic access
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const ctx = getAudioContext();

    // Create source from mic stream
    sourceNode = ctx.createMediaStreamSource(mediaStream);

    // Create analyser for pitch detection (fftSize 4096 gives good frequency resolution)
    analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 4096;

    // Connect: mic source -> analyser (no output to speakers to avoid feedback)
    sourceNode.connect(analyserNode);

    state = 'active';
    return analyserNode;
  } catch (err) {
    // Classify the error
    if (
      err.name === 'NotAllowedError' ||
      err.name === 'PermissionDeniedError'
    ) {
      state = 'denied';
    } else {
      state = 'error';
    }

    // Clean up any partial setup
    cleanup();
    throw err;
  }
}

/**
 * Stops the microphone: ends all media tracks and disconnects audio nodes.
 */
export function stopMicrophone() {
  cleanup();
  state = 'inactive';
}

/**
 * Returns the current AnalyserNode, or null if the microphone is not active.
 * @returns {AnalyserNode | null}
 */
export function getAnalyserNode() {
  return analyserNode;
}

/**
 * Returns the current microphone state.
 * @returns {MicrophoneState}
 */
export function getMicrophoneState() {
  return state;
}

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

function cleanup() {
  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  analyserNode = null;
}
