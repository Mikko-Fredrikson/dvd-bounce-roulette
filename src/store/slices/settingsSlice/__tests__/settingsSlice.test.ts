import { describe, it, expect } from "vitest";
import settingsReducer, {
  setAngleVariance,
  setPlayerHealth,
  setCustomLogo,
  resetSettings,
  setLogoSpeed,
  setRedistributionMode, // Import the new action
  SettingsState,
} from "../settingsSlice";

describe("settings slice", () => {
  const initialState: SettingsState = {
    angleVariance: 20, // Was 10
    playerHealth: 3,
    customLogo: null,
    logoSpeed: 3, // Was 5
    redistributionMode: "adjacent", // Add initial redistribution mode
  };

  it("should handle initial state", () => {
    expect(settingsReducer(undefined, { type: "unknown" })).toEqual(
      initialState,
    );
  });

  it("should handle setAngleVariance", () => {
    const actual = settingsReducer(initialState, setAngleVariance(20));
    expect(actual.angleVariance).toEqual(20);
  });

  it("should handle setPlayerHealth", () => {
    const actual = settingsReducer(initialState, setPlayerHealth(5));
    expect(actual.playerHealth).toEqual(5);
  });

  it("should handle setCustomLogo", () => {
    const logoUrl = "path/to/logo.png";
    const actual = settingsReducer(initialState, setCustomLogo(logoUrl));
    expect(actual.customLogo).toEqual(logoUrl);
  });

  it("should handle setCustomLogo with null", () => {
    const stateWithLogo: SettingsState = {
      ...initialState,
      customLogo: "path/to/logo.png",
    };
    const actual = settingsReducer(stateWithLogo, setCustomLogo(null));
    expect(actual.customLogo).toBeNull();
  });

  it("should handle setLogoSpeed", () => {
    const actual = settingsReducer(initialState, setLogoSpeed(8));
    expect(actual.logoSpeed).toEqual(8);
  });

  it("should handle setRedistributionMode", () => {
    let actual = settingsReducer(initialState, setRedistributionMode("equal"));
    expect(actual.redistributionMode).toEqual("equal");

    actual = settingsReducer(actual, setRedistributionMode("adjacent"));
    expect(actual.redistributionMode).toEqual("adjacent");
  });

  it("should handle resetSettings", () => {
    const modifiedState: SettingsState = {
      angleVariance: 30, // Changed from 20 to ensure it's different
      playerHealth: 5,
      customLogo: "test.png",
      logoSpeed: 10,
      redistributionMode: "equal", // Include redistributionMode in modified state
    };
    const actual = settingsReducer(modifiedState, resetSettings());
    expect(actual).toEqual(initialState);
  });
});
