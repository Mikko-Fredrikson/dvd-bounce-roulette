import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import useHealBlips, { HEAL_BLIP_DURATION_MS } from "../useHealBlips";
import { Player } from "../../../store/slices/playerSlice/types";

const buildPlayer = (id: string, health: number): Player => ({
  id,
  name: `Player ${id}`,
  health,
  color: "#ff0000",
  sectionStart: 0,
  sectionLength: 1,
  isEliminated: false,
  eliminationOrder: null,
});

describe("useHealBlips", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports nothing on the first render", () => {
    const { result } = renderHook(() =>
      useHealBlips([buildPlayer("1", 3)], true),
    );

    expect(result.current.size).toBe(0);
  });

  it("reports a blip when a player's health actually increases", () => {
    const { result, rerender } = renderHook(
      ({ players }) => useHealBlips(players, true),
      { initialProps: { players: [buildPlayer("1", 2)] } },
    );

    rerender({ players: [buildPlayer("1", 3)] });

    expect(result.current.get("1")).toBe(1);
  });

  it("reports nothing for a player already at max health", () => {
    // The reducer caps healing, so a maxed player's health does not change
    // and there is nothing to announce.
    const { result, rerender } = renderHook(
      ({ players }) => useHealBlips(players, true),
      { initialProps: { players: [buildPlayer("1", 3)] } },
    );

    rerender({ players: [buildPlayer("1", 3)] });

    expect(result.current.size).toBe(0);
  });

  it("reports nothing when health drops", () => {
    const { result, rerender } = renderHook(
      ({ players }) => useHealBlips(players, true),
      { initialProps: { players: [buildPlayer("1", 3)] } },
    );

    rerender({ players: [buildPlayer("1", 2)] });

    expect(result.current.size).toBe(0);
  });

  it("reports nothing while disabled, and does not blip on the next enabled render", () => {
    const { result, rerender } = renderHook(
      ({ players, enabled }) => useHealBlips(players, enabled),
      { initialProps: { players: [buildPlayer("1", 2)], enabled: false } },
    );

    rerender({ players: [buildPlayer("1", 3)], enabled: false });
    expect(result.current.size).toBe(0);

    // Health is still tracked while disabled, so enabling later does not
    // replay the increase that already happened.
    rerender({ players: [buildPlayer("1", 3)], enabled: true });
    expect(result.current.size).toBe(0);
  });

  it("clears the blip after the animation window", () => {
    const { result, rerender } = renderHook(
      ({ players }) => useHealBlips(players, true),
      { initialProps: { players: [buildPlayer("1", 2)] } },
    );

    rerender({ players: [buildPlayer("1", 3)] });
    expect(result.current.get("1")).toBe(1);

    act(() => {
      vi.advanceTimersByTime(HEAL_BLIP_DURATION_MS + 10);
    });

    expect(result.current.size).toBe(0);
  });

  it("tracks several players independently", () => {
    const { result, rerender } = renderHook(
      ({ players }) => useHealBlips(players, true),
      {
        initialProps: {
          players: [buildPlayer("1", 2), buildPlayer("2", 3), buildPlayer("3", 1)],
        },
      },
    );

    // Player 1 heals, player 2 is at max, player 3 heals
    rerender({
      players: [buildPlayer("1", 3), buildPlayer("2", 3), buildPlayer("3", 2)],
    });

    expect(result.current.get("1")).toBe(1);
    expect(result.current.has("2")).toBe(false);
    expect(result.current.get("3")).toBe(1);
  });

  it("ignores newly added players", () => {
    const { result, rerender } = renderHook(
      ({ players }) => useHealBlips(players, true),
      { initialProps: { players: [buildPlayer("1", 3)] } },
    );

    rerender({ players: [buildPlayer("1", 3), buildPlayer("2", 3)] });

    expect(result.current.size).toBe(0);
  });
});
