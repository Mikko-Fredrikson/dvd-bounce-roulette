import { BorderSide, PlayerBorderSegments } from "./types";
// Remove calculateBorderLength import, no longer needed here
import { calculateBorderSegments } from "./calculateBorderSegments";
import { Player } from "../../store/slices/playerSlice/types";
import { getTotalPerimeter } from "./borderSides";

/**
 * Calculates border segments for all players based on their stored start/length percentages and a rotation offset.
 *
 * @param sides - Array of BorderSide objects representing the game area
 * @param players - Array of Player objects (should be active players with correct sectionStart/sectionLength)
 * @param rotationOffsetPixels - Number of pixels to offset the starting position counterclockwise (default: 0)
 * @returns Array of PlayerBorderSegments with segments assigned to each player
 */
export function calculatePlayerBorderSegments(
  sides: BorderSide[],
  players: Player[],
  rotationOffsetPixels: number = 0,
): PlayerBorderSegments[] {
  if (players.length === 0 || sides.length === 0) {
    return [];
  }

  const totalPerimeter = getTotalPerimeter(sides);
  if (totalPerimeter <= 0) return []; // Avoid division by zero

  const playerBorderSegments: PlayerBorderSegments[] = [];

  // Normalize the rotation offset
  const normalizedRotationOffset = rotationOffsetPixels % totalPerimeter;

  for (const player of players) {
    // Calculate the player's absolute start position in pixels based on their percentage and the total perimeter
    const playerStartPixelsAbsolute = player.sectionStart * totalPerimeter;
    // Calculate the player's absolute length in pixels
    const playerLengthPixels = player.sectionLength * totalPerimeter;

    // Apply the rotation offset to the player's absolute start position
    const playerStartPixelsWithOffset =
      (playerStartPixelsAbsolute + normalizedRotationOffset) % totalPerimeter;

    // Find the starting side and position in pixels based on the offset start
    let currentSide: BorderSide | null = null;
    let currentPositionPixels = 0;
    let remainingOffset = playerStartPixelsWithOffset;

    for (const side of sides) {
      if (remainingOffset < side.length) {
        currentSide = side;
        currentPositionPixels = remainingOffset;
        break;
      }
      remainingOffset -= side.length;
    }

    // If we couldn't find a side (shouldn't happen with valid input), skip player
    if (!currentSide) {
      console.error("Could not determine starting side for player", player);
      continue;
    }

    // Calculate the actual segments for this player using their specific length
    const segments = calculateBorderSegments(
      currentSide,
      currentPositionPixels,
      playerLengthPixels, // Use the player's specific length in pixels
    );

    playerBorderSegments.push({
      playerId: player.id,
      playerName: player.name,
      playerColor: player.color,
      segments: segments,
    });
  }

  return playerBorderSegments;
}
