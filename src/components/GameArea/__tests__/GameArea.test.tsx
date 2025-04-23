import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import GameArea from "../GameArea";
import playerReducer from "../../../store/slices/playerSlice/playerSlice";
import logoReducer from "../../../store/slices/logoSlice/logoSlice";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the PlayerNameBox component
vi.mock("../../PlayerNameBox/PlayerNameBox", () => ({
  default: ({ name, color, position, hp }: any) => (
    <div data-testid="player-name-box">
      {name} - {color} - ({position.x}, {position.y}) - HP: {hp}
    </div>
  ),
}));

// Define the mock context structure outside beforeEach so it persists
const mockCtx = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillRect: vi.fn(),
};

// Mock requestAnimationFrame and cancelAnimationFrame, and setup canvas mock
beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", vi.fn());
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  // Reset mocks before each test
  vi.clearAllMocks();
  // Mock getContext to return the persistent mock object
  HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx);
});

// Helper function to render GameArea with Redux Provider
const renderGameArea = (initialState = {}) => {
  const store = configureStore({
    reducer: {
      players: playerReducer,
      logo: logoReducer,
    },
    preloadedState: {
      players: {
        players: [
          {
            id: "1",
            name: "Player 1",
            health: 100,
            color: "#ff0000",
            borderShare: 0.5,
          },
          {
            id: "2",
            name: "Player 2",
            health: 100,
            color: "#0000ff",
            borderShare: 0.5,
          },
        ],
      },
      logo: {
        position: { x: 450, y: 300 },
        velocity: { x: 1, y: 1 },
        size: { width: 50, height: 30 },
        imageUrl: null,
        angle: 45,
        speed: Math.sqrt(2),
      },
      ...initialState,
    },
  });

  return render(
    <Provider store={store}>
      <GameArea width={900} height={600} />
    </Provider>,
  );
};

describe("GameArea", () => {
  it("renders game area with correct aspect ratio", () => {
    renderGameArea();
    const gameArea = screen.getByTestId("game-area");
    expect(gameArea).toBeInTheDocument();
    const container = gameArea.parentElement;
    expect(container).toHaveStyle("aspectRatio: 1.5");
    expect(container).toHaveStyle("maxWidth: 900px");
  });

  it("canvas is rendered", () => {
    renderGameArea();
    const canvas = screen.getByTestId("game-canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute("width", "900");
    expect(canvas).toHaveAttribute("height", "600");
  });

  it("draws player border segments and logo on canvas", async () => {
    renderGameArea();

    // Wait for the drawing calls within useEffect
    await waitFor(() => {
      // Assertions directly on the persistent mock context object
      expect(mockCtx.clearRect).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();

      // Check the arguments of the first call to clearRect directly
      expect(mockCtx.clearRect.mock.calls.length).toBeGreaterThan(0); // Ensure it was called
      const clearRectArgs = mockCtx.clearRect.mock.calls[0];
      expect(clearRectArgs).toEqual([0, 0, 900, 600]);
    });
  });

  it("has visible boundaries", () => {
    renderGameArea();
    const gameArea = screen.getByTestId("game-area");
    expect(gameArea).toHaveStyle("border: 2px solid #1a1a1a");
  });

  it("sets up a container with correct aspect ratio", () => {
    renderGameArea();
    const container = screen.getByTestId("game-area").parentElement;
    expect(container).toHaveStyle("aspectRatio: 1.5");
    expect(container).toHaveStyle("maxWidth: 900px");
  });

  it("fills its container dimensions", () => {
    renderGameArea();
    const gameArea = screen.getByTestId("game-area");
    expect(gameArea).toHaveClass("w-full h-full");
  });

  it("renders canvas element with correct dimensions", () => {
    renderGameArea();
    const canvas = screen.getByTestId("game-canvas");
    expect(canvas).toHaveAttribute("width", "900");
    expect(canvas).toHaveAttribute("height", "600");
  });

  it("sets up animation with requestAnimationFrame", () => {
    renderGameArea();
    expect(requestAnimationFrame).toHaveBeenCalled();
  });

  it("renders PlayerNameBox components", () => {
    renderGameArea();
    const nameBoxes = screen.getAllByTestId("player-name-box");
    expect(nameBoxes.length).toBe(2);
    expect(nameBoxes[0]).toHaveTextContent("Player 1");
    expect(nameBoxes[1]).toHaveTextContent("Player 2");
  });
});
