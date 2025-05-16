// src/components/GameControls/__tests__/GameControls.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import GameControls from "../GameControls";
import { resetGame } from "../../../store/slices/gameStateSlice/gameStateSlice";
import { resetPlayersHealth } from "../../../store/slices/playerSlice/playerSlice";
import { resetLogo } from "../../../store/slices/logoSlice/logoSlice"; // Import resetLogo instead of resetLogoPosition

// Mock the Redux store
const mockStore = configureStore([]);

describe("GameControls Component", () => {
  it("should dispatch resetGame, resetPlayersHealth, and resetLogo on reset button click", () => {
    // Updated test description
    // Initial state for the mock store
    const initialState = {
      gameState: { status: "idle" },
      players: { players: [] },
      settings: { playerHealth: 5 }, // Add settings slice with playerHealth
      // Updated logo state to match the refactored slice
      logo: {
        position: { x: 0, y: 0 },
        direction: { dx: 1, dy: 0 }, // Use direction
        size: { width: 80, height: 50 },
        imageUrl: null,
      },
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
    expect(store.dispatch).toHaveBeenCalledWith(
      resetPlayersHealth(initialState.settings.playerHealth),
    ); // Pass playerHealth
    expect(store.dispatch).toHaveBeenCalledWith(resetLogo()); // Expect resetLogo

    // Verify the number of dispatches if needed
    expect(store.dispatch).toHaveBeenCalledTimes(3);
  });

  // Add other tests for Start, Pause, Resume buttons as needed
});
