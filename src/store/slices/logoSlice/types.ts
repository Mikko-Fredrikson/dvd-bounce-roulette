export interface Vector2D {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface LogoState {
  direction: { dx: number; dy: number }; // Normalized direction vector
  position: Vector2D;
  initialPosition: Vector2D; // Add initial position
  velocity: Vector2D;
  size: Size;
  color: string; // Current color of the logo
  imageUrl: string | null; // To store the uploaded logo URL
  angle: number; // Current angle of movement in degrees
  speed: number; // Magnitude of velocity
}
