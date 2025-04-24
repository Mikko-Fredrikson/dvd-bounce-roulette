import { render, screen, waitFor, act } from "@testing-library/react"; // Added act
import { Provider } from "react-redux";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import GameArea from "../GameArea";
import playerReducer, {
  decrementPlayerHealth,
} from "../../../store/slices/playerSlice/playerSlice";
import logoReducer, {
  setLogoPosition,
  setLogoDirection, // Updated import
} from "../../../store/slices/logoSlice/logoSlice";
import gameStateReducer, {
  pauseGame,
  finishGame, // Added finishGame import
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
  arc: vi.fn(), // <-- Add the missing arc mock
  save: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  restore: vi.fn(),
  ellipse: vi.fn(),
  canvas: { width: 900, height: 600 },
  // Add mocks for properties accessed in drawGameElements
  strokeStyle: "",
  lineWidth: 0,
  globalAlpha: 1,
  lineCap: "butt",
  drawImage: vi.fn(), // Add drawImage mock
};

// Mock requestAnimationFrame and cancelAnimationFrame for controlling animation loop (Synchronous version)
let rafCallbacks: Map<number, FrameRequestCallback> = new Map();
let rafIdCounter = 0;

vi.stubGlobal(
  "requestAnimationFrame",
  (callback: FrameRequestCallback): number => {
    const id = ++rafIdCounter;
    rafCallbacks.set(id, callback);
    return id;
  },
);

vi.stubGlobal("cancelAnimationFrame", (id: number): void => {
  rafCallbacks.delete(id);
});

// Helper to advance animation frames synchronously
const advanceFrames = (count: number, timeIncrement = 16.66) => {
  let currentTime = performance.now();
  for (let i = 0; i < count; i++) {
    currentTime += timeIncrement;
    const callbacksToRun = Array.from(rafCallbacks.entries());
    rafCallbacks.clear(); // Clear before running callbacks, as they might request new frames
    callbacksToRun.forEach(([id, cb]) => {
      try {
        cb(currentTime);
      } catch (e) {
        console.error(`Error in mocked RAF callback (ID: ${id}):`, e);
      }
    });
  }
};

// Spy instance variable
let rafSpy: SpyInstance<[callback: FrameRequestCallback], number>;
let cafSpy: SpyInstance<[handle: number], void>;

beforeEach(() => {
  rafIdCounter = 0;
  rafCallbacks.clear();
  vi.clearAllMocks(); // Ensure mocks are cleared

  // Mock getContext before spying on RAF/CAF
  HTMLCanvasElement.prototype.getContext = vi.fn((contextId) => {
    if (contextId === "2d") {
      // Reset the existing mock context
      Object.values(mockCtx).forEach((mockFn) => {
        if (typeof mockFn === "function") mockFn.mockClear();
      });
      return mockCtx as unknown as CanvasRenderingContext2D;
    }
    return null;
  });

  // Restore spies if they exist from previous tests, then re-spy
  rafSpy?.mockRestore();
  cafSpy?.mockRestore();
  rafSpy = vi.spyOn(window, "requestAnimationFrame");
  cafSpy = vi.spyOn(window, "cancelAnimationFrame");
});

afterEach(() => {
  rafSpy.mockRestore();
  cafSpy.mockRestore();
  vi.unstubAllGlobals(); // Ensure globals are unstubbed
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
        direction: { dx: 0.832, dy: 0.555 }, // Use direction instead of velocity
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
        logoSpeed: 5, // ADDED default logoSpeed
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

  it("should dispatch setLogoDirection with varied angle after top border collision", () => {
    const initialDirection = { dx: 0, dy: -1 };
    const logoSize = { width: 50, height: 30 };
    const angleVariance = 20;
    const speed = 5;
    const { store, dispatchSpy } = renderGameArea({
      logo: {
        position: { x: 450, y: logoSize.height / 2 + 1 },
        direction: initialDirection,
        size: logoSize,
        speed: Math.sqrt(
          initialDirection.dx * initialDirection.dx +
            initialDirection.dy * initialDirection.dy,
        ),
      },
      settings: { angleVariance, logoSpeed: speed }, // Explicitly set logoSpeed
      gameState: { status: "running" },
    });

    act(() => {
      advanceFrames(1);
    });

    // Check if setLogoDirection was called
    const setDirectionAction = dispatchSpy.mock.calls.find(
      (call) => call[0].type === setLogoDirection.type,
    );
    expect(
      setDirectionAction,
      "setLogoDirection should have been called",
    ).toBeDefined();

    // Check if setLogoPosition was called
    const setPositionAction = dispatchSpy.mock.calls.find(
      (call) => call[0].type === setLogoPosition.type,
    );
    expect(
      setPositionAction,
      "setLogoPosition should have been called",
    ).toBeDefined();

    // Original check for setLogoDirection payload
    const reflectedDx = initialDirection.dx;
    const reflectedDy = -initialDirection.dy;

    const deviationDegrees = (0.75 - 0.5) * angleVariance; // 0.25 * 20 = 5 degrees
    const deviationRadians = deviationDegrees * (Math.PI / 180);

    const cosTheta = Math.cos(deviationRadians);
    const sinTheta = Math.sin(deviationRadians);

    const finalDx = reflectedDx * cosTheta - reflectedDy * sinTheta; // 0*cos(5) - 1*sin(5) -> -sin(5)
    const finalDy = reflectedDx * sinTheta + reflectedDy * cosTheta; // 0*sin(5) + 1*cos(5) -> cos(5)

    // Check the payload values
    expect(setDirectionAction[0].payload.dx).toBeCloseTo(finalDx);
    expect(setDirectionAction[0].payload.dy).toBeCloseTo(finalDy);
  });

  it("should dispatch setLogoDirection with varied angle after left border collision", () => {
    const initialDirection = { dx: -1, dy: 0 };
    const logoSize = { width: 50, height: 30 };
    const angleVariance = 30;
    const speed = 5;
    const { store, dispatchSpy } = renderGameArea({
      logo: {
        position: { x: logoSize.width / 2 + 1, y: 300 },
        direction: initialDirection,
        size: logoSize,
        speed: Math.sqrt(
          initialDirection.dx * initialDirection.dx +
            initialDirection.dy * initialDirection.dy,
        ),
      },
      settings: { angleVariance, logoSpeed: speed }, // Explicitly set logoSpeed
      gameState: { status: "running" },
    });

    act(() => {
      advanceFrames(1);
    });

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: setLogoPosition.type }),
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: setLogoDirection.type }),
    );

    const setDirectionAction = dispatchSpy.mock.calls.find(
      (call) => call[0].type === setLogoDirection.type,
    );
    expect(setDirectionAction).toBeDefined();

    const reflectedDx = -initialDirection.dx;
    const reflectedDy = initialDirection.dy;

    const deviationDegrees = (0.75 - 0.5) * angleVariance; // 7.5 degrees
    const deviationRadians = deviationDegrees * (Math.PI / 180);
    const cosTheta = Math.cos(deviationRadians);
    const sinTheta = Math.sin(deviationRadians);

    const finalDx = reflectedDx * cosTheta - reflectedDy * sinTheta; // 1*cos(7.5) - 0*sin(7.5)
    const finalDy = reflectedDx * sinTheta + reflectedDy * cosTheta; // 1*sin(7.5) + 0*cos(7.5)

    expect(setDirectionAction[0].payload.dx).toBeCloseTo(finalDx);
    expect(setDirectionAction[0].payload.dy).toBeCloseTo(finalDy);
  });

  it("should dispatch setLogoDirection with only reversed direction if angleVariance is 0", () => {
    const initialDirection = { dx: 0, dy: -1 };
    const logoSize = { width: 50, height: 30 };
    const speed = 5;
    const { store, dispatchSpy } = renderGameArea({
      logo: {
        position: { x: 450, y: logoSize.height / 2 + 1 },
        direction: initialDirection,
        size: logoSize,
      },
      settings: { angleVariance: 0, logoSpeed: speed }, // Explicitly set logoSpeed
      gameState: { status: "running" },
    });

    act(() => {
      advanceFrames(1);
    });

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: setLogoPosition.type }),
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: setLogoDirection.type }),
    );

    const setDirectionAction = dispatchSpy.mock.calls.find(
      (call) => call[0].type === setLogoDirection.type,
    );
    expect(setDirectionAction).toBeDefined();
    expect(setDirectionAction[0].payload.dx).toBeCloseTo(initialDirection.dx);
    expect(setDirectionAction[0].payload.dy).toBeCloseTo(-initialDirection.dy);
  });

  it("should dispatch decrementPlayerHealth for player p1 when hitting right border segment", () => {
    const logoSize = { width: 50, height: 30 };
    const gameWidth = 900;
    const { store, dispatchSpy } = renderGameArea({
      logo: {
        position: { x: gameWidth - logoSize.width / 2 - 1, y: 300 },
        direction: { dx: 1, dy: 0 },
        size: logoSize,
      },
      settings: { angleVariance: 0 },
      gameState: { status: "running" },
    });

    advanceFrames(1);

    waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: setLogoDirection.type,
          payload: expect.objectContaining({ dx: -1 }),
        }),
      );
      expect(dispatchSpy).toHaveBeenCalledWith(decrementPlayerHealth("p1"));
    });
  });

  it("should finish game when only one player remains", () => {
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

    advanceFrames(1);

    waitFor(() => {
      // Expect finishGame to be called, not pauseGame
      expect(dispatchSpy).toHaveBeenCalledWith(finishGame());
    });

    // Verify the final state is 'finished'
    expect(store.getState().gameState.status).toBe("finished");
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

  it("draws player border segments and logo on canvas when running", () => {
    renderGameArea({ gameState: { status: "running" } });

    advanceFrames(1);

    waitFor(() => {
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

  it("sets up animation with requestAnimationFrame when game is running", () => {
    renderGameArea({ gameState: { status: "running" } });
    waitFor(() => {
      expect(rafSpy).toHaveBeenCalled();
    });
    expect(cafSpy).not.toHaveBeenCalled();
  });

  it("does NOT set up animation with requestAnimationFrame when game is idle", () => {
    renderGameArea({ gameState: { status: "idle" } });
    new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(rafSpy).not.toHaveBeenCalled();
    });
  });

  it("does NOT set up animation with requestAnimationFrame when game is paused", () => {
    renderGameArea({ gameState: { status: "paused" } });
    new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      expect(rafSpy).not.toHaveBeenCalled();
    });
  });

  it("cancels animation frame when game status changes from running to paused", () => {
    const { store, rerender } = renderGameArea({
      gameState: { status: "running" },
    });

    waitFor(() => {
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

    advanceFrames(2);
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
