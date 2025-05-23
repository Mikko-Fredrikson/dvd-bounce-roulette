import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { LogoState, Vector2D, Size } from "./types";

// Helper function to normalize a vector
const normalizeVector = (vec: {
  x: number;
  y: number;
}): { dx: number; dy: number } => {
  const magnitude = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
  if (magnitude === 0) {
    // Avoid division by zero, return a default direction (e.g., right)
    return { dx: 1, dy: 0 };
  }
  return { dx: vec.x / magnitude, dy: vec.y / magnitude };
};

// Normalize the initial velocity to get the initial direction
const initialVelocity = { x: 5, y: 3 };
const initialDirection = normalizeVector(initialVelocity);

const DEFAULT_LOGO_SIZE: Size = { width: 80, height: 50 }; // Example size
const DEFAULT_INITIAL_POSITION: Vector2D = { x: 0, y: 0 }; // Default initial position
const DEFAULT_COLOR = "blue"; // Default color for the logo

const initialState: LogoState = {
  position: DEFAULT_INITIAL_POSITION, // Initial position
  direction: initialDirection, // Store normalized direction vector
  size: DEFAULT_LOGO_SIZE,
  imageUrl: null, // Optional image URL
  color: DEFAULT_COLOR, // Current color of the logo
  defaultColor: DEFAULT_COLOR, // Default color to reset to
};

const logoSlice = createSlice({
  name: "logo",
  initialState,
  reducers: {
    initializeLogoPosition(state, action: PayloadAction<Vector2D>) {
      // Initialize only if position is still at origin (0,0)
      if (state.position.x === 0 && state.position.y === 0) {
        state.position = action.payload;
      }
    },
    setLogoPosition(state, action: PayloadAction<Vector2D>) {
      state.position = action.payload;
    },
    // Renamed from setLogoVelocity and takes a direction object
    setLogoDirection(state, action: PayloadAction<{ dx: number; dy: number }>) {
      // Ensure the direction is always stored normalized
      const magnitude = Math.sqrt(
        action.payload.dx ** 2 + action.payload.dy ** 2,
      );
      if (magnitude === 0) {
        // Keep previous direction if new direction is zero vector
        console.warn(
          "Attempted to set zero direction vector. Keeping previous.",
        );
      } else {
        state.direction.dx = action.payload.dx / magnitude;
        state.direction.dy = action.payload.dy / magnitude;
      }
    },
    // Reverses only the direction component
    reverseVelocityX(state) {
      state.direction.dx *= -1;
    },
    // Reverses only the direction component
    reverseVelocityY(state) {
      state.direction.dy *= -1;
    },
    setLogoSize(state, action: PayloadAction<Size>) {
      state.size = action.payload;
    },
    setLogoImage(state, action: PayloadAction<string | null>) {
      state.imageUrl = action.payload;
    },
    setLogoColor(state, action: PayloadAction<string | null | undefined>) {
      // Only update if the payload is a valid color string
      if (action.payload && typeof action.payload === "string") {
        state.color = action.payload;
      }
    },
    resetLogo(state) {
      // Reset position to initial position, keep initial direction
      state.position = DEFAULT_INITIAL_POSITION;
      state.direction = initialDirection;
      // Reset color to the stored default color
      state.color = state.defaultColor;
    },
  },
});

export const {
  initializeLogoPosition,
  setLogoPosition,
  setLogoDirection, // Export new action name
  reverseVelocityX,
  reverseVelocityY,
  setLogoSize,
  setLogoImage,
  setLogoColor, // Export the new action
  resetLogo,
} = logoSlice.actions;

export default logoSlice.reducer;
