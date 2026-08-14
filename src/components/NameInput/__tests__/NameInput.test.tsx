import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import NameInput from "../NameInput";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import playerReducer, {
  addPlayer,
  decrementPlayerHealth,
  setAllPlayersHealth,
} from "../../../store/slices/playerSlice/playerSlice";
import gameStateReducer from "../../../store/slices/gameStateSlice/gameStateSlice";
import type { GameStatus } from "../../../store/slices/gameStateSlice/types";
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
          healOnElimination: false,
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

  describe("heal blip", () => {
    // Two players; the second is on 1 HP so the next hit eliminates them and
    // the survivor heals. The survivor starts below max so the heal lands.
    const buildHealStore = (healOnElimination: boolean) =>
      configureStore({
        reducer: {
          players: playerReducer,
          gameState: gameStateReducer,
          settings: settingsReducer,
        },
        preloadedState: {
          settings: {
            playerHealth: 3,
            angleVariance: 0,
            logoSpeed: 5,
            customLogo: null,
            redistributionMode: "adjacent" as RedistributionMode,
            healOnElimination,
          },
          players: {
            players: [
              {
                id: "1",
                name: "Survivor",
                health: 2,
                color: "#ff0000",
                sectionStart: 0,
                sectionLength: 0.5,
                isEliminated: false,
                eliminationOrder: null,
              },
              {
                id: "2",
                name: "Doomed",
                health: 1,
                color: "#00ff00",
                sectionStart: 0.5,
                sectionLength: 0.5,
                isEliminated: false,
                eliminationOrder: null,
              },
            ],
          },
          gameState: { status: "running" as GameStatus },
        },
      });

    const eliminate = (store: ReturnType<typeof buildHealStore>) =>
      store.dispatch(
        decrementPlayerHealth({
          playerId: "2",
          healOnElimination: true,
          maxHealth: 3,
        }),
      );

    it("shows a +1 next to a player who actually healed", async () => {
      const store = buildHealStore(true);
      render(
        <Provider store={store}>
          <NameInput />
        </Provider>,
      );

      expect(screen.getByText("HP: 2")).toBeInTheDocument();

      act(() => {
        eliminate(store);
      });

      expect(await screen.findByText("+1")).toBeInTheDocument();
      expect(screen.getByText("HP: 3")).toBeInTheDocument();
    });

    it("shows no blip for a player already at max health", () => {
      const store = buildHealStore(true);
      // Push the survivor to max first, so the heal is capped to a no-op
      store.dispatch(setAllPlayersHealth(3));

      render(
        <Provider store={store}>
          <NameInput />
        </Provider>,
      );

      act(() => {
        eliminate(store);
      });

      expect(screen.queryByText("+1")).not.toBeInTheDocument();
    });

    it("shows no blip when the heal setting is off", () => {
      const store = buildHealStore(false);
      render(
        <Provider store={store}>
          <NameInput />
        </Provider>,
      );

      act(() => {
        // Even if a heal somehow lands, the display stays quiet when disabled
        store.dispatch(
          decrementPlayerHealth({
            playerId: "2",
            healOnElimination: true,
            maxHealth: 3,
          }),
        );
      });

      expect(screen.queryByText("+1")).not.toBeInTheDocument();
    });
  });
});
