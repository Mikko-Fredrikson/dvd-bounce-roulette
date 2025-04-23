import { describe, it, expect } from "vitest";
import { calculatePlayerBorderSegments } from "../calculatePlayerBorderSegments";
import { createBorderSides, getTotalPerimeter } from "../borderSides"; // Import getTotalPerimeter
import { Player } from "../../../store/slices/playerSlice/types";

describe("calculatePlayerBorderSegments", () => {
  it("should return empty array if no players", () => {
    const sides = createBorderSides(800, 600);
    const players: Player[] = [];
    const result = calculatePlayerBorderSegments(sides, players);
    expect(result).toEqual([]);
  });

  it("should calculate segments for one player correctly", () => {
    const width = 800;
    const height = 600;
    const sides = createBorderSides(width, height);
    const totalPerimeter = getTotalPerimeter(sides); // Calculate total perimeter

    const players: Player[] = [
      {
        id: "1",
        name: "Player 1",
        color: "#FF0000",
        sectionStart: 0,
        sectionLength: 1.0, // Player gets the whole border
        health: 3, // Use realistic health
        isEliminated: false,
        eliminationOrder: null,
      },
    ];

    const result = calculatePlayerBorderSegments(sides, players);

    // One player gets the entire perimeter
    expect(result.length).toBe(1);

    // Check the player ID is correctly assigned
    expect(result[0].playerId).toBe("1");

    // Check the player color is correctly assigned
    expect(result[0].playerColor).toBe("#FF0000");

    // Check that total length of all segments matches perimeter
    const totalSegmentLength = result[0].segments.reduce(
      (sum, segment) => sum + segment.length,
      0,
    );
    expect(totalSegmentLength).toBeCloseTo(totalPerimeter); // Use toBeCloseTo for float precision

    // Check that we have segments for each side
    const segmentSides = result[0].segments.map((segment) => segment.side.name);
    expect(segmentSides).toContain("top");
    expect(segmentSides).toContain("right");
    expect(segmentSides).toContain("bottom");
    expect(segmentSides).toContain("left");
  });

  it("should calculate segments for multiple players correctly", () => {
    const width = 800;
    const height = 600;
    const sides = createBorderSides(width, height);
    const totalPerimeter = getTotalPerimeter(sides); // Calculate total perimeter

    const players: Player[] = [
      {
        id: "1",
        name: "Player 1",
        color: "#FF0000",
        sectionStart: 0,
        sectionLength: 0.25, // Assign 1/4 length
        health: 3,
        isEliminated: false,
        eliminationOrder: null,
      },
      {
        id: "2",
        name: "Player 2",
        color: "#00FF00",
        sectionStart: 0.25, // Start after player 1
        sectionLength: 0.25, // Assign 1/4 length
        health: 3,
        isEliminated: false,
        eliminationOrder: null,
      },
      {
        id: "3",
        name: "Player 3",
        color: "#0000FF",
        sectionStart: 0.5, // Start after player 2
        sectionLength: 0.25, // Assign 1/4 length
        health: 3,
        isEliminated: false,
        eliminationOrder: null,
      },
      {
        id: "4",
        name: "Player 4",
        color: "#FFFF00",
        sectionStart: 0.75, // Start after player 3
        sectionLength: 0.25, // Assign 1/4 length
        health: 3,
        isEliminated: false,
        eliminationOrder: null,
      },
    ];

    const result = calculatePlayerBorderSegments(sides, players);

    // Should have segments for all 4 players
    expect(result.length).toBe(4);

    // Each player should have segments that total to 1/4 of the perimeter
    const expectedLengthPerPlayer = totalPerimeter / players.length; // Use calculated perimeter

    result.forEach((playerData) => {
      const totalLength = playerData.segments.reduce(
        (sum, segment) => sum + segment.length,
        0,
      );
      expect(totalLength).toBeCloseTo(expectedLengthPerPlayer);
    });

    // Check that segments don't overlap
    // First player's first segment should start at the beginning of the first side
    expect(result[0].segments[0].startPosition).toBe(0);
    expect(result[0].segments[0].side.name).toBe("top");

    // For each player (except the first), check that their first segment starts
    // right after the last player's last segment
    for (let i = 1; i < players.length; i++) {
      const prevPlayerLastSegment =
        result[i - 1].segments[result[i - 1].segments.length - 1];
      const currPlayerFirstSegment = result[i].segments[0];

      if (prevPlayerLastSegment.side === currPlayerFirstSegment.side) {
        // If on same side, the start position should be right after the previous segment
        expect(currPlayerFirstSegment.startPosition).toBe(
          prevPlayerLastSegment.startPosition + prevPlayerLastSegment.length,
        );
      } else {
        // If on a different side, should start at position 0 of the next side
        expect(currPlayerFirstSegment.startPosition).toBe(0);
        expect(currPlayerFirstSegment.side).toBe(
          prevPlayerLastSegment.side.nextSide,
        );
      }
    }

    // Verify player properties are correctly assigned
    expect(result[0].playerName).toBe("Player 1");
    expect(result[1].playerName).toBe("Player 2");
    expect(result[2].playerName).toBe("Player 3");
    expect(result[3].playerName).toBe("Player 4");
  });

  it("should handle uneven distribution correctly", () => {
    const width = 100;
    const height = 50;
    const sides = createBorderSides(width, height);
    const totalPerimeter = getTotalPerimeter(sides); // Perimeter = 300

    const players: Player[] = [
      {
        id: "1",
        name: "Player 1",
        color: "#FF0000",
        sectionStart: 0,
        sectionLength: 150 / totalPerimeter, // Player 1 gets 150px (half)
        health: 3,
        isEliminated: false,
        eliminationOrder: null,
      },
      {
        id: "2",
        name: "Player 2",
        color: "#00FF00",
        sectionStart: 150 / totalPerimeter, // Starts after player 1
        sectionLength: 100 / totalPerimeter, // Player 2 gets 100px
        health: 3,
        isEliminated: false,
        eliminationOrder: null,
      },
      {
        id: "3",
        name: "Player 3",
        color: "#0000FF",
        sectionStart: (150 + 100) / totalPerimeter, // Starts after player 2
        sectionLength: 50 / totalPerimeter, // Player 3 gets 50px
        health: 3,
        isEliminated: false,
        eliminationOrder: null,
      },
    ];

    const result = calculatePlayerBorderSegments(sides, players);

    // Should have segments for all 3 players
    expect(result.length).toBe(3);

    // --- Player 1 Assertions (150px total) ---
    expect(result[0].playerId).toBe("1");
    const player1TotalLength = result[0].segments.reduce(
      (sum, s) => sum + s.length,
      0,
    );
    expect(player1TotalLength).toBeCloseTo(150);
    // First segment: top, start 0, length 100
    expect(result[0].segments[0].side.name).toBe("top");
    expect(result[0].segments[0].startPosition).toBe(0);
    expect(result[0].segments[0].length).toBe(100);
    // Second segment: right, start 0, length 50
    expect(result[0].segments[1].side.name).toBe("right");
    expect(result[0].segments[1].startPosition).toBe(0);
    expect(result[0].segments[1].length).toBe(50);

    // --- Player 2 Assertions (100px total) ---
    expect(result[1].playerId).toBe("2");
    const player2TotalLength = result[1].segments.reduce(
      (sum, s) => sum + s.length,
      0,
    );
    expect(player2TotalLength).toBeCloseTo(100);
    // First segment: bottom, start 0, length 100 (starts from right end of bottom)
    expect(result[1].segments[0].side.name).toBe("bottom");
    expect(result[1].segments[0].startPosition).toBe(0);
    expect(result[1].segments[0].length).toBe(100);

    // --- Player 3 Assertions (50px total) ---
    expect(result[2].playerId).toBe("3");
    const player3TotalLength = result[2].segments.reduce(
      (sum, s) => sum + s.length,
      0,
    );
    expect(player3TotalLength).toBeCloseTo(50);
    // First segment: left, start 0, length 50 (starts from bottom end of left)
    expect(result[2].segments[0].side.name).toBe("left");
    expect(result[2].segments[0].startPosition).toBe(0);
    expect(result[2].segments[0].length).toBe(50);
  });
});
