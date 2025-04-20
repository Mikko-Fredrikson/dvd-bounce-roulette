import { describe, it, expect, vi } from "vitest";
import playerReducer, {
  addPlayer,
  removePlayer,
  updatePlayerName,
  initialState,
} from "../playerSlice";
import { PlayerState } from "../types";
import { generateUniqueColors } from "../../../../utils/colorUtils";

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
    // Fields are kept but not calculated
    expect(nextState.players[0].sectionStart).toBe(0);
    expect(nextState.players[0].sectionLength).toBe(0);
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
        },
        {
          id: "2",
          name: "Player 2",
          health: 3,
          color: "#00ff00",
          sectionStart: 0.25,
          sectionLength: 0.25,
        },
      ],
    };

    const nextState = playerReducer(previousState, removePlayer("1"));

    expect(nextState.players.length).toBe(1);
    expect(nextState.players[0].id).toBe("2");
    // Color should be updated after removal but we mocked it
    expect(nextState.players[0].color).toBeDefined();
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
});
