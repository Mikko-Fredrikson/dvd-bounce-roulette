// src/store/slices/gameStateSlice/types.ts
export type GameStatus = "idle" | "running" | "paused";

export interface GameState {
  status: GameStatus;
}
