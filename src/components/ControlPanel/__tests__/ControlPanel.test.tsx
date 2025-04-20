import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ControlPanel from "../ControlPanel";
import playerReducer from "../../../store/slices/playerSlice/playerSlice";

// Create mock store for testing
const createMockStore = () => {
  return configureStore({
    reducer: {
      players: playerReducer,
    },
  });
};

describe("ControlPanel", () => {
  it("should render the control panel container", () => {
    render(
      <Provider store={createMockStore()}>
        <ControlPanel />
      </Provider>,
    );

    const containerElement = screen.getByTestId("control-panel");
    expect(containerElement).toBeInTheDocument();
  });

  it("should render tab navigation", () => {
    render(
      <Provider store={createMockStore()}>
        <ControlPanel />
      </Provider>,
    );

    const tabNavigation = screen.getByRole("tablist");
    expect(tabNavigation).toBeInTheDocument();
  });

  it("should render Players tab by default", () => {
    render(
      <Provider store={createMockStore()}>
        <ControlPanel />
      </Provider>,
    );

    const playersTab = screen.getByRole("tab", { name: /players/i });
    expect(playersTab).toHaveAttribute("aria-selected", "true");

    // Check that the NameInput is rendered when Players tab is active
    const playerInput = screen.getByPlaceholderText("Enter player name...");
    expect(playerInput).toBeInTheDocument();
  });

  it("should render Settings tab", () => {
    render(
      <Provider store={createMockStore()}>
        <ControlPanel />
      </Provider>,
    );

    const settingsTab = screen.getByRole("tab", { name: /settings/i });
    expect(settingsTab).toBeInTheDocument();
  });

  it("should switch to Settings tab when clicked", () => {
    render(
      <Provider store={createMockStore()}>
        <ControlPanel />
      </Provider>,
    );

    // First check that Players tab is selected by default
    const playersTab = screen.getByRole("tab", { name: /players/i });
    expect(playersTab).toHaveAttribute("aria-selected", "true");

    // Click the Settings tab
    const settingsTab = screen.getByRole("tab", { name: /settings/i });
    fireEvent.click(settingsTab);

    // Check that Settings tab is now selected
    expect(settingsTab).toHaveAttribute("aria-selected", "true");
    expect(playersTab).toHaveAttribute("aria-selected", "false");

    // Check that Settings content is visible
    const logoUploadLabel = screen.getByText("Custom Logo");
    expect(logoUploadLabel).toBeInTheDocument();
  });
});
