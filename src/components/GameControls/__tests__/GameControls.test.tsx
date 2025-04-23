// src/components/GameControls/__tests__/GameControls.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import GameControls from "../GameControls";
import { resetGame } from "../../../store/slices/gameStateSlice/gameStateSlice";
import { resetPlayersHealth } from "../../../store/slices/playerSlice/playerSlice";
import { resetLogoPosition } from "../../../store/slices/logoSlice/logoSlice";

// Mock the Redux store
const mockStore = configureStore([]);

describe("GameControls Component", () => {
  it("should dispatch resetGame, resetPlayersHealth, and resetLogoPosition on reset button click", () => {
    // Initial state for the mock store (can be minimal for this test)
    const initialState = {
      gameState: { status: "idle" }, // Status can be anything that shows the reset button
      players: { players: [] },
      logo: { position: { x: 0, y: 0 }, initialPosition: { x: 0, y: 0 } }, // Add necessary parts of logo state
    };
    const store = mockStore(initialState);

    // Mock dispatch
    store.dispatch = vi.fn();

    render(
      <Provider store={store}>
        <GameControls />
      </Provider>,
    );

    // Find the reset button
    const resetButton = screen.getByTestId("reset-button");

    // Simulate a click
    fireEvent.click(resetButton);

    // Check if the correct actions were dispatched
    expect(store.dispatch).toHaveBeenCalledWith(resetGame());
    expect(store.dispatch).toHaveBeenCalledWith(resetPlayersHealth());
    expect(store.dispatch).toHaveBeenCalledWith(resetLogoPosition());

    // Verify the number of dispatches if needed
    expect(store.dispatch).toHaveBeenCalledTimes(3);
  });

  // Add other tests for Start, Pause, Resume buttons as needed
});
