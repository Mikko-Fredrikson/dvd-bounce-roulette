import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ControlPanel from "../ControlPanel";
import playerReducer from "../../../store/slices/playerSlice/playerSlice";
import gameStateReducer, {
  startGame,
  pauseGame,
  resumeGame,
  resetGame,
} from "../../../store/slices/gameStateSlice/gameStateSlice";
import settingsReducer, {
  setAngleVariance,
} from "../../../store/slices/settingsSlice/settingsSlice";
import { RootState } from "../../../store";

// Create mock store for testing, now including gameState and settings
const createMockStore = (initialState: Partial<RootState> = {}) => {
  return configureStore({
    reducer: {
      players: playerReducer,
      gameState: gameStateReducer,
      settings: settingsReducer,
    },
    preloadedState: {
      ...initialState,
      gameState: {
        ...(initialState.gameState || { status: "idle" }),
      },
      players: {
        players: initialState.players?.players || [],
      },
      settings: {
        ...(initialState.settings || {
          angleVariance: 10,
          playerHealth: 3,
          customLogo: null,
        }),
      },
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

    const playersTab = screen.getByRole("tab", { name: /players/i });
    const settingsTab = screen.getByRole("tab", { name: /settings/i });
    fireEvent.click(settingsTab);

    expect(settingsTab).toHaveAttribute("aria-selected", "true");
    expect(playersTab).toHaveAttribute("aria-selected", "false");
  });
});

describe("ControlPanel Settings Tab", () => {
  it("should render angle variance slider when Settings tab is active", () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ControlPanel />
      </Provider>,
    );

    const settingsTab = screen.getByRole("tab", { name: /settings/i });
    fireEvent.click(settingsTab);

    const sliderLabel = screen.getByLabelText(/angle variance/i);
    const sliderInput = screen.getByRole("slider", { name: /angle variance/i });
    const valueDisplay = screen.getByText(/10°/i);

    expect(sliderLabel).toBeInTheDocument();
    expect(sliderInput).toBeInTheDocument();
    expect(sliderInput).toHaveValue("10");
    expect(valueDisplay).toBeInTheDocument();
    expect(
      screen.getByText(/Max angle deviation on bounce \(±5°\)/i),
    ).toBeInTheDocument();
  });

  it("should dispatch setAngleVariance action when slider value changes", () => {
    const store = createMockStore();
    vi.spyOn(store, "dispatch");
    render(
      <Provider store={store}>
        <ControlPanel />
      </Provider>,
    );

    const settingsTab = screen.getByRole("tab", { name: /settings/i });
    fireEvent.click(settingsTab);

    const sliderInput = screen.getByRole("slider", { name: /angle variance/i });
    fireEvent.change(sliderInput, { target: { value: "20" } });

    expect(store.dispatch).toHaveBeenCalledWith(setAngleVariance(20));
  });

  it("should display the updated angle variance value", () => {
    const store = createMockStore({
      settings: { angleVariance: 30, playerHealth: 3, customLogo: null },
    });
    render(
      <Provider store={store}>
        <ControlPanel />
      </Provider>,
    );

    const settingsTab = screen.getByRole("tab", { name: /settings/i });
    fireEvent.click(settingsTab);

    const sliderInput = screen.getByRole("slider", { name: /angle variance/i });
    const valueDisplay = screen.getByText(/30°/i);
    const helpText = screen.getByText(
      /Max angle deviation on bounce \(±15°\)/i,
    );

    expect(sliderInput).toHaveValue("30");
    expect(valueDisplay).toBeInTheDocument();
    expect(helpText).toBeInTheDocument();
  });
});

describe("GameControls within ControlPanel", () => {
  it("should display Start and Reset buttons when game is idle", () => {
    const store = createMockStore({ gameState: { status: "idle" } });
    render(
      <Provider store={store}>
        <ControlPanel />
      </Provider>,
    );

    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /pause/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /resume/i }),
    ).not.toBeInTheDocument();
  });

  it("should display Pause and Reset buttons when game is running", () => {
    const store = createMockStore({ gameState: { status: "running" } });
    render(
      <Provider store={store}>
        <ControlPanel />
      </Provider>,
    );

    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /start/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /resume/i }),
    ).not.toBeInTheDocument();
  });

  it("should display Resume and Reset buttons when game is paused", () => {
    const store = createMockStore({ gameState: { status: "paused" } });
    render(
      <Provider store={store}>
        <ControlPanel />
      </Provider>,
    );

    expect(screen.getByRole("button", { name: /resume/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /start/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /pause/i }),
    ).not.toBeInTheDocument();
  });

  it("should dispatch startGame action when Start button is clicked", () => {
    const store = createMockStore({ gameState: { status: "idle" } });
    vi.spyOn(store, "dispatch");
    render(
      <Provider store={store}>
        <ControlPanel />
      </Provider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /start/i }));
    expect(store.dispatch).toHaveBeenCalledWith(startGame());
  });

  it("should dispatch pauseGame action when Pause button is clicked", () => {
    const store = createMockStore({ gameState: { status: "running" } });
    vi.spyOn(store, "dispatch");
    render(
      <Provider store={store}>
        <ControlPanel />
      </Provider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /pause/i }));
    expect(store.dispatch).toHaveBeenCalledWith(pauseGame());
  });

  it("should dispatch resumeGame action when Resume button is clicked", () => {
    const store = createMockStore({ gameState: { status: "paused" } });
    vi.spyOn(store, "dispatch");
    render(
      <Provider store={store}>
        <ControlPanel />
      </Provider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /resume/i }));
    expect(store.dispatch).toHaveBeenCalledWith(resumeGame());
  });

  it("should dispatch resetGame action when Reset button is clicked", () => {
    const store = createMockStore({ gameState: { status: "running" } });
    vi.spyOn(store, "dispatch");
    render(
      <Provider store={store}>
        <ControlPanel />
      </Provider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(store.dispatch).toHaveBeenCalledWith(resetGame());
  });
});
