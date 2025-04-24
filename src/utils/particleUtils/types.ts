/**
 * Represents the state of a single particle.
 */
export interface Particle {
  id: string; // Unique identifier
  x: number; // Current horizontal position
  y: number; // Current vertical position
  vx: number; // Horizontal velocity
  vy: number; // Vertical velocity
  color: string; // Particle color
  size: number; // Particle size (e.g., radius)
  opacity: number; // Current opacity (for fading out)
  lifetime: number; // Total duration the particle should exist (in ms or frames)
  age: number; // Current age of the particle (in ms or frames)
}
