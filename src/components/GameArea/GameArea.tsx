import React from "react";

interface GameAreaProps {
  width?: number;
  height?: number;
}

/**
 * GameArea component that maintains a fixed 3:2 aspect ratio regardless of window size
 */
const GameArea: React.FC<GameAreaProps> = ({ width = 900, height = 600 }) => {
  // Fixed aspect ratio of 3:2 (width:height)
  const aspectRatio = width / height;

  return (
    <div
      className="w-full"
      style={{ aspectRatio: `${aspectRatio}`, maxWidth: `${width}px` }}
    >
      <div
        data-testid="game-area"
        className="w-full h-full"
        style={{
          border: "2px solid #1a1a1a",
          boxSizing: "border-box",
          backgroundColor: "#f5f5f5",
        }}
      >
        {/* Content will be added here in future tasks */}
      </div>
    </div>
  );
};

export default GameArea;
