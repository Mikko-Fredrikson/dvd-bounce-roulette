import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import GameArea from "../GameArea";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "../../../store/slices/playerSlice/playerSlice";

// Mock animation frame
globalThis.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(() => callback(Date.now()), 0);
});
globalThis.cancelAnimationFrame = vi.fn((id) => {
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

// Mock the borderUtils methods
vi.mock("../../../utils/borderUtils/borderSides", () => {
  const mockTop = {
    name: "top",
    length: 900,
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 900, y: 0 },
    nextSide: null,
  };

  const mockRight = {
    name: "right",
    length: 600,
    startPoint: { x: 900, y: 0 },
    endPoint: { x: 900, y: 600 },
    nextSide: null,
  };

  const mockBottom = {
    name: "bottom",
    length: 900,
    startPoint: { x: 900, y: 600 },
    endPoint: { x: 0, y: 600 },
    nextSide: null,
  };

  const mockLeft = {
    name: "left",
    length: 600,
    startPoint: { x: 0, y: 600 },
    endPoint: { x: 0, y: 0 },
    nextSide: null,
  };

  // Link the sides
  mockTop.nextSide = mockRight;
  mockRight.nextSide = mockBottom;
  mockBottom.nextSide = mockLeft;
  mockLeft.nextSide = mockTop;

  const mockSides = [mockTop, mockRight, mockBottom, mockLeft];

  return {
    createBorderSides: vi.fn().mockReturnValue(mockSides),
    getTotalPerimeter: vi.fn().mockReturnValue(3000), // 900 + 600 + 900 + 600
    getSideByName: vi.fn((sides, name) =>
      mockSides.find((side) => side.name === name),
    ),
    getPointOnSide: vi.fn(),
  };
});

vi.mock("../../../utils/borderUtils/calculatePlayerBorderSegments", () => ({
  calculatePlayerBorderSegments: vi
    .fn()
    .mockImplementation((sides, players, offset = 0) => {
      return players.map((player) => ({
        playerId: player.id,
        playerName: player.name,
        playerColor: player.color,
        segments: [
          {
            side: sides[0],
            startPosition: offset % 900,
            length: 300,
          },
        ],
      }));
    }),
}));

vi.mock("../../../utils/positionUtils/calculatePlayerNamePositions", () => ({
  calculatePlayerNamePositions: vi.fn().mockImplementation((playerSegments) => {
    return playerSegments.map((segment) => ({
      playerId: segment.playerId,
      playerName: segment.playerName,
      playerColor: segment.playerColor,
      position: { x: 100, y: -30 },
    }));
  }),
}));

describe("GameArea", () => {
  const mockPlayers = [
    {
      id: "1",
      name: "Player 1",
      color: "#FF0000",
      health: 100,
      isAlive: true,
    },
    {
      id: "2",
      name: "Player 2",
      color: "#00FF00",
      health: 100,
      isAlive: true,
    },
  ];

  const mockWidth = 900;
  const mockHeight = 600;

  beforeEach(() => {
    vi.clearAllMocks();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCanvasContext);
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

  it("sets up animation with requestAnimationFrame", () => {
    // Mock requestAnimationFrame
    const mockRequestAnimationFrame = vi.fn().mockReturnValue(123);
    global.requestAnimationFrame = mockRequestAnimationFrame;
    global.cancelAnimationFrame = vi.fn();

    renderWithStore(<GameArea animationSpeed={5} />, mockPlayers);

    // Verify that requestAnimationFrame was called at least once to set up animation
    expect(mockRequestAnimationFrame).toHaveBeenCalled();

    // Cleanup
    vi.restoreAllMocks();
  });
});
