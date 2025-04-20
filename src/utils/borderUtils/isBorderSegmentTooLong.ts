import { BorderSide } from "./types";

/**
 * Determines if a border segment would be too long to fit on a specific side
 * starting from a given position.
 *
 * @param side - The border side to check against
 * @param startPosition - The starting position along the side (in pixels)
 * @param segmentLength - The length of the border segment (in pixels)
 * @returns True if the segment is too long to fit on the side, false otherwise
 */
export function isBorderSegmentTooLong(
  side: BorderSide,
  startPosition: number,
  segmentLength: number,
): boolean {
  // Normalize inputs to handle edge cases
  const normalizedStartPos = Math.max(0, startPosition);
  const normalizedLength = Math.max(0, segmentLength);

  // If segment has zero length, it always fits
  if (normalizedLength === 0) {
    return false;
  }

  // Calculate where the segment would end
  const endPosition = normalizedStartPos + normalizedLength;

  // Check if the end position exceeds the side length
  return endPosition > side.length;
}
