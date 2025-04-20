import { useState } from "react";
import { useSelector } from "react-redux";
// import { RootState } from '../../store';

/**
 * ControlPanel component displays the side panel with tabs for:
 * 1. Player management (adding/removing players)
 * 2. Game settings (logo, angle variance, player health)
 */
const ControlPanel = () => {
  const [activeTab, setActiveTab] = useState<"players" | "settings">("players");

  // We'll use these selectors once we have the Redux store set up
  // const players = useSelector((state: RootState) => state.players.players);
  // const gameSettings = useSelector((state: RootState) => state.settings);

  return (
    <div
      data-testid="control-panel"
      className="w-full h-full bg-white rounded-lg shadow-md p-4 flex flex-col"
    >
      {/* Tab Navigation */}
      <div role="tablist" className="flex border-b border-gray-200 mb-4">
        <button
          role="tab"
          aria-selected={activeTab === "players"}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === "players"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("players")}
        >
          Players
        </button>

        <button
          role="tab"
          aria-selected={activeTab === "settings"}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === "settings"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "players" ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Players</h3>
            {/* Player management UI will go here */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add player name"
                className="flex-1 border rounded py-1 px-2"
              />
              <button className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600">
                Add
              </button>
            </div>

            <div className="mt-4">
              {/* Player list will go here once we have the state */}
              <div className="text-sm text-gray-500">No players added yet</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Game Settings</h3>

            {/* Logo upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Custom Logo</label>
              <input
                type="file"
                accept="image/png"
                className="block w-full text-sm"
              />
            </div>

            {/* Angle variance */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Angle Variance: <span>0°</span>
              </label>
              <input
                type="range"
                min="0"
                max="45"
                defaultValue="0"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Higher values make bounce angles less predictable
              </p>
            </div>

            {/* Player health */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Player Health: <span>3</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                defaultValue="3"
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Game Controls */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
        <button className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Start
        </button>
        <button
          className="flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
          disabled
        >
          Pause
        </button>
        <button className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600">
          Reset
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
