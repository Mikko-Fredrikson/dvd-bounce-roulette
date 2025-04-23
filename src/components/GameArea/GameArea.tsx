import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { initializeLogoPosition } from "../../store/slices/logoSlice/logoSlice";

interface GameAreaProps {
  width?: number;
  height?: number;
  animationSpeed?: number;
}

/**
 * GameArea component that maintains a fixed 3:2 aspect ratio regardless of window size
 * Displays player borders, name boxes, and a logo that rotates counter-clockwise
 */
const GameArea: React.FC<GameAreaProps> = ({
  width = 900,
  height = 600,
  animationSpeed = 1, // pixels per frame
}) => {
  // Fixed aspect ratio of 3:2 (width:height)
  const aspectRatio = width / height;

  // Get players and logo from Redux store
  const dispatch = useDispatch();
  const players = useSelector((state: RootState) => state.players.players);
  const logo = useSelector((state: RootState) => state.logo);

  // Animation state
  const [offset, setOffset] = useState(0);
  const animationRef = useRef<number | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const nameBoxContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate border segments for all players
  const sides = createBorderSides(width, height);
  const perimeter = getTotalPerimeter(sides);
  const playerBorderSegments = calculatePlayerBorderSegments(
    sides,
    players,
    offset,
  );

  // Calculate player name positions based on current rotation offset
  const gameDimensions: GameDimensions = { width, height };
  const playerNamePositions = calculatePlayerNamePositions(
    playerBorderSegments,
    gameDimensions,
    0,
  );

  /**
   * Draws the logo on the canvas
   */
  const drawLogo = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { position, size, imageUrl } = logo;
      const centerX = position.x;
      const centerY = position.y;
      const drawWidth = size.width;
      const drawHeight = size.height;

      // TODO: Implement image drawing if imageUrl exists
      if (imageUrl) {
        // Placeholder for image drawing logic
        console.warn("Image drawing not yet implemented.");
        // Example placeholder drawing
        ctx.fillStyle = "purple"; // Placeholder color for image
        ctx.fillRect(
          centerX - drawWidth / 2,
          centerY - drawHeight / 2,
          drawWidth,
          drawHeight,
        );
      } else {
        // Draw a default rectangle if no image
        ctx.fillStyle = "blue"; // Default logo color
        ctx.fillRect(
          centerX - drawWidth / 2,
          centerY - drawHeight / 2,
          drawWidth,
          drawHeight,
        );
      }
    },
    [logo],
  );

  /**
   * Draws player border segments and the logo on canvas
   */
  const drawGameElements = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // Clear the entire canvas before drawing
      ctx.clearRect(0, 0, width, height);

      // Draw the logo first (so borders appear on top if overlapping)
      drawLogo(ctx);

      // Draw player borders
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
    [playerBorderSegments, width, height, drawLogo],
  );

  // Animation loop to continuously update the offset
  const animateOffset = React.useCallback(() => {
    setOffset((prevOffset) => (prevOffset + animationSpeed) % perimeter);
    animationRef.current = requestAnimationFrame(animateOffset);
  }, [animationSpeed, perimeter]);

  // Setup canvas context and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Get canvas context
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize logo position to the center of the GameArea
    if (logo.position.x === 0 && logo.position.y === 0) {
      dispatch(initializeLogoPosition({ x: width / 2, y: height / 2 }));
    }

    // Start animation loop
    animationRef.current = requestAnimationFrame(animateOffset);

    // Cleanup animation loop on unmount
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, animateOffset, dispatch, logo.position]);

  // Update canvas when player border segments or logo state change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw game elements (borders and logo)
    drawGameElements(ctx);
  }, [playerBorderSegments, drawGameElements]);

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
              hp={players.find((p) => p.id === namePos.playerId)?.health || 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameArea;
