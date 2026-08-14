import { BorderSegment, PlayerBorderSegments } from "./types";

/** Default divider thickness in pixels, measured along the perimeter. */
export const DEFAULT_DIVIDER_WIDTH = 2;

/**
 * Derives the thin separators drawn between neighbouring players' border bars.
 *
 * Players occupy contiguous runs around the perimeter, so the start of each
 * player's run is exactly the junction with the previous player. A run may be
 * split into several segments where it crosses a corner - those internal splits
 * are the same colour and must not get a divider, so only `segments[0]` counts.
 *
 * The returned segments are meant to be drawn *on top of* the player bars, so
 * they consume none of any player's border length.
 *
 * @param playerBorderSegments - Border segments per player, in perimeter order
 * @param dividerWidth - Divider thickness in pixels along the perimeter
 * @returns One BorderSegment per junction between two differently coloured runs
 */
export function calculateSegmentDividers(
  playerBorderSegments: PlayerBorderSegments[],
  dividerWidth: number = DEFAULT_DIVIDER_WIDTH,
): BorderSegment[] {
  const withSegments = playerBorderSegments.filter(
    (player) => player.segments.length > 0,
  );

  // A single run wraps back onto itself, so there is no colour change anywhere.
  if (withSegments.length < 2) {
    return [];
  }

  const dividers: BorderSegment[] = [];

  withSegments.forEach((player, index) => {
    const previous =
      withSegments[(index - 1 + withSegments.length) % withSegments.length];

    // Only separate runs that actually differ in colour
    if (previous.playerColor === player.playerColor) {
      return;
    }

    const { side, startPosition } = player.segments[0];

    // Keep the divider on this side rather than spilling past the corner
    const availableLength = side.length - startPosition;
    const length = Math.min(dividerWidth, availableLength);
    if (length <= 0) {
      return;
    }

    dividers.push({ side, startPosition, length });
  });

  return dividers;
}
