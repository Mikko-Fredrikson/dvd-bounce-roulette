import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux"; // Import useDispatch
import Confetti from "react-confetti";
import useWindowSize from "../../hooks/useWindowSize/useWindowSize";
import { RootState } from "../../store";
import { resetGame } from "../../store/slices/gameStateSlice/gameStateSlice"; // Import resetGame
import { resetPlayersHealth } from "../../store/slices/playerSlice/playerSlice"; // Import resetPlayersHealth
import { resetLogo } from "../../store/slices/logoSlice/logoSlice"; // Import resetLogo

interface WinnerDisplayProps {}

const WinnerDisplay: React.FC<WinnerDisplayProps> = () => {
  const dispatch = useDispatch(); // Get dispatch function
  const allPlayers = useSelector((state: RootState) => state.players.players);
  const gameStatus = useSelector((state: RootState) => state.gameState.status);
  const playerHealth = useSelector(
    (state: RootState) => state.settings.playerHealth,
  );
  const { width, height } = useWindowSize(); // Get window dimensions for confetti
  const [showConfetti, setShowConfetti] = useState(false);

  // Filter for active players
  const activePlayers = allPlayers.filter((player) => !player.isEliminated);

  // Determine the winner based on active players
  const winner =
    gameStatus === "finished" && activePlayers.length === 1
      ? activePlayers[0]
      : null;

  // Trigger confetti when winner is determined
  useEffect(() => {
    if (winner) {
      setShowConfetti(true);
      // Optional: Stop confetti after some time
      const timer = setTimeout(() => setShowConfetti(false), 10000); // Stop after 10 seconds
      return () => clearTimeout(timer);
    }
  }, [winner]);

  // Handler for the reset button
  const handleReset = () => {
    dispatch(resetGame());
    dispatch(resetPlayersHealth(playerHealth));
    dispatch(resetLogo());
  };

  if (!winner) {
    return null;
  }

  return (
    <>
      {/* Conditionally render Confetti */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={300} // Adjust number of pieces
          recycle={false} // Don't recycle confetti
          gravity={0.2} // Adjust gravity
          colors={[winner.color, "#FFC700", "#FF85A1", "#FFFFFF"]} // Use winner color + others
        />
      )}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        data-testid="winner-display"
      >
        <div
          className="bg-white p-8 rounded-lg shadow-xl text-center pointer-events-auto"
          style={{ borderColor: winner.color, borderWidth: "4px" }}
        >
          <h2 className="text-4xl font-bold mb-4">Congratulations!</h2>
          <p className="text-2xl mb-6">
            The winner is{" "}
            <span style={{ color: winner.color, fontWeight: "bold" }}>
              {winner.name}
            </span>
            !
          </p>
          {/* Add the reset button */}
          <button
            onClick={handleReset}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Play Again?
          </button>
        </div>
      </div>
    </>
  );
};

export default WinnerDisplay;
