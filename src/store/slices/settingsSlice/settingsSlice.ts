import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SettingsState {
  angleVariance: number; // Max deviation in degrees (e.g., 10 means +/- 5 degrees)
  playerHealth: number;
  customLogo: string | null; // URL or path to the custom logo
}

const initialState: SettingsState = {
  angleVariance: 10, // Default variance
  playerHealth: 3,
  customLogo: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setAngleVariance(state, action: PayloadAction<number>) {
      state.angleVariance = action.payload;
    },
    setPlayerHealth(state, action: PayloadAction<number>) {
      state.playerHealth = action.payload;
    },
    setCustomLogo(state, action: PayloadAction<string | null>) {
      state.customLogo = action.payload;
    },
    resetSettings(state) {
      state.angleVariance = initialState.angleVariance;
      state.playerHealth = initialState.playerHealth;
      state.customLogo = initialState.customLogo;
    },
  },
});

export const {
  setAngleVariance,
  setPlayerHealth,
  setCustomLogo,
  resetSettings,
} = settingsSlice.actions;
export default settingsSlice.reducer;
