import { useState, ChangeEvent } from "react";
import NameInput from "../NameInput/NameInput";
import GameControls from "../GameControls/GameControls"; // Import GameControls
import { useAppDispatch, useAppSelector } from "../../store/hooks"; // Import hooks
import {
  setAngleVariance,
  setLogoSpeed, // Import setLogoSpeed action
  setCustomLogo, // Import setCustomLogo action
  setPlayerHealth, // Import setPlayerHealth action
  setRedistributionMode, // Import the new action
  RedistributionMode, // Import the type
} from "../../store/slices/settingsSlice/settingsSlice"; // Import action
import { setAllPlayersHealth } from "../../store/slices/playerSlice/playerSlice"; // Import the new action

/**
 * ControlPanel component displays the side panel with tabs for:
 * 1. Player management (adding/removing players)
 * 2. Game settings (logo, angle variance, player health)
 */
const ControlPanel = () => {
  const [activeTab, setActiveTab] = useState<"players" | "settings">("players");
  const dispatch = useAppDispatch();
  const angleVariance = useAppSelector((state) => state.settings.angleVariance);
  const logoSpeed = useAppSelector((state) => state.settings.logoSpeed); // Get logoSpeed from state
  const playerHealth = useAppSelector((state) => state.settings.playerHealth); // Get playerHealth from state
  const customLogo = useAppSelector((state) => state.settings.customLogo); // Get customLogo from state
  const redistributionMode = useAppSelector(
    (state) => state.settings.redistributionMode,
  ); // Get redistributionMode from state
  const [logoPreview, setLogoPreview] = useState<string | null>(customLogo);

  const handleAngleVarianceChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(event.target.value, 10);
    dispatch(setAngleVariance(value));
  };

  const handleLogoSpeedChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(event.target.value, 10);
    dispatch(setLogoSpeed(value)); // Dispatch setLogoSpeed action
  };

  const handlePlayerHealthChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(event.target.value, 10);
    dispatch(setPlayerHealth(value));
    dispatch(setAllPlayersHealth(value)); // Dispatch action to update all players' health
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "image/png") {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        dispatch(setCustomLogo(result));
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      // Handle error or invalid file type
      dispatch(setCustomLogo(null));
      setLogoPreview(null);
      alert("Please select a valid PNG file.");
    }
  };

  const clearCustomLogo = () => {
    dispatch(setCustomLogo(null));
    setLogoPreview(null);
    // Optionally reset the file input value if needed
    const fileInput = document.getElementById(
      "logo-upload",
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleRedistributionModeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value as RedistributionMode;
    dispatch(setRedistributionMode(value));
  };

  return (
    <div
      data-testid="control-panel"
      className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg shadow-lg flex flex-col overflow-hidden"
    >
      {/* Tab Navigation */}
      <div role="tablist" className="flex bg-white shadow-sm">
        <button
          role="tab"
          aria-selected={activeTab === "players"}
          className={`py-3 px-6 font-medium text-sm flex-1 transition-all duration-200 ${
            activeTab === "players"
              ? "bg-indigo-500 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
          onClick={() => setActiveTab("players")}
        >
          Players
        </button>

        <button
          role="tab"
          aria-selected={activeTab === "settings"}
          className={`py-3 px-6 font-medium text-sm flex-1 transition-all duration-200 ${
            activeTab === "settings"
              ? "bg-indigo-500 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "players" ? (
          <NameInput />
        ) : (
          <div className="space-y-5 p-5">
            <h3 className="text-lg font-medium text-slate-800">
              Game Settings
            </h3>

            {/* Logo upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Custom Logo (PNG)
              </label>
              {logoPreview ? (
                <div className="relative group">
                  <img
                    src={logoPreview}
                    alt="Custom Logo Preview"
                    className="max-w-full h-32 object-contain border border-slate-300 rounded-lg p-2 bg-white mx-auto"
                  />
                  <button
                    onClick={clearCustomLogo}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    aria-label="Clear custom logo"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col rounded-lg border-2 border-dashed w-full h-32 p-3 group text-center border-slate-300 hover:border-indigo-500 transition-colors cursor-pointer">
                    <div className="h-full w-full flex flex-col items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-10 h-10 text-slate-400 group-hover:text-indigo-500 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-slate-500 group-hover:text-indigo-500 transition-colors mt-2">
                        Click to upload PNG
                      </p>
                    </div>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/png"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Angle variance */}
            <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="angle-variance-slider"
                  className="block text-sm font-medium text-slate-700"
                >
                  Angle Variance
                </label>
                <span className="text-sm bg-slate-100 px-2 py-1 rounded-md font-mono">
                  {angleVariance}°
                </span>
              </div>
              <input
                id="angle-variance-slider"
                type="range"
                min="0"
                max="45"
                value={angleVariance} // Use value from state
                onChange={handleAngleVarianceChange} // Handle change
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-xs text-slate-500">
                Max angle deviation on bounce (±{angleVariance / 2}°)
              </p>
            </div>

            {/* Logo Speed */}
            <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="logo-speed-slider"
                  className="block text-sm font-medium text-slate-700"
                >
                  Logo Speed
                </label>
                <span className="text-sm bg-slate-100 px-2 py-1 rounded-md font-mono">
                  {logoSpeed} {/* Display current logo speed */}
                </span>
              </div>
              <input
                id="logo-speed-slider"
                type="range"
                min="1" // Set appropriate min/max values
                max="20"
                value={logoSpeed} // Use value from state
                onChange={handleLogoSpeedChange} // Handle change
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-xs text-slate-500">
                Adjust the speed of the bouncing logo.
              </p>
            </div>

            {/* Player health */}
            <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="player-health-slider"
                  className="block text-sm font-medium text-slate-700"
                >
                  Player Health
                </label>
                <span className="text-sm bg-slate-100 px-2 py-1 rounded-md font-mono">
                  {playerHealth} {/* Display current player health */}
                </span>
              </div>
              <input
                id="player-health-slider"
                type="range"
                min="1"
                max="10"
                value={playerHealth} // Use value from state
                onChange={handlePlayerHealthChange} // Handle change
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-xs text-slate-500">
                Set the starting health for each player.
              </p>
            </div>

            {/* Border Redistribution Mode */}
            <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Border Redistribution on Elimination
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="redistributionMode"
                    value="adjacent"
                    checked={redistributionMode === "adjacent"}
                    onChange={handleRedistributionModeChange}
                    className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span className="text-sm text-slate-600">Adjacent</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="redistributionMode"
                    value="equal"
                    checked={redistributionMode === "equal"}
                    onChange={handleRedistributionModeChange}
                    className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span className="text-sm text-slate-600">Equal</span>
                </label>
              </div>
              <p className="text-xs text-slate-500">
                Choose how border space is redistributed when a player is
                eliminated.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Game Controls */}
      <GameControls />
    </div>
  );
};

export default ControlPanel;
