import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GameArea from "../GameArea";

describe("GameArea", () => {
  it("renders game area element", () => {
    render(<GameArea />);
    const gameArea = screen.getByTestId("game-area");
    expect(gameArea).toBeInTheDocument();
  });

  it("has visible boundaries", () => {
    render(<GameArea />);
    const container = screen.getByTestId("game-area");

    // Check that the container has a border
    const styles = window.getComputedStyle(container);
    expect(styles.border).not.toBe("none");
  });

  it("sets up a container with correct aspect ratio", () => {
    const width = 900;
    const height = 600;
    const aspectRatio = width / height;

    render(<GameArea width={width} height={height} />);
    const container = screen.getByTestId("game-area").parentElement;

    // Check that the aspect ratio is set correctly
    expect(container).not.toBeNull();
    if (container) {
      expect(container.style.aspectRatio).toBe(aspectRatio.toString());
      expect(container.style.maxWidth).toBe(`${width}px`);
    }
  });

  it("fills its container dimensions", () => {
    render(<GameArea />);
    const gameArea = screen.getByTestId("game-area");

    expect(gameArea.className).toContain("w-full");
    expect(gameArea.className).toContain("h-full");
  });
});
