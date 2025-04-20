import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ControlPanel from "../ControlPanel";

// Create mock store for testing
const createMockStore = () => {
  return configureStore({
    reducer: {
      // We will add the actual reducers once we create them
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
});
