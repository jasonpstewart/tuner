/**
 * Note detection and closest-string matching.
 *
 * Pure function module that connects detected frequency to musical meaning.
 * Supports both instrument mode (match against specific strings) and
 * chromatic mode (identify nearest note from the chromatic scale).
 */

import {
  frequencyToNoteName,
  calculateCents,
  findClosestString,
} from "../utils/music.js";

/** Minimum musically useful frequency (Hz). */
const MIN_FREQUENCY = 20;

/** Maximum musically useful frequency (Hz). */
const MAX_FREQUENCY = 5000;

/** In-tune threshold in cents. */
const IN_TUNE_THRESHOLD = 10;

/** Direction dead-zone in cents. */
const DIRECTION_THRESHOLD = 5;

/**
 * Determines the tuning direction label from a cents value.
 *
 * @param {number} cents - Cents deviation (positive = sharp, negative = flat)
 * @returns {'sharp' | 'flat' | 'in-tune'}
 */
function getDirection(cents) {
  if (cents > DIRECTION_THRESHOLD) return "sharp";
  if (cents < -DIRECTION_THRESHOLD) return "flat";
  return "in-tune";
}

/**
 * Takes a detected frequency and returns full musical context.
 *
 * In **instrument mode** (strings array provided), the closest string is
 * identified and stringCents/inTune/direction are relative to that string.
 *
 * In **chromatic mode** (strings is null or empty), stringCents is null and
 * inTune/direction are based on deviation from the nearest chromatic note.
 *
 * @param {number | null | undefined} frequency - Detected frequency in Hz
 * @param {{ frequency: number, midiNote: number }[] | null} strings - Instrument strings, or null for chromatic mode
 * @param {number} [a4=440] - Reference frequency for A4
 * @returns {{
 *   frequency: number,
 *   note: string,
 *   octave: number,
 *   cents: number,
 *   closestString: object | null,
 *   stringCents: number | null,
 *   inTune: boolean,
 *   direction: 'sharp' | 'flat' | 'in-tune'
 * } | null} Detection result, or null for invalid input
 */
export function detectNote(frequency, strings, a4 = 440) {
  if (frequency == null || !isFinite(frequency)) return null;
  if (frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) return null;

  const { note, octave, cents } = frequencyToNoteName(frequency, a4);

  const isChromatic = !strings || strings.length === 0;

  if (isChromatic) {
    return {
      frequency,
      note,
      octave,
      cents,
      closestString: null,
      stringCents: null,
      inTune: Math.abs(cents) <= IN_TUNE_THRESHOLD,
      direction: getDirection(cents),
    };
  }

  // Instrument mode
  const { string: closestString, cents: stringCents } = findClosestString(
    frequency,
    strings,
    a4,
  );

  return {
    frequency,
    note,
    octave,
    cents,
    closestString,
    stringCents,
    inTune: Math.abs(stringCents) <= IN_TUNE_THRESHOLD,
    direction: getDirection(stringCents),
  };
}
