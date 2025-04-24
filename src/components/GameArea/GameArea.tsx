import React, { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import gsap from "gsap"; // <-- Import GSAP
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
import {
  initializeLogoPosition,
  setLogoPosition,
  setLogoDirection,
  setLogoColor,
} from "../../store/slices/logoSlice/logoSlice";
import { decrementPlayerHealth } from "../../store/slices/playerSlice/playerSlice";
import { PlayerBorderSegments } from "../../utils/borderUtils/types";
import {
  pauseGame,
  finishGame,
} from "../../store/slices/gameStateSlice/gameStateSlice"; // Import finishGame
import { createParticles } from "../../utils/particleUtils/particleManager";
import type { Particle } from "../../utils/particleUtils/types";

// Define type for the impact pulse effect state
interface ImpactPulse {
  color: string;
  opacity: number;
  startTime: number;
  duration: number;
}

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
  animationSpeed = 1, // pixels per frame for border rotation
}) => {
  // Fixed aspect ratio of 3:2 (width:height)
  const aspectRatio = width / height;

  // Get players, logo, and game status from Redux store
  const dispatch = useDispatch();
  const allPlayers = useSelector((state: RootState) => state.players.players);
  const logo = useSelector((state: RootState) => state.logo);
  const gameStatus = useSelector((state: RootState) => state.gameState.status);
  const { angleVariance, logoSpeed, customLogo } = useSelector(
    (state: RootState) => state.settings,
  );

  // Filter out eliminated players
  const activePlayers = allPlayers.filter((player) => !player.isEliminated);

  // Memoize the Image object to avoid reloading on every render
  const logoImage = useMemo(() => {
    if (!customLogo) return null;
    const img = new Image();
    img.src = customLogo;
    return img;
  }, [customLogo]);

  // Animation state
  const [offset, setOffset] = useState(0);
  const animationRef = useRef<number | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null); // Ref for the element to shake
  const nameBoxContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [impactPulse, setImpactPulse] = useState<ImpactPulse | null>(null);

  // Calculate border segments for active players
  const sides = createBorderSides(width, height);
  const perimeter = getTotalPerimeter(sides);
  const playerBorderSegments = calculatePlayerBorderSegments(
    sides,
    activePlayers,
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
      const { position, size, color } = logo;
      const centerX = position.x;
      const centerY = position.y;

      if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
        const imgWidth = logoImage.naturalWidth;
        const imgHeight = logoImage.naturalHeight;
        const targetWidth = size.width;
        const targetHeight = size.height;

        const scaleX = targetWidth / imgWidth;
        const scaleY = targetHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY);

        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;
        const drawX = centerX - drawWidth / 2;
        const drawY = centerY - drawHeight / 2;

        ctx.drawImage(logoImage, drawX, drawY, drawWidth, drawHeight);
      } else if (!customLogo) {
        const radiusX = size.width / 2;
        const radiusY = size.height / 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.fill();
      }
    },
    [logo, logoImage, customLogo],
  );

  /**
   * Draws particles on the canvas
   */
  const drawParticles = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
    },
    [particles],
  );

  /**
   * Draws player border segments, the logo, and particles on canvas
   */
  const drawGameElements = React.useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, width, height);

      drawLogo(ctx);

      playerBorderSegments.forEach((playerSegment) => {
        const { segments, playerColor } = playerSegment;

        ctx.strokeStyle = playerColor;
        ctx.lineWidth = 15;

        segments.forEach((segment) => {
          const { side, startPosition, length } = segment;
          ctx.beginPath();

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

      drawParticles(ctx);
    },
    [playerBorderSegments, width, height, drawLogo, drawParticles],
  );

  // Combined animation loop for border rotation and logo movement
  const animate = React.useCallback(() => {
    if (gameStatus !== "running") {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const now = performance.now();

    // --- Particle Update Logic --- START ---
    const updatedParticles = particles
      .map((p) => {
        const ageIncrement = 16.67;
        const newAge = p.age + ageIncrement;
        const lifeRatio = Math.min(1, newAge / p.lifetime);
        return {
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          age: newAge,
          opacity: 1 - lifeRatio,
        };
      })
      .filter((p) => p.age < p.lifetime);
    // --- Particle Update Logic --- END ---

    // --- Trail Particle Creation --- START ---
    const trailParticleCount = 4;
    const trailParticles = createParticles(
      trailParticleCount,
      logo.position.x,
      logo.position.y,
      [logo.color],
      {
        minSpeed: 2,
        maxSpeed: 4,
        minSize: 1,
        maxSize: 3,
        lifetime: 300,
      },
    );
    setParticles((prevParticles) => [...updatedParticles, ...trailParticles]);
    // --- Trail Particle Creation --- END ---

    let currentPulse = impactPulse;
    if (currentPulse) {
      const elapsed = now - currentPulse.startTime;
      if (elapsed >= currentPulse.duration) {
        setImpactPulse(null);
        currentPulse = null;
      } else {
        const progress = elapsed / currentPulse.duration;
        const opacity = Math.sin(progress * Math.PI) * 0.8;
        if (Math.abs(opacity - currentPulse.opacity) > 0.01) {
          setImpactPulse({ ...currentPulse, opacity });
        }
      }
    }

    setOffset((prevOffset) => (prevOffset + animationSpeed) % perimeter);

    const currentDx = logo.direction.dx;
    const currentDy = logo.direction.dy;
    const vx = currentDx * logoSpeed;
    const vy = currentDy * logoSpeed;

    let nextX = logo.position.x + vx;
    let nextY = logo.position.y + vy;

    const logoHalfWidth = logo.size.width / 2;
    const logoHalfHeight = logo.size.height / 2;

    let collisionSide: "top" | "right" | "bottom" | "left" | null = null;
    let collisionCoords: { x: number; y: number } | null = null;
    let collided = false;
    let finalDx = currentDx;
    let finalDy = currentDy;
    let directionNeedsUpdate = false;

    if (nextX - logoHalfWidth <= 0) {
      finalDx = -currentDx;
      nextX = logoHalfWidth;
      collisionSide = "left";
      collisionCoords = { x: 0, y: nextY };
      collided = true;
      directionNeedsUpdate = true;
    } else if (nextX + logoHalfWidth >= width) {
      finalDx = -currentDx;
      nextX = width - logoHalfWidth;
      collisionSide = "right";
      collisionCoords = { x: width, y: nextY };
      collided = true;
      directionNeedsUpdate = true;
    }

    let currentFinalDx = finalDx;
    if (nextY - logoHalfHeight <= 0) {
      finalDy = -currentDy;
      finalDx = currentFinalDx;
      nextY = logoHalfHeight;
      if (!collided) {
        collisionSide = "top";
        collisionCoords = { x: nextX, y: 0 };
      }
      collided = true;
      directionNeedsUpdate = true;
    } else if (nextY + logoHalfHeight >= height) {
      finalDy = -currentDy;
      finalDx = currentFinalDx;
      nextY = height - logoHalfHeight;
      if (!collided) {
        collisionSide = "bottom";
        collisionCoords = { x: nextX, y: height };
      }
      collided = true;
      directionNeedsUpdate = true;
    }

    // --- Screen Shake on Collision --- START ---
    if (collided && gameAreaRef.current) {
      gsap.killTweensOf(gameAreaRef.current); // Stop any previous shake
      gsap.fromTo(
        gameAreaRef.current,
        { x: 0, y: 0 }, // Start from no offset
        {
          duration: 0.07, // Duration of each jiggle
          x: () => Math.random() * 6 - 3, // Random X offset (-3px to 3px)
          y: () => Math.random() * 6 - 3, // Random Y offset (-3px to 3px)
          repeat: 4, // Number of jiggles
          yoyo: true, // Return towards start position
          ease: "power1.inOut",
          onComplete: () => {
            // Ensure the element is perfectly reset after shaking
            gsap.set(gameAreaRef.current, { x: 0, y: 0 });
          },
        },
      );
    }
    // --- Screen Shake on Collision --- END ---

    if (directionNeedsUpdate && angleVariance > 0) {
      const deviationDegrees = (Math.random() - 0.5) * angleVariance;
      const deviationRadians = deviationDegrees * (Math.PI / 180);

      const cosTheta = Math.cos(deviationRadians);
      const sinTheta = Math.sin(deviationRadians);
      const rotatedDx = finalDx * cosTheta - finalDy * sinTheta;
      const rotatedDy = finalDx * sinTheta + finalDy * cosTheta;
      finalDx = rotatedDx;
      finalDy = rotatedDy;
    }

    if (directionNeedsUpdate) {
      dispatch(setLogoDirection({ dx: finalDx, dy: finalDy }));
    }

    if (collisionSide && collisionCoords) {
      const hitPlayerSegment = (
        playerBorderSegments as PlayerBorderSegments[]
      ).find((playerSegment) =>
        playerSegment.segments.some((segment) => {
          if (segment.side.name !== collisionSide) {
            return false;
          }

          let pointToCheck: number;
          if (collisionSide === "top" || collisionSide === "bottom") {
            pointToCheck = collisionCoords!.x;
            if (collisionSide === "bottom") {
              pointToCheck = width - collisionCoords!.x;
            }
          } else {
            pointToCheck = collisionCoords!.y;
            if (collisionSide === "left") {
              pointToCheck = height - collisionCoords!.y;
            }
          }

          return (
            pointToCheck >= segment.startPosition &&
            pointToCheck < segment.startPosition + segment.length
          );
        }),
      );

      if (hitPlayerSegment) {
        console.log(
          `Collision detected! Side: ${collisionSide}, Coords: ${collisionCoords}, Player Hit: ${hitPlayerSegment.playerName} (ID: ${hitPlayerSegment.playerId})`,
        );
        const hitPlayer = activePlayers.find(
          (p) => p.id === hitPlayerSegment.playerId,
        );
        if (hitPlayer && !hitPlayer.isEliminated) {
          dispatch(decrementPlayerHealth(hitPlayerSegment.playerId));
          dispatch(setLogoColor(hitPlayerSegment.playerColor));

          const particleCount = 50;
          const particleColors = [hitPlayerSegment.playerColor, logo.color];
          const newParticles = createParticles(
            particleCount,
            collisionCoords.x,
            collisionCoords.y,
            particleColors,
            { lifetime: 800, maxSpeed: 6 },
          );
          setParticles((prevParticles) => [...prevParticles, ...newParticles]);

          if (!impactPulse) {
            setImpactPulse({
              color: hitPlayerSegment.playerColor,
              opacity: 0,
              startTime: now,
              duration: 400,
            });
          }
        }
      } else {
        console.log(
          `Collision detected! Side: ${collisionSide}, Coords: ${collisionCoords}, No player segment found at this point.`,
        );
      }
    }

    dispatch(setLogoPosition({ x: nextX, y: nextY }));

    if (gameStatus === "running") {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [
    animationSpeed,
    perimeter,
    dispatch,
    logo.position,
    logo.direction,
    logo.size,
    width,
    height,
    playerBorderSegments,
    activePlayers,
    gameStatus,
    angleVariance,
    logoSpeed,
    particles,
    impactPulse,
    logo.color,
  ]);

  useEffect(() => {
    // Check if only one player remains and finish the game
    if (activePlayers.length === 1 && gameStatus === "running") {
      dispatch(finishGame()); // Dispatch finishGame instead of pauseGame
    }
  }, [activePlayers.length, gameStatus, dispatch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (logo.position.x === 0 && logo.position.y === 0) {
      dispatch(initializeLogoPosition({ x: width / 2, y: height / 2 }));
    }

    if (gameStatus === "running" && animationRef.current === null) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [
    width,
    height,
    animate,
    dispatch,
    logo.position.x,
    logo.position.y,
    gameStatus,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawGameElements(ctx);
  }, [
    playerBorderSegments,
    drawGameElements,
    logo,
    gameStatus,
    logoImage,
    particles,
  ]);

  const gameAreaStyle = useMemo(() => {
    let boxShadow = "none";
    if (impactPulse) {
      const alphaHex = Math.round(impactPulse.opacity * 255)
        .toString(16)
        .padStart(2, "0");
      const shadowColor = `${impactPulse.color}${alphaHex}`;
      const spread = Math.max(0, impactPulse.opacity * 50);
      const blur = spread * 2;
      boxShadow = `0 0 ${blur}px ${spread}px ${shadowColor}`;
    }
    return {
      border: "2px solid #1a1a1a",
      boxSizing: "border-box",
      backgroundColor: "#f5f5f5",
      boxShadow: boxShadow,
      transition: "box-shadow 0.05s linear",
    };
  }, [impactPulse]);

  return (
    <div
      className="w-full relative"
      style={{ aspectRatio: `${width / height}`, maxWidth: `${width}px` }}
    >
      <div
        data-testid="game-area"
        ref={gameAreaRef}
        className="w-full h-full relative overflow-visible"
        style={gameAreaStyle}
      >
        <canvas
          data-testid="game-canvas"
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          width={width}
          height={height}
        />

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
              hp={
                allPlayers.find((p) => p.id === namePos.playerId)?.health || 0
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameArea;
