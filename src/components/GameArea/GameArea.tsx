import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { createBorderSides } from "../../utils/borderUtils/borderSides";
import { calculatePlayerBorderSegments } from "../../utils/borderUtils/calculatePlayerBorderSegments";
import {
  calculatePlayerNamePositions,
  GameDimensions,
} from "../../utils/positionUtils/calculatePlayerNamePositions";
import PlayerNameBox from "../PlayerNameBox/PlayerNameBox";

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
  // const [rotationOffset, setRotationOffset] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const nameBoxContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate border segments for all players
  const sides = createBorderSides(width, height);
  // const perimeter = getTotalPerimeter(sides);
  const playerBorderSegments = calculatePlayerBorderSegments(sides, players);

  // Calculate player name positions based on current rotation offset
  const gameDimensions: GameDimensions = { width, height };
  const playerNamePositions = calculatePlayerNamePositions(
    playerBorderSegments,
    gameDimensions,
    0,
  );

  /**
   * Draws player border segments on canvas
   */
  const drawPlayerBorders = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // Draw for each player
      playerBorderSegments.forEach((playerSegment) => {
        const { segments, playerColor } = playerSegment;

        ctx.strokeStyle = playerColor;
        ctx.lineWidth = 15; // Border thickness

        segments.forEach((segment) => {
          const { side, startPosition, length } = segment;
          ctx.beginPath();

          // Draw according to which side the segment is on
          switch (side.name) {
            case "top":
              ctx.moveTo(startPosition, 0);
              ctx.lineTo(startPosition + length, 0);
              break;
            case "right":
              ctx.moveTo(width, startPosition);
              ctx.lineTo(width, startPosition + length);
              break;
            case "bottom":
              ctx.moveTo(width - startPosition, height);
              ctx.lineTo(width - (startPosition + length), height);
              break;
            case "left":
              ctx.moveTo(0, height - startPosition);
              ctx.lineTo(0, height - (startPosition + length));
              break;
          }

          ctx.stroke();
        });
      });
    },
    [playerBorderSegments, width, height],
  );

  // Setup canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Get canvas context
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw player border segments
    drawPlayerBorders(ctx);

    // Canvas is now set up and ready for drawing
    // Future tasks will include drawing the bouncing logo
  }, [width, height, players, playerBorderSegments, drawPlayerBorders]);

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
        {/* Canvas for drawing the bouncing logo */}
        <canvas
          data-testid="game-canvas"
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          width={width}
          height={height}
        />

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
      </div>
    </div>
  );
};

export default GameArea;
