import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NameInput from "../NameInput";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "../../../store/slices/playerSlice/playerSlice";

describe("NameInput", () => {
  // Create a fresh store for each test
  let mockStore: ReturnType<typeof configureStore>;

  beforeEach(() => {
    mockStore = configureStore({
      reducer: {
        players: playerReducer,
      },
    });
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

  it("should add player when button is clicked", () => {
    render(
      <Provider store={mockStore}>
        <NameInput />
      </Provider>,
    );

    const input = screen.getByPlaceholderText("Enter player name...");
    fireEvent.change(input, { target: { value: "Test Player" } });

    const button = screen.getByText("Add Player");
    fireEvent.click(button);

    // Check if the player list contains the added player
    expect(screen.getByText("Test Player")).toBeInTheDocument();
  });

  it("should display player colors", () => {
    render(
      <Provider store={mockStore}>
        <NameInput />
      </Provider>,
    );

    const input = screen.getByPlaceholderText("Enter player name...");
    fireEvent.change(input, { target: { value: "Color Test" } });

    const button = screen.getByText("Add Player");
    fireEvent.click(button);

    // Check if color indicator is present
    const colorIndicator = screen.getByTestId("color-indicator-0");
    expect(colorIndicator).toBeInTheDocument();
  });

  it("should allow removing a player", async () => {
    const { rerender } = render(
      <Provider store={mockStore}>
        <NameInput />
      </Provider>,
    );

    // Add a player first
    const input = screen.getByPlaceholderText("Enter player name...");
    fireEvent.change(input, { target: { value: "Remove Test" } });

    const addButton = screen.getByText("Add Player");
    fireEvent.click(addButton);

    // Verify player was added
    expect(screen.getByText("Remove Test")).toBeInTheDocument();

    // Now remove the player
    const removeButton = screen.getByTestId("remove-player-0");
    fireEvent.click(removeButton);

    // Need to rerender to see the changes after Redux state update
    rerender(
      <Provider store={mockStore}>
        <NameInput />
      </Provider>,
    );

    // Verify player is removed
    expect(screen.queryByText("Remove Test")).not.toBeInTheDocument();
  });
});
