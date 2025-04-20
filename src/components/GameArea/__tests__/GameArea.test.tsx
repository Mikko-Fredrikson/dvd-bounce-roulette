import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import GameArea from "../GameArea";

// Create mock store for testing
const createMockStore = () => {
  return configureStore({
    reducer: {
      // We will add the actual reducers once we create them
    },
  });
};

describe("GameArea", () => {
  it("should render the game canvas", () => {
    render(
      <Provider store={createMockStore()}>
        <GameArea />
      </Provider>,
    );

    const canvasElement = screen.getByTestId("game-canvas");
    expect(canvasElement).toBeInTheDocument();
    expect(canvasElement.tagName.toLowerCase()).toBe("canvas");
  });

  it("should have appropriate dimensions", () => {
    render(
      <Provider store={createMockStore()}>
        <GameArea />
      </Provider>,
    );

    const container = screen.getByTestId("game-area-container");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("w-full");
  });
});
