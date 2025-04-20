export interface Player {
  id: string;
  name: string;
  health: number;
  color: string;
  sectionStart: number; // Starting point of player's border section (0-1)
  sectionLength: number; // Length of player's border section (0-1)
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
