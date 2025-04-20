import { configureStore } from "@reduxjs/toolkit";
// We'll import slices as we create them
// import gameSlice from './slices/gameSlice';

export const store = configureStore({
  reducer: {
    // game: gameSlice,
    // Add more slices as they are created
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
