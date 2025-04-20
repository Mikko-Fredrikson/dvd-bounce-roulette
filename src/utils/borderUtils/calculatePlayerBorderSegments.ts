import { BorderSide, PlayerBorderSegments } from "./types";
import { calculateBorderLength } from "./calculateBorderLength";
import { calculateBorderSegments } from "./calculateBorderSegments";
import { Player } from "../../store/slices/playerSlice/types";

/**
 * Calculates border segments for all players in the game and assigns them to specific players
 *
 * @param sides - Array of BorderSide objects representing the game area
 * @param players - Array of Player objects to assign segments to
 * @returns Array of PlayerBorderSegments with segments assigned to each player
 */
export function calculatePlayerBorderSegments(
  sides: BorderSide[],
  players: Player[],
): PlayerBorderSegments[] {
  // If there are no players, return an empty array
  if (players.length === 0 || sides.length === 0) {
    return [];
  }

  // Calculate the width and height based on the first side (top) and second side (right)
  // assuming sides are ordered correctly (top, right, bottom, left)
  const width = sides[0].length;
  const height = sides[1].length;

  // Calculate border length for each player
  const lengthPerPlayer = calculateBorderLength(width, height, players.length);

  // Array to store each player's segments with their information
  const playerBorderSegments: PlayerBorderSegments[] = [];

  // Start with the first side
  let currentSide = sides[0];
  let currentPosition = 0;

  // For each player, calculate their segments
  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    // Calculate border segments for this player starting at the current position
    const segments = calculateBorderSegments(
      currentSide,
      currentPosition,
      lengthPerPlayer,
    );

    // Add player data with their segments
    playerBorderSegments.push({
      playerId: player.id,
      playerName: player.name,
      playerColor: player.color,
      segments: segments,
    });

    // Update the current position for the next player
    // Get the last segment of the current player
    const lastSegment = segments[segments.length - 1];

    // If we need to move to the next side
    if (
      lastSegment.startPosition + lastSegment.length >=
      lastSegment.side.length
    ) {
      // Move to the next side at position 0
      currentSide = lastSegment.side.nextSide!;
      currentPosition = 0;
    } else {
      // Stay on the same side but move position after this segment
      currentSide = lastSegment.side;
      currentPosition = lastSegment.startPosition + lastSegment.length;
    }
  }

  return playerBorderSegments;
}
