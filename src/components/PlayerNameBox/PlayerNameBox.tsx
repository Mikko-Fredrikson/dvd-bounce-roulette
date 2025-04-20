import React from "react";

interface Position {
  x: number;
  y: number;
}

interface PlayerNameBoxProps {
  name: string;
  color: string;
  position: Position;
  hp: number;
}

/**
 * Displays a player's name in a colored box that positions itself
 * relative to the player's border segment
 */
const PlayerNameBox: React.FC<PlayerNameBoxProps> = ({
  name,
  color,
  position,
  hp,
}) => {
  return (
    <div
      data-testid="player-name-box"
      className="absolute px-3 py-1 text-white text-sm font-bold rounded-md shadow-md whitespace-nowrap"
      style={{
        backgroundColor: color,
        transform: `translate(${position.x}px, ${position.y}px)`,
        // transition: "transform 0.5s ease",
        zIndex: 10,
      }}
    >
      <div className="flex flex-col items-center">
        <div>{name}</div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium">HP: {hp}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerNameBox;
