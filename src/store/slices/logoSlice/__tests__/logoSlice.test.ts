import { describe, it, expect } from "vitest";
import logoReducer, {
  setLogoPosition,
  setLogoVelocity,
  setLogoAngle,
  setLogoSpeed,
  setLogoSize,
  setLogoImageUrl,
  initializeLogoPosition,
  reverseVelocityX,
  reverseVelocityY,
  // Import initial state if needed for comparison, or define expected initial state here
} from "../logoSlice";
import type { LogoState, Vector2D, Size } from "../types";

// Define expected initial state structure for clarity in tests
const expectedInitialState: LogoState = {
  position: { x: 0, y: 0 },
  // Calculate expected initial velocity based on defaults
  velocity: {
    x: 2 * Math.cos((45 * Math.PI) / 180),
    y: 2 * Math.sin((45 * Math.PI) / 180),
  },
  size: { width: 50, height: 30 },
  imageUrl: null,
  angle: 45,
  speed: 2,
};

describe("logoSlice reducer", () => {
  it("should handle initial state", () => {
    // Check if the reducer returns the expected initial state when called with undefined state
    // Use expect(...).toEqual(...) for deep equality checks of objects
    expect(logoReducer(undefined, { type: "unknown" })).toEqual(
      expectedInitialState,
    );
  });

  it("should handle setLogoPosition", () => {
    const newPosition: Vector2D = { x: 100, y: 150 };
    const nextState = logoReducer(
      expectedInitialState,
      setLogoPosition(newPosition),
    );
    expect(nextState.position).toEqual(newPosition);
  });

  it("should handle setLogoVelocity and update angle/speed", () => {
    const newVelocity: Vector2D = { x: 3, y: -4 };
    const expectedSpeed = 5; // sqrt(3^2 + (-4)^2)
    const expectedAngle = (Math.atan2(-4, 3) * 180) / Math.PI;
    const nextState = logoReducer(
      expectedInitialState,
      setLogoVelocity(newVelocity),
    );
    expect(nextState.velocity).toEqual(newVelocity);
    expect(nextState.speed).toBeCloseTo(expectedSpeed);
    expect(nextState.angle).toBeCloseTo(expectedAngle);
  });

  it("should handle setLogoAngle and update velocity", () => {
    const newAngle = 135;
    const currentSpeed = expectedInitialState.speed;
    const expectedVelocity: Vector2D = {
      x: currentSpeed * Math.cos((newAngle * Math.PI) / 180),
      y: currentSpeed * Math.sin((newAngle * Math.PI) / 180),
    };
    const nextState = logoReducer(expectedInitialState, setLogoAngle(newAngle));
    expect(nextState.angle).toBeCloseTo(newAngle);
    expect(nextState.velocity.x).toBeCloseTo(expectedVelocity.x);
    expect(nextState.velocity.y).toBeCloseTo(expectedVelocity.y);
    expect(nextState.speed).toBeCloseTo(currentSpeed); // Speed should remain the same
  });

  it("should handle setLogoSpeed and update velocity", () => {
    const newSpeed = 5;
    const currentAngle = expectedInitialState.angle;
    const expectedVelocity: Vector2D = {
      x: newSpeed * Math.cos((currentAngle * Math.PI) / 180),
      y: newSpeed * Math.sin((currentAngle * Math.PI) / 180),
    };
    const nextState = logoReducer(expectedInitialState, setLogoSpeed(newSpeed));
    expect(nextState.speed).toBeCloseTo(newSpeed);
    expect(nextState.velocity.x).toBeCloseTo(expectedVelocity.x);
    expect(nextState.velocity.y).toBeCloseTo(expectedVelocity.y);
    expect(nextState.angle).toBeCloseTo(currentAngle); // Angle should remain the same
  });

  it("should handle setLogoSize", () => {
    const newSize: Size = { width: 100, height: 60 };
    const nextState = logoReducer(expectedInitialState, setLogoSize(newSize));
    expect(nextState.size).toEqual(newSize);
  });

  it("should handle setLogoImageUrl", () => {
    const imageUrl = "http://example.com/logo.png";
    const nextState = logoReducer(
      expectedInitialState,
      setLogoImageUrl(imageUrl),
    );
    expect(nextState.imageUrl).toBe(imageUrl);
    const nextStateNull = logoReducer(nextState, setLogoImageUrl(null));
    expect(nextStateNull.imageUrl).toBeNull();
  });

  it("should handle initializeLogoPosition", () => {
    const initialPos: Vector2D = { x: 200, y: 300 };
    const nextState = logoReducer(
      expectedInitialState,
      initializeLogoPosition(initialPos),
    );
    expect(nextState.position).toEqual(initialPos);
  });

  it("should handle reverseVelocityX and update angle", () => {
    const initialStateWithVelocity = {
      ...expectedInitialState,
      velocity: { x: 2, y: 3 },
    };
    const expectedNewVelocityX = -2;
    const expectedNewAngle = (Math.atan2(3, -2) * 180) / Math.PI;
    const nextState = logoReducer(initialStateWithVelocity, reverseVelocityX());
    expect(nextState.velocity.x).toBe(expectedNewVelocityX);
    expect(nextState.velocity.y).toBe(initialStateWithVelocity.velocity.y); // y should not change
    expect(nextState.angle).toBeCloseTo(expectedNewAngle);
  });

  it("should handle reverseVelocityY and update angle", () => {
    const initialStateWithVelocity = {
      ...expectedInitialState,
      velocity: { x: 2, y: 3 },
    };
    const expectedNewVelocityY = -3;
    const expectedNewAngle = (Math.atan2(-3, 2) * 180) / Math.PI;
    const nextState = logoReducer(initialStateWithVelocity, reverseVelocityY());
    expect(nextState.velocity.y).toBe(expectedNewVelocityY);
    expect(nextState.velocity.x).toBe(initialStateWithVelocity.velocity.x); // x should not change
    expect(nextState.angle).toBeCloseTo(expectedNewAngle);
  });
});
