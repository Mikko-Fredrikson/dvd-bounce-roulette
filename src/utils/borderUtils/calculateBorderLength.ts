/**
 * Calculates the length of each player's border section based on the game area dimensions
 * and the number of players.
 *
 * @param width - Width of the game area
 * @param height - Height of the game area
 * @param playerCount - Number of players in the game
 * @returns Length of border assigned to each player (0 if no players)
 */
export function calculateBorderLength(
  width: number,
  height: number,
  playerCount: number,
): number {
  // Calculate the circumference of the game area
  const circumference = 2 * (width + height);

  // Return 0 if there are no players to avoid division by zero
  if (playerCount <= 0) {
    return 0;
  }

  // For each player, assign an equal portion of the circumference
  return circumference / playerCount;
}
