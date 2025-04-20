import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  createBorderSides,
  getTotalPerimeter,
} from "../../utils/borderUtils/borderSides";
import { calculatePlayerBorderSegments } from "../../utils/borderUtils/calculatePlayerBorderSegments";
import {
  calculatePlayerNamePositions,
  GameDimensions,
} from "../../utils/positionUtils/calculatePlayerNamePositions";
import PlayerNameBox from "../PlayerNameBox/PlayerNameBox";
import gsap from "gsap";

interface GameAreaProps {
  width?: number;
  height?: number;
}

/**
 * GameArea component that maintains a fixed 3:2 aspect ratio regardless of window size
 * Displays player borders and name boxes that rotate counter-clockwise
 */
const GameArea: React.FC<GameAreaProps> = ({ width = 900, height = 600 }) => {
  // Fixed aspect ratio of 3:2 (width:height)
  const aspectRatio = width / height;

  // Get players from Redux store
  const players = useSelector((state: RootState) => state.players.players);

  // Animation state
  const [rotationOffset, setRotationOffset] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const nameBoxContainerRef = useRef<HTMLDivElement>(null);

  // Calculate border segments for all players
  const sides = createBorderSides(width, height);
  const perimeter = getTotalPerimeter(sides);
  const playerBorderSegments = calculatePlayerBorderSegments(sides, players);

  // Calculate player name positions based on current rotation offset
  const gameDimensions: GameDimensions = { width, height };
  const playerNamePositions = calculatePlayerNamePositions(
    playerBorderSegments,
    gameDimensions,
    rotationOffset,
  );

  // Setup GSAP animation for border rotation
  useEffect(() => {
    // GSAP animation for continuous rotation
    if (players.length > 0) {
      const rotationDuration = 5; // seconds for a full rotation

      // Clear any existing animations
      gsap.killTweensOf({});

      // Create GSAP timeline for continuous rotation
      const tl = gsap.timeline({ repeat: 0 });

      tl.to(
        {},
        {
          duration: rotationDuration,
          ease: "linear",
          // onUpdate: function () {
          //   // Calculate current rotation offset based on timeline progress
          //   const progress = tl.progress();
          //   // const newOffset = progress * perimeter;
          //   // setRotationOffset(newOffset);
          // },
        },
      );

      return () => {
        // Cleanup animation when component unmounts
        tl.kill();
      };
    }
  }, [players.length, perimeter]);

  return (
    <div
      className="w-full relative"
      style={{ aspectRatio: `${aspectRatio}`, maxWidth: `${width}px` }}
    >
      <div
        data-testid="game-area"
        ref={gameAreaRef}
        className="w-full h-full relative overflow-visible"
        style={{
          border: "2px solid #1a1a1a",
          boxSizing: "border-box",
          backgroundColor: "#f5f5f5",
        }}
      >
        {/* Container for player name boxes */}
        <div
          ref={nameBoxContainerRef}
          className="absolute top-0 left-0 w-full h-full overflow-visible"
        >
          {playerNamePositions.map((namePos) => (
            <PlayerNameBox
              key={namePos.playerId}
              name={namePos.playerName}
              color={namePos.playerColor}
              position={namePos.position}
            />
          ))}
        </div>

        {/* Canvas for drawing borders will be added in a future task */}
      </div>
    </div>
  );
};

export default GameArea;
