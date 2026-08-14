import { describe, it, expect } from "vitest";
import { calculateSegmentDividers } from "../calculateSegmentDividers";
import { createBorderSides } from "../borderSides";
import { calculatePlayerBorderSegments } from "../calculatePlayerBorderSegments";
import { BorderSide, PlayerBorderSegments } from "../types";
import { Player } from "../../../store/slices/playerSlice/types";

const WIDTH = 800;
const HEIGHT = 600;

const buildPlayer = (
  id: string,
  color: string,
  sectionStart: number,
  sectionLength: number,
): Player => ({
  id,
  name: `Player ${id}`,
  health: 3,
  color,
  sectionStart,
  sectionLength,
  isEliminated: false,
  eliminationOrder: null,
});

describe("calculateSegmentDividers", () => {
  const sides = createBorderSides(WIDTH, HEIGHT);
  const findSide = (name: BorderSide["name"]) =>
    sides.find((s) => s.name === name)!;

  it("returns no dividers when there are no players", () => {
    expect(calculateSegmentDividers([])).toEqual([]);
  });

  it("returns no dividers for a single player", () => {
    // A lone player's run wraps back onto itself, so both sides of the
    // junction are the same colour and there is nothing to separate.
    const segments = calculatePlayerBorderSegments(
      sides,
      [buildPlayer("1", "#ff0000", 0, 1)],
      0,
    );

    expect(calculateSegmentDividers(segments)).toEqual([]);
  });

  it("places one divider at the start of each player's run", () => {
    const players = [
      buildPlayer("1", "#ff0000", 0, 0.5),
      buildPlayer("2", "#00ff00", 0.5, 0.5),
    ];
    const segments = calculatePlayerBorderSegments(sides, players, 0);

    const dividers = calculateSegmentDividers(segments);

    // One junction per player boundary - two players means two junctions
    expect(dividers).toHaveLength(2);
    // Player 1 starts at the very beginning of the top side
    expect(dividers[0].side.name).toBe("top");
    expect(dividers[0].startPosition).toBe(0);
    // Player 2 starts halfway around the perimeter
    expect(dividers[1].side).toBe(segments[1].segments[0].side);
    expect(dividers[1].startPosition).toBe(
      segments[1].segments[0].startPosition,
    );
  });

  it("does not place a divider where a player's own run wraps across a corner", () => {
    // Player 1 spans the whole top side and part of the right side, so it has
    // two segments. Only the run start gets a divider, not the corner split.
    const players = [
      buildPlayer("1", "#ff0000", 0, 0.5),
      buildPlayer("2", "#00ff00", 0.5, 0.5),
    ];
    const segments = calculatePlayerBorderSegments(sides, players, 0);

    expect(segments[0].segments.length).toBeGreaterThan(1);
    const dividers = calculateSegmentDividers(segments);

    // Still one divider per player, not one per segment
    expect(dividers).toHaveLength(2);
  });

  it("skips junctions between two runs of the same colour", () => {
    const sameColour: PlayerBorderSegments[] = [
      {
        playerId: "1",
        playerName: "P1",
        playerColor: "#ff0000",
        segments: [{ side: findSide("top"), startPosition: 0, length: 100 }],
      },
      {
        playerId: "2",
        playerName: "P2",
        playerColor: "#ff0000",
        segments: [{ side: findSide("top"), startPosition: 100, length: 100 }],
      },
    ];

    expect(calculateSegmentDividers(sameColour)).toEqual([]);
  });

  it("uses the requested divider width and never runs past the end of a side", () => {
    const atSideEnd: PlayerBorderSegments[] = [
      {
        playerId: "1",
        playerName: "P1",
        playerColor: "#ff0000",
        segments: [{ side: findSide("top"), startPosition: 10, length: 100 }],
      },
      {
        playerId: "2",
        playerName: "P2",
        playerColor: "#00ff00",
        // Starts 1px before the corner, so a 4px divider must be clamped
        segments: [
          { side: findSide("top"), startPosition: WIDTH - 1, length: 50 },
        ],
      },
    ];

    const dividers = calculateSegmentDividers(atSideEnd, 4);

    expect(dividers[0].length).toBe(4);
    expect(dividers[1].length).toBe(1);
    expect(
      dividers[1].startPosition + dividers[1].length,
    ).toBeLessThanOrEqual(WIDTH);
  });

  it("ignores players that have no segments", () => {
    // A zero-length player sits between two real runs; it must not produce a
    // divider of its own, nor break the pairing of the runs either side of it.
    const withEmpty: PlayerBorderSegments[] = [
      {
        playerId: "1",
        playerName: "P1",
        playerColor: "#ff0000",
        segments: [{ side: findSide("top"), startPosition: 0, length: 100 }],
      },
      {
        playerId: "2",
        playerName: "P2",
        playerColor: "#00ff00",
        segments: [],
      },
      {
        playerId: "3",
        playerName: "P3",
        playerColor: "#0000ff",
        segments: [{ side: findSide("top"), startPosition: 100, length: 100 }],
      },
    ];

    const dividers = calculateSegmentDividers(withEmpty);

    expect(dividers).toHaveLength(2);
    expect(dividers.map((d) => d.startPosition)).toEqual([0, 100]);
  });
});
