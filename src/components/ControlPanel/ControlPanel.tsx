import { useState } from "react";
import NameInput from "../NameInput/NameInput";
import GameControls from "../GameControls/GameControls"; // Import GameControls

/**
 * ControlPanel component displays the side panel with tabs for:
 * 1. Player management (adding/removing players)
 * 2. Game settings (logo, angle variance, player health)
 */
const ControlPanel = () => {
  const [activeTab, setActiveTab] = useState<"players" | "settings">("players");

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
                Custom Logo
              </label>
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
                    <p className="text-sm text-slate-500 group-hover:text-indigo-500 transition-colors">
                      Click to upload PNG
                    </p>
                  </div>
                  <input type="file" accept="image/png" className="hidden" />
                </label>
              </div>
            </div>

            {/* Angle variance */}
            <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-slate-700">
                  Angle Variance
                </label>
                <span className="text-sm bg-slate-100 px-2 py-1 rounded-md font-mono">
                  0°
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                defaultValue="0"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-xs text-slate-500">
                Higher values make bounce angles less predictable
              </p>
            </div>

            {/* Player health */}
            <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-slate-700">
                  Player Health
                </label>
                <span className="text-sm bg-slate-100 px-2 py-1 rounded-md font-mono">
                  3
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                defaultValue="3"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
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
