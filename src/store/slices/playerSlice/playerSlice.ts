import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import {
  PlayerState,
  Player,
  AddPlayerPayload,
  UpdatePlayerNamePayload,
} from "./types";
import { generateUniqueColors } from "../../../utils/colorUtils";

// For color generation with generateUniqueColors
let usedColors: { [key: string]: string } = {};

export const initialState: PlayerState = {
  players: [],
};

export const playerSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    addPlayer: (state, action: PayloadAction<AddPlayerPayload>) => {
      // Generate a color for the new player
      const playerNames = state.players.map((p) => p.name);
      playerNames.push(action.payload.name);
      usedColors = generateUniqueColors(playerNames);

      const newPlayer: Player = {
        id: uuidv4(),
        name: action.payload.name,
        health: 3,
        color: usedColors[action.payload.name],
        // Keep these fields but don't calculate them yet
        sectionStart: 0,
        sectionLength: 0,
      };

      state.players.push(newPlayer);
    },

    removePlayer: (state, action: PayloadAction<string>) => {
      state.players = state.players.filter(
        (player) => player.id !== action.payload,
      );

      // Update colors after removal
      const playerNames = state.players.map((p) => p.name);
      usedColors = generateUniqueColors(playerNames);

      // Update colors of remaining players
      state.players.forEach((player) => {
        player.color = usedColors[player.name];
      });
    },

    updatePlayerName: (
      state,
      action: PayloadAction<UpdatePlayerNamePayload>,
    ) => {
      const player = state.players.find((p) => p.id === action.payload.id);
      if (player) {
        const oldName = player.name;
        player.name = action.payload.name;

        // Update colors with the new name
        const playerNames = state.players.map((p) => p.name);
        usedColors = generateUniqueColors(playerNames);

        // Update all player colors
        state.players.forEach((p) => {
          p.color = usedColors[p.name];
        });
      }
    },

    decrementPlayerHealth: (state, action: PayloadAction<string>) => {
      const player = state.players.find((p) => p.id === action.payload);
      if (player && player.health > 0) {
        player.health -= 1;
      }
    },

    // Renamed from resetAllPlayers
    resetPlayersHealth: (state) => {
      // Reset health to 3 for all players instead of removing them
      state.players.forEach((player) => {
        player.health = 3; // Assuming 3 is the initial health
      });
      // Keep usedColors as is, no need to reset if players remain
    },
  },
});

export const {
  addPlayer,
  removePlayer,
  updatePlayerName,
  decrementPlayerHealth,
  resetPlayersHealth, // Export renamed action
} = playerSlice.actions;

export default playerSlice.reducer;
