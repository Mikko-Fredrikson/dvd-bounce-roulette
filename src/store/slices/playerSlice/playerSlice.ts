import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import {
  PlayerState,
  Player,
  AddPlayerPayload,
  UpdatePlayerNamePayload,
  DecrementPlayerHealthPayload, // Import new payload type
  SetPlayerBorderSegmentsPayload, // Import explicit type
} from "./types";
import { generateUniqueColors } from "../../../utils/colorUtils";

// For color generation with generateUniqueColors
let usedColors: { [key: string]: string } = {};

export const initialState: PlayerState = {
  players: [],
};

// Helper to find the next elimination order number
const getNextEliminationOrder = (players: Player[]): number => {
  const eliminatedPlayers = players.filter((p) => p.isEliminated);
  return eliminatedPlayers.length;
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
        health: action.payload.initialHealth, // Use initialHealth from payload
        color: usedColors[action.payload.name],
        sectionStart: 0,
        sectionLength: 0,
        isEliminated: false,
        eliminationOrder: null, // Initialize eliminationOrder
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

      // Recalculate elimination order if an eliminated player is removed (edge case)
      const remainingPlayers = state.players;
      const eliminatedSorted = remainingPlayers
        .filter((p) => p.isEliminated)
        .sort(
          (a, b) =>
            (a.eliminationOrder ?? Infinity) - (b.eliminationOrder ?? Infinity),
        );
      eliminatedSorted.forEach((p, index) => {
        p.eliminationOrder = index + 1;
      });
    },

    updatePlayerName: (
      state,
      action: PayloadAction<UpdatePlayerNamePayload>,
    ) => {
      const player = state.players.find((p) => p.id === action.payload.id);
      if (player) {
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

    decrementPlayerHealth: (
      state,
      action: PayloadAction<DecrementPlayerHealthPayload>, // Use the new payload type
    ) => {
      const { playerId, mode = "adjacent" } = action.payload; // Destructure payload, default mode to adjacent
      const playerIndex = state.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) return;

      const player = state.players[playerIndex];
      // Only process if health > 0 and not already eliminated
      if (player.health > 0 && !player.isEliminated) {
        player.health -= 1;

        if (player.health === 0) {
          player.isEliminated = true;
          player.eliminationOrder = getNextEliminationOrder(state.players);
          const eliminatedPlayer = player;
          const eliminatedLength = eliminatedPlayer.sectionLength;
          eliminatedPlayer.sectionLength = 0; // Set eliminated player length to 0

          const activePlayers = state.players.filter((p) => !p.isEliminated);
          const numActivePlayers = activePlayers.length;

          if (numActivePlayers > 0) {
            // --- Distribute Length based on mode ---
            if (mode === "equal") {
              // EQUAL DISTRIBUTION
              const lengthToAdd = eliminatedLength / numActivePlayers;
              activePlayers.forEach((activePlayer) => {
                activePlayer.sectionLength += lengthToAdd;
              });
            } else {
              // ADJACENT DISTRIBUTION (Existing Logic)
              const eliminatedOriginalIndex = state.players.findIndex(
                (p) => p.id === eliminatedPlayer.id,
              );
              let prevNeighborOriginalIndex = -1;
              let nextNeighborOriginalIndex = -1;

              // Find previous active neighbor index
              for (let i = 1; i < state.players.length; i++) {
                const checkIndex =
                  (eliminatedOriginalIndex - i + state.players.length) %
                  state.players.length;
                if (!state.players[checkIndex].isEliminated) {
                  prevNeighborOriginalIndex = checkIndex;
                  break;
                }
              }

              // Find next active neighbor index
              for (let i = 1; i < state.players.length; i++) {
                const checkIndex =
                  (eliminatedOriginalIndex + i) % state.players.length;
                if (!state.players[checkIndex].isEliminated) {
                  nextNeighborOriginalIndex = checkIndex;
                  break;
                }
              }

              if (
                prevNeighborOriginalIndex !== -1 &&
                nextNeighborOriginalIndex !== -1 &&
                prevNeighborOriginalIndex !== nextNeighborOriginalIndex
              ) {
                // Two distinct neighbors: Split the length
                const lengthToAdd = eliminatedLength / 2;
                state.players[prevNeighborOriginalIndex].sectionLength +=
                  lengthToAdd;
                state.players[nextNeighborOriginalIndex].sectionLength +=
                  lengthToAdd;
              } else if (prevNeighborOriginalIndex !== -1) {
                // Only one neighbor left (prev and next are the same index)
                state.players[prevNeighborOriginalIndex].sectionLength +=
                  eliminatedLength;
              }
              // If no neighbors, length is just lost (last player standing)
            }
            // --- End Distribute Length ---

            // --- Recalculate Start Positions Sequentially (Works for both modes) --- START ---
            // Sort active players by their original start positions to maintain visual order
            activePlayers.sort((a, b) => a.sectionStart - b.sectionStart);

            // Find the active player who should be visually first
            // This is usually the one with the lowest original sectionStart among active players
            const firstVisualPlayer = activePlayers[0];
            let currentStart = firstVisualPlayer.sectionStart; // Start recalculation from their current start

            // Iterate through the *sorted* active players and set contiguous start positions
            for (const activePlayer of activePlayers) {
              activePlayer.sectionStart = currentStart;
              currentStart = (currentStart + activePlayer.sectionLength) % 1.0;
            }
            // --- Recalculate Start Positions Sequentially --- END ---
          }
        }
      }
    },

    resetPlayersHealth: (state, action: PayloadAction<number>) => {
      state.players.forEach((player) => {
        player.health = action.payload; // Set to the new health value
        player.isEliminated = false;
        player.eliminationOrder = null; // Reset elimination order
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
      action: PayloadAction<SetPlayerBorderSegmentsPayload[]>, // Use explicit type
    ) => {
      action.payload.forEach((segmentInfo) => {
        const player = state.players.find((p) => p.id === segmentInfo.id);
        if (player) {
          player.sectionStart = segmentInfo.sectionStart;
          player.sectionLength = segmentInfo.sectionLength;
        }
      });
    },

    // New reducer to update all players' health to a specific value
    setAllPlayersHealth: (state, action: PayloadAction<number>) => {
      state.players.forEach((player) => {
        if (!player.isEliminated) {
          // Only update health for active players
          player.health = Math.max(1, action.payload); // Ensure health is at least 1
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
  setAllPlayersHealth, // Export the new action
} = playerSlice.actions;

export default playerSlice.reducer;
