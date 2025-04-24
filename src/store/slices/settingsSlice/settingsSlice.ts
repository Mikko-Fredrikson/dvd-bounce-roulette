import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SettingsState {
  angleVariance: number; // Max deviation in degrees (e.g., 10 means +/- 5 degrees)
  playerHealth: number;
  customLogo: string | null; // URL or path to the custom logo
  logoSpeed: number; // Speed of the logo animation
}

const initialState: SettingsState = {
  angleVariance: 10, // Default variance
  playerHealth: 3,
  customLogo: null,
  logoSpeed: 5, // Default speed
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
    setLogoSpeed(state, action: PayloadAction<number>) {
      state.logoSpeed = action.payload;
    },
    resetSettings(state) {
      state.angleVariance = initialState.angleVariance;
      state.playerHealth = initialState.playerHealth;
      state.customLogo = initialState.customLogo;
      state.logoSpeed = initialState.logoSpeed;
    },
  },
});

export const {
  setAngleVariance,
  setPlayerHealth,
  setCustomLogo,
  resetSettings,
  setLogoSpeed,
} = settingsSlice.actions;
export default settingsSlice.reducer;
