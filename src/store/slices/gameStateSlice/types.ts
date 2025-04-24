// src/store/slices/gameStateSlice/types.ts
export type GameStatus = "idle" | "running" | "paused" | "finished";

export interface GameState {
  status: GameStatus;
}
