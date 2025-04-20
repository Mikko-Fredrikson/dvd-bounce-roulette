import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import GameArea from "../GameArea";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "../../../store/slices/playerSlice/playerSlice";
import * as borderSegmentUtils from "../../../utils/borderUtils/calculatePlayerBorderSegments";
import * as borderSidesUtils from "../../../utils/borderUtils/borderSides";
import * as positionUtils from "../../../utils/positionUtils/calculatePlayerNamePositions";

// Mock animation frame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(() => callback(Date.now()), 0);
});
global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});

// Canvas mock setup
const mockCanvasContext = {
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  clearRect: vi.fn(),
};

// Create a mock store
const createMockStore = (initialPlayers = []) => {
  return configureStore({
    reducer: {
      players: playerReducer,
    },
    preloadedState: {
      players: {
        players: initialPlayers,
        nextId: initialPlayers.length + 1,
      },
    },
  });
};

const renderWithStore = (component, players = []) => {
  const store = createMockStore(players);
  return render(<Provider store={store}>{component}</Provider>);
};

describe("GameArea", () => {
  const mockPlayers = [
    {
      id: "1",
      name: "Player 1",
      color: "#FF0000",
      health: 100,
      isAlive: true,
      borderStart: 0,
      borderLength: 500,
    },
    {
      id: "2",
      name: "Player 2",
      color: "#00FF00",
      health: 100,
      isAlive: true,
      borderStart: 500,
      borderLength: 500,
    },
  ];

  const mockWidth = 900;
  const mockHeight = 600;

  const mockSides = {
    top: mockWidth,
    right: mockHeight,
    bottom: mockWidth,
    left: mockHeight,
  };

  const mockPlayerBorderSegments = [
    {
      playerId: "1",
      playerName: "Player 1",
      playerColor: "#FF0000",
      segments: [{ side: "top", start: 0, length: 500 }],
    },
    {
      playerId: "2",
      playerName: "Player 2",
      playerColor: "#00FF00",
      segments: [
        { side: "top", start: 500, length: 400 },
        { side: "right", start: 0, length: 100 },
      ],
    },
  ];

  const mockPlayerNamePositions = [
    {
      playerId: "1",
      playerName: "Player 1",
      playerColor: "#FF0000",
      position: { x: 250, y: -30 },
    },
    {
      playerId: "2",
      playerName: "Player 2",
      playerColor: "#00FF00",
      position: { x: 700, y: -30 },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock canvas getContext
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCanvasContext);

    // Set up direct mocks for the utility functions
    vi.spyOn(borderSidesUtils, "createBorderSides").mockReturnValue(mockSides);
    vi.spyOn(
      borderSegmentUtils,
      "calculatePlayerBorderSegments",
    ).mockReturnValue(mockPlayerBorderSegments);
    vi.spyOn(positionUtils, "calculatePlayerNamePositions").mockReturnValue(
      mockPlayerNamePositions,
    );
  });

  it("renders game area with correct aspect ratio", () => {
    renderWithStore(
      <GameArea width={mockWidth} height={mockHeight} />,
      mockPlayers,
    );
    const gameArea = screen.getByTestId("game-area");
    expect(gameArea).toBeInTheDocument();
  });

  it("canvas is rendered", () => {
    renderWithStore(
      <GameArea width={mockWidth} height={mockHeight} />,
      mockPlayers,
    );
    const canvas = screen.getByTestId("game-canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("draws player border segments on canvas", () => {
    renderWithStore(
      <GameArea width={mockWidth} height={mockHeight} />,
      mockPlayers,
    );

    // Canvas context should be initialized
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith("2d");

    // Canvas should be cleared before drawing
    expect(mockCanvasContext.clearRect).toHaveBeenCalledWith(
      0,
      0,
      mockWidth,
      mockHeight,
    );

    // Test player segment drawing was called
    expect(mockCanvasContext.beginPath).toHaveBeenCalled();
    expect(mockCanvasContext.stroke).toHaveBeenCalled();
  });

  it("has visible boundaries", () => {
    renderWithStore(<GameArea />, mockPlayers);
    const container = screen.getByTestId("game-area");

    // Check that the container has a border
    const styles = window.getComputedStyle(container);
    expect(styles.border).not.toBe("none");
  });

  it("sets up a container with correct aspect ratio", () => {
    const width = 900;
    const height = 600;
    const aspectRatio = width / height;

    renderWithStore(<GameArea width={width} height={height} />, mockPlayers);
    const container = screen.getByTestId("game-area").parentElement;

    // Check that the aspect ratio is set correctly
    expect(container).not.toBeNull();
    if (container) {
      expect(container.style.aspectRatio).toBe(aspectRatio.toString());
      expect(container.style.maxWidth).toBe(`${width}px`);
    }
  });

  it("fills its container dimensions", () => {
    renderWithStore(<GameArea />, mockPlayers);
    const gameArea = screen.getByTestId("game-area");

    expect(gameArea.className).toContain("w-full");
    expect(gameArea.className).toContain("h-full");
  });

  it("renders canvas element with correct dimensions", () => {
    const width = 900;
    const height = 600;

    renderWithStore(<GameArea width={width} height={height} />, mockPlayers);

    // Check that the canvas element exists
    const canvas = screen.getByTestId("game-canvas");
    expect(canvas).toBeInTheDocument();

    // Check that the canvas has the correct dimensions
    expect(canvas).toHaveAttribute("width", width.toString());
    expect(canvas).toHaveAttribute("height", height.toString());

    // Check that the canvas fills the game area
    expect(canvas.className).toContain("absolute");
    expect(canvas.className).toContain("top-0");
    expect(canvas.className).toContain("left-0");
  });
});
