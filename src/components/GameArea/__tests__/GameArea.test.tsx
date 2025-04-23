import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import GameArea from "../GameArea";
import playerReducer, {
  decrementPlayerHealth,
} from "../../../store/slices/playerSlice/playerSlice";
import logoReducer, {
  setLogoPosition,
  setLogoVelocity,
} from "../../../store/slices/logoSlice/logoSlice";
import gameStateReducer, {
  pauseGame,
} from "../../../store/slices/gameStateSlice/gameStateSlice";
import settingsReducer from "../../../store/slices/settingsSlice/settingsSlice";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  Mock,
  SpyInstance,
  afterEach,
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
      settings: settingsReducer,
    },
    preloadedState: {
      players: {
        players: [
          {
            id: "p1", // Use consistent IDs
            name: "Player 1",
            health: 3,
            color: "#ff0000",
            sectionStart: 0,
            sectionLength: 1500,
            isEliminated: false,
          },
          {
            id: "p2", // Use consistent IDs
            name: "Player 2",
            health: 3,
            color: "#0000ff",
            sectionStart: 1500,
            sectionLength: 1500,
            isEliminated: false,
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
      settings: { angleVariance: 10, playerHealth: 3, customLogo: null },
      ...initialState,
      // Ensure deep merging for nested states
      logo: {
        position: { x: 450, y: 300 },
        velocity: { x: 5, y: 5 },
        size: { width: 50, height: 30 },
        imageUrl: null,
        angle: 45,
        speed: Math.sqrt(50),
        ...(initialState.logo || {}),
      },
      gameState: {
        status: "running",
        ...(initialState.gameState || {}),
      },
      players: {
        players: [
          {
            id: "p1",
            name: "Player 1",
            health: 3,
            color: "#ff0000",
            sectionStart: 0,
            sectionLength: 1500,
            isEliminated: false,
          },
          {
            id: "p2",
            name: "Player 2",
            health: 3,
            color: "#0000ff",
            sectionStart: 1500,
            sectionLength: 1500,
            isEliminated: false,
          },
        ],
        ...(initialState.players || {}),
      },
      settings: {
        angleVariance: 10,
        playerHealth: 3,
        customLogo: null,
        ...(initialState.settings || {}),
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

describe("GameArea Collision Detection with Angle Variance", () => {
  let mathRandomSpy: SpyInstance;

  beforeEach(() => {
    // Mock Math.random to return a predictable value (e.g., 0.75 for positive deviation)
    mathRandomSpy = vi.spyOn(Math, "random").mockReturnValue(0.75);
  });

  afterEach(() => {
    mathRandomSpy.mockRestore(); // Restore original Math.random
  });

  it("should dispatch setLogoVelocity with varied angle after top border collision", async () => {
    const initialVelocity = { x: 1, y: -5 };
    const angleVariance = 20; // degrees
    const { store } = renderGameArea({
      logo: {
        position: { x: 450, y: 10 }, // Near top border
        velocity: initialVelocity,
        size: { width: 50, height: 30 },
        imageUrl: null,
        angle: 0, // Angle/speed not directly used in test logic here
        speed: 0,
      },
      settings: { angleVariance, playerHealth: 3, customLogo: null },
    });

    advanceFrames(1);

    await waitFor(() => {
      // Check that setLogoPosition was called (always happens)
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: setLogoPosition.type }),
      );

      // Check that setLogoVelocity was called due to collision + variance
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: setLogoVelocity.type }),
      );

      // Verify the payload of setLogoVelocity
      const setVelocityAction = (store.dispatch as Mock).mock.calls.find(
        (call) => call[0].type === setLogoVelocity.type,
      );
      expect(setVelocityAction).toBeDefined();

      const expectedVy = Math.abs(initialVelocity.y); // Base reversed velocity
      const expectedVx = initialVelocity.x;
      // Calculate expected velocity after variance (0.75 -> positive deviation)
      // Deviation = (0.75 - 0.5) * 20 = 5 degrees = 0.087 radians
      const deviationRadians = 5 * (Math.PI / 180);
      const cosTheta = Math.cos(deviationRadians);
      const sinTheta = Math.sin(deviationRadians);
      const finalVx = expectedVx * cosTheta - expectedVy * sinTheta;
      const finalVy = expectedVx * sinTheta + expectedVy * cosTheta;

      expect(setVelocityAction[0].payload.x).toBeCloseTo(finalVx);
      expect(setVelocityAction[0].payload.y).toBeCloseTo(finalVy);
    });
  });

  it("should dispatch setLogoVelocity with varied angle after left border collision", async () => {
    const initialVelocity = { x: -5, y: 1 };
    const angleVariance = 30; // degrees
    const { store } = renderGameArea({
      logo: {
        position: { x: 10, y: 300 }, // Near left border
        velocity: initialVelocity,
        size: { width: 50, height: 30 },
        imageUrl: null,
        angle: 0,
        speed: 0,
      },
      settings: { angleVariance, playerHealth: 3, customLogo: null },
    });

    advanceFrames(1);

    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: setLogoPosition.type }),
      );
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: setLogoVelocity.type }),
      );

      const setVelocityAction = (store.dispatch as Mock).mock.calls.find(
        (call) => call[0].type === setLogoVelocity.type,
      );
      expect(setVelocityAction).toBeDefined();

      const expectedVx = Math.abs(initialVelocity.x); // Base reversed velocity
      const expectedVy = initialVelocity.y;
      // Calculate expected velocity after variance (0.75 -> positive deviation)
      // Deviation = (0.75 - 0.5) * 30 = 7.5 degrees = 0.131 radians
      const deviationRadians = 7.5 * (Math.PI / 180);
      const cosTheta = Math.cos(deviationRadians);
      const sinTheta = Math.sin(deviationRadians);
      const finalVx = expectedVx * cosTheta - expectedVy * sinTheta;
      const finalVy = expectedVx * sinTheta + expectedVy * cosTheta;

      expect(setVelocityAction[0].payload.x).toBeCloseTo(finalVx);
      expect(setVelocityAction[0].payload.y).toBeCloseTo(finalVy);
    });
  });

  it("should dispatch setLogoVelocity with only reversed velocity if angleVariance is 0", async () => {
    const initialVelocity = { x: 1, y: -5 };
    const { store } = renderGameArea({
      logo: {
        position: { x: 450, y: 10 }, // Near top border
        velocity: initialVelocity,
        size: { width: 50, height: 30 },
      },
      settings: { angleVariance: 0 }, // Variance is zero
    });

    advanceFrames(1);

    await waitFor(() => {
      // Position should still update
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: setLogoPosition.type }),
      );

      // Velocity should be updated with the reversed value
      const setVelocityAction = (store.dispatch as Mock).mock.calls.find(
        (call) => call[0].type === setLogoVelocity.type,
      );
      expect(setVelocityAction).toBeDefined();
      expect(setVelocityAction[0].payload.x).toBeCloseTo(initialVelocity.x); // X unchanged
      expect(setVelocityAction[0].payload.y).toBeCloseTo(-initialVelocity.y); // Y reversed
    });
  });

  it("should dispatch decrementPlayerHealth for player p1 when hitting right border segment", async () => {
    const { store } = renderGameArea({
      logo: {
        position: { x: 890, y: 300 }, // Near right border, middle height
        velocity: { x: 5, y: 1 },
        size: { width: 50, height: 30 },
      },
      settings: { angleVariance: 0 }, // No variance for simplicity
      // Default players: p1 owns 0-1500 (includes right border 900-1500)
    });

    advanceFrames(1);

    await waitFor(() => {
      // Check that decrementPlayerHealth was called for the correct player (p1)
      expect(store.dispatch).toHaveBeenCalledWith(decrementPlayerHealth("p1"));
    });
  });

  it("should pause game when only one player remains", async () => {
    const { store } = renderGameArea({
      players: {
        players: [
          {
            id: "p1",
            name: "P1",
            health: 1,
            color: "red",
            sectionStart: 0,
            sectionLength: 1500,
            isEliminated: false,
          },
          {
            id: "p2",
            name: "P2",
            health: 0,
            color: "blue",
            sectionStart: 1500,
            sectionLength: 1500,
            isEliminated: true,
          }, // P2 already eliminated
        ],
      },
      gameState: { status: "running" },
    });

    // No need to advance frames, the check happens in useEffect
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(pauseGame());
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
