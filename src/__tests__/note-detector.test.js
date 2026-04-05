import { describe, it, expect } from "vitest";
import { detectNote } from "../audio/note-detector.js";

const guitarStrings = [
  { name: "E2", note: "E", octave: 2, midiNote: 40, frequency: 82.41 },
  { name: "A2", note: "A", octave: 2, midiNote: 45, frequency: 110.0 },
  { name: "D3", note: "D", octave: 3, midiNote: 50, frequency: 146.83 },
  { name: "G3", note: "G", octave: 3, midiNote: 55, frequency: 196.0 },
  { name: "B3", note: "B", octave: 3, midiNote: 59, frequency: 246.94 },
  { name: "E4", note: "E", octave: 4, midiNote: 64, frequency: 329.63 },
];

describe("detectNote – chromatic mode", () => {
  it("440 Hz → A4, in tune", () => {
    const result = detectNote(440, null);
    expect(result.note).toBe("A");
    expect(result.octave).toBe(4);
    expect(result.cents).toBe(0);
    expect(result.inTune).toBe(true);
    expect(result.direction).toBe("in-tune");
    expect(result.closestString).toBeNull();
    expect(result.stringCents).toBeNull();
  });

  it("preserves frequency in result", () => {
    const result = detectNote(440, null);
    expect(result.frequency).toBe(440);
  });

  it("empty strings array → chromatic mode", () => {
    const result = detectNote(440, []);
    expect(result.closestString).toBeNull();
    expect(result.stringCents).toBeNull();
    expect(result.inTune).toBe(true);
  });
});

describe("detectNote – instrument mode", () => {
  it("110 Hz with guitar strings → closest is A2", () => {
    const result = detectNote(110, guitarStrings);
    expect(result.note).toBe("A");
    expect(result.octave).toBe(2);
    expect(result.closestString).not.toBeNull();
    expect(result.closestString.name).toBe("A2");
    expect(result.stringCents).toBe(0);
    expect(result.inTune).toBe(true);
  });

  it("440 Hz with guitar strings → closest is E4", () => {
    const result = detectNote(440, guitarStrings);
    expect(result.closestString).not.toBeNull();
    expect(result.closestString.name).toBe("E4");
    expect(result.stringCents).not.toBeNull();
  });
});

describe("detectNote – sharp/flat detection", () => {
  it("445 Hz chromatic → direction sharp", () => {
    const result = detectNote(445, null);
    expect(result.direction).toBe("sharp");
    expect(result.cents).toBeGreaterThan(0);
  });

  it("435 Hz chromatic → direction flat", () => {
    const result = detectNote(435, null);
    expect(result.direction).toBe("flat");
    expect(result.cents).toBeLessThan(0);
  });
});

describe("detectNote – in-tune threshold", () => {
  it("441 Hz → in tune (within 10 cents)", () => {
    const result = detectNote(441, null);
    expect(result.inTune).toBe(true);
    expect(Math.abs(result.cents)).toBeLessThanOrEqual(10);
  });

  it("460 Hz → not in tune", () => {
    const result = detectNote(460, null);
    expect(result.inTune).toBe(false);
  });

  it("within 5 cents → direction is in-tune", () => {
    // 440.5 Hz is ~2 cents sharp — within the 5-cent direction threshold
    const result = detectNote(440.5, null);
    expect(result.direction).toBe("in-tune");
  });
});

describe("detectNote – edge cases", () => {
  it("null frequency → null", () => {
    expect(detectNote(null, null)).toBeNull();
  });

  it("undefined frequency → null", () => {
    expect(detectNote(undefined, null)).toBeNull();
  });

  it("0 frequency → null (below MIN_FREQUENCY)", () => {
    expect(detectNote(0, null)).toBeNull();
  });

  it("negative frequency → null", () => {
    expect(detectNote(-100, null)).toBeNull();
  });

  it("Infinity → null", () => {
    expect(detectNote(Infinity, null)).toBeNull();
  });

  it("NaN → null", () => {
    expect(detectNote(NaN, null)).toBeNull();
  });

  it("frequency below 20 Hz → null", () => {
    expect(detectNote(15, null)).toBeNull();
  });

  it("frequency above 5000 Hz → null", () => {
    expect(detectNote(6000, null)).toBeNull();
  });

  it("frequency at boundaries: 20 Hz → valid result", () => {
    expect(detectNote(20, null)).not.toBeNull();
  });

  it("frequency at boundaries: 5000 Hz → valid result", () => {
    expect(detectNote(5000, null)).not.toBeNull();
  });

  it("with custom a4=432", () => {
    const result = detectNote(432, null, 432);
    expect(result.note).toBe("A");
    expect(result.octave).toBe(4);
    expect(result.cents).toBe(0);
    expect(result.inTune).toBe(true);
  });
});
