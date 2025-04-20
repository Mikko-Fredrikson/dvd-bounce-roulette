import { BorderSide, Point } from "./types";

/**
 * Creates a structure representing the four sides of the game area
 * @param width Width of the game area in pixels
 * @param height Height of the game area in pixels
 * @returns Array of BorderSide objects representing the game area sides
 */
export const createBorderSides = (
  width: number,
  height: number,
): BorderSide[] => {
  // Create the border sides
  const top: BorderSide = {
    name: "top",
    length: width,
    startPoint: { x: 0, y: 0 },
    endPoint: { x: width, y: 0 },
  };

  const right: BorderSide = {
    name: "right",
    length: height,
    startPoint: { x: width, y: 0 },
    endPoint: { x: width, y: height },
  };

  const bottom: BorderSide = {
    name: "bottom",
    length: width,
    startPoint: { x: width, y: height },
    endPoint: { x: 0, y: height },
  };

  const left: BorderSide = {
    name: "left",
    length: height,
    startPoint: { x: 0, y: height },
    endPoint: { x: 0, y: 0 },
  };

  // Link the sides in clockwise order
  top.nextSide = right;
  right.nextSide = bottom;
  bottom.nextSide = left;
  left.nextSide = top;

  return [top, right, bottom, left];
};

/**
 * Gets the total perimeter of the game area
 * @param sides Array of BorderSide objects
 * @returns Total perimeter length in pixels
 */
export const getTotalPerimeter = (sides: BorderSide[]): number => {
  return sides.reduce((sum, side) => sum + side.length, 0);
};

/**
 * Finds a specific side by name
 * @param sides Array of BorderSide objects
 * @param name Name of the side to find
 * @returns The found BorderSide or undefined if not found
 */
export const getSideByName = (
  sides: BorderSide[],
  name: BorderSide["name"],
): BorderSide | undefined => {
  return sides.find((side) => side.name === name);
};

/**
 * Calculates a point along a side based on percentage
 * @param side The border side
 * @param percentage Position along the side (0 to 1)
 * @returns Coordinates of the point
 */
export const getPointOnSide = (side: BorderSide, percentage: number): Point => {
  const clampedPercentage = Math.max(0, Math.min(1, percentage));

  return {
    x:
      side.startPoint.x +
      (side.endPoint.x - side.startPoint.x) * clampedPercentage,
    y:
      side.startPoint.y +
      (side.endPoint.y - side.startPoint.y) * clampedPercentage,
  };
};
