import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import {
  PlayerState,
  Player,
  AddPlayerPayload,
  UpdatePlayerNamePayload,
  SetPlayerBorderSegmentsPayload,
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
        sectionStart: 0,
        sectionLength: 0,
        isEliminated: false,
      };

      state.players.push(newPlayer);

      // Recalculate initial segments after adding
      const activePlayers = state.players.filter((p) => !p.isEliminated);
      const numActivePlayers = activePlayers.length;
      if (numActivePlayers > 0) {
        const lengthPerPlayer = 1.0 / numActivePlayers;
        activePlayers.forEach((player, index) => {
          player.sectionStart = index * lengthPerPlayer;
          player.sectionLength = lengthPerPlayer;
        });
      }
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

      // Recalculate segments after removal
      const activePlayers = state.players.filter((p) => !p.isEliminated);
      const numActivePlayers = activePlayers.length;
      if (numActivePlayers > 0) {
        const lengthPerPlayer = 1.0 / numActivePlayers;
        activePlayers.forEach((player, index) => {
          player.sectionStart = index * lengthPerPlayer;
          player.sectionLength = lengthPerPlayer;
        });
      }
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
      const playerIndex = state.players.findIndex(
        (p) => p.id === action.payload,
      );
      if (playerIndex === -1) return;

      const player = state.players[playerIndex];
      if (player.health > 0 && !player.isEliminated) {
        player.health -= 1;

        if (player.health === 0) {
          // Mark as eliminated immediately
          player.isEliminated = true;

          // Redistribution Logic
          const eliminatedPlayer = player;
          const eliminatedLength = eliminatedPlayer.sectionLength;
          eliminatedPlayer.sectionLength = 0;

          const activePlayers = state.players.filter((p) => !p.isEliminated);
          const numActivePlayers = activePlayers.length;

          if (numActivePlayers > 0) {
            const originalIndices = state.players
              .map((p, idx) => (p.isEliminated ? -1 : idx))
              .filter((idx) => idx !== -1);
            const eliminatedOriginalIndex = state.players.findIndex(
              (p) => p.id === eliminatedPlayer.id,
            );

            let prevNeighborIndex = -1;
            let nextNeighborIndex = -1;

            for (let i = 1; i < state.players.length; i++) {
              const checkIndex =
                (eliminatedOriginalIndex - i + state.players.length) %
                state.players.length;
              if (!state.players[checkIndex].isEliminated) {
                prevNeighborIndex = checkIndex;
                break;
              }
            }

            for (let i = 1; i < state.players.length; i++) {
              const checkIndex =
                (eliminatedOriginalIndex + i) % state.players.length;
              if (!state.players[checkIndex].isEliminated) {
                nextNeighborIndex = checkIndex;
                break;
              }
            }

            if (
              prevNeighborIndex !== -1 &&
              nextNeighborIndex !== -1 &&
              prevNeighborIndex !== nextNeighborIndex
            ) {
              const lengthToAdd = eliminatedLength / 2;
              const prevNeighbor = state.players[prevNeighborIndex];
              const nextNeighbor = state.players[nextNeighborIndex];

              prevNeighbor.sectionLength += lengthToAdd;
              nextNeighbor.sectionLength += lengthToAdd;
            } else if (prevNeighborIndex !== -1) {
              const neighbor = state.players[prevNeighborIndex];
              neighbor.sectionLength += eliminatedLength;
            }

            activePlayers.sort((a, b) => a.sectionStart - b.sectionStart);

            let currentStart = 0;
            const firstActivePlayer =
              activePlayers.length > 0 ? activePlayers[0] : null;

            if (firstActivePlayer) {
              let referencePlayerIndex = state.players.findIndex(
                (p) => p.sectionStart === 0,
              );
              if (
                referencePlayerIndex === -1 ||
                state.players[referencePlayerIndex].isEliminated
              ) {
                let minStart = 1.0;
                let minIndex = -1;
                activePlayers.forEach((p) => {
                  if (p.sectionStart < minStart) {
                    minStart = p.sectionStart;
                    minIndex = state.players.findIndex((sp) => sp.id === p.id);
                  }
                });
                referencePlayerIndex = minIndex;
              }

              let firstVisualPlayer = activePlayers[0];
              currentStart = firstVisualPlayer.sectionStart;

              for (let i = 0; i < activePlayers.length; i++) {
                const player = activePlayers[i];
                player.sectionStart = currentStart;
                currentStart = (currentStart + player.sectionLength) % 1.0;
              }
            }
          }
        }
      }
    },

    resetPlayersHealth: (state) => {
      state.players.forEach((player) => {
        player.health = 3;
        player.isEliminated = false;
      });

      const numPlayers = state.players.length;
      if (numPlayers > 0) {
        const lengthPerPlayer = 1.0 / numPlayers;
        state.players.forEach((player, index) => {
          player.sectionStart = index * lengthPerPlayer;
          player.sectionLength = lengthPerPlayer;
        });
      }
    },

    setPlayerBorderSegments: (
      state,
      action: PayloadAction<SetPlayerBorderSegmentsPayload[]>,
    ) => {
      action.payload.forEach((segmentInfo) => {
        const player = state.players.find((p) => p.id === segmentInfo.id);
        if (player) {
          player.sectionStart = segmentInfo.sectionStart;
          player.sectionLength = segmentInfo.sectionLength;
        }
      });
    },
  },
});

export const {
  addPlayer,
  removePlayer,
  updatePlayerName,
  decrementPlayerHealth,
  resetPlayersHealth,
  setPlayerBorderSegments,
} = playerSlice.actions;

export default playerSlice.reducer;
