import { describe, it, expect } from "vitest";
import { generateUniqueColors } from "../generateUniqueColors";

describe("Color Utilities", () => {
  it("generates unique colors for each name", () => {
    const names = ["Alice", "Bob", "Charlie"];
    const colorMap = generateUniqueColors(names);

    // Check that each name has a color assigned
    expect(Object.keys(colorMap).length).toBe(names.length);
    names.forEach((name) => {
      expect(colorMap[name]).toBeDefined();
      expect(typeof colorMap[name]).toBe("string");
      expect(colorMap[name]).toMatch(/^#[0-9A-F]{6}$/i); // Check if it's a valid hex color
    });
  });

  it("returns unique colors for each name", () => {
    const names = ["Alice", "Bob", "Charlie", "Dave", "Eve"];
    const colorMap = generateUniqueColors(names);

    // Create a set of unique colors
    const uniqueColors = new Set(Object.values(colorMap));

    // The set size should match the number of names if all colors are unique
    expect(uniqueColors.size).toBe(names.length);
  });

  it("returns an empty object when given an empty array", () => {
    const colorMap = generateUniqueColors([]);
    expect(Object.keys(colorMap).length).toBe(0);
  });

  it("returns consistent colors for the same names", () => {
    const names = ["Alice", "Bob"];
    const colorMap1 = generateUniqueColors(names);
    const colorMap2 = generateUniqueColors(names);

    // The colors should be the same for each run with the same names
    names.forEach((name) => {
      expect(colorMap1[name]).toBe(colorMap2[name]);
    });
  });
});
