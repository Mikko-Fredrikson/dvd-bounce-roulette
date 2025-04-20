import { describe, it, expect } from "vitest";
import { calculateBorderLength } from "../calculateBorderLength";

describe("calculateBorderLength", () => {
  it("should calculate equal border lengths for each player", () => {
    // GameArea dimensions - width: 800, height: 600
    const width = 800;
    const height = 600;
    const playerCount = 4;

    // Circumference of the game area = 2 * (width + height) = 2 * (800 + 600) = 2800
    const expectedBorderLength = 2800 / playerCount; // 700 per player

    const result = calculateBorderLength(width, height, playerCount);
    expect(result).toBe(expectedBorderLength);
  });

  it("should handle a single player case", () => {
    const width = 800;
    const height = 600;
    const playerCount = 1;

    // Single player should get the full circumference
    const expectedBorderLength = 2 * (width + height); // 2800

    const result = calculateBorderLength(width, height, playerCount);
    expect(result).toBe(expectedBorderLength);
  });

  it("should handle zero players by returning zero", () => {
    const width = 800;
    const height = 600;
    const playerCount = 0;

    const result = calculateBorderLength(width, height, playerCount);
    expect(result).toBe(0);
  });
});
