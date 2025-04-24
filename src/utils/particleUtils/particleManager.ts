import { Particle } from "./types";

/**
 * Creates an array of particles originating from a specific point,
 * randomly assigning colors from the provided array.
 *
 * @param count The number of particles to create.
 * @param originX The starting X coordinate.
 * @param originY The starting Y coordinate.
 * @param colors An array of color strings to choose from for the particles.
 * @param options Optional configuration for particle properties.
 * @returns An array of newly created Particle objects.
 */
export const createParticles = (
  count: number,
  originX: number,
  originY: number,
  colors: string[], // Changed from single color to array
  options?: {
    minSpeed?: number;
    maxSpeed?: number;
    minSize?: number;
    maxSize?: number;
    lifetime?: number;
  },
): Particle[] => {
  const particles: Particle[] = [];
  const {
    minSpeed = 1,
    maxSpeed = 5,
    minSize = 1,
    maxSize = 3,
    lifetime = 1000,
  } = options || {};

  // Ensure colors array is not empty
  if (!colors || colors.length === 0) {
    console.warn(
      "createParticles called with empty colors array. Using default white.",
    );
    colors = ["#FFFFFF"];
  }

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    const size = minSize + Math.random() * (maxSize - minSize);
    // Randomly select a color from the provided array
    const color = colors[Math.floor(Math.random() * colors.length)];

    particles.push({
      id: `particle-${Date.now()}-${Math.random()}`,
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: color, // Assign the randomly selected color
      size: size,
      opacity: 1,
      lifetime: lifetime,
      age: 0,
    });
  }

  return particles;
};

// Future functions for updating/managing particles with GSAP might go here
