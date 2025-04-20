import { describe, it, expect } from "vitest";
import { createBorderSides } from "../borderSides";
import { BorderSide } from "../types";

describe("borderSides", () => {
  it("should create border sides with correct properties", () => {
    const width = 800;
    const height = 600;
    const borderSides = createBorderSides(width, height);

    // Check if we have all four sides
    expect(borderSides.length).toBe(4);

    // Check if sides have correct names
    expect(borderSides.map((side) => side.name)).toEqual([
      "top",
      "right",
      "bottom",
      "left",
    ]);

    // Check if lengths are correct
    expect(borderSides.find((side) => side.name === "top")?.length).toBe(width);
    expect(borderSides.find((side) => side.name === "right")?.length).toBe(
      height,
    );
    expect(borderSides.find((side) => side.name === "bottom")?.length).toBe(
      width,
    );
    expect(borderSides.find((side) => side.name === "left")?.length).toBe(
      height,
    );

    // Check if sides are linked correctly in clockwise order
    const top = borderSides.find((side) => side.name === "top");
    const right = borderSides.find((side) => side.name === "right");
    const bottom = borderSides.find((side) => side.name === "bottom");
    const left = borderSides.find((side) => side.name === "left");

    expect(top?.nextSide).toBe(right);
    expect(right?.nextSide).toBe(bottom);
    expect(bottom?.nextSide).toBe(left);
    expect(left?.nextSide).toBe(top);

    // Check coordinates
    expect(top?.startPoint).toEqual({ x: 0, y: 0 });
    expect(top?.endPoint).toEqual({ x: width, y: 0 });

    expect(right?.startPoint).toEqual({ x: width, y: 0 });
    expect(right?.endPoint).toEqual({ x: width, y: height });

    expect(bottom?.startPoint).toEqual({ x: width, y: height });
    expect(bottom?.endPoint).toEqual({ x: 0, y: height });

    expect(left?.startPoint).toEqual({ x: 0, y: height });
    expect(left?.endPoint).toEqual({ x: 0, y: 0 });
  });
});
