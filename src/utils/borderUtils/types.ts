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

/**
 * Represents a segment of the border assigned to a player
 */
export interface BorderSegment {
  /** The side this segment belongs to */
  side: BorderSide;

  /** Position along the side where this segment starts (in pixels) */
  startPosition: number;

  /** Length of this segment (in pixels) */
  length: number;
}

/**
 * Represents all border segments belonging to a specific player
 */
export interface PlayerBorderSegments {
  /** ID of the player that owns these segments */
  playerId: string;

  /** Name of the player that owns these segments */
  playerName: string;

  /** Color assigned to this player */
  playerColor: string;

  /** All border segments belonging to this player */
  segments: BorderSegment[];
}
