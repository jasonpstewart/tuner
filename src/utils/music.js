/**
 * Music math utilities for instrument tuning.
 *
 * All functions accept an optional `a4` parameter (default 440 Hz)
 * for configurable reference pitch.
 */

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/**
 * Returns the standard chromatic note names.
 * @returns {string[]}
 */
export function getNoteNames() {
  return [...NOTE_NAMES];
}

/**
 * Converts a MIDI note number to frequency in Hz.
 * Formula: f = a4 * 2^((midiNote - 69) / 12)
 *
 * @param {number} midiNote - MIDI note number (0-127)
 * @param {number} [a4=440] - Reference frequency for A4
 * @returns {number} Frequency in Hz
 */
export function midiToFrequency(midiNote, a4 = 440) {
  return a4 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Converts a frequency in Hz to a (possibly fractional) MIDI note number.
 * Inverse of midiToFrequency.
 *
 * @param {number} frequency - Frequency in Hz
 * @param {number} [a4=440] - Reference frequency for A4
 * @returns {number} MIDI note number (can be fractional)
 */
export function frequencyToMidi(frequency, a4 = 440) {
  return 69 + 12 * Math.log2(frequency / a4);
}

/**
 * Calculates cents deviation between a detected frequency and a target frequency.
 * Formula: 1200 * log2(detected / target)
 *
 * @param {number} detected - Detected frequency in Hz
 * @param {number} target - Target frequency in Hz
 * @returns {number} Cents deviation (positive = sharp, negative = flat)
 */
export function calculateCents(detected, target) {
  return 1200 * Math.log2(detected / target);
}

/**
 * Returns the nearest note name, octave, and cents deviation for a given frequency.
 *
 * @param {number} frequency - Frequency in Hz
 * @param {number} [a4=440] - Reference frequency for A4
 * @returns {{ note: string, octave: number, cents: number }}
 */
export function frequencyToNoteName(frequency, a4 = 440) {
  const midi = frequencyToMidi(frequency, a4);
  const roundedMidi = Math.round(midi);
  const cents = (midi - roundedMidi) * 100;
  const noteIndex = ((roundedMidi % 12) + 12) % 12;
  const octave = Math.floor(roundedMidi / 12) - 1;

  return {
    note: NOTE_NAMES[noteIndex],
    octave,
    cents: Math.round(cents * 100) / 100,
  };
}

/**
 * Finds the closest string to a detected frequency from an array of string objects.
 *
 * @param {number} frequency - Detected frequency in Hz
 * @param {{ frequency: number }[]} strings - Array of string objects with frequency property
 * @param {number} [a4=440] - Reference frequency for A4 (used for recalculating if needed)
 * @returns {{ string: object, cents: number }} The closest string and cents deviation
 */
export function findClosestString(frequency, strings, a4 = 440) {
  let closestString = null;
  let closestCents = Infinity;

  for (const s of strings) {
    const targetFreq = a4 === 440 ? s.frequency : midiToFrequency(s.midiNote, a4);
    const cents = calculateCents(frequency, targetFreq);
    if (Math.abs(cents) < Math.abs(closestCents)) {
      closestCents = cents;
      closestString = s;
    }
  }

  return {
    string: closestString,
    cents: Math.round(closestCents * 100) / 100,
  };
}
