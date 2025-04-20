import { BorderSegment, PlayerBorderSegments } from "../borderUtils/types";

/**
 * Represents the position of a player's name box
 */
export interface PlayerNamePosition {
  playerId: string;
  playerName: string;
  playerColor: string;
  position: { x: number; y: number };
}

/**
 * Game area dimensions
 */
export interface GameDimensions {
  width: number;
  height: number;
}

const OFFSET_DISTANCE = 40; // Distance from the border in pixels

/**
 * Calculates the positions for player name boxes based on their border segments and rotation offset
 *
 * @param playerBorders - Array of PlayerBorderSegments for each player
 * @param gameDimensions - Width and height of the game area
 * @param rotationOffset - Offset due to border rotation in pixels (clockwise)
 * @returns Array of positions for each player's name box
 */
export function calculatePlayerNamePositions(
  playerBorders: PlayerBorderSegments[],
  gameDimensions: GameDimensions,
  rotationOffset: number,
): PlayerNamePosition[] {
  if (playerBorders.length === 0) {
    return [];
  }

  const { width, height } = gameDimensions;
  const perimeter = 2 * (width + height);

  // Normalize rotation offset to be within the perimeter
  const normalizedOffset = rotationOffset % perimeter;

  return playerBorders.map((player) => {
    // Find the primary segment for this player (usually the longest one)
    const primarySegment = findPrimarySegment(player.segments);

    // Calculate the midpoint of the segment
    const midpoint = calculateSegmentMidpoint(
      primarySegment,
      width,
      height,
      normalizedOffset,
      perimeter,
    );

    return {
      playerId: player.playerId,
      playerName: player.playerName,
      playerColor: player.playerColor,
      position: calculateBoxPosition(
        midpoint,
        primarySegment.side.name,
        width,
        height,
      ),
    };
  });
}

/**
 * Finds the primary segment to position the player name box next to
 */
function findPrimarySegment(segments: BorderSegment[]): BorderSegment {
  // By default, use the first segment as the primary one
  if (segments.length === 1) {
    return segments[0];
  }

  // TODO: Implement more sophisticated logic to find the best segment
  // based on rotation and visibility

  // For now, just return the longest segment
  return [...segments].sort((a, b) => b.length - a.length)[0];
}

/**
 * Calculates the midpoint of a border segment, accounting for rotation
 */
function calculateSegmentMidpoint(
  segment: BorderSegment,
  width: number,
  height: number,
  rotationOffset: number,
  perimeter: number,
): { x: number; y: number } {
  // Calculate the absolute position along the perimeter
  let position = 0;

  // Add positions based on which side the segment is on
  switch (segment.side.name) {
    case "top":
      position = segment.startPosition;
      break;
    case "right":
      position = width + segment.startPosition;
      break;
    case "bottom":
      position = width + height + segment.startPosition;
      break;
    case "left":
      position = 2 * width + height + segment.startPosition;
      break;
  }

  // Add half the length to get to the midpoint of the segment
  position += segment.length / 2;

  // Apply rotation offset
  position = (position + rotationOffset) % perimeter;

  // Convert the perimeter position back to x,y coordinates
  return perimeterPositionToXY(position, width, height);
}

/**
 * Converts a position along the perimeter to x,y coordinates
 */
function perimeterPositionToXY(
  position: number,
  width: number,
  height: number,
): { x: number; y: number } {
  // Normalize position to be within the perimeter
  const perimeter = 2 * (width + height);
  position = position % perimeter;

  // Determine which side of the game area this position is on
  if (position < width) {
    // Top side
    return { x: position, y: 0 };
  } else if (position < width + height) {
    // Right side
    return { x: width, y: position - width };
  } else if (position < 2 * width + height) {
    // Bottom side
    return { x: 2 * width + height - position, y: height };
  } else {
    // Left side
    return { x: 0, y: perimeter - position };
  }
}

/**
 * Calculates the position for the name box based on the segment midpoint
 */
function calculateBoxPosition(
  midpoint: { x: number; y: number },
  sideName: string,
  width: number,
  height: number,
): { x: number; y: number } {
  // Position the box outside the game area based on which side the segment is on
  switch (sideName) {
    case "top":
      return { x: midpoint.x, y: -OFFSET_DISTANCE };
    case "right":
      return { x: width + OFFSET_DISTANCE / 2, y: midpoint.y };
    case "bottom":
      return { x: midpoint.x, y: height + OFFSET_DISTANCE / 2 };
    case "left":
      return { x: -OFFSET_DISTANCE * 2, y: midpoint.y };
    default:
      return midpoint;
  }
}
