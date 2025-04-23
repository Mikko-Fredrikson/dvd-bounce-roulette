import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import GameArea from "../GameArea";
import playerReducer from "../../../store/slices/playerSlice/playerSlice";
import logoReducer, {
  reverseVelocityX,
  reverseVelocityY,
} from "../../../store/slices/logoSlice/logoSlice";
import gameStateReducer from "../../../store/slices/gameStateSlice/gameStateSlice";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  Mock,
  SpyInstance,
} from "vitest";
import { RootState } from "../../../store"; // Import RootState

// Mock the PlayerNameBox component
vi.mock("../../PlayerNameBox/PlayerNameBox", () => ({
  default: ({ name, color, position, hp }: any) => (
    <div data-testid="player-name-box">
      {name} - {color} - ({position.x}, {position.y}) - HP: {hp}
    </div>
  ),
}));

const mockCtx = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillRect: vi.fn(),
};

// Mock requestAnimationFrame and cancelAnimationFrame for controlling animation loop
let frameId = 0;
const frameCallbacks: Map<number, FrameRequestCallback> = new Map();

vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
  const id = ++frameId;
  frameCallbacks.set(id, callback);
  return id;
});

vi.stubGlobal("cancelAnimationFrame", (id: number) => {
  frameCallbacks.delete(id);
});

// Helper to advance animation frames
const advanceFrames = (count: number) => {
  for (let i = 0; i < count; i++) {
    const callbacksToRun = Array.from(frameCallbacks.entries());
    frameCallbacks.clear(); // Clear before running to handle cancellations within callbacks
    callbacksToRun.forEach(([id, cb]) => {
      cb(performance.now());
    });
  }
};

// Spy instance variable
let rafSpy: SpyInstance;

beforeEach(() => {
  frameId = 0;
  frameCallbacks.clear();
  vi.clearAllMocks();
  HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx);
  // Restore any potentially spied-on global functions before re-spying
  if (rafSpy) {
    rafSpy.mockRestore();
  }
  // Spy on the *original* window.requestAnimationFrame for the specific test that needs it
  rafSpy = vi.spyOn(window, "requestAnimationFrame");
});

// Helper function to render GameArea with Redux Provider
const renderGameArea = (initialState: Partial<RootState> = {}) => {
  const store = configureStore({
    reducer: {
      players: playerReducer,
      logo: logoReducer,
      gameState: gameStateReducer,
    },
    preloadedState: {
      players: {
        players: [
          {
            id: "1",
            name: "Player 1",
            health: 3,
            color: "#ff0000",
            sectionStart: 0,
            sectionLength: 1500,
          },
          {
            id: "2",
            name: "Player 2",
            health: 3,
            color: "#0000ff",
            sectionStart: 1500,
            sectionLength: 1500,
          },
        ],
      },
      logo: {
        position: { x: 450, y: 300 },
        velocity: { x: 5, y: 5 },
        size: { width: 50, height: 30 },
        imageUrl: null,
        angle: 45,
        speed: Math.sqrt(50),
      },
      gameState: {
        status: "running",
      },
      ...initialState,
      logo: {
        ...(initialState.logo || {
          position: { x: 450, y: 300 },
          velocity: { x: 5, y: 5 },
          size: { width: 50, height: 30 },
          imageUrl: null,
          angle: 45,
          speed: Math.sqrt(50),
        }),
      },
      gameState: {
        ...(initialState.gameState || { status: "running" }),
      },
      players: {
        players: initialState.players?.players || [
          {
            id: "1",
            name: "Player 1",
            health: 3,
            color: "#ff0000",
            sectionStart: 0,
            sectionLength: 1500,
          },
          {
            id: "2",
            name: "Player 2",
            health: 3,
            color: "#0000ff",
            sectionStart: 1500,
            sectionLength: 1500,
          },
        ],
      },
    },
  });

  // Spy on store.dispatch
  vi.spyOn(store, "dispatch");

  const utils = render(
    <Provider store={store}>
      <GameArea width={900} height={600} />
    </Provider>,
  );

  return { ...utils, store };
};

describe("GameArea Collision Detection", () => {
  it("should reverse Y velocity when hitting the top border", async () => {
    const { store } = renderGameArea({
      logo: {
        position: { x: 450, y: 10 },
        velocity: { x: 1, y: -5 },
        size: { width: 50, height: 30 },
        imageUrl: null,
        angle: -78.69,
        speed: Math.sqrt(26),
      },
    });

    advanceFrames(1);

    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(reverseVelocityY());
    });
  });

  it("should reverse Y velocity when hitting the bottom border", async () => {
    const { store } = renderGameArea({
      logo: {
        position: { x: 450, y: 590 },
        velocity: { x: 1, y: 5 },
        size: { width: 50, height: 30 },
        imageUrl: null,
        angle: 78.69,
        speed: Math.sqrt(26),
      },
    });

    advanceFrames(1);

    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(reverseVelocityY());
    });
  });

  it("should reverse X velocity when hitting the left border", async () => {
    const { store } = renderGameArea({
      logo: {
        position: { x: 10, y: 300 },
        velocity: { x: -5, y: 1 },
        size: { width: 50, height: 30 },
        imageUrl: null,
        angle: 168.69,
        speed: Math.sqrt(26),
      },
    });

    advanceFrames(1);

    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(reverseVelocityX());
    });
  });

  it("should reverse X velocity when hitting the right border", async () => {
    const { store } = renderGameArea({
      logo: {
        position: { x: 890, y: 300 },
        velocity: { x: 5, y: 1 },
        size: { width: 50, height: 30 },
        imageUrl: null,
        angle: 11.31,
        speed: Math.sqrt(26),
      },
    });

    advanceFrames(1);

    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(reverseVelocityX());
    });
  });
});

describe("GameArea Rendering and Setup", () => {
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

  it("draws player border segments and logo on canvas when running", async () => {
    renderGameArea({ gameState: { status: "running" } });

    await waitFor(() => {
      expect(mockCtx.clearRect).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
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

  it("sets up animation with requestAnimationFrame when game is running", () => {
    renderGameArea({ gameState: { status: "running" } });
    waitFor(() => {
      expect(rafSpy).toHaveBeenCalled();
    });
  });

  it("does NOT set up animation with requestAnimationFrame when game is idle", () => {
    renderGameArea({ gameState: { status: "idle" } });
    waitFor(() => {
      expect(rafSpy).not.toHaveBeenCalled();
    });
  });

  it("does NOT set up animation with requestAnimationFrame when game is paused", () => {
    renderGameArea({ gameState: { status: "paused" } });
    waitFor(() => {
      expect(rafSpy).not.toHaveBeenCalled();
    });
  });

  it("renders PlayerNameBox components", () => {
    renderGameArea();
    const nameBoxes = screen.getAllByTestId("player-name-box");
    expect(nameBoxes.length).toBe(2);
    expect(nameBoxes[0]).toHaveTextContent("Player 1");
    expect(nameBoxes[1]).toHaveTextContent("Player 2");
  });
});
