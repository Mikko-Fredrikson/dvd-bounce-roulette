import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { LogoState, Vector2D, Size } from "./types";

// Define default properties
const DEFAULT_LOGO_SIZE: Size = { width: 50, height: 30 }; // Example size in pixels
const DEFAULT_SPEED = 2; // Example speed in pixels per frame
const INITIAL_ANGLE = 45; // Example initial angle in degrees

// Function to calculate initial velocity from angle and speed
const calculateVelocity = (angle: number, speed: number): Vector2D => {
  const angleRad = (angle * Math.PI) / 180;
  return {
    x: Math.cos(angleRad) * speed,
    y: Math.sin(angleRad) * speed,
  };
};

const initialState: LogoState = {
  // Initial position will likely be set dynamically based on GameArea dimensions
  // For now, setting to 0,0 - needs adjustment when GameArea is ready
  position: { x: 0, y: 0 },
  velocity: calculateVelocity(INITIAL_ANGLE, DEFAULT_SPEED),
  size: DEFAULT_LOGO_SIZE,
  imageUrl: null, // No default image initially
  angle: INITIAL_ANGLE,
  speed: DEFAULT_SPEED,
};

const logoSlice = createSlice({
  name: "logo",
  initialState,
  reducers: {
    setLogoPosition: (state, action: PayloadAction<Vector2D>) => {
      state.position = action.payload;
    },
    setLogoVelocity: (state, action: PayloadAction<Vector2D>) => {
      state.velocity = action.payload;
      // Update angle and speed based on new velocity
      state.speed = Math.sqrt(action.payload.x ** 2 + action.payload.y ** 2);
      state.angle =
        (Math.atan2(action.payload.y, action.payload.x) * 180) / Math.PI;
    },
    setLogoAngle: (state, action: PayloadAction<number>) => {
      state.angle = action.payload % 360; // Keep angle between 0 and 360
      state.velocity = calculateVelocity(state.angle, state.speed);
    },
    setLogoSpeed: (state, action: PayloadAction<number>) => {
      state.speed = action.payload;
      state.velocity = calculateVelocity(state.angle, state.speed);
    },
    setLogoSize: (state, action: PayloadAction<Size>) => {
      state.size = action.payload;
    },
    setLogoImageUrl: (state, action: PayloadAction<string | null>) => {
      state.imageUrl = action.payload;
    },
    // Reducer to set initial position, useful after GameArea dimensions are known
    initializeLogoPosition: (state, action: PayloadAction<Vector2D>) => {
      state.position = action.payload;
    },
    // Add other reducers as needed, e.g., for bouncing logic
    reverseVelocityX: (state) => {
      state.velocity.x *= -1;
      state.angle =
        (Math.atan2(state.velocity.y, state.velocity.x) * 180) / Math.PI;
    },
    reverseVelocityY: (state) => {
      state.velocity.y *= -1;
      state.angle =
        (Math.atan2(state.velocity.y, state.velocity.x) * 180) / Math.PI;
    },
  },
});

export const {
  setLogoPosition,
  setLogoVelocity,
  setLogoAngle,
  setLogoSpeed,
  setLogoSize,
  setLogoImageUrl,
  initializeLogoPosition,
  reverseVelocityX,
  reverseVelocityY,
} = logoSlice.actions;

export default logoSlice.reducer;
