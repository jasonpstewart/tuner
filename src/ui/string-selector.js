import { instruments } from '../data/instruments.js';
import { midiToFrequency } from '../utils/music.js';
import { getReferencePitch } from './menu.js';
import '../styles/controls.css';

/** @typedef {import('../data/instruments.js').instruments} InstrumentsData */

/*
 * String selector with merged select+play button.
 *
 * Two independent string indices:
 *   - selectedStringIndex : sticky, set only by user tap, drives the tuning
 *                           target (gauge compares cents against this string).
 *   - detectedStringIndex : transient, set only by pitch detection, drives the
 *                           amber "hearing this" outline on the button.
 *
 * Tap state machine on a string button:
 *   - idle (neither selected nor playing)          -> select + play tone
 *   - selected, tone playing                       -> stop tone, keep selection
 *   - selected, tone NOT playing                   -> restart tone
 *   - different string, regardless of state        -> stop old tone, switch
 *                                                     selection, play new tone
 *
 * The detector's auto-lock never sets selectedStringIndex and never triggers
 * a tone - it only paints the amber outline hint. This preserves the escape
 * hatch of manual pinning when the detector is doing the wrong thing.
 */

// ── State ──────────────────────────────────────────────────────────────
let currentInstrumentIndex = 0;
let currentTuningIndex = 0;
let selectedStringIndex = -1;
let detectedStringIndex = -1;
let playingStringIndex = -1;
let detectedInTune = false;

// Callbacks
let instrumentChangeCallback = null;
let stringSelectCallback = null;

// DOM refs (set during mount)
let instrumentSelect = null;
let tuningSelect = null;
let stringButtonsContainer = null;
let anyNoteButton = null;

// ── Helpers ────────────────────────────────────────────────────────────

function currentInstrument() {
  return instruments[currentInstrumentIndex];
}

function currentTuning() {
  return currentInstrument().tunings[currentTuningIndex];
}

/**
 * Resolve a string's reference frequency at the current A4 setting.
 * Instrument data stores frequencies at A4=440 for readability, but the
 * authoritative source is `midiNote` — this recomputes from the MIDI note
 * using the user's A4 so reference tones and gauge calculations stay in
 * sync when A4 is changed (e.g. 432 Hz, 442 Hz).
 *
 * @param {{ midiNote: number, frequency: number }} s
 * @returns {number}
 */
function stringFrequency(s) {
  return midiToFrequency(s.midiNote, getReferencePitch());
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
  tuningSelect.disabled = tunings.length <= 1;
}

function renderStringButtons() {
  stringButtonsContainer.innerHTML = '';
  anyNoteButton = null;
  const strings = currentTuning().strings;

  strings.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.className = 'string-btn';
    btn.type = 'button';
    btn.dataset.index = i;
    btn.dataset.frequency = String(stringFrequency(s));
    btn.dataset.stringName = s.name;

    const label = document.createElement('span');
    label.className = 'string-btn-label';
    label.textContent = s.name;
    btn.appendChild(label);

    // Small status dot: shown when the button is the currently-detected
    // string, filled teal when the detected pitch is within the in-tune
    // threshold. Purely a glance hint — precise cents live in the gauge.
    const dot = document.createElement('span');
    dot.className = 'string-btn-dot';
    dot.setAttribute('aria-hidden', 'true');
    btn.appendChild(dot);

    btn.addEventListener('click', () => handleStringTap(i));

    stringButtonsContainer.appendChild(btn);
  });

  // "Any Note" button — escape hatch that clears the selection so the gauge
  // reverts to showing whatever note the mic hears, without locking to any
  // preset string. Rendered at the end of the row with a distinct style so
  // users can tell it's a mode, not a tuning preset.
  anyNoteButton = document.createElement('button');
  anyNoteButton.className = 'any-note-btn';
  anyNoteButton.type = 'button';
  anyNoteButton.textContent = 'Any Note';
  anyNoteButton.addEventListener('click', handleAnyNoteTap);
  stringButtonsContainer.appendChild(anyNoteButton);

  applyButtonStates();
}

/**
 * Any Note tap handler — clears the user's pinned string selection and stops
 * any playing reference tone. The gauge automatically reverts to chromatic
 * readout when no string is selected.
 */
function handleAnyNoteTap() {
  if (selectedStringIndex === -1 && playingStringIndex === -1) return;
  selectedStringIndex = -1;
  if (playingStringIndex !== -1) {
    document.dispatchEvent(new CustomEvent('stop-tone'));
  }
  applyButtonStates();
}

/**
 * Tap handler — implements the state machine in the file header comment.
 */
function handleStringTap(index) {
  const strings = currentTuning().strings;
  const string = strings[index];
  if (!string) return;

  const freq = stringFrequency(string);

  if (index === selectedStringIndex) {
    // Same-string tap: toggle tone on/off, keep selection pinned.
    if (playingStringIndex === index) {
      document.dispatchEvent(new CustomEvent('stop-tone'));
    } else {
      document.dispatchEvent(
        new CustomEvent('play-tone', {
          detail: { frequency: freq, name: string.name },
        })
      );
    }
  } else {
    // Different-string tap: switch selection and (re)start tone.
    selectedStringIndex = index;
    document.dispatchEvent(
      new CustomEvent('play-tone', {
        detail: { frequency: freq, name: string.name },
      })
    );
    if (stringSelectCallback) {
      stringSelectCallback(index, string);
    }
  }
  applyButtonStates();
}

/**
 * Apply the visual state classes (.selected, .detected, .playing, .in-tune)
 * to every button based on current index state.
 */
function applyButtonStates() {
  if (!stringButtonsContainer) return;
  const buttons = stringButtonsContainer.querySelectorAll('.string-btn');
  buttons.forEach((btn, i) => {
    const isSelected = i === selectedStringIndex;
    const isDetected = i === detectedStringIndex;
    const isPlaying = i === playingStringIndex;

    btn.classList.toggle('selected', isSelected);
    btn.classList.toggle('detected', isDetected);
    btn.classList.toggle('playing', isPlaying);
    btn.classList.toggle('in-tune', isDetected && detectedInTune);

    btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

    const name = btn.dataset.stringName || '';
    const freq = btn.dataset.frequency || '';
    let label = `String ${name}, ${freq} Hz`;
    if (isPlaying) label = `Stop ${name} reference tone`;
    else if (isSelected) label = `${name} selected, tap to play reference tone`;
    else label = `${name}, tap to select and play reference tone`;
    btn.setAttribute('aria-label', label);
  });

  if (anyNoteButton) {
    const anyNoteActive = selectedStringIndex === -1;
    anyNoteButton.classList.toggle('selected', anyNoteActive);
    anyNoteButton.setAttribute('aria-pressed', anyNoteActive ? 'true' : 'false');
    anyNoteButton.setAttribute(
      'aria-label',
      anyNoteActive
        ? 'Any Note mode active, gauge shows whatever note you play'
        : 'Switch to Any Note mode'
    );
  }
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
  stringButtonsContainer.setAttribute('aria-label', 'Strings');
  container.appendChild(stringButtonsContainer);

  // Event: instrument change
  instrumentSelect.addEventListener('change', () => {
    currentInstrumentIndex = parseInt(instrumentSelect.value, 10);
    currentTuningIndex = 0;
    selectedStringIndex = -1;
    detectedStringIndex = -1;
    renderTuningOptions();
    renderStringButtons();
    notifyInstrumentChange();
  });

  // Event: tuning change
  tuningSelect.addEventListener('change', () => {
    currentTuningIndex = parseInt(tuningSelect.value, 10);
    selectedStringIndex = -1;
    detectedStringIndex = -1;
    renderStringButtons();
    notifyInstrumentChange();
  });

  // Reflect tone playback state on string buttons
  document.addEventListener('tone-start', (e) => {
    setPlayingFrequency(e.detail.frequency);
  });
  document.addEventListener('tone-end', () => {
    setPlayingFrequency(null);
  });

  // When A4 reference pitch changes (settings panel), recompute all
  // string-button dataset frequencies and restart any in-flight tone at
  // the new pitch so the reference stays in sync with the tuner.
  document.addEventListener('reference-pitch-change', () => {
    if (!stringButtonsContainer) return;
    const strings = currentTuning().strings;
    const buttons = stringButtonsContainer.querySelectorAll('.string-btn');
    buttons.forEach((btn, i) => {
      if (strings[i]) btn.dataset.frequency = String(stringFrequency(strings[i]));
    });
    if (playingStringIndex >= 0 && strings[playingStringIndex]) {
      const s = strings[playingStringIndex];
      document.dispatchEvent(
        new CustomEvent('play-tone', {
          detail: { frequency: stringFrequency(s), name: s.name },
        })
      );
    }
  });

  // Initial render
  renderTuningOptions();
  renderStringButtons();
}

/**
 * Update the pulsing-play state based on the currently-playing tone frequency.
 * @param {number | null} frequency
 */
function setPlayingFrequency(frequency) {
  if (!stringButtonsContainer) return;
  if (frequency === null) {
    playingStringIndex = -1;
  } else {
    const strings = currentTuning().strings;
    playingStringIndex = strings.findIndex(
      (s) => Math.abs(s.frequency - frequency) < 0.01
    );
  }
  applyButtonStates();
}

/**
 * Update which string the pitch detector has identified as closest.
 * Called from main.js on every detection frame.
 *
 * @param {number} stringIndex - Closest string index, or -1 if none within threshold
 * @param {boolean} [inTune=false] - Whether the detected pitch is within the in-tune threshold
 */
export function setDetectedString(stringIndex, inTune = false) {
  if (stringIndex === detectedStringIndex && inTune === detectedInTune) return;
  detectedStringIndex = stringIndex;
  detectedInTune = inTune;
  applyButtonStates();
}

/**
 * Returns the currently-selected string index (user-sticky), or -1 if none.
 * @returns {number}
 */
export function getSelectedStringIndex() {
  return selectedStringIndex;
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
