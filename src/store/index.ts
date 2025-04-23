import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "./slices/playerSlice/playerSlice";
import logoReducer from "./slices/logoSlice/logoSlice";
import gameStateReducer from "./slices/gameStateSlice/gameStateSlice"; // Import the gameState reducer

export const store = configureStore({
  reducer: {
    players: playerReducer,
    logo: logoReducer,
    gameState: gameStateReducer, // Add the gameState reducer
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
