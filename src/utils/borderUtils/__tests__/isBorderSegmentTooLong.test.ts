import { describe, it, expect } from "vitest";
import { isBorderSegmentTooLong } from "../isBorderSegmentTooLong";
import { BorderSide } from "../types";

describe("isBorderSegmentTooLong", () => {
  it("should return true when segment is too long for side", () => {
    const side: BorderSide = {
      name: "top",
      length: 800,
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 800, y: 0 },
    };

    // Starting at position 500 on an 800px side, trying to add 400px segment
    expect(isBorderSegmentTooLong(side, 500, 400)).toBe(true);

    // Starting at the very beginning but segment is longer than side
    expect(isBorderSegmentTooLong(side, 0, 900)).toBe(true);

    // Edge case: starting at the very end of the side
    expect(isBorderSegmentTooLong(side, 800, 1)).toBe(true);
  });

  it("should return false when segment fits on the side", () => {
    const side: BorderSide = {
      name: "right",
      length: 600,
      startPoint: { x: 800, y: 0 },
      endPoint: { x: 800, y: 600 },
    };

    // Exactly fits the side
    expect(isBorderSegmentTooLong(side, 0, 600)).toBe(false);

    // Starting in the middle with segment that fits
    expect(isBorderSegmentTooLong(side, 200, 400)).toBe(false);

    // Very small segment
    expect(isBorderSegmentTooLong(side, 590, 10)).toBe(false);
  });

  it("should handle edge cases", () => {
    const side: BorderSide = {
      name: "bottom",
      length: 800,
      startPoint: { x: 800, y: 600 },
      endPoint: { x: 0, y: 600 },
    };

    // Zero length segment should never be too long
    expect(isBorderSegmentTooLong(side, 400, 0)).toBe(false);

    // Negative starting position (should be treated as position 0)
    expect(isBorderSegmentTooLong(side, -50, 300)).toBe(false);
    expect(isBorderSegmentTooLong(side, -50, 900)).toBe(true);

    // Negative segment length (should be treated as 0)
    expect(isBorderSegmentTooLong(side, 500, -100)).toBe(false);
  });
});
