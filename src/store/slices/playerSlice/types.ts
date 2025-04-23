export interface Player {
  id: string;
  name: string;
  health: number;
  color: string;
  sectionStart: number; // Starting point of player's border section (0-1)
  sectionLength: number; // Length of player's border section (0-1)
  isEliminated: boolean; // Flag to indicate if the player is out
  eliminationOrder: number | null; // Order in which player was eliminated (1st, 2nd, etc.)
}

export interface PlayerState {
  players: Player[];
}

export interface AddPlayerPayload {
  name: string;
}

export interface UpdatePlayerNamePayload {
  id: string;
  name: string;
}
