import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the possible modes for border redistribution
export type RedistributionMode = "adjacent" | "equal";

export interface SettingsState {
  angleVariance: number; // Percentage (0-100)
  playerHealth: number;
  customLogo: string | null; // Store as data URL
  logoSpeed: number; // Pixels per frame or similar unit
  redistributionMode: RedistributionMode; // Add the new setting
}

const initialState: SettingsState = {
  angleVariance: 20, // Default 20%
  playerHealth: 3, // Default 3 hits
  customLogo: null,
  logoSpeed: 3, // Default speed
  redistributionMode: "adjacent", // Default to adjacent redistribution
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setAngleVariance(state, action: PayloadAction<number>) {
      state.angleVariance = Math.max(0, Math.min(100, action.payload)); // Clamp between 0 and 100
    },
    setPlayerHealth(state, action: PayloadAction<number>) {
      state.playerHealth = Math.max(1, action.payload); // Minimum 1 health
    },
    setCustomLogo(state, action: PayloadAction<string | null>) {
      state.customLogo = action.payload;
    },
    setLogoSpeed(state, action: PayloadAction<number>) {
      state.logoSpeed = Math.max(1, action.payload); // Minimum speed 1
    },
    setRedistributionMode(state, action: PayloadAction<RedistributionMode>) {
      state.redistributionMode = action.payload;
    },
    resetSettings(state) {
      state.angleVariance = initialState.angleVariance;
      state.playerHealth = initialState.playerHealth;
      state.customLogo = initialState.customLogo;
      state.logoSpeed = initialState.logoSpeed;
      state.redistributionMode = initialState.redistributionMode; // Reset the new setting
    },
  },
});

export const {
  setAngleVariance,
  setPlayerHealth,
  setCustomLogo,
  resetSettings,
  setLogoSpeed,
  setRedistributionMode, // Export the new action
} = settingsSlice.actions;
export default settingsSlice.reducer;
