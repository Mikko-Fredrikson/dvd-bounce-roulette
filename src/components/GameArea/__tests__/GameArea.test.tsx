import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GameArea from "../GameArea";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "../../../store/slices/playerSlice/playerSlice";

// Mock animation frame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(() => callback(Date.now()), 0);
});
global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});

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
  it("renders game area element", () => {
    renderWithStore(<GameArea />);
    const gameArea = screen.getByTestId("game-area");
    expect(gameArea).toBeInTheDocument();
  });

  it("has visible boundaries", () => {
    renderWithStore(<GameArea />);
    const container = screen.getByTestId("game-area");

    // Check that the container has a border
    const styles = window.getComputedStyle(container);
    expect(styles.border).not.toBe("none");
  });

  it("sets up a container with correct aspect ratio", () => {
    const width = 900;
    const height = 600;
    const aspectRatio = width / height;

    renderWithStore(<GameArea width={width} height={height} />);
    const container = screen.getByTestId("game-area").parentElement;

    // Check that the aspect ratio is set correctly
    expect(container).not.toBeNull();
    if (container) {
      expect(container.style.aspectRatio).toBe(aspectRatio.toString());
      expect(container.style.maxWidth).toBe(`${width}px`);
    }
  });

  it("fills its container dimensions", () => {
    renderWithStore(<GameArea />);
    const gameArea = screen.getByTestId("game-area");

    expect(gameArea.className).toContain("w-full");
    expect(gameArea.className).toContain("h-full");
  });

  it("renders player name boxes when players exist", () => {
    const mockPlayers = [
      {
        id: "1",
        name: "Player 1",
        color: "#FF0000",
        sectionStart: 0,
        sectionLength: 500,
      },
      {
        id: "2",
        name: "Player 2",
        color: "#00FF00",
        sectionStart: 500,
        sectionLength: 500,
      },
    ];

    renderWithStore(<GameArea />, mockPlayers);

    // Check that player name boxes are rendered
    expect(screen.getByText("Player 1")).toBeInTheDocument();
    expect(screen.getByText("Player 2")).toBeInTheDocument();
  });

  it("renders canvas element with correct dimensions", () => {
    const width = 900;
    const height = 600;

    renderWithStore(<GameArea width={width} height={height} />);

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
