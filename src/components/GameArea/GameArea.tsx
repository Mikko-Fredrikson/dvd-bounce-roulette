import { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
// import { RootState } from '../../store';

/**
 * GameArea component renders the game canvas where the DVD logo bounces
 * and interacts with player borders.
 */
const GameArea = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // We'll use these selectors once we have the Redux store set up
  // const players = useSelector((state: RootState) => state.players.players);
  // const gameSettings = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions to maintain a 2:3 aspect ratio
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth;
      // Calculate height to maintain 2:3 aspect ratio (height:width)
      const containerHeight = (containerWidth * 3) / 2;

      canvas.width = containerWidth;
      canvas.height = containerHeight;

      // Initial drawing will go here once game state is implemented
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Clean up event listener
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div
      data-testid="game-area-container"
      className="w-full h-full flex items-center justify-center bg-gray-900"
    >
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        className="border border-gray-700 shadow-lg"
      />
    </div>
  );
};

export default GameArea;
