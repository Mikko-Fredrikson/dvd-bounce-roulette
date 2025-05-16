// src/components/GameControls/GameControls.tsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  startGame,
  pauseGame,
  resumeGame,
  resetGame,
} from "../../store/slices/gameStateSlice/gameStateSlice";
import { resetPlayersHealth } from "../../store/slices/playerSlice/playerSlice";
import {
  resetLogo, // Import resetLogo instead of resetLogoPosition
} from "../../store/slices/logoSlice/logoSlice";

const GameControls: React.FC = () => {
  const dispatch = useDispatch();
  const gameStatus = useSelector((state: RootState) => state.gameState.status);
  const playerHealth = useSelector((state: RootState) => state.settings.playerHealth); // Get playerHealth from settings

  const handleStart = () => {
    dispatch(startGame());
  };

  const handlePause = () => {
    dispatch(pauseGame());
  };

  const handleResume = () => {
    dispatch(resumeGame());
  };

  const handleReset = () => {
    dispatch(resetGame());
    dispatch(resetPlayersHealth(playerHealth)); // Dispatch with playerHealth from settings
    dispatch(resetLogo()); // Dispatch resetLogo
  };

  // Basic button styling (replace with Tailwind classes later if needed)
  const buttonStyle = "px-4 py-2 m-1 border rounded text-white font-semibold";
  const startButtonStyle = `${buttonStyle} bg-green-500 hover:bg-green-600`;
  const pauseButtonStyle = `${buttonStyle} bg-yellow-500 hover:bg-yellow-600`;
  const resumeButtonStyle = `${buttonStyle} bg-blue-500 hover:bg-blue-600`;
  const resetButtonStyle = `${buttonStyle} bg-red-500 hover:bg-red-600`;

  return (
    <div className="flex justify-center items-center p-4 border-t border-gray-300 mt-4">
      {gameStatus === "idle" && (
        <button
          onClick={handleStart}
          className={startButtonStyle}
          data-testid="start-button"
        >
          Start
        </button>
      )}
      {gameStatus === "running" && (
        <button
          onClick={handlePause}
          className={pauseButtonStyle}
          data-testid="pause-button"
        >
          Pause
        </button>
      )}
      {gameStatus === "paused" && (
        <button
          onClick={handleResume}
          className={resumeButtonStyle}
          data-testid="resume-button"
        >
          Resume
        </button>
      )}
      {/* Reset button is always available */}
      <button
        onClick={handleReset}
        className={resetButtonStyle}
        data-testid="reset-button"
      >
        Reset
      </button>
    </div>
  );
};

export default GameControls;
