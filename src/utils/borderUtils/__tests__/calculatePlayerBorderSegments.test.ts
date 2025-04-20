import { describe, it, expect } from "vitest";
import { calculatePlayerBorderSegments } from "../calculatePlayerBorderSegments";
import { createBorderSides } from "../borderSides";
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

    const players: Player[] = [
      {
        id: "1",
        name: "Player 1",
        color: "#FF0000",
        sectionStart: 0,
        sectionLength: 0,
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
    expect(totalSegmentLength).toBe(2 * (width + height));

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

    const players: Player[] = [
      {
        id: "1",
        name: "Player 1",
        color: "#FF0000",
        sectionStart: 0,
        sectionLength: 0,
      },
      {
        id: "2",
        name: "Player 2",
        color: "#00FF00",
        sectionStart: 0,
        sectionLength: 0,
      },
      {
        id: "3",
        name: "Player 3",
        color: "#0000FF",
        sectionStart: 0,
        sectionLength: 0,
      },
      {
        id: "4",
        name: "Player 4",
        color: "#FFFF00",
        sectionStart: 0,
        sectionLength: 0,
      },
    ];

    const result = calculatePlayerBorderSegments(sides, players);

    // Should have segments for all 4 players
    expect(result.length).toBe(4);

    // Each player should have segments that total to 1/4 of the perimeter
    const perimeter = 2 * (width + height);
    const expectedLengthPerPlayer = perimeter / players.length;

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
    const sides = createBorderSides(100, 50); // Perimeter = 300

    const players: Player[] = [
      {
        id: "1",
        name: "Player 1",
        color: "#FF0000",
        sectionStart: 0,
        sectionLength: 0,
      },
      {
        id: "2",
        name: "Player 2",
        color: "#00FF00",
        sectionStart: 0,
        sectionLength: 0,
      },
      {
        id: "3",
        name: "Player 3",
        color: "#0000FF",
        sectionStart: 0,
        sectionLength: 0,
      },
    ];

    const result = calculatePlayerBorderSegments(sides, players);

    // Should have segments for all 3 players
    expect(result.length).toBe(3);

    // First player starts at the beginning of 'top' side
    expect(result[0].segments[0].side.name).toBe("top");
    expect(result[0].segments[0].startPosition).toBe(0);

    // First player should take the entire 'top' side of 100px
    expect(result[0].segments[0].length).toBe(100);

    // Second player should start at the beginning of 'right' side
    expect(result[1].segments[0].side.name).toBe("right");
    expect(result[1].segments[0].startPosition).toBe(0);

    // Second player should take the entire 'right' side of 50px and part of 'bottom'
    expect(result[1].segments[0].length).toBe(50);
    expect(result[1].segments[1].side.name).toBe("bottom");
    expect(result[1].segments[1].length).toBe(50);

    // Third player should start at position 50 of 'bottom' side
    expect(result[2].segments[0].side.name).toBe("bottom");
    expect(result[2].segments[0].startPosition).toBe(50);

    // Third player should take the rest of 'bottom' (50px) and part of 'left' (50px)
    expect(result[2].segments[0].length).toBe(50);
    expect(result[2].segments[1].side.name).toBe("left");
    expect(result[2].segments[1].length).toBe(50);
  });
});
