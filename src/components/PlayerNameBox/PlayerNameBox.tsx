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
 * Hard 1px outline on all four corners plus a soft halo. The box background is the
 * player's palette color, several of which are near-white (yellow, lime, cyan), where
 * plain white text is unreadable. `text-shadow` is inherited, so setting it on the
 * outer box covers both the name and the HP line.
 */
const TEXT_OUTLINE =
  "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 3px rgba(0, 0, 0, 0.6)";

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
        textShadow: TEXT_OUTLINE,
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
