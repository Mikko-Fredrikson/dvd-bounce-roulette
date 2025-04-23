import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "./slices/playerSlice/playerSlice";
import logoReducer from "./slices/logoSlice/logoSlice"; // Import the new reducer

export const store = configureStore({
  reducer: {
    players: playerReducer,
    logo: logoReducer, // Add the logo reducer
    // Add more slices as they are created
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
