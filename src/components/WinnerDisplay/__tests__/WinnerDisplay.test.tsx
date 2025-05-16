import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react"; // Import within
import { Provider } from "react-redux";
import { vi } from "vitest";
import WinnerDisplay from "../WinnerDisplay";
import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "../../../store/slices/playerSlice/playerSlice";
import gameStateReducer, {
  resetGame,
} from "../../../store/slices/gameStateSlice/gameStateSlice";
import settingsReducer from "../../../store/slices/settingsSlice/settingsSlice"; // Import settingsReducer
import { resetPlayersHealth } from "../../../store/slices/playerSlice/playerSlice";
import { resetLogo } from "../../../store/slices/logoSlice/logoSlice";
import logoReducer from "../../../store/slices/logoSlice/logoSlice";

// Mock the useWindowSize hook
vi.mock("../../../hooks/useWindowSize/useWindowSize", () => ({
  default: () => ({ width: 1024, height: 768 }),
}));

// Mock react-confetti
vi.mock("react-confetti", () => ({
  default: () => <div data-testid="confetti">Confetti</div>,
}));

const defaultSettings = {
  playerHealth: 3,
  angleVariance: 0,
  logoSpeed: 5,
  customLogo: null,
  redistributionMode: "adjacent" as "adjacent", // Ensure correct type
};

const renderWinnerDisplay = (initialState: any = {}) => {
  const store = configureStore({
    reducer: {
      players: playerReducer,
      gameState: gameStateReducer,
      logo: logoReducer,
      settings: settingsReducer, // Add settingsReducer
    },
    preloadedState: {
      settings: defaultSettings, // Provide default settings
      ...initialState,
      // Ensure nested states are merged correctly
      players: { players: [], ...initialState.players },
      gameState: { status: "initial", ...initialState.gameState },
      logo: { position: { x: 0, y: 0 }, velocity: { dx: 0, dy: 0 }, color: "white", ...initialState.logo },
    },
  });
  const dispatchSpy = vi.spyOn(store, "dispatch");
  render(
    <Provider store={store}>
      <WinnerDisplay />
    </Provider>,
  );
  return { store, dispatchSpy }; // Return dispatchSpy
};

describe("WinnerDisplay Component", () => {
  it("should not render if game status is not finished", () => {
    renderWinnerDisplay({ gameState: { status: "running" } });
    expect(screen.queryByTestId("winner-display")).not.toBeInTheDocument();
  });

  it("should not render if there is more than one active player", () => {
    renderWinnerDisplay({
      gameState: { status: "finished" },
      players: {
        players: [
          {
            id: "1",
            name: "Winner",
            health: 1,
            isEliminated: false,
            color: "red",
          },
          {
            id: "2",
            name: "Loser",
            health: 0,
            isEliminated: false,
            color: "blue",
          }, // Still active
        ],
      },
    });
    expect(screen.queryByTestId("winner-display")).not.toBeInTheDocument();
  });

  it("should render winner information and confetti when game is finished and one player remains", () => {
    renderWinnerDisplay({
      gameState: { status: "finished" },
      players: {
        players: [
          {
            id: "1",
            name: "Winner",
            health: 1,
            isEliminated: false,
            color: "red",
          },
          {
            id: "2",
            name: "Loser",
            health: 0,
            isEliminated: true,
            color: "blue",
          },
        ],
      },
    });

    expect(screen.getByTestId("winner-display")).toBeInTheDocument();
    expect(screen.getByText(/Congratulations!/i)).toBeInTheDocument();
    const winnerDisplayElement = screen.getByTestId("winner-display");
    // Find the paragraph containing the winner text
    const winnerParagraph =
      within(winnerDisplayElement).getByText(/The winner is/i);
    // Find the span *within* that paragraph
    expect(
      within(winnerParagraph).getByText(/Winner/i, { selector: "span" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("confetti")).toBeInTheDocument();
  });

  it("should render a reset button", () => {
    renderWinnerDisplay({
      gameState: { status: "finished" },
      players: {
        players: [
          {
            id: "1",
            name: "Winner",
            health: 1,
            isEliminated: false,
            color: "red",
          },
        ],
      },
    });
    expect(
      screen.getByRole("button", { name: /play again/i }),
    ).toBeInTheDocument();
  });

  it("should dispatch reset actions when reset button is clicked", async () => {
    const initialPlayerHealth = 5; // Define an initial health value for the test
    const { dispatchSpy } = renderWinnerDisplay({
      gameState: { status: "finished" },
      players: {
        players: [
          {
            id: "1",
            name: "Winner",
            health: 1,
            isEliminated: false,
            color: "red",
          },
        ],
      },
      settings: { ...defaultSettings, playerHealth: initialPlayerHealth }, // Pass settings with specific playerHealth
    });

    const resetButton = screen.getByRole("button", { name: /play again/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(resetGame());
      // Expect resetPlayersHealth to be called with the health from settings
      expect(dispatchSpy).toHaveBeenCalledWith(resetPlayersHealth(initialPlayerHealth));
      expect(dispatchSpy).toHaveBeenCalledWith(resetLogo());
    });
  });
});
