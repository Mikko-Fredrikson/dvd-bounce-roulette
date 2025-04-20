import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PlayerNameBox from "../PlayerNameBox";

describe("PlayerNameBox", () => {
  it("renders player name correctly", () => {
    render(
      <PlayerNameBox
        name="Player 1"
        color="#FF0000"
        position={{ x: 100, y: 100 }}
      />,
    );

    expect(screen.getByText("Player 1")).toBeInTheDocument();
  });

  it("applies the correct color style", () => {
    render(
      <PlayerNameBox
        name="Player 2"
        color="#00FF00"
        position={{ x: 100, y: 100 }}
      />,
    );

    const element = screen.getByTestId("player-name-box");
    expect(element).toHaveStyle({ backgroundColor: "#00FF00" });
  });

  it("positions the box correctly", () => {
    const position = { x: 150, y: 250 };
    render(
      <PlayerNameBox name="Player 3" color="#0000FF" position={position} />,
    );

    const element = screen.getByTestId("player-name-box");
    expect(element).toHaveStyle({
      transform: `translate(${position.x}px, ${position.y}px)`,
    });
  });
});
