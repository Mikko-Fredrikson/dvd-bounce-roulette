import { describe, it, expect } from "vitest";
import { calculateBorderSegments } from "../calculateBorderSegments";
import { createBorderSides } from "../borderSides";

describe("calculateBorderSegments", () => {
  // Create standard testing borders
  const width = 800;
  const height = 600;
  const sides = createBorderSides(width, height);
  const [top, right, bottom, left] = sides;

  it("should create a single segment when the entire length fits on the starting side", () => {
    // Player starts at position 100 on top with length 300
    const segments = calculateBorderSegments(top, 100, 300);

    // Should only need one segment
    expect(segments.length).toBe(1);
    expect(segments[0]).toEqual({
      side: top,
      startPosition: 100,
      length: 300,
    });
  });

  it("should create multiple segments when length spans multiple sides", () => {
    // Player starts at position 600 on top with length 500
    // - First segment: 200px on top (from 600 to 800)
    // - Second segment: 300px on right (from 0 to 300)
    const segments = calculateBorderSegments(top, 600, 500);

    expect(segments.length).toBe(2);

    expect(segments[0]).toEqual({
      side: top,
      startPosition: 600,
      length: 200, // Top remaining: 800 - 600 = 200
    });

    expect(segments[1]).toEqual({
      side: right,
      startPosition: 0,
      length: 300, // Remaining length after top: 500 - 200 = 300
    });
  });

  it("should handle when player spans three sides", () => {
    // Player starts from middle top (position 400) with length 1400
    // - First segment: 400px on top (from 400 to 800)
    // - Second segment: 600px on right (entire right side)
    // - Third segment: 400px on bottom (from 0 to 400)
    const segments = calculateBorderSegments(top, 400, 1400);

    expect(segments.length).toBe(3);

    expect(segments[0]).toEqual({
      side: top,
      startPosition: 400,
      length: 400, // Top remaining: 800 - 400 = 400
    });

    expect(segments[1]).toEqual({
      side: right,
      startPosition: 0,
      length: 600, // Entire right side
    });

    expect(segments[2]).toEqual({
      side: bottom,
      startPosition: 0,
      length: 400, // Remaining length: 1400 - 400 - 600 = 400
    });
  });

  it("should handle when player spans all four sides", () => {
    // Player starts near end of left (position 500) with length 2000
    // This will wrap around to all sides
    const segments = calculateBorderSegments(left, 500, 2000);

    expect(segments.length).toBe(4);

    expect(segments[0]).toEqual({
      side: left,
      startPosition: 500,
      length: 100, // Left remaining: 600 - 500 = 100
    });

    expect(segments[1]).toEqual({
      side: top,
      startPosition: 0,
      length: 800, // Entire top side
    });

    expect(segments[2]).toEqual({
      side: right,
      startPosition: 0,
      length: 600, // Entire right side
    });

    expect(segments[3]).toEqual({
      side: bottom,
      startPosition: 0,
      length: 500, // Remaining length: 2000 - 100 - 800 - 600 = 500
    });
  });

  it("should normalize negative start positions", () => {
    // Player has negative start position (-50) on top
    const segments = calculateBorderSegments(top, -50, 300);

    expect(segments.length).toBe(1);
    expect(segments[0]).toEqual({
      side: top,
      startPosition: 0, // Should normalize to 0
      length: 300,
    });
  });

  it("should handle zero length properly", () => {
    // Player has zero length (shouldn't happen in practice)
    const segments = calculateBorderSegments(bottom, 200, 0);

    expect(segments.length).toBe(0);
  });

  it("should create segments when wrapping almost entirely around the game area", () => {
    // Player starts from middle top (position 400) with length 2700
    // This should wrap around almost the entire perimeter (total perimeter = 2800)
    // - First segment: 400px on top (from 400 to 800)
    // - Second segment: 600px on right (entire right side)
    // - Third segment: 800px on bottom (entire bottom side)
    // - Fourth segment: 600px on left (entire left side)
    // - Fifth segment: 300px on top (from 0 to 300)
    const segments = calculateBorderSegments(top, 400, 2700);

    expect(segments.length).toBe(5);

    expect(segments[0]).toEqual({
      side: top,
      startPosition: 400,
      length: 400, // Top remaining: 800 - 400 = 400
    });

    expect(segments[1]).toEqual({
      side: right,
      startPosition: 0,
      length: 600, // Entire right side
    });

    expect(segments[2]).toEqual({
      side: bottom,
      startPosition: 0,
      length: 800, // Entire bottom side
    });

    expect(segments[3]).toEqual({
      side: left,
      startPosition: 0,
      length: 600, // Entire left side
    });

    expect(segments[4]).toEqual({
      side: top,
      startPosition: 0,
      length: 300, // Remaining length: 2700 - 400 - 600 - 800 - 600 = 300
    });
  });
});
