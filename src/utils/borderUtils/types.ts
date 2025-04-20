/**
 * Represents a point in the 2D space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents a side of the game area border
 */
export interface BorderSide {
  /** Name of the side (top, right, bottom, left) */
  name: "top" | "right" | "bottom" | "left";

  /** Length of this side in pixels */
  length: number;

  /** Starting point coordinates */
  startPoint: Point;

  /** Ending point coordinates */
  endPoint: Point;

  /** Reference to the next side in clockwise order */
  nextSide?: BorderSide;
}
