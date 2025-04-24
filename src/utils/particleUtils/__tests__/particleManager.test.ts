import { describe, it, expect, beforeEach } from "vitest";
import { createParticles } from "../particleManager";
import type { Particle } from "../types";

describe("particleManager utility functions", () => {
  describe("createParticles", () => {
    const count = 10;
    const originX = 100;
    const originY = 200;
    const colors = ["#ff0000", "#0000ff"]; // Use an array of colors
    const options = {
      minSpeed: 2,
      maxSpeed: 6,
      minSize: 2,
      maxSize: 4,
      lifetime: 500,
    };

    let particles: Particle[];

    beforeEach(() => {
      particles = createParticles(count, originX, originY, colors, options);
    });

    it("should create the specified number of particles", () => {
      expect(particles).toHaveLength(count);
    });

    it("should initialize particles at the specified origin", () => {
      particles.forEach((p) => {
        expect(p.x).toBe(originX);
        expect(p.y).toBe(originY);
      });
    });

    it("should assign colors from the provided array", () => {
      particles.forEach((p) => {
        expect(colors).toContain(p.color);
      });
      const uniqueParticleColors = new Set(particles.map((p) => p.color));
    });

    it("should handle an empty colors array by defaulting to white", () => {
      const emptyColorParticles = createParticles(5, 0, 0, [], options);
      expect(emptyColorParticles).toHaveLength(5);
      emptyColorParticles.forEach((p) => {
        expect(p.color).toBe("#FFFFFF");
      });
    });

    it("should assign initial properties correctly (opacity, age, lifetime)", () => {
      particles.forEach((p) => {
        expect(p.opacity).toBe(1);
        expect(p.age).toBe(0);
        expect(p.lifetime).toBe(options.lifetime);
      });
    });

    it("should assign sizes within the specified range", () => {
      particles.forEach((p) => {
        expect(p.size).toBeGreaterThanOrEqual(options.minSize);
        expect(p.size).toBeLessThanOrEqual(options.maxSize);
      });
    });

    it("should assign velocities with speeds within the specified range", () => {
      particles.forEach((p) => {
        const speed = Math.sqrt(p.vx ** 2 + p.vy ** 2);
        expect(speed).toBeGreaterThanOrEqual(options.minSpeed);
        expect(speed).toBeLessThanOrEqual(options.maxSpeed);
        if (options.minSpeed > 0) {
          expect(speed).toBeGreaterThan(0);
        }
      });
    });

    it("should assign unique IDs to each particle", () => {
      const ids = particles.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it("should use default options if none are provided", () => {
      const defaultColors = ["#00ff00"];
      const defaultParticles = createParticles(5, 0, 0, defaultColors);
      expect(defaultParticles).toHaveLength(5);
      defaultParticles.forEach((p) => {
        expect(p.lifetime).toBe(1000);
        expect(p.size).toBeGreaterThanOrEqual(1);
        expect(p.size).toBeLessThanOrEqual(3);
        const speed = Math.sqrt(p.vx ** 2 + p.vy ** 2);
        expect(speed).toBeGreaterThanOrEqual(1);
        expect(speed).toBeLessThanOrEqual(5);
        expect(p.color).toBe(defaultColors[0]);
      });
    });
  });

  // Add describe blocks for future particle management functions (e.g., updateParticles)
});
