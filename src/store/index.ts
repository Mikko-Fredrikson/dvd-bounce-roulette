import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "./slices/playerSlice/playerSlice";

export const store = configureStore({
  reducer: {
    players: playerReducer,
    // Add more slices as they are created
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
