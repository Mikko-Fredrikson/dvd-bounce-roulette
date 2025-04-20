import { BorderSide, BorderSegment } from "./types";

/**
 * Calculates all border segments needed for a player based on their starting position and total border length
 *
 * @param startingSide - The side where the player's border starts
 * @param startPosition - The position along the starting side where the player's border begins (in pixels)
 * @param totalLength - The total length of the player's border (in pixels)
 * @returns Array of BorderSegment objects representing all segments needed for the player
 */
export function calculateBorderSegments(
  startingSide: BorderSide,
  startPosition: number,
  totalLength: number,
): BorderSegment[] {
  const segments: BorderSegment[] = [];
  let remainingLength = totalLength;

  // Normalize start position (ensure it's not negative)
  const normalizedStartPos = Math.max(0, startPosition);

  // Start with the first segment on the starting side
  let currentSide = startingSide;
  let currentStartPos = normalizedStartPos;

  // Continue adding segments until we've allocated the entire length
  while (remainingLength > 0) {
    // Calculate how much length would fit on the current side
    const availableLengthOnSide = currentSide.length - currentStartPos;

    // Determine segment length for this side
    const segmentLength = Math.min(availableLengthOnSide, remainingLength);

    // Add this segment
    segments.push({
      side: currentSide,
      startPosition: currentStartPos,
      length: segmentLength,
    });

    // Reduce remaining length
    remainingLength -= segmentLength;

    // If we still have length to allocate, move to the next side
    if (remainingLength > 0 && currentSide.nextSide) {
      currentSide = currentSide.nextSide;
      currentStartPos = 0; // Start from the beginning of the next side
    }
  }

  return segments;
}
