import { describe, it, expect, vi } from "vitest";
import playerReducer, {
  addPlayer,
  removePlayer,
  updatePlayerName,
  decrementPlayerHealth,
  resetPlayersHealth,
  setPlayerBorderSegments, // Import new action
  initialState,
} from "../playerSlice";
import { PlayerState, Player } from "../types";
import { RedistributionMode } from "../../settingsSlice/settingsSlice"; // Import type

// Mock the color utility to get consistent test results
vi.mock("../../../../utils/colorUtils", () => ({
  generateUniqueColors: (names: string[]) => {
    const colors: Record<string, string> = {};
    names.forEach((name, i) => {
      colors[name] = `#color${i}`;
    });
    return colors;
  },
}));

describe("player reducer", () => {
  it("should return the initial state", () => {
    expect(playerReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it("should handle addPlayer", () => {
    const previousState: PlayerState = {
      players: [],
    };

    const nextState = playerReducer(
      previousState,
      addPlayer({ name: "Player 1" }),
    );

    expect(nextState.players.length).toBe(1);
    expect(nextState.players[0].name).toBe("Player 1");
    expect(nextState.players[0].health).toBe(3); // Default health
    expect(nextState.players[0].color).toBeDefined();
    // Segments are now calculated immediately
    expect(nextState.players[0].sectionStart).toBe(0);
    expect(nextState.players[0].sectionLength).toBe(1.0); // First player gets full length
    expect(nextState.players[0].isEliminated).toBe(false);
  });

  it("should handle addPlayer and calculate initial segments", () => {
    let state = initialState;
    state = playerReducer(state, addPlayer({ name: "P1" }));
    expect(state.players.length).toBe(1);
    expect(state.players[0].name).toBe("P1");
    expect(state.players[0].health).toBe(3);
    expect(state.players[0].color).toBe("#color0");
    expect(state.players[0].isEliminated).toBe(false);
    expect(state.players[0].sectionStart).toBe(0);
    expect(state.players[0].sectionLength).toBe(1.0);

    state = playerReducer(state, addPlayer({ name: "P2" }));
    expect(state.players.length).toBe(2);
    expect(state.players[0].sectionStart).toBe(0);
    expect(state.players[0].sectionLength).toBe(0.5);
    expect(state.players[1].sectionStart).toBe(0.5);
    expect(state.players[1].sectionLength).toBe(0.5);

    state = playerReducer(state, addPlayer({ name: "P3" }));
    expect(state.players.length).toBe(3);
    expect(state.players[0].sectionLength).toBeCloseTo(1 / 3);
    expect(state.players[1].sectionLength).toBeCloseTo(1 / 3);
    expect(state.players[2].sectionLength).toBeCloseTo(1 / 3);
    expect(state.players[0].sectionStart).toBe(0);
    expect(state.players[1].sectionStart).toBeCloseTo(1 / 3);
    expect(state.players[2].sectionStart).toBeCloseTo(2 / 3);
  });

  it("should handle removePlayer", () => {
    const previousState: PlayerState = {
      players: [
        {
          id: "1",
          name: "Player 1",
          health: 3,
          color: "#ff0000",
          sectionStart: 0,
          sectionLength: 0.25,
          isEliminated: false,
        },
        {
          id: "2",
          name: "Player 2",
          health: 3,
          color: "#00ff00",
          sectionStart: 0.25,
          sectionLength: 0.25,
          isEliminated: false,
        },
      ],
    };

    const nextState = playerReducer(previousState, removePlayer("1"));

    expect(nextState.players.length).toBe(1);
    expect(nextState.players[0].id).toBe("2");
    // Color should be updated after removal but we mocked it
    expect(nextState.players[0].color).toBeDefined();
  });

  it("should handle removePlayer and recalculate segments", () => {
    const p1: Player = {
      id: "1",
      name: "P1",
      health: 3,
      color: "#c0",
      sectionStart: 0,
      sectionLength: 1 / 3,
      isEliminated: false,
    };
    const p2: Player = {
      id: "2",
      name: "P2",
      health: 3,
      color: "#c1",
      sectionStart: 1 / 3,
      sectionLength: 1 / 3,
      isEliminated: false,
    };
    const p3: Player = {
      id: "3",
      name: "P3",
      health: 3,
      color: "#c2",
      sectionStart: 2 / 3,
      sectionLength: 1 / 3,
      isEliminated: false,
    };
    let state: PlayerState = { players: [p1, p2, p3] };

    state = playerReducer(state, removePlayer("2")); // Remove middle player

    expect(state.players.length).toBe(2);
    expect(state.players.find((p) => p.id === "2")).toBeUndefined();
    // Remaining players P1 and P3 should now split the space
    expect(state.players[0].id).toBe("1");
    expect(state.players[0].sectionStart).toBe(0);
    expect(state.players[0].sectionLength).toBe(0.5);
    expect(state.players[1].id).toBe("3");
    expect(state.players[1].sectionStart).toBe(0.5);
    expect(state.players[1].sectionLength).toBe(0.5);
  });

  it("should handle updatePlayerName", () => {
    const previousState: PlayerState = {
      players: [
        {
          id: "1",
          name: "Player 1",
          health: 3,
          color: "#ff0000",
          sectionStart: 0,
          sectionLength: 0.25,
          isEliminated: false,
        },
      ],
    };

    const nextState = playerReducer(
      previousState,
      updatePlayerName({ id: "1", name: "Updated Name" }),
    );

    expect(nextState.players[0].name).toBe("Updated Name");
    // Color should be updated after name change but we mocked it
    expect(nextState.players[0].color).toBeDefined();
  });

  it("should assign unique colors to players", () => {
    // Start with empty state
    let state = initialState;

    // Add first player
    state = playerReducer(state, addPlayer({ name: "Player 1" }));
    const firstPlayerColor = state.players[0].color;
    expect(firstPlayerColor).toBeDefined();

    // Add second player
    state = playerReducer(state, addPlayer({ name: "Player 2" }));
    const secondPlayerColor = state.players[1].color;
    expect(secondPlayerColor).toBeDefined();

    // With our mock, the colors should be different
    expect(firstPlayerColor).not.toBe(secondPlayerColor);
  });

  it("should handle decrementPlayerHealth", () => {
    const player1: Player = {
      id: "1",
      name: "Player 1",
      health: 3,
      color: "#color0",
      sectionStart: 0,
      sectionLength: 0.5,
      isEliminated: false, // Add missing property
    };
    const player2: Player = {
      id: "2",
      name: "Player 2",
      health: 1,
      color: "#color1",
      sectionStart: 0.5,
      sectionLength: 0.5,
      isEliminated: false, // Add missing property
    };
    const previousState: PlayerState = {
      players: [player1, player2],
    };

    // Decrement player 1's health
    // Update action call to use payload object
    let nextState = playerReducer(
      previousState,
      decrementPlayerHealth({ playerId: "1" }),
    );
    expect(nextState.players.find((p) => p.id === "1")?.health).toBe(2);
    expect(nextState.players.find((p) => p.id === "1")?.isEliminated).toBe(
      false,
    );
    expect(nextState.players.find((p) => p.id === "2")?.health).toBe(1); // Player 2 unchanged
    expect(nextState.players.find((p) => p.id === "2")?.isEliminated).toBe(
      false,
    );

    // Decrement player 2's health
    // Update action call to use payload object
    nextState = playerReducer(
      nextState,
      decrementPlayerHealth({ playerId: "2" }),
    );
    expect(nextState.players.find((p) => p.id === "1")?.health).toBe(2); // Player 1 unchanged
    expect(nextState.players.find((p) => p.id === "2")?.health).toBe(0);
    expect(nextState.players.find((p) => p.id === "2")?.isEliminated).toBe(
      true,
    );

    // Try decrementing player 2's health below 0
    // Update action call to use payload object
    nextState = playerReducer(
      nextState,
      decrementPlayerHealth({ playerId: "2" }),
    );
    expect(nextState.players.find((p) => p.id === "2")?.health).toBe(0); // Health should not go below 0
    expect(nextState.players.find((p) => p.id === "2")?.isEliminated).toBe(
      true,
    ); // Should remain eliminated
  });

  it("should handle decrementPlayerHealth causing elimination and redistribute length (middle player)", () => {
    // P1 --- P2 --- P3
    const p1: Player = {
      id: "1",
      name: "P1",
      health: 3,
      color: "#c0",
      sectionStart: 0,
      sectionLength: 1 / 3,
      isEliminated: false,
    };
    const p2: Player = {
      id: "2",
      name: "P2",
      health: 1,
      color: "#c1",
      sectionStart: 1 / 3,
      sectionLength: 1 / 3,
      isEliminated: false,
    };
    const p3: Player = {
      id: "3",
      name: "P3",
      health: 3,
      color: "#c2",
      sectionStart: 2 / 3,
      sectionLength: 1 / 3,
      isEliminated: false,
    };
    const previousState: PlayerState = { players: [p1, p2, p3] };

    // Update action call to use payload object (defaulting to adjacent)
    const nextState = playerReducer(
      previousState,
      decrementPlayerHealth({ playerId: "2" }),
    );

    const eliminatedPlayer = nextState.players.find((p) => p.id === "2");
    const neighbor1 = nextState.players.find((p) => p.id === "1");
    const neighbor3 = nextState.players.find((p) => p.id === "3");

    // Check elimination status and health
    expect(eliminatedPlayer?.health).toBe(0);
    expect(eliminatedPlayer?.isEliminated).toBe(true);
    expect(eliminatedPlayer?.sectionLength).toBe(0); // Eliminated player has no length
    expect(neighbor1?.health).toBe(3);
    expect(neighbor3?.health).toBe(3);

    // Check length redistribution (P1 and P3 get half of P2's length)
    const expectedLength = 1 / 3 + 1 / 3 / 2; // Original + half of eliminated
    expect(neighbor1?.sectionLength).toBeCloseTo(expectedLength);
    expect(neighbor3?.sectionLength).toBeCloseTo(expectedLength);

    // Check start position recalculation
    // P1 should still start at 0
    // P3 should start where P1 ends
    expect(neighbor1?.sectionStart).toBeCloseTo(0);
    expect(neighbor3?.sectionStart).toBeCloseTo(neighbor1?.sectionLength ?? 0);
  });

  it("should handle decrementPlayerHealth causing elimination and redistribute length (first player)", () => {
    // P1 --- P2 --- P3 (P1 eliminated, P3 is prev neighbor, P2 is next)
    const p1: Player = {
      id: "1",
      name: "P1",
      health: 1,
      color: "#c0",
      sectionStart: 0,
      sectionLength: 1 / 3,
      isEliminated: false,
    };
    const p2: Player = {
      id: "2",
      name: "P2",
      health: 3,
      color: "#c1",
      sectionStart: 1 / 3,
      sectionLength: 1 / 3,
      isEliminated: false,
    };
    const p3: Player = {
      id: "3",
      name: "P3",
      health: 3,
      color: "#c2",
      sectionStart: 2 / 3,
      sectionLength: 1 / 3,
      isEliminated: false,
    };
    const previousState: PlayerState = { players: [p1, p2, p3] };

    // Update action call to use payload object (defaulting to adjacent)
    const nextState = playerReducer(
      previousState,
      decrementPlayerHealth({ playerId: "1" }),
    );

    const eliminatedPlayer = nextState.players.find((p) => p.id === "1");
    const neighbor2 = nextState.players.find((p) => p.id === "2");
    const neighbor3 = nextState.players.find((p) => p.id === "3"); // Wraps around

    expect(eliminatedPlayer?.health).toBe(0);
    expect(eliminatedPlayer?.isEliminated).toBe(true);
    expect(eliminatedPlayer?.sectionLength).toBe(0);

    const expectedLength = 1 / 3 + 1 / 3 / 2;
    expect(neighbor2?.sectionLength).toBeCloseTo(expectedLength);
    expect(neighbor3?.sectionLength).toBeCloseTo(expectedLength);

    // Check start positions (P2 should now be first visually, starting where P1 ended)
    // P3 starts after P2
    // Note: The recalculation logic sorts active players by original start time.
    // P2 had original start 1/3, P3 had 2/3. So P2 comes first.
    expect(neighbor2?.sectionStart).toBeCloseTo(1 / 3); // P2 keeps its original start visually
    expect(neighbor3?.sectionStart).toBeCloseTo(
      1 / 3 + neighbor2!.sectionLength,
    );
  });

  it("should handle decrementPlayerHealth causing elimination and redistribute length (last player)", () => {
    // P1 --- P2 --- P3 (P3 eliminated, P2 is prev, P1 is next)
    const p1: Player = {
      id: "1",
      name: "P1",
      health: 3,
      color: "#c0",
      sectionStart: 0,
      sectionLength: 1 / 3,
      isEliminated: false,
    };
    const p2: Player = {
      id: "2",
      name: "P2",
      health: 3,
      color: "#c1",
      sectionStart: 1 / 3,
      sectionLength: 1 / 3,
      isEliminated: false,
    };
    const p3: Player = {
      id: "3",
      name: "P3",
      health: 1,
      color: "#c2",
      sectionStart: 2 / 3,
      sectionLength: 1 / 3,
      isEliminated: false,
    };
    const previousState: PlayerState = { players: [p1, p2, p3] };

    // Update action call to use payload object (defaulting to adjacent)
    const nextState = playerReducer(
      previousState,
      decrementPlayerHealth({ playerId: "3" }),
    );

    const eliminatedPlayer = nextState.players.find((p) => p.id === "3");
    const neighbor1 = nextState.players.find((p) => p.id === "1"); // Wraps around
    const neighbor2 = nextState.players.find((p) => p.id === "2");

    expect(eliminatedPlayer?.health).toBe(0);
    expect(eliminatedPlayer?.isEliminated).toBe(true);
    expect(eliminatedPlayer?.sectionLength).toBe(0);

    const expectedLength = 1 / 3 + 1 / 3 / 2;
    expect(neighbor1?.sectionLength).toBeCloseTo(expectedLength);
    expect(neighbor2?.sectionLength).toBeCloseTo(expectedLength);

    // Check start positions (P1 starts at 0, P2 starts after P1)
    expect(neighbor1?.sectionStart).toBeCloseTo(0);
    expect(neighbor2?.sectionStart).toBeCloseTo(neighbor1!.sectionLength);
  });

  it("should handle decrementPlayerHealth causing elimination with only one neighbor left", () => {
    // P1 --- P2 (P2 eliminated)
    const p1: Player = {
      id: "1",
      name: "P1",
      health: 3,
      color: "#c0",
      sectionStart: 0,
      sectionLength: 0.5,
      isEliminated: false,
    };
    const p2: Player = {
      id: "2",
      name: "P2",
      health: 1,
      color: "#c1",
      sectionStart: 0.5,
      sectionLength: 0.5,
      isEliminated: false,
    };
    const previousState: PlayerState = { players: [p1, p2] };

    // Update action call to use payload object (defaulting to adjacent)
    const nextState = playerReducer(
      previousState,
      decrementPlayerHealth({ playerId: "2" }),
    );

    const eliminatedPlayer = nextState.players.find((p) => p.id === "2");
    const neighbor1 = nextState.players.find((p) => p.id === "1");

    expect(eliminatedPlayer?.health).toBe(0);
    expect(eliminatedPlayer?.isEliminated).toBe(true);
    expect(eliminatedPlayer?.sectionLength).toBe(0);

    // P1 gets all the length
    expect(neighbor1?.sectionLength).toBeCloseTo(1.0);
    expect(neighbor1?.sectionStart).toBeCloseTo(0); // Start remains 0
  });

  it("should not decrement health or eliminate if already eliminated", () => {
    const p1: Player = {
      id: "1",
      name: "P1",
      health: 0,
      color: "#c0",
      sectionStart: 0,
      sectionLength: 0,
      isEliminated: true,
    };
    const p2: Player = {
      id: "2",
      name: "P2",
      health: 3,
      color: "#c1",
      sectionStart: 0,
      sectionLength: 1.0,
      isEliminated: false,
    }; // P2 has full length
    const previousState: PlayerState = { players: [p1, p2] };

    // Update action call to use payload object (defaulting to adjacent)
    const nextState = playerReducer(
      previousState,
      decrementPlayerHealth({ playerId: "1" }),
    );

    // P1 state should remain unchanged
    expect(nextState.players.find((p) => p.id === "1")?.health).toBe(0);
    expect(nextState.players.find((p) => p.id === "1")?.isEliminated).toBe(
      true,
    );
    expect(nextState.players.find((p) => p.id === "1")?.sectionLength).toBe(0);
    // P2 state should remain unchanged
    expect(nextState.players.find((p) => p.id === "2")?.health).toBe(3);
    expect(nextState.players.find((p) => p.id === "2")?.sectionLength).toBe(
      1.0,
    );
  });

  it("should handle resetPlayersHealth", () => {
    const p1: Player = {
      id: "1",
      name: "P1",
      health: 1,
      color: "#c0",
      sectionStart: 0,
      sectionLength: 0.4,
      isEliminated: false,
    };
    const p2: Player = {
      id: "2",
      name: "P2",
      health: 0,
      color: "#c1",
      sectionStart: 0.4,
      sectionLength: 0,
      isEliminated: true,
    };
    const p3: Player = {
      id: "3",
      name: "P3",
      health: 2,
      color: "#c2",
      sectionStart: 0.4,
      sectionLength: 0.6,
      isEliminated: false,
    };
    const previousState: PlayerState = { players: [p1, p2, p3] };

    const nextState = playerReducer(previousState, resetPlayersHealth());

    expect(nextState.players.length).toBe(3);
    // Check health and elimination status reset
    nextState.players.forEach((player) => {
      expect(player.health).toBe(3);
      expect(player.isEliminated).toBe(false);
    });
    // Check segments recalculated evenly
    expect(nextState.players[0].sectionLength).toBeCloseTo(1 / 3);
    expect(nextState.players[1].sectionLength).toBeCloseTo(1 / 3);
    expect(nextState.players[2].sectionLength).toBeCloseTo(1 / 3);
    expect(nextState.players[0].sectionStart).toBeCloseTo(0);
    expect(nextState.players[1].sectionStart).toBeCloseTo(1 / 3);
    expect(nextState.players[2].sectionStart).toBeCloseTo(2 / 3);
  });

  it("should handle setPlayerBorderSegments", () => {
    const p1: Player = {
      id: "1",
      name: "P1",
      health: 3,
      color: "#c0",
      sectionStart: 0,
      sectionLength: 0.5,
      isEliminated: false,
    };
    const p2: Player = {
      id: "2",
      name: "P2",
      health: 3,
      color: "#c1",
      sectionStart: 0.5,
      sectionLength: 0.5,
      isEliminated: false,
    };
    const previousState: PlayerState = { players: [p1, p2] };

    const newSegments = [
      { id: "1", sectionStart: 0.1, sectionLength: 0.4 },
      { id: "2", sectionStart: 0.5, sectionLength: 0.5 }, // No change for P2
      { id: "3", sectionStart: 0, sectionLength: 0 }, // Non-existent player, should be ignored
    ];

    const nextState = playerReducer(
      previousState,
      setPlayerBorderSegments(newSegments),
    );

    expect(nextState.players.find((p) => p.id === "1")?.sectionStart).toBe(0.1);
    expect(nextState.players.find((p) => p.id === "1")?.sectionLength).toBe(
      0.4,
    );
    expect(nextState.players.find((p) => p.id === "2")?.sectionStart).toBe(0.5);
    expect(nextState.players.find((p) => p.id === "2")?.sectionLength).toBe(
      0.5,
    );
  });

  it("should handle decrementPlayerHealth causing elimination and redistribute length (4 players, middle player)", () => {
    // P1 --- P2 --- P3 --- P4
    const initialLength = 1 / 4;
    const p1: Player = {
      id: "1",
      name: "P1",
      health: 3,
      color: "#c0",
      sectionStart: 0 * initialLength,
      sectionLength: initialLength,
      isEliminated: false,
    };
    const p2: Player = {
      id: "2",
      name: "P2",
      health: 1,
      color: "#c1",
      sectionStart: 1 * initialLength,
      sectionLength: initialLength,
      isEliminated: false,
    }; // P2 will be eliminated
    const p3: Player = {
      id: "3",
      name: "P3",
      health: 3,
      color: "#c2",
      sectionStart: 2 * initialLength,
      sectionLength: initialLength,
      isEliminated: false,
    };
    const p4: Player = {
      id: "4",
      name: "P4",
      health: 3,
      color: "#c3",
      sectionStart: 3 * initialLength,
      sectionLength: initialLength,
      isEliminated: false,
    };
    const previousState: PlayerState = { players: [p1, p2, p3, p4] };

    // Update action call to use payload object (defaulting to adjacent)
    const nextState = playerReducer(
      previousState,
      decrementPlayerHealth({ playerId: "2" }),
    );

    const eliminatedPlayer = nextState.players.find((p) => p.id === "2");
    const neighbor1 = nextState.players.find((p) => p.id === "1");
    const neighbor3 = nextState.players.find((p) => p.id === "3");
    const nonNeighbor4 = nextState.players.find((p) => p.id === "4");

    // Check elimination status and health
    expect(eliminatedPlayer?.health).toBe(0);
    expect(eliminatedPlayer?.isEliminated).toBe(true);
    expect(eliminatedPlayer?.sectionLength).toBe(0); // Eliminated player has no length
    expect(neighbor1?.health).toBe(3);
    expect(neighbor3?.health).toBe(3);
    expect(nonNeighbor4?.health).toBe(3);

    // Check length redistribution (P1 and P3 get half of P2's length)
    const lengthToAdd = initialLength / 2;
    const expectedNeighborLength = initialLength + lengthToAdd; // 0.25 + 0.125 = 0.375
    expect(neighbor1?.sectionLength).toBeCloseTo(expectedNeighborLength);
    expect(neighbor3?.sectionLength).toBeCloseTo(expectedNeighborLength);
    expect(nonNeighbor4?.sectionLength).toBeCloseTo(initialLength); // P4 length unchanged

    // Check start position recalculation
    // Order should be P1, P3, P4
    expect(neighbor1?.sectionStart).toBeCloseTo(0); // P1 still starts at 0
    expect(neighbor3?.sectionStart).toBeCloseTo(neighbor1!.sectionLength); // P3 starts after P1
    expect(nonNeighbor4?.sectionStart).toBeCloseTo(
      neighbor1!.sectionLength + neighbor3!.sectionLength,
    ); // P4 starts after P3
  });

  // --- New Tests for Equal Redistribution ---

  it("should handle decrementPlayerHealth causing elimination and redistribute length EQUALLY (4 players, middle player)", () => {
    // P1 --- P2 --- P3 --- P4 (P2 eliminated)
    const initialLength = 1 / 4;
    const p1: Player = {
      id: "1",
      name: "P1",
      health: 3,
      color: "#c0",
      sectionStart: 0 * initialLength,
      sectionLength: initialLength,
      isEliminated: false,
    };
    const p2: Player = {
      id: "2",
      name: "P2",
      health: 1,
      color: "#c1",
      sectionStart: 1 * initialLength,
      sectionLength: initialLength,
      isEliminated: false,
    };
    const p3: Player = {
      id: "3",
      name: "P3",
      health: 3,
      color: "#c2",
      sectionStart: 2 * initialLength,
      sectionLength: initialLength,
      isEliminated: false,
    };
    const p4: Player = {
      id: "4",
      name: "P4",
      health: 3,
      color: "#c3",
      sectionStart: 3 * initialLength,
      sectionLength: initialLength,
      isEliminated: false,
    };
    const previousState: PlayerState = { players: [p1, p2, p3, p4] };
    const mode: RedistributionMode = "equal";

    // Simulate calling the reducer with the mode (actual implementation might differ)
    // We'll assume the reducer logic accesses this mode internally for the test
    const nextState = playerReducer(
      previousState,
      decrementPlayerHealth({ playerId: "2", mode }),
    );

    const eliminatedPlayer = nextState.players.find((p) => p.id === "2");
    const activePlayers = nextState.players.filter((p) => !p.isEliminated);
    const p1After = activePlayers.find((p) => p.id === "1");
    const p3After = activePlayers.find((p) => p.id === "3");
    const p4After = activePlayers.find((p) => p.id === "4");

    expect(eliminatedPlayer?.health).toBe(0);
    expect(eliminatedPlayer?.isEliminated).toBe(true);
    expect(eliminatedPlayer?.sectionLength).toBe(0);
    expect(activePlayers.length).toBe(3);

    // Check length redistribution (P1, P3, P4 each get 1/3 of P2's length)
    const lengthToAdd = initialLength / 3;
    const expectedLength = initialLength + lengthToAdd; // 0.25 + (0.25 / 3) = 1/3
    expect(p1After?.sectionLength).toBeCloseTo(expectedLength);
    expect(p3After?.sectionLength).toBeCloseTo(expectedLength);
    expect(p4After?.sectionLength).toBeCloseTo(expectedLength);

    // Check start positions (Order P1, P3, P4 based on original start)
    expect(p1After?.sectionStart).toBeCloseTo(0); // P1 still starts at 0
    expect(p3After?.sectionStart).toBeCloseTo(p1After!.sectionLength); // P3 starts after P1
    expect(p4After?.sectionStart).toBeCloseTo(
      p1After!.sectionLength + p3After!.sectionLength,
    ); // P4 starts after P3
  });

  it("should handle decrementPlayerHealth causing elimination and redistribute length EQUALLY (3 players, first player)", () => {
    // P1 --- P2 --- P3 (P1 eliminated)
    const initialLength = 1 / 3;
    const p1: Player = {
      id: "1",
      name: "P1",
      health: 1,
      color: "#c0",
      sectionStart: 0 * initialLength,
      sectionLength: initialLength,
      isEliminated: false,
    };
    const p2: Player = {
      id: "2",
      name: "P2",
      health: 3,
      color: "#c1",
      sectionStart: 1 * initialLength,
      sectionLength: initialLength,
      isEliminated: false,
    };
    const p3: Player = {
      id: "3",
      name: "P3",
      health: 3,
      color: "#c2",
      sectionStart: 2 * initialLength,
      sectionLength: initialLength,
      isEliminated: false,
    };
    const previousState: PlayerState = { players: [p1, p2, p3] };
    const mode: RedistributionMode = "equal";

    const nextState = playerReducer(
      previousState,
      decrementPlayerHealth({ playerId: "1", mode }),
    );

    const eliminatedPlayer = nextState.players.find((p) => p.id === "1");
    const activePlayers = nextState.players.filter((p) => !p.isEliminated);
    const p2After = activePlayers.find((p) => p.id === "2");
    const p3After = activePlayers.find((p) => p.id === "3");

    expect(eliminatedPlayer?.health).toBe(0);
    expect(eliminatedPlayer?.isEliminated).toBe(true);
    expect(eliminatedPlayer?.sectionLength).toBe(0);
    expect(activePlayers.length).toBe(2);

    // Check length redistribution (P2, P3 each get 1/2 of P1's length)
    const lengthToAdd = initialLength / 2;
    const expectedLength = initialLength + lengthToAdd; // 1/3 + (1/3 / 2) = 0.5
    expect(p2After?.sectionLength).toBeCloseTo(expectedLength);
    expect(p3After?.sectionLength).toBeCloseTo(expectedLength);

    // Check start positions (Order P2, P3 based on original start)
    expect(p2After?.sectionStart).toBeCloseTo(initialLength); // P2 keeps original start
    expect(p3After?.sectionStart).toBeCloseTo(
      initialLength + p2After!.sectionLength,
    ); // P3 starts after P2
  });

  it("should handle decrementPlayerHealth causing elimination and redistribute length EQUALLY (3 players, last player)", () => {
    // P1 --- P2 --- P3 (P3 eliminated)
    const initialLength = 1 / 3;
    const p1: Player = {
      id: "1",
      name: "P1",
      health: 3,
      color: "#c0",
      sectionStart: 0 * initialLength,
      sectionLength: initialLength,
      isEliminated: false,
    };
    const p2: Player = {
      id: "2",
      name: "P2",
      health: 3,
      color: "#c1",
      sectionStart: 1 * initialLength,
      sectionLength: initialLength,
      isEliminated: false,
    };
    const p3: Player = {
      id: "3",
      name: "P3",
      health: 1,
      color: "#c2",
      sectionStart: 2 * initialLength,
      sectionLength: initialLength,
      isEliminated: false,
    };
    const previousState: PlayerState = { players: [p1, p2, p3] };
    const mode: RedistributionMode = "equal";

    const nextState = playerReducer(
      previousState,
      decrementPlayerHealth({ playerId: "3", mode }),
    );

    const eliminatedPlayer = nextState.players.find((p) => p.id === "3");
    const activePlayers = nextState.players.filter((p) => !p.isEliminated);
    const p1After = activePlayers.find((p) => p.id === "1");
    const p2After = activePlayers.find((p) => p.id === "2");

    expect(eliminatedPlayer?.health).toBe(0);
    expect(eliminatedPlayer?.isEliminated).toBe(true);
    expect(eliminatedPlayer?.sectionLength).toBe(0);
    expect(activePlayers.length).toBe(2);

    // Check length redistribution (P1, P2 each get 1/2 of P3's length)
    const lengthToAdd = initialLength / 2;
    const expectedLength = initialLength + lengthToAdd; // 1/3 + (1/3 / 2) = 0.5
    expect(p1After?.sectionLength).toBeCloseTo(expectedLength);
    expect(p2After?.sectionLength).toBeCloseTo(expectedLength);

    // Check start positions (Order P1, P2 based on original start)
    expect(p1After?.sectionStart).toBeCloseTo(0); // P1 keeps original start
    expect(p2After?.sectionStart).toBeCloseTo(p1After!.sectionLength); // P2 starts after P1
  });

  it("should handle decrementPlayerHealth causing elimination with only one neighbor left (EQUAL mode - same as adjacent)", () => {
    // P1 --- P2 (P2 eliminated)
    const p1: Player = {
      id: "1",
      name: "P1",
      health: 3,
      color: "#c0",
      sectionStart: 0,
      sectionLength: 0.5,
      isEliminated: false,
    };
    const p2: Player = {
      id: "2",
      name: "P2",
      health: 1,
      color: "#c1",
      sectionStart: 0.5,
      sectionLength: 0.5,
      isEliminated: false,
    };
    const previousState: PlayerState = { players: [p1, p2] };
    const mode: RedistributionMode = "equal";

    const nextState = playerReducer(
      previousState,
      decrementPlayerHealth({ playerId: "2", mode }),
    );

    const eliminatedPlayer = nextState.players.find((p) => p.id === "2");
    const neighbor1 = nextState.players.find(
      (p) => p.id === "1" && !p.isEliminated,
    );

    expect(eliminatedPlayer?.health).toBe(0);
    expect(eliminatedPlayer?.isEliminated).toBe(true);
    expect(eliminatedPlayer?.sectionLength).toBe(0);

    // P1 gets all the length
    expect(neighbor1?.sectionLength).toBeCloseTo(1.0);
    expect(neighbor1?.sectionStart).toBeCloseTo(0); // Start remains 0
  });
});
