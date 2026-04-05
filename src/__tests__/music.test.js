import { describe, it, expect } from "vitest";
import {
  midiToFrequency,
  frequencyToMidi,
  frequencyToNoteName,
  calculateCents,
  getNoteNames,
  findClosestString,
} from "../utils/music.js";

describe("getNoteNames", () => {
  it("returns 12 chromatic note names", () => {
    const names = getNoteNames();
    expect(names).toHaveLength(12);
    expect(names[0]).toBe("C");
    expect(names[9]).toBe("A");
  });

  it("returns a copy, not the original array", () => {
    const a = getNoteNames();
    const b = getNoteNames();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

describe("midiToFrequency", () => {
  it("MIDI 69 → 440 Hz (A4)", () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 2);
  });

  it("MIDI 60 → 261.63 Hz (C4)", () => {
    expect(midiToFrequency(60)).toBeCloseTo(261.63, 1);
  });

  it("MIDI 69 with a4=432 → 432 Hz", () => {
    expect(midiToFrequency(69, 432)).toBeCloseTo(432, 2);
  });

  it("MIDI 60 with a4=432 scales proportionally", () => {
    const ratio = midiToFrequency(60) / 440;
    expect(midiToFrequency(60, 432)).toBeCloseTo(432 * ratio, 1);
  });

  it("MIDI 0 → very low frequency", () => {
    expect(midiToFrequency(0)).toBeCloseTo(8.18, 1);
  });

  it("MIDI 127 → very high frequency", () => {
    expect(midiToFrequency(127)).toBeGreaterThan(12000);
  });
});

describe("frequencyToMidi", () => {
  it("440 Hz → MIDI 69", () => {
    expect(frequencyToMidi(440)).toBeCloseTo(69, 5);
  });

  it("261.63 Hz → ~MIDI 60", () => {
    expect(frequencyToMidi(261.63)).toBeCloseTo(60, 0);
  });

  it("880 Hz → MIDI 81 (A5, octave above A4)", () => {
    expect(frequencyToMidi(880)).toBeCloseTo(81, 5);
  });

  it("with a4=432, 432 Hz → MIDI 69", () => {
    expect(frequencyToMidi(432, 432)).toBeCloseTo(69, 5);
  });

  it("round-trips with midiToFrequency", () => {
    for (const midi of [21, 40, 60, 69, 88, 108]) {
      const freq = midiToFrequency(midi);
      expect(frequencyToMidi(freq)).toBeCloseTo(midi, 5);
    }
  });
});

describe("calculateCents", () => {
  it("same frequency → 0 cents", () => {
    expect(calculateCents(440, 440)).toBe(0);
  });

  it("octave above → 1200 cents", () => {
    expect(calculateCents(880, 440)).toBeCloseTo(1200, 5);
  });

  it("octave below → -1200 cents", () => {
    expect(calculateCents(220, 440)).toBeCloseTo(-1200, 5);
  });

  it("half step above → ~100 cents", () => {
    const halfStepAbove = 440 * Math.pow(2, 1 / 12);
    expect(calculateCents(halfStepAbove, 440)).toBeCloseTo(100, 5);
  });

  it("slightly sharp → small positive cents", () => {
    expect(calculateCents(441, 440)).toBeGreaterThan(0);
    expect(calculateCents(441, 440)).toBeLessThan(10);
  });

  it("slightly flat → small negative cents", () => {
    expect(calculateCents(439, 440)).toBeLessThan(0);
    expect(calculateCents(439, 440)).toBeGreaterThan(-10);
  });
});

describe("frequencyToNoteName", () => {
  it("440 Hz → A4, 0 cents", () => {
    const result = frequencyToNoteName(440);
    expect(result.note).toBe("A");
    expect(result.octave).toBe(4);
    expect(result.cents).toBe(0);
  });

  it("261.63 Hz → C4, ~0 cents", () => {
    const result = frequencyToNoteName(261.63);
    expect(result.note).toBe("C");
    expect(result.octave).toBe(4);
    expect(Math.abs(result.cents)).toBeLessThan(5);
  });

  it("445 Hz → A4, sharp (positive cents)", () => {
    const result = frequencyToNoteName(445);
    expect(result.note).toBe("A");
    expect(result.octave).toBe(4);
    expect(result.cents).toBeGreaterThan(0);
  });

  it("435 Hz → A4, flat (negative cents)", () => {
    const result = frequencyToNoteName(435);
    expect(result.note).toBe("A");
    expect(result.octave).toBe(4);
    expect(result.cents).toBeLessThan(0);
  });

  it("with a4=432, 432 Hz → A4, 0 cents", () => {
    const result = frequencyToNoteName(432, 432);
    expect(result.note).toBe("A");
    expect(result.octave).toBe(4);
    expect(result.cents).toBe(0);
  });

  it("very low freq: bass B0 ~30.87 Hz", () => {
    const result = frequencyToNoteName(30.87);
    expect(result.note).toBe("B");
    expect(result.octave).toBe(0);
  });

  it("very high freq: violin E5 ~659.26 Hz", () => {
    const result = frequencyToNoteName(659.26);
    expect(result.note).toBe("E");
    expect(result.octave).toBe(5);
  });
});

describe("findClosestString", () => {
  const guitarStrings = [
    { name: "E2", note: "E", octave: 2, midiNote: 40, frequency: 82.41 },
    { name: "A2", note: "A", octave: 2, midiNote: 45, frequency: 110.0 },
    { name: "D3", note: "D", octave: 3, midiNote: 50, frequency: 146.83 },
    { name: "G3", note: "G", octave: 3, midiNote: 55, frequency: 196.0 },
    { name: "B3", note: "B", octave: 3, midiNote: 59, frequency: 246.94 },
    { name: "E4", note: "E", octave: 4, midiNote: 64, frequency: 329.63 },
  ];

  it("exact match on A2 string (110 Hz)", () => {
    const result = findClosestString(110, guitarStrings);
    expect(result.string.name).toBe("A2");
    expect(result.cents).toBe(0);
  });

  it("slightly sharp of E2 → closest is E2", () => {
    const result = findClosestString(84, guitarStrings);
    expect(result.string.name).toBe("E2");
    expect(result.cents).toBeGreaterThan(0);
  });

  it("frequency between A2 and D3 → picks nearest", () => {
    // 125 Hz is closer to A2 (110) than D3 (146.83) in cents
    const result = findClosestString(125, guitarStrings);
    expect(result.string.name).toBe("A2");
  });

  it("frequency near high E4 → closest is E4", () => {
    const result = findClosestString(330, guitarStrings);
    expect(result.string.name).toBe("E4");
    expect(Math.abs(result.cents)).toBeLessThan(5);
  });

  it("with custom a4, recalculates target frequencies", () => {
    const result = findClosestString(432, guitarStrings, 432);
    // At a4=432, midiNote 69 would be 432 Hz, but no guitar string is at 69
    // The closest string should still be E4 (midiNote 64)
    expect(result.string.name).toBe("E4");
  });
});
