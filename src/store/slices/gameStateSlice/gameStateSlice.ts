// src/store/slices/gameStateSlice/gameStateSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { GameState } from "./types";

const initialState: GameState = {
  status: "idle", // Initial state is idle
};

const gameStateSlice = createSlice({
  name: "gameState",
  initialState,
  reducers: {
    startGame: (state) => {
      state.status = "running";
    },
    pauseGame: (state) => {
      if (state.status === "running") {
        state.status = "paused";
      }
    },
    resumeGame: (state) => {
      if (state.status === "paused") {
        state.status = "running";
      }
    },
    resetGame: (state) => {
      state.status = "idle";
      // Potentially reset other game aspects here or dispatch other actions
    },
    finishGame: (state) => {
      state.status = "finished";
    },
  },
  extraReducers: (builder) => {
    builder.addCase("settings/setPlayerHealth", (_state, _action) => {
      // This is an example if you wanted to react to another slice's action
      // For this task, direct dispatch from ControlPanel is more straightforward
      // Prefixing with _ to denote unused variables
    });
  },
});

export const { startGame, pauseGame, resumeGame, resetGame, finishGame } =
  gameStateSlice.actions;

export default gameStateSlice.reducer;
