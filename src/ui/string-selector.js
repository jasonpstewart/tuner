import { instruments } from '../data/instruments.js';
import '../styles/controls.css';

/** @typedef {import('../data/instruments.js').instruments} InstrumentsData */

// ── State ──────────────────────────────────────────────────────────────
let currentInstrumentIndex = 0;
let currentTuningIndex = 0;
let activeStringIndex = -1;
let chromaticMode = false;

// Callbacks
let instrumentChangeCallback = null;
let stringSelectCallback = null;

// DOM refs (set during mount)
let instrumentSelect = null;
let tuningSelect = null;
let stringButtonsContainer = null;
let chromaticToggle = null;

// ── Helpers ────────────────────────────────────────────────────────────

function currentInstrument() {
  return instruments[currentInstrumentIndex];
}

function currentTuning() {
  return currentInstrument().tunings[currentTuningIndex];
}

/** Small inline play-icon SVG (speaker shape) */
function playIconSVG() {
  return '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 5.5h2l3.5-3v11l-3.5-3H3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1zm8 .25a3.5 3.5 0 0 1 0 4.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
}

// ── Render functions ───────────────────────────────────────────────────

function renderTuningOptions() {
  tuningSelect.innerHTML = '';
  const tunings = currentInstrument().tunings;
  tunings.forEach((t, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = t.name;
    tuningSelect.appendChild(opt);
  });
  tuningSelect.value = currentTuningIndex;
}

function renderStringButtons() {
  stringButtonsContainer.innerHTML = '';
  const strings = currentTuning().strings;

  strings.forEach((s, i) => {
    const group = document.createElement('div');
    group.className = 'string-group';

    // Main string button
    const btn = document.createElement('button');
    btn.className = 'string-btn' + (i === activeStringIndex ? ' active' : '');
    btn.type = 'button';
    btn.textContent = s.name;
    btn.setAttribute('aria-label', `String ${s.name}, ${s.frequency} Hz`);
    btn.setAttribute('aria-pressed', i === activeStringIndex ? 'true' : 'false');
    btn.dataset.index = i;

    btn.addEventListener('click', () => {
      setActiveString(i);
      if (stringSelectCallback) {
        stringSelectCallback(i, s);
      }
    });

    // Play tone button
    const playBtn = document.createElement('button');
    playBtn.className = 'play-tone-btn';
    playBtn.type = 'button';
    playBtn.innerHTML = playIconSVG();
    playBtn.setAttribute('aria-label', `Play ${s.name} reference tone`);
    playBtn.dataset.frequency = s.frequency;

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.dispatchEvent(
        new CustomEvent('play-tone', {
          detail: { frequency: s.frequency, name: s.name },
        })
      );
    });

    group.appendChild(btn);
    group.appendChild(playBtn);
    stringButtonsContainer.appendChild(group);
  });
}

function notifyInstrumentChange() {
  if (instrumentChangeCallback) {
    instrumentChangeCallback(getSelectedTuning());
  }
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Mount the string selector UI into the given container.
 * @param {HTMLElement} container - Mount point (.string-selector)
 * @param {typeof instruments} _instrumentsData - Instrument data (unused, we import directly)
 */
export function createStringSelector(container, _instrumentsData) {
  // Pickers row
  const pickersRow = document.createElement('div');
  pickersRow.className = 'pickers';

  instrumentSelect = document.createElement('select');
  instrumentSelect.className = 'picker-select';
  instrumentSelect.setAttribute('aria-label', 'Instrument');
  instruments.forEach((inst, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = inst.name;
    instrumentSelect.appendChild(opt);
  });

  tuningSelect = document.createElement('select');
  tuningSelect.className = 'picker-select';
  tuningSelect.setAttribute('aria-label', 'Tuning');

  pickersRow.appendChild(instrumentSelect);
  pickersRow.appendChild(tuningSelect);
  container.appendChild(pickersRow);

  // String buttons row
  stringButtonsContainer = document.createElement('div');
  stringButtonsContainer.className = 'string-buttons';
  stringButtonsContainer.setAttribute('role', 'group');
  stringButtonsContainer.setAttribute('aria-label', 'String selection');
  container.appendChild(stringButtonsContainer);

  // Chromatic mode toggle
  chromaticToggle = document.createElement('button');
  chromaticToggle.className = 'chromatic-toggle';
  chromaticToggle.type = 'button';
  chromaticToggle.textContent = 'Chromatic';
  chromaticToggle.setAttribute('aria-pressed', 'false');
  chromaticToggle.setAttribute('aria-label', 'Toggle chromatic mode');
  container.appendChild(chromaticToggle);

  // Event: instrument change
  instrumentSelect.addEventListener('change', () => {
    currentInstrumentIndex = parseInt(instrumentSelect.value, 10);
    currentTuningIndex = 0;
    activeStringIndex = -1;
    renderTuningOptions();
    renderStringButtons();
    notifyInstrumentChange();
  });

  // Event: tuning change
  tuningSelect.addEventListener('change', () => {
    currentTuningIndex = parseInt(tuningSelect.value, 10);
    activeStringIndex = -1;
    renderStringButtons();
    notifyInstrumentChange();
  });

  // Event: chromatic toggle
  chromaticToggle.addEventListener('click', () => {
    setChromaticMode(!chromaticMode);
  });

  // Initial render
  renderTuningOptions();
  renderStringButtons();
}

/**
 * Highlight a string button as active.
 * @param {number} stringIndex - Index of the string to highlight (-1 to clear)
 */
export function setActiveString(stringIndex) {
  activeStringIndex = stringIndex;
  const buttons = stringButtonsContainer.querySelectorAll('.string-btn');
  buttons.forEach((btn, i) => {
    const isActive = i === stringIndex;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

/**
 * Register a callback for instrument/tuning changes.
 * @param {function} callback - Receives { instrument, tuning, strings }
 */
export function onInstrumentChange(callback) {
  instrumentChangeCallback = callback;
}

/**
 * Register a callback for manual string selection.
 * @param {function} callback - Receives (stringIndex, stringData)
 */
export function onStringSelect(callback) {
  stringSelectCallback = callback;
}

/**
 * Get the currently selected tuning info.
 * @returns {{ instrument: object, tuning: object, strings: object[] }}
 */
export function getSelectedTuning() {
  const instrument = currentInstrument();
  const tuning = currentTuning();
  return {
    instrument: { id: instrument.id, name: instrument.name },
    tuning: { id: tuning.id, name: tuning.name },
    strings: tuning.strings,
  };
}

/**
 * Enable or disable chromatic mode.
 * @param {boolean} enabled
 */
export function setChromaticMode(enabled) {
  chromaticMode = enabled;
  if (chromaticToggle) {
    chromaticToggle.classList.toggle('active', enabled);
    chromaticToggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  }
  // Dispatch event so other modules can react
  document.dispatchEvent(
    new CustomEvent('chromatic-mode-change', { detail: { enabled } })
  );
}

/**
 * Check if chromatic mode is currently active.
 * @returns {boolean}
 */
export function isChromaticMode() {
  return chromaticMode;
}
