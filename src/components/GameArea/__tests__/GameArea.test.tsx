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
      {name} - {color} - ({position?.x ?? 0}, {position?.y ?? 0}) - HP: {hp}
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
  fill: vi.fn(), // Add the missing fill mock
  save: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  restore: vi.fn(),
  ellipse: vi.fn(),
  canvas: { width: 900, height: 600 },
};

// Mock requestAnimationFrame and cancelAnimationFrame for controlling animation loop
let frameId = 0;
const frameCallbacks: Map<number, FrameRequestCallback> = new Map();
let lastTimestamp = 0;

vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
  const id = ++frameId;
  frameCallbacks.set(id, callback);
  return id;
});

vi.stubGlobal("cancelAnimationFrame", (id: number) => {
  frameCallbacks.delete(id);
});

// Helper to advance animation frames
const advanceFrames = async (count: number, timeIncrement = 16) => {
  for (let i = 0; i < count; i++) {
    lastTimestamp += timeIncrement;
    const callbacksToRun = Array.from(frameCallbacks.values());
    callbacksToRun.forEach((cb) => {
      try {
        cb(lastTimestamp);
      } catch (e) {
        console.error("Error in mocked RAF callback:", e);
      }
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};

// Spy instance variable
let rafSpy: SpyInstance;
let cafSpy: SpyInstance;

beforeEach(() => {
  frameId = 0;
  lastTimestamp = 0;
  frameCallbacks.clear();
  vi.clearAllMocks();
  HTMLCanvasElement.prototype.getContext = vi.fn((contextId) => {
    if (contextId === "2d") {
      return mockCtx as unknown as CanvasRenderingContext2D;
    }
    return null;
  });
  rafSpy?.mockRestore();
  cafSpy?.mockRestore();

  rafSpy = vi.spyOn(window, "requestAnimationFrame");
  cafSpy = vi.spyOn(window, "cancelAnimationFrame");
});

afterEach(() => {
  rafSpy.mockRestore();
  cafSpy.mockRestore();
  vi.unstubAllGlobals();
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
      logo: {
        position: { x: 450, y: 300 },
        velocity: { x: 5, y: 5 },
        size: { width: 50, height: 30 },
        imageUrl: null,
        angle: 45,
        speed: Math.sqrt(5 * 5 + 5 * 5),
        ...(initialState.logo || {}),
      },
      gameState: {
        status: "running",
        ...(initialState.gameState || {}),
      },
      settings: {
        angleVariance: 10,
        playerHealth: 3,
        customLogo: null,
        ...(initialState.settings || {}),
      },
    },
  });

  const dispatchSpy = vi.spyOn(store, "dispatch");

  const utils = render(
    <Provider store={store}>
      <GameArea width={900} height={600} />
    </Provider>,
  );

  return { ...utils, store, dispatchSpy };
};

describe("GameArea Collision Detection with Angle Variance", () => {
  let mathRandomSpy: SpyInstance;

  beforeEach(() => {
    mathRandomSpy = vi.spyOn(Math, "random").mockReturnValue(0.75);
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  it("should dispatch setLogoVelocity with varied angle after top border collision", async () => {
    const initialVelocity = { x: 1, y: -5 };
    const logoSize = { width: 50, height: 30 };
    const angleVariance = 20;
    const { store, dispatchSpy } = renderGameArea({
      logo: {
        position: { x: 450, y: logoSize.height / 2 + 1 },
        velocity: initialVelocity,
        size: logoSize,
        speed: Math.sqrt(
          initialVelocity.x * initialVelocity.x +
            initialVelocity.y * initialVelocity.y,
        ),
      },
      settings: { angleVariance },
      gameState: { status: "running" },
    });

    await advanceFrames(1);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: setLogoPosition.type }),
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: setLogoVelocity.type }),
      );
    });

    const setVelocityAction = dispatchSpy.mock.calls.find(
      (call) => call[0].type === setLogoVelocity.type,
    );
    expect(setVelocityAction).toBeDefined();

    const reflectedVx = initialVelocity.x;
    const reflectedVy = -initialVelocity.y;

    const deviationDegrees = (0.75 - 0.5) * angleVariance; // 0.25 * 20 = 5 degrees
    const deviationRadians = deviationDegrees * (Math.PI / 180);

    const cosTheta = Math.cos(deviationRadians);
    const sinTheta = Math.sin(deviationRadians);

    const finalVx = reflectedVx * cosTheta - reflectedVy * sinTheta; // 1*cos(5) - 5*sin(5)
    const finalVy = reflectedVx * sinTheta + reflectedVy * cosTheta; // 1*sin(5) + 5*cos(5)

    expect(setVelocityAction[0].payload.x).toBeCloseTo(finalVx);
    expect(setVelocityAction[0].payload.y).toBeCloseTo(finalVy);
  });

  it("should dispatch setLogoVelocity with varied angle after left border collision", async () => {
    const initialVelocity = { x: -5, y: 1 };
    const logoSize = { width: 50, height: 30 };
    const angleVariance = 30;
    const { store, dispatchSpy } = renderGameArea({
      logo: {
        position: { x: logoSize.width / 2 + 1, y: 300 },
        velocity: initialVelocity,
        size: logoSize,
        speed: Math.sqrt(
          initialVelocity.x * initialVelocity.x +
            initialVelocity.y * initialVelocity.y,
        ),
      },
      settings: { angleVariance },
      gameState: { status: "running" },
    });

    await advanceFrames(1);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: setLogoPosition.type }),
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: setLogoVelocity.type }),
      );
    });

    const setVelocityAction = dispatchSpy.mock.calls.find(
      (call) => call[0].type === setLogoVelocity.type,
    );
    expect(setVelocityAction).toBeDefined();

    const reflectedVx = -initialVelocity.x;
    const reflectedVy = initialVelocity.y;

    const deviationDegrees = (0.75 - 0.5) * angleVariance; // 7.5 degrees
    const deviationRadians = deviationDegrees * (Math.PI / 180);
    const cosTheta = Math.cos(deviationRadians);
    const sinTheta = Math.sin(deviationRadians);

    const finalVx = reflectedVx * cosTheta - reflectedVy * sinTheta; // 5*cos(7.5) - 1*sin(7.5)
    const finalVy = reflectedVx * sinTheta + reflectedVy * cosTheta; // 5*sin(7.5) + 1*cos(7.5)

    expect(setVelocityAction[0].payload.x).toBeCloseTo(finalVx);
    expect(setVelocityAction[0].payload.y).toBeCloseTo(finalVy);
  });

  it("should dispatch setLogoVelocity with only reversed velocity if angleVariance is 0", async () => {
    const initialVelocity = { x: 1, y: -5 };
    const logoSize = { width: 50, height: 30 };
    const { store, dispatchSpy } = renderGameArea({
      logo: {
        position: { x: 450, y: logoSize.height / 2 + 1 },
        velocity: initialVelocity,
        size: logoSize,
      },
      settings: { angleVariance: 0 },
      gameState: { status: "running" },
    });

    await advanceFrames(1);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: setLogoPosition.type }),
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: setLogoVelocity.type }),
      );
    });

    const setVelocityAction = dispatchSpy.mock.calls.find(
      (call) => call[0].type === setLogoVelocity.type,
    );
    expect(setVelocityAction).toBeDefined();
    expect(setVelocityAction[0].payload.x).toBeCloseTo(initialVelocity.x);
    expect(setVelocityAction[0].payload.y).toBeCloseTo(-initialVelocity.y);
  });

  it("should dispatch decrementPlayerHealth for player p1 when hitting right border segment", async () => {
    const logoSize = { width: 50, height: 30 };
    const gameWidth = 900;
    const { store, dispatchSpy } = renderGameArea({
      logo: {
        position: { x: gameWidth - logoSize.width / 2 - 1, y: 300 },
        velocity: { x: 5, y: 1 },
        size: logoSize,
      },
      settings: { angleVariance: 0 },
      gameState: { status: "running" },
    });

    await advanceFrames(1);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: setLogoVelocity.type,
          payload: expect.objectContaining({ x: -5 }),
        }),
      );
      expect(dispatchSpy).toHaveBeenCalledWith(decrementPlayerHealth("p1"));
    });
  });

  it("should pause game when only one player remains", async () => {
    const { store, dispatchSpy } = renderGameArea({
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
          },
        ],
      },
      gameState: { status: "running" },
    });

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(pauseGame());
    });

    expect(store.getState().gameState.status).toBe("paused");
  });
});

describe("GameArea Rendering and Setup", () => {
  it("renders game area with correct aspect ratio", () => {
    renderGameArea();
    const gameArea = screen.getByTestId("game-area");
    expect(gameArea).toBeInTheDocument();
    const container = gameArea.parentElement;
    expect(container).toHaveStyle("aspectRatio: 1.5");
    expect(container).toHaveClass("w-full"); // Check for Tailwind class instead of inline style
    expect(container).toHaveClass("relative"); // Also check for relative positioning class
  });

  it("canvas is rendered with correct width and height attributes", () => {
    renderGameArea();
    const canvas = screen.getByTestId("game-canvas") as HTMLCanvasElement;
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute("width", "900");
    expect(canvas).toHaveAttribute("height", "600");
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith("2d");
  });

  it("draws player border segments and logo on canvas when running", async () => {
    renderGameArea({ gameState: { status: "running" } });

    await advanceFrames(1);

    await waitFor(() => {
      expect(mockCtx.clearRect).toHaveBeenCalled();
      expect(
        mockCtx.fillRect.mock.calls.length > 0 ||
          mockCtx.stroke.mock.calls.length > 0,
      ).toBe(true);
    });
  });

  it("has visible boundaries (via style or class)", () => {
    renderGameArea();
    const gameArea = screen.getByTestId("game-area");
    expect(gameArea).toHaveStyle("border: 2px solid #1a1a1a");
  });

  it("sets up animation with requestAnimationFrame when game is running", async () => {
    renderGameArea({ gameState: { status: "running" } });
    await waitFor(() => {
      expect(rafSpy).toHaveBeenCalled();
    });
    expect(cafSpy).not.toHaveBeenCalled();
  });

  it("does NOT set up animation with requestAnimationFrame when game is idle", async () => {
    renderGameArea({ gameState: { status: "idle" } });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(rafSpy).not.toHaveBeenCalled();
  });

  it("does NOT set up animation with requestAnimationFrame when game is paused", async () => {
    renderGameArea({ gameState: { status: "paused" } });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(rafSpy).not.toHaveBeenCalled();
  });

  it("cancels animation frame when game status changes from running to paused", async () => {
    const { store, rerender } = renderGameArea({
      gameState: { status: "running" },
    });

    await waitFor(() => {
      expect(rafSpy).toHaveBeenCalledTimes(1);
    });
    const initialRafCallCount = rafSpy.mock.calls.length;
    const initialCafCallCount = cafSpy.mock.calls.length;

    store.dispatch(pauseGame());

    rerender(
      <Provider store={store}>
        <GameArea width={900} height={600} />
      </Provider>,
    );

    await waitFor(() => {
      expect(cafSpy.mock.calls.length).toBeGreaterThan(initialCafCallCount);
    });

    await advanceFrames(2);
    expect(rafSpy.mock.calls.length).toBe(initialRafCallCount);
  });

  it("renders PlayerNameBox components for non-eliminated players", () => {
    renderGameArea({
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
            health: 0,
            color: "#0000ff",
            sectionStart: 1500,
            sectionLength: 1500,
            isEliminated: true,
          },
          {
            id: "p3",
            name: "Player 3",
            health: 2,
            color: "#00ff00",
            sectionStart: 0,
            sectionLength: 1000,
            isEliminated: false,
          },
        ],
      },
    });
    const nameBoxes = screen.getAllByTestId("player-name-box");
    expect(nameBoxes.length).toBe(2);
    expect(nameBoxes[0]).toHaveTextContent("Player 1");
    expect(nameBoxes[1]).toHaveTextContent("Player 3");
    expect(screen.queryByText(/Player 2/)).not.toBeInTheDocument();
  });
});
