import { describe, it, expect } from "vitest";
import { calculatePlayerBorderSegments } from "../calculatePlayerBorderSegments";
import { createBorderSides, getTotalPerimeter } from "../borderSides";
import { Player } from "../../../store/slices/playerSlice/types";

describe("calculatePlayerBorderSegments", () => {
  it("should offset segments counterclockwise based on startOffset parameter", () => {
    // Setup test data
    const width = 300;
    const height = 200;
    const sides = createBorderSides(width, height);
    const totalPerimeter = getTotalPerimeter(sides);

    const players: Player[] = [
      {
        id: "1",
        name: "Player 1",
        color: "#FF0000",
        health: 3,
        sectionStart: 0,
        sectionLength: 0.5,
        isEliminated: false,
        eliminationOrder: null,
      },
      {
        id: "2",
        name: "Player 2",
        color: "#00FF00",
        health: 3,
        sectionStart: 0.5,
        sectionLength: 0.5,
        isEliminated: false,
        eliminationOrder: null,
      },
    ];

    // Calculate segments with no offset
    const segmentsWithNoOffset = calculatePlayerBorderSegments(
      sides,
      players,
      0,
    );

    // Calculate segments with a specific offset (e.g., 50 pixels)
    const offset = 50;
    const segmentsWithOffset = calculatePlayerBorderSegments(
      sides,
      players,
      offset,
    );

    // Verify segments are different with the offset
    expect(segmentsWithOffset).not.toEqual(segmentsWithNoOffset);

    // Verify the offset is applied correctly
    // For a 50px offset, the first segment should start 50px counterclockwise from the original position

    // Case 1: Offset within the same side
    if (offset < sides[0].length) {
      // If offset is less than top side length, first segment should still be on top side but shifted
      expect(segmentsWithOffset[0].segments[0].side.name).toBe("top");
      expect(segmentsWithOffset[0].segments[0].startPosition).toBe(offset);
    }

    // Case 2: Offset moves to a different side
    const largeOffset = width + 50; // Move beyond the top side into the right side
    const segmentsWithLargeOffset = calculatePlayerBorderSegments(
      sides,
      players,
      largeOffset,
    );

    // First segment should now start on the right side
    expect(segmentsWithLargeOffset[0].segments[0].side.name).toBe("right");
    expect(segmentsWithLargeOffset[0].segments[0].startPosition).toBe(50); // 50px from the top of right side

    // Verify that a full perimeter offset brings us back to the original position
    const fullPerimeterOffset = totalPerimeter;
    const segmentsWithFullOffset = calculatePlayerBorderSegments(
      sides,
      players,
      fullPerimeterOffset,
    );
    expect(segmentsWithFullOffset).toEqual(segmentsWithNoOffset);
  });
});
