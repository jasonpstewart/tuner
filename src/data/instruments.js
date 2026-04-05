/**
 * Instrument tuning data model.
 *
 * Frequency formula: f = 440 * 2^((midiNote - 69) / 12)
 * All frequencies rounded to 2 decimal places.
 */

export const instruments = [
  {
    id: "guitar-6",
    name: "Guitar (6-string)",
    tunings: [
      {
        id: "standard",
        name: "Standard",
        strings: [
          { name: "E2", note: "E", octave: 2, midiNote: 40, frequency: 82.41 },
          { name: "A2", note: "A", octave: 2, midiNote: 45, frequency: 110.0 },
          { name: "D3", note: "D", octave: 3, midiNote: 50, frequency: 146.83 },
          { name: "G3", note: "G", octave: 3, midiNote: 55, frequency: 196.0 },
          { name: "B3", note: "B", octave: 3, midiNote: 59, frequency: 246.94 },
          { name: "E4", note: "E", octave: 4, midiNote: 64, frequency: 329.63 },
        ],
      },
      {
        id: "drop-d",
        name: "Drop D",
        strings: [
          { name: "D2", note: "D", octave: 2, midiNote: 38, frequency: 73.42 },
          { name: "A2", note: "A", octave: 2, midiNote: 45, frequency: 110.0 },
          { name: "D3", note: "D", octave: 3, midiNote: 50, frequency: 146.83 },
          { name: "G3", note: "G", octave: 3, midiNote: 55, frequency: 196.0 },
          { name: "B3", note: "B", octave: 3, midiNote: 59, frequency: 246.94 },
          { name: "D4", note: "D", octave: 4, midiNote: 62, frequency: 293.66 },
        ],
      },
      {
        id: "open-g",
        name: "Open G",
        strings: [
          { name: "D2", note: "D", octave: 2, midiNote: 38, frequency: 73.42 },
          { name: "G2", note: "G", octave: 2, midiNote: 43, frequency: 98.0 },
          { name: "D3", note: "D", octave: 3, midiNote: 50, frequency: 146.83 },
          { name: "G3", note: "G", octave: 3, midiNote: 55, frequency: 196.0 },
          { name: "B3", note: "B", octave: 3, midiNote: 59, frequency: 246.94 },
          { name: "D4", note: "D", octave: 4, midiNote: 62, frequency: 293.66 },
        ],
      },
      {
        id: "dadgad",
        name: "DADGAD",
        strings: [
          { name: "D2", note: "D", octave: 2, midiNote: 38, frequency: 73.42 },
          { name: "A2", note: "A", octave: 2, midiNote: 45, frequency: 110.0 },
          { name: "D3", note: "D", octave: 3, midiNote: 50, frequency: 146.83 },
          { name: "G3", note: "G", octave: 3, midiNote: 55, frequency: 196.0 },
          { name: "A3", note: "A", octave: 3, midiNote: 57, frequency: 220.0 },
          { name: "D4", note: "D", octave: 4, midiNote: 62, frequency: 293.66 },
        ],
      },
      {
        id: "half-step-down",
        name: "Half-step Down",
        strings: [
          { name: "Eb2", note: "D#", octave: 2, midiNote: 39, frequency: 77.78 },
          { name: "Ab2", note: "G#", octave: 2, midiNote: 44, frequency: 103.83 },
          { name: "Db3", note: "C#", octave: 3, midiNote: 49, frequency: 138.59 },
          { name: "Gb3", note: "F#", octave: 3, midiNote: 54, frequency: 185.0 },
          { name: "Bb3", note: "A#", octave: 3, midiNote: 58, frequency: 233.08 },
          { name: "Eb4", note: "D#", octave: 4, midiNote: 63, frequency: 311.13 },
        ],
      },
    ],
  },
  {
    id: "bass-4",
    name: "Bass (4-string)",
    tunings: [
      {
        id: "standard",
        name: "Standard",
        strings: [
          { name: "E1", note: "E", octave: 1, midiNote: 28, frequency: 41.2 },
          { name: "A1", note: "A", octave: 1, midiNote: 33, frequency: 55.0 },
          { name: "D2", note: "D", octave: 2, midiNote: 38, frequency: 73.42 },
          { name: "G2", note: "G", octave: 2, midiNote: 43, frequency: 98.0 },
        ],
      },
    ],
  },
  {
    id: "bass-5",
    name: "Bass (5-string)",
    tunings: [
      {
        id: "standard",
        name: "Standard",
        strings: [
          { name: "B0", note: "B", octave: 0, midiNote: 23, frequency: 30.87 },
          { name: "E1", note: "E", octave: 1, midiNote: 28, frequency: 41.2 },
          { name: "A1", note: "A", octave: 1, midiNote: 33, frequency: 55.0 },
          { name: "D2", note: "D", octave: 2, midiNote: 38, frequency: 73.42 },
          { name: "G2", note: "G", octave: 2, midiNote: 43, frequency: 98.0 },
        ],
      },
    ],
  },
  {
    id: "ukulele",
    name: "Ukulele",
    tunings: [
      {
        id: "standard",
        name: "Standard (GCEA)",
        // Re-entrant tuning: G4 is higher than C4
        strings: [
          { name: "G4", note: "G", octave: 4, midiNote: 67, frequency: 392.0 },
          { name: "C4", note: "C", octave: 4, midiNote: 60, frequency: 261.63 },
          { name: "E4", note: "E", octave: 4, midiNote: 64, frequency: 329.63 },
          { name: "A4", note: "A", octave: 4, midiNote: 69, frequency: 440.0 },
        ],
      },
      {
        id: "low-g",
        name: "Low G (linear)",
        // Linear tuning: G3 sits below C4 instead of above A4
        strings: [
          { name: "G3", note: "G", octave: 3, midiNote: 55, frequency: 196.0 },
          { name: "C4", note: "C", octave: 4, midiNote: 60, frequency: 261.63 },
          { name: "E4", note: "E", octave: 4, midiNote: 64, frequency: 329.63 },
          { name: "A4", note: "A", octave: 4, midiNote: 69, frequency: 440.0 },
        ],
      },
      {
        id: "d-tuning",
        name: "D-tuning (ADF#B)",
        // Traditional pre-1930s tuning, a whole step above GCEA. Re-entrant.
        strings: [
          { name: "A4", note: "A", octave: 4, midiNote: 69, frequency: 440.0 },
          { name: "D4", note: "D", octave: 4, midiNote: 62, frequency: 293.66 },
          { name: "F#4", note: "F#", octave: 4, midiNote: 66, frequency: 369.99 },
          { name: "B4", note: "B", octave: 4, midiNote: 71, frequency: 493.88 },
        ],
      },
    ],
  },
  {
    // Baritone ukulele: larger body, tuned like the top four strings of a guitar.
    // Linear (not re-entrant) and an octave lower in feel than soprano/concert/tenor,
    // so it gets its own instrument entry rather than a tuning of "Ukulele".
    id: "baritone-ukulele",
    name: "Baritone Ukulele",
    tunings: [
      {
        id: "standard",
        name: "Standard (DGBE)",
        strings: [
          { name: "D3", note: "D", octave: 3, midiNote: 50, frequency: 146.83 },
          { name: "G3", note: "G", octave: 3, midiNote: 55, frequency: 196.0 },
          { name: "B3", note: "B", octave: 3, midiNote: 59, frequency: 246.94 },
          { name: "E4", note: "E", octave: 4, midiNote: 64, frequency: 329.63 },
        ],
      },
    ],
  },
  {
    // Mandolin: four courses (pairs) tuned in fifths, same pitches as a violin.
    // Each course of two strings tunes to the same note, so only four
    // reference pitches are needed.
    id: "mandolin",
    name: "Mandolin",
    tunings: [
      {
        id: "standard",
        name: "Standard (GDAE)",
        strings: [
          { name: "G3", note: "G", octave: 3, midiNote: 55, frequency: 196.0 },
          { name: "D4", note: "D", octave: 4, midiNote: 62, frequency: 293.66 },
          { name: "A4", note: "A", octave: 4, midiNote: 69, frequency: 440.0 },
          { name: "E5", note: "E", octave: 5, midiNote: 76, frequency: 659.26 },
        ],
      },
    ],
  },
  {
    id: "violin",
    name: "Violin",
    tunings: [
      {
        id: "standard",
        name: "Standard",
        strings: [
          { name: "G3", note: "G", octave: 3, midiNote: 55, frequency: 196.0 },
          { name: "D4", note: "D", octave: 4, midiNote: 62, frequency: 293.66 },
          { name: "A4", note: "A", octave: 4, midiNote: 69, frequency: 440.0 },
          { name: "E5", note: "E", octave: 5, midiNote: 76, frequency: 659.26 },
        ],
      },
    ],
  },
  {
    id: "viola",
    name: "Viola",
    tunings: [
      {
        id: "standard",
        name: "Standard",
        strings: [
          { name: "C3", note: "C", octave: 3, midiNote: 48, frequency: 130.81 },
          { name: "G3", note: "G", octave: 3, midiNote: 55, frequency: 196.0 },
          { name: "D4", note: "D", octave: 4, midiNote: 62, frequency: 293.66 },
          { name: "A4", note: "A", octave: 4, midiNote: 69, frequency: 440.0 },
        ],
      },
    ],
  },
  {
    id: "cello",
    name: "Cello",
    tunings: [
      {
        id: "standard",
        name: "Standard",
        strings: [
          { name: "C2", note: "C", octave: 2, midiNote: 36, frequency: 65.41 },
          { name: "G2", note: "G", octave: 2, midiNote: 43, frequency: 98.0 },
          { name: "D3", note: "D", octave: 3, midiNote: 50, frequency: 146.83 },
          { name: "A3", note: "A", octave: 3, midiNote: 57, frequency: 220.0 },
        ],
      },
    ],
  },
  {
    // Bb trumpet: transposing instrument. Frequencies stored as CONCERT pitches
    // (what the tuner actually hears) since the microphone captures sounding
    // pitch, not written pitch.
    id: "trumpet",
    name: "Trumpet (Bb)",
    tunings: [
      {
        id: "standard",
        name: "Standard",
        strings: [
          { name: "Bb3", note: "A#", octave: 3, midiNote: 58, frequency: 233.08 },
          { name: "F4", note: "F", octave: 4, midiNote: 65, frequency: 349.23 },
          { name: "A4", note: "A", octave: 4, midiNote: 69, frequency: 440.0 },
          { name: "Bb4", note: "A#", octave: 4, midiNote: 70, frequency: 466.16 },
          { name: "C5", note: "C", octave: 5, midiNote: 72, frequency: 523.25 },
        ],
      },
    ],
  },
  {
    // Bb clarinet: transposing instrument. Concert pitches stored.
    id: "clarinet",
    name: "Clarinet (Bb)",
    tunings: [
      {
        id: "standard",
        name: "Standard",
        strings: [
          { name: "Bb3", note: "A#", octave: 3, midiNote: 58, frequency: 233.08 },
          { name: "Eb4", note: "D#", octave: 4, midiNote: 63, frequency: 311.13 },
          { name: "F4", note: "F", octave: 4, midiNote: 65, frequency: 349.23 },
          { name: "A4", note: "A", octave: 4, midiNote: 69, frequency: 440.0 },
          { name: "Bb4", note: "A#", octave: 4, midiNote: 70, frequency: 466.16 },
        ],
      },
    ],
  },
];
