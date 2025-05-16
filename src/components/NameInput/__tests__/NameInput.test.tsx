import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NameInput from "../NameInput";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import playerReducer, { addPlayer } from "../../../store/slices/playerSlice/playerSlice";
import gameStateReducer from "../../../store/slices/gameStateSlice/gameStateSlice";
import settingsReducer from "../../../store/slices/settingsSlice/settingsSlice";
import type { RedistributionMode } from "../../../store/slices/settingsSlice/types";

describe("NameInput", () => {
  let mockStore: ReturnType<typeof configureStore>;
  const initialPlayerHealth = 3;

  beforeEach(() => {
    mockStore = configureStore({
      reducer: {
        players: playerReducer,
        gameState: gameStateReducer,
        settings: settingsReducer,
      },
      preloadedState: {
        settings: {
          playerHealth: initialPlayerHealth,
          angleVariance: 0,
          logoSpeed: 5,
          customLogo: null,
          redistributionMode: "adjacent" as RedistributionMode,
        },
        players: {
          players: [],
          eliminatedPlayers: [],
          nextPlayerId: 0,
          playerColors: {},
        },
        gameState: {
          isGameRunning: false,
          isPaused: false,
          winner: null,
          status: "initial",
        },
      },
    });
    vi.spyOn(mockStore, 'dispatch');
  });

  it("should render input field for player name", () => {
    render(
      <Provider store={mockStore}>
        <NameInput />
      </Provider>,
    );

    expect(
      screen.getByPlaceholderText("Enter player name..."),
    ).toBeInTheDocument();
  });

  it("should render add player button", () => {
    render(
      <Provider store={mockStore}>
        <NameInput />
      </Provider>,
    );

    expect(screen.getByText("Add Player")).toBeInTheDocument();
  });

  it("should add player with initial health when button is clicked", () => {
    render(
      <Provider store={mockStore}>
        <NameInput />
      </Provider>,
    );

    const input = screen.getByPlaceholderText("Enter player name...");
    fireEvent.change(input, { target: { value: "Test Player" } });

    const button = screen.getByText("Add Player");
    fireEvent.click(button);

    // Check if addPlayer action was dispatched with correct payload
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      addPlayer({ name: "Test Player", initialHealth: initialPlayerHealth }),
    );
  });

  it("should display player colors", () => {
    mockStore.dispatch(addPlayer({ name: "Color Test", initialHealth: initialPlayerHealth }));

    render(
      <Provider store={mockStore}>
        <NameInput />
      </Provider>,
    );

    const colorIndicator = screen.getByTestId("color-indicator-0");
    expect(colorIndicator).toBeInTheDocument();
  });

  it("should allow removing a player", async () => {
    mockStore.dispatch(addPlayer({ name: "Remove Test", initialHealth: initialPlayerHealth }));

    const { rerender } = render(
      <Provider store={mockStore}>
        <NameInput />
      </Provider>,
    );

    expect(screen.getByTestId("remove-player-0")).toBeInTheDocument();

    const removeButton = screen.getByTestId("remove-player-0");
    fireEvent.click(removeButton);

    rerender(
      <Provider store={mockStore}>
        <NameInput />
      </Provider>,
    );

    expect(screen.queryByTestId("remove-player-0")).not.toBeInTheDocument();
    expect(screen.queryByText("Remove Test")).not.toBeInTheDocument();
  });
});
