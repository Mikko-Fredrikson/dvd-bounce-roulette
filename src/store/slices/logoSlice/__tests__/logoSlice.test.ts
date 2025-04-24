import { describe, it, expect } from "vitest";
import logoReducer, {
  setLogoPosition,
  setLogoDirection, // Updated import
  setLogoSize,
  setLogoImage, // Renamed from setLogoImageUrl
  initializeLogoPosition,
  reverseVelocityX,
  reverseVelocityY,
  resetLogo, // Updated import
} from "../logoSlice";
import type { LogoState, Vector2D, Size } from "../types";

// Helper to normalize for comparison
const normalize = (vec: { x: number; y: number }) => {
  const mag = Math.sqrt(vec.x ** 2 + vec.y ** 2);
  return mag === 0 ? { dx: 1, dy: 0 } : { dx: vec.x / mag, dy: vec.y / mag };
};

// Define expected initial state structure for clarity in tests
const initialVelocity = { x: 5, y: 3 };
const initialDirection = normalize(initialVelocity);
const DEFAULT_LOGO_SIZE: Size = { width: 80, height: 50 };
const DEFAULT_INITIAL_POSITION: Vector2D = { x: 0, y: 0 };

const expectedInitialState: LogoState = {
  position: DEFAULT_INITIAL_POSITION,
  direction: initialDirection,
  size: DEFAULT_LOGO_SIZE,
  imageUrl: null,
};

describe("logoSlice reducer", () => {
  it("should handle initial state", () => {
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

  it("should handle setLogoDirection and normalize it", () => {
    const newDirectionInput = { dx: 3, dy: -4 };
    const expectedNormalizedDirection = normalize({ x: 3, y: -4 });
    const nextState = logoReducer(
      expectedInitialState,
      setLogoDirection(newDirectionInput),
    );
    expect(nextState.direction.dx).toBeCloseTo(expectedNormalizedDirection.dx);
    expect(nextState.direction.dy).toBeCloseTo(expectedNormalizedDirection.dy);
  });

  it("should handle setLogoDirection with zero vector (keep previous)", () => {
    const zeroDirectionInput = { dx: 0, dy: 0 };
    const nextState = logoReducer(
      expectedInitialState,
      setLogoDirection(zeroDirectionInput),
    );
    // Direction should remain the initial direction
    expect(nextState.direction.dx).toBeCloseTo(initialDirection.dx);
    expect(nextState.direction.dy).toBeCloseTo(initialDirection.dy);
  });

  it("should handle setLogoSize", () => {
    const newSize: Size = { width: 100, height: 60 };
    const nextState = logoReducer(expectedInitialState, setLogoSize(newSize));
    expect(nextState.size).toEqual(newSize);
  });

  it("should handle setLogoImage", () => {
    const imageUrl = "http://example.com/logo.png";
    const nextState = logoReducer(expectedInitialState, setLogoImage(imageUrl));
    expect(nextState.imageUrl).toBe(imageUrl);
    const nextStateNull = logoReducer(nextState, setLogoImage(null));
    expect(nextStateNull.imageUrl).toBeNull();
  });

  it("should handle initializeLogoPosition only if position is 0,0", () => {
    const initialPos: Vector2D = { x: 200, y: 300 };
    // Test case 1: Initializing from 0,0
    const stateAtOrigin = { ...expectedInitialState };
    const nextStateFromOrigin = logoReducer(
      stateAtOrigin,
      initializeLogoPosition(initialPos),
    );
    expect(nextStateFromOrigin.position).toEqual(initialPos);

    // Test case 2: Trying to initialize when already positioned
    const stateAlreadyPositioned = {
      ...expectedInitialState,
      position: { x: 50, y: 50 },
    };
    const nextStateAlreadyPositioned = logoReducer(
      stateAlreadyPositioned,
      initializeLogoPosition(initialPos),
    );
    // Position should NOT change
    expect(nextStateAlreadyPositioned.position).toEqual({ x: 50, y: 50 });
  });

  it("should handle reverseVelocityX", () => {
    const initialStateWithDirection = {
      ...expectedInitialState,
      direction: normalize({ x: 2, y: 3 }),
    };
    const expectedNewDirectionX = -initialStateWithDirection.direction.dx;
    const nextState = logoReducer(initialStateWithDirection, reverseVelocityX());
    expect(nextState.direction.dx).toBeCloseTo(expectedNewDirectionX);
    expect(nextState.direction.dy).toBeCloseTo(
      initialStateWithDirection.direction.dy,
    ); // y should not change
  });

  it("should handle reverseVelocityY", () => {
    const initialStateWithDirection = {
      ...expectedInitialState,
      direction: normalize({ x: 2, y: 3 }),
    };
    const expectedNewDirectionY = -initialStateWithDirection.direction.dy;
    const nextState = logoReducer(initialStateWithDirection, reverseVelocityY());
    expect(nextState.direction.dy).toBeCloseTo(expectedNewDirectionY);
    expect(nextState.direction.dx).toBeCloseTo(
      initialStateWithDirection.direction.dx,
    ); // x should not change
  });

  it("should handle resetLogo", () => {
    const modifiedState: LogoState = {
      ...expectedInitialState,
      position: { x: 500, y: 600 }, // Simulate a changed position
      direction: normalize({ x: -1, y: 1 }), // Simulate a changed direction
      size: { width: 10, height: 10 },
      imageUrl: "test.png",
    };
    const nextState = logoReducer(modifiedState, resetLogo());
    // Position should reset to default initial (0,0)
    expect(nextState.position).toEqual(DEFAULT_INITIAL_POSITION);
    // Direction should reset to initial direction
    expect(nextState.direction.dx).toBeCloseTo(initialDirection.dx);
    expect(nextState.direction.dy).toBeCloseTo(initialDirection.dy);
    // Size and imageUrl should remain unchanged based on current resetLogo logic
    expect(nextState.size).toEqual(modifiedState.size);
    expect(nextState.imageUrl).toEqual(modifiedState.imageUrl);
  });
});
