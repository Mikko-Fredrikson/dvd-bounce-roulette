import { useRef, useEffect } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from '../../store';

/**
 * GameArea component renders the game canvas where the DVD logo bounces
 * and interacts with player borders.
 */
const GameArea = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;

      const containerWidth = containerRef.current.clientWidth - 24; // Subtract padding (p-3 = 0.75rem = 12px on each side)

      // Calculate height to maintain exactly 3:2 aspect ratio (width:height)
      const containerHeight = containerWidth * (2 / 3);

      // Set canvas dimensions
      canvasRef.current.width = containerWidth;
      canvasRef.current.height = containerHeight;

      // Set canvas container style dimensions
      canvasRef.current.style.width = `${containerWidth}px`;
      canvasRef.current.style.height = `${containerHeight}px`;
    };

    // Initial size calculation
    handleResize();

    // Recalculate on window resize
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      data-testid="game-area-container"
      className="w-full h-full flex items-center justify-center bg-white rounded-lg p-3"
      ref={containerRef}
    >
      <div className="canvas-wrapper" style={{ aspectRatio: "3/2" }}>
        <div className="relative w-full h-full">
          <div className="absolute inset-0 border border-slate-300 rounded-md"></div>
          <canvas
            ref={canvasRef}
            data-testid="game-canvas"
            className="relative z-10 rounded-md bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default GameArea;
