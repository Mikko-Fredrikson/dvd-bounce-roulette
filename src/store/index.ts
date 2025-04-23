import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "./slices/playerSlice/playerSlice";
import gameStateReducer from "./slices/gameStateSlice/gameStateSlice";
import logoReducer from "./slices/logoSlice/logoSlice";
import settingsReducer from "./slices/settingsSlice/settingsSlice"; // Import the new reducer

export const store = configureStore({
  reducer: {
    players: playerReducer,
    gameState: gameStateReducer,
    logo: logoReducer,
    settings: settingsReducer, // Add the settings reducer
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {players: PlayersState, gameState: GameStateState, logo: LogoState, settings: SettingsState}
export type AppDispatch = typeof store.dispatch;
