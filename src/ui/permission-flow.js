/**
 * Microphone permission UX flow.
 *
 * Manages the "Start Tuning" / "Stop" button and communicates
 * microphone permission states to the user.
 */

import {
  startMicrophone,
  stopMicrophone,
  getMicrophoneState,
} from '../audio/microphone.js';

/** @type {((analyser: AnalyserNode) => void) | null} */
let _onStartCb = null;

/** @type {(() => void) | null} */
let _onStopCb = null;

/** @type {HTMLElement | null} */
let _container = null;

/**
 * Returns true when the page is served over HTTPS or localhost
 * (contexts where getUserMedia is available).
 */
function isSecureContext() {
  if (window.isSecureContext !== undefined) return window.isSecureContext;
  const { protocol, hostname } = location;
  return (
    protocol === 'https:' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]'
  );
}

/* ------------------------------------------------------------------ */
/*  Rendering helpers                                                  */
/* ------------------------------------------------------------------ */

function renderStart(container) {
  container.innerHTML = '';
  const btn = document.createElement('button');
  btn.className = 'pf-start-btn';
  btn.type = 'button';
  btn.textContent = 'Start Tuning';
  btn.setAttribute('aria-label', 'Start tuning — requests microphone access');
  btn.addEventListener('click', () => handleStart(container));
  container.appendChild(btn);
}

function renderRequesting(container) {
  container.innerHTML = '';
  const msg = document.createElement('p');
  msg.className = 'pf-status pf-status--requesting';
  msg.textContent = 'Requesting microphone\u2026';
  msg.setAttribute('role', 'status');
  container.appendChild(msg);
}

function renderActive(container) {
  container.innerHTML = '';
  const btn = document.createElement('button');
  btn.className = 'pf-stop-btn';
  btn.type = 'button';
  btn.textContent = 'Stop';
  btn.setAttribute('aria-label', 'Stop tuning');
  btn.addEventListener('click', () => handleStop(container));
  container.appendChild(btn);
}

function renderDenied(container) {
  container.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'pf-message pf-message--denied';
  wrapper.setAttribute('role', 'alert');

  const text = document.createElement('p');
  text.className = 'pf-status pf-status--error';
  text.textContent =
    'Microphone access was denied. Please enable it in your browser settings and reload the page.';

  const retry = document.createElement('button');
  retry.className = 'pf-retry-btn';
  retry.type = 'button';
  retry.textContent = 'Retry';
  retry.addEventListener('click', () => handleStart(container));

  wrapper.append(text, retry);
  container.appendChild(wrapper);
}

function renderNoHttps(container) {
  container.innerHTML = '';
  const msg = document.createElement('p');
  msg.className = 'pf-status pf-status--error';
  msg.setAttribute('role', 'alert');
  msg.textContent =
    'Microphone access requires a secure connection (HTTPS). Please load this page over HTTPS.';
  container.appendChild(msg);
}

function renderError(container) {
  container.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'pf-message pf-message--error';
  wrapper.setAttribute('role', 'alert');

  const text = document.createElement('p');
  text.className = 'pf-status pf-status--error';
  text.textContent =
    'Something went wrong while accessing the microphone. Please try again.';

  const retry = document.createElement('button');
  retry.className = 'pf-retry-btn';
  retry.type = 'button';
  retry.textContent = 'Retry';
  retry.addEventListener('click', () => handleStart(container));

  wrapper.append(text, retry);
  container.appendChild(wrapper);
}

/* ------------------------------------------------------------------ */
/*  Handlers                                                           */
/* ------------------------------------------------------------------ */

async function handleStart(container) {
  if (!isSecureContext()) {
    renderNoHttps(container);
    return;
  }

  renderRequesting(container);

  try {
    const analyser = await startMicrophone();
    renderActive(container);
    if (_onStartCb) _onStartCb(analyser);
  } catch (_err) {
    const micState = getMicrophoneState();
    if (micState === 'denied') {
      renderDenied(container);
    } else {
      renderError(container);
    }
  }
}

function handleStop(container) {
  stopMicrophone();
  renderStart(container);
  if (_onStopCb) _onStopCb();
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Mount the permission flow into the given container element.
 * @param {HTMLElement} container — typically .action-buttons
 */
export function createPermissionFlow(container) {
  _container = container;
  renderStart(container);
}

/**
 * Register a callback invoked when the microphone starts successfully.
 * @param {(analyser: AnalyserNode) => void} callback
 */
export function onStart(callback) {
  _onStartCb = callback;
}

/**
 * Register a callback invoked when the user stops tuning.
 * @param {() => void} callback
 */
export function onStop(callback) {
  _onStopCb = callback;
}
