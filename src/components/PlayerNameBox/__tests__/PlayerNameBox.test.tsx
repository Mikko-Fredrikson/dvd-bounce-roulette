import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayerNameBox from "../PlayerNameBox";

describe("PlayerNameBox", () => {
  const defaultProps = {
    name: "Player 1",
    color: "#FF0000",
    position: { x: 100, y: 100 },
    hp: 100,
    startPosition: 50,
    length: 200,
  };

  it("renders player name correctly", () => {
    render(<PlayerNameBox {...defaultProps} />);

    expect(screen.getByText("Player 1")).toBeInTheDocument();
  });

  it("applies the correct color style", () => {
    render(<PlayerNameBox {...defaultProps} color="#00FF00" />);

    const element = screen.getByTestId("player-name-box");
    expect(element).toHaveStyle({ backgroundColor: "#00FF00" });
  });

  it("positions the box correctly", () => {
    const position = { x: 150, y: 250 };
    render(<PlayerNameBox {...defaultProps} position={position} />);

    const element = screen.getByTestId("player-name-box");
    expect(element).toHaveStyle({
      transform: `translate(${position.x}px, ${position.y}px)`,
    });
  });

  it("displays player HP correctly", () => {
    render(<PlayerNameBox {...defaultProps} hp={75} />);
    expect(screen.getByText("HP: 75")).toBeInTheDocument();
  });
});
