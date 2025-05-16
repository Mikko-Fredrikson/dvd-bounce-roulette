import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  addPlayer,
  removePlayer,
} from "../../store/slices/playerSlice/playerSlice";

const NameInput: React.FC = () => {
  const [playerName, setPlayerName] = useState<string>("");
  const players = useAppSelector((state) => state.players.players);
  const gameStatus = useAppSelector((state) => state.gameState.status);
  const initialHealth = useAppSelector((state) => state.settings.playerHealth); // Get initialHealth from settings
  const dispatch = useAppDispatch();

  const handleAddPlayer = () => {
    if (playerName.trim()) {
      dispatch(addPlayer({ name: playerName.trim(), initialHealth })); // Pass initialHealth when adding player
      setPlayerName("");
    }
  };

  const handleRemovePlayer = (id: string) => {
    dispatch(removePlayer(id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPlayer();
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Players</h2>

      <div className="flex mb-4">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter player name..."
          className="px-3 py-2 border rounded mr-2 flex-grow"
        />
        <button
          onClick={handleAddPlayer}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Player
        </button>
      </div>

      {players.length > 0 ? (
        <ul className="border rounded divide-y">
          {[...players]
            .sort((a, b) => {
              // Sort primarily by elimination status (active first)
              if (a.isEliminated !== b.isEliminated) {
                return a.isEliminated ? 1 : -1;
              }
              // If both eliminated, sort by elimination order
              if (a.isEliminated && b.isEliminated) {
                return (
                  (a.eliminationOrder ?? Infinity) -
                  (b.eliminationOrder ?? Infinity)
                );
              }
              // Otherwise, maintain original add order (or sort by name, id etc. if needed)
              return 0;
            })
            .map((player, index) => (
              <li
                key={player.id}
                className={`flex items-center p-3 justify-between ${player.isEliminated ? "opacity-50 bg-gray-100" : ""}`}
              >
                <div className="flex items-center">
                  <div
                    data-testid={`color-indicator-${index}`}
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: player.color }}
                  />
                  <span>{player.name}</span>
                  {player.isEliminated && player.eliminationOrder && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({ordinalSuffix(player.eliminationOrder)} eliminated)
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  {!player.isEliminated && (
                    <span className="mr-3">HP: {player.health}</span>
                  )}
                  <button
                    data-testid={`remove-player-${index}`}
                    onClick={() => handleRemovePlayer(player.id)}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    disabled={
                      gameStatus === "running" || gameStatus === "paused"
                    } // Disable remove when game active
                    title={
                      gameStatus !== "idle"
                        ? "Cannot remove players while game is active"
                        : "Remove player"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
        </ul>
      ) : (
        <div className="text-center p-4 text-gray-500">
          No players added yet. Add players to start the game.
        </div>
      )}
    </div>
  );
};

// Helper function for ordinal suffixes (1st, 2nd, 3rd, etc.)
function ordinalSuffix(i: number): string {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return i + "st";
  }
  if (j === 2 && k !== 12) {
    return i + "nd";
  }
  if (j === 3 && k !== 13) {
    return i + "rd";
  }
  return i + "th";
}

export default NameInput;
