import { describe, it, expect } from "vitest";
import { calculatePlayerNamePositions } from "../calculatePlayerNamePositions";
import { createBorderSides } from "../../borderUtils/borderSides";
import { PlayerBorderSegments } from "../../borderUtils/types";

describe("calculatePlayerNamePositions", () => {
  const width = 800;
  const height = 600;
  const sides = createBorderSides(width, height);
  const [top, right, bottom, left] = sides;

  it("returns an empty array when given empty input", () => {
    const result = calculatePlayerNamePositions([], { width, height }, 0);
    expect(result).toEqual([]);
  });

  it("calculates position for a player with a single segment on top border", () => {
    const playerBorders: PlayerBorderSegments[] = [
      {
        playerId: "1",
        playerName: "Player 1",
        playerColor: "#FF0000",
        segments: [
          {
            side: top,
            startPosition: 200,
            length: 400,
          },
        ],
      },
    ];

    const result = calculatePlayerNamePositions(
      playerBorders,
      { width, height },
      0,
    );

    expect(result).toHaveLength(1);
    expect(result[0].playerId).toBe("1");
    expect(result[0].position.x).toBe(400); // Middle of segment (200 + 400/2)
    expect(result[0].position.y).toBeLessThan(0); // Above the top border
  });

  it("calculates position for a player with a single segment on right border", () => {
    const playerBorders: PlayerBorderSegments[] = [
      {
        playerId: "1",
        playerName: "Player 1",
        playerColor: "#FF0000",
        segments: [
          {
            side: right,
            startPosition: 100,
            length: 400,
          },
        ],
      },
    ];

    const result = calculatePlayerNamePositions(
      playerBorders,
      { width, height },
      0,
    );

    expect(result).toHaveLength(1);
    expect(result[0].position.x).toBeGreaterThan(width); // Right of the right border
    expect(result[0].position.y).toBe(300); // Middle of segment (100 + 400/2)
  });

  it("calculates positions for multiple players with rotational offset", () => {
    const playerBorders: PlayerBorderSegments[] = [
      {
        playerId: "1",
        playerName: "Player 1",
        playerColor: "#FF0000",
        segments: [
          {
            side: top,
            startPosition: 0,
            length: 800,
          },
        ],
      },
      {
        playerId: "2",
        playerName: "Player 2",
        playerColor: "#00FF00",
        segments: [
          {
            side: right,
            startPosition: 0,
            length: 600,
          },
        ],
      },
    ];

    // With 25% rotation (1/4 of the perimeter), Player 1 should now be partially on the right side
    const rotationOffset = (width + height) * 0.25; // 25% of half perimeter
    const result = calculatePlayerNamePositions(
      playerBorders,
      { width, height },
      rotationOffset,
    );

    expect(result).toHaveLength(2);

    // Player 1 should now be showing on the right side
    const player1 = result.find((p) => p.playerId === "1");
    expect(player1).toBeDefined();
    expect(player1!.position.x).toBeGreaterThan(width / 2);

    // Player 2 should be showing on the bottom side
    const player2 = result.find((p) => p.playerId === "2");
    expect(player2).toBeDefined();
    expect(player2!.position.y).toBeGreaterThan(height / 2);
  });
});
