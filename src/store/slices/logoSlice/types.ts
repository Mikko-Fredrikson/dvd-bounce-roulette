export interface Vector2D {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface LogoState {
  direction: Vector2D; // Normalized direction vector {x, y}
  position: Vector2D;
  // initialPosition: Vector2D; // This was in the provided context but not used by the slice, consider removing if not needed
  // velocity: Vector2D; // This was in the provided context but not used by the slice, consider removing if not needed
  size: Size;
  color: string; // Current color of the logo
  defaultColor: string; // Default color to reset to
  imageUrl: string | null; // To store the uploaded logo URL
  // angle: number; // This was in the provided context but not used by the slice, consider removing if not needed
  // speed: number; // This was in the provided context but not used by the slice, consider removing if not needed
}
