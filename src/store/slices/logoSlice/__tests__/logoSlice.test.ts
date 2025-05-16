import { describe, it, expect, beforeEach } from "vitest";
import logoReducer, {
  setLogoPosition,
  setLogoDirection,
  setLogoSize,
  setLogoImage,
  initializeLogoPosition,
  reverseVelocityX,
  reverseVelocityY,
  resetLogo,
  setLogoColor,
} from "../logoSlice";
import type { LogoState, Vector2D, Size } from "../types";

// Helper to normalize for comparison
const normalize = (vec: { x: number; y: number }) => {
  const mag = Math.sqrt(vec.x ** 2 + vec.y ** 2);
  // Return a default if magnitude is 0 to avoid division by zero and match slice logic
  return mag === 0 ? { x: 1, y: 0 } : { x: vec.x / mag, y: vec.y / mag };
};

// Define default constants for properties that are not random
const DEFAULT_LOGO_SIZE_CONST: Size = { width: 80, height: 50 };
const DEFAULT_INITIAL_POSITION_CONST: Vector2D = { x: 0, y: 0 };
const DEFAULT_COLOR_CONST = "blue"; // Match the slice definition

describe("logoSlice reducer", () => {
  let currentState: LogoState;
  let actualInitialStateFromSlice: LogoState; // To store the slice's actual initial state

  beforeEach(() => {
    actualInitialStateFromSlice = logoReducer(undefined, { type: "unknown" });
    currentState = { ...actualInitialStateFromSlice };
  });

  it("should handle initial state", () => {
    expect(actualInitialStateFromSlice.position).toEqual(
      DEFAULT_INITIAL_POSITION_CONST,
    );
    expect(actualInitialStateFromSlice.size).toEqual(DEFAULT_LOGO_SIZE_CONST);
    expect(actualInitialStateFromSlice.imageUrl).toBeNull();
    expect(actualInitialStateFromSlice.color).toBe(DEFAULT_COLOR_CONST);
    expect(actualInitialStateFromSlice.defaultColor).toBe(DEFAULT_COLOR_CONST);

    // Check direction properties for validity (normalization)
    expect(typeof actualInitialStateFromSlice.direction.x).toBe("number");
    expect(typeof actualInitialStateFromSlice.direction.y).toBe("number");
    const magSquared =
      actualInitialStateFromSlice.direction.x ** 2 +
      actualInitialStateFromSlice.direction.y ** 2;
    expect(magSquared).toBeCloseTo(1);
  });

  it("should handle setLogoPosition", () => {
    const newPosition: Vector2D = { x: 100, y: 150 };
    const nextState = logoReducer(currentState, setLogoPosition(newPosition));
    expect(nextState.position).toEqual(newPosition);
  });

  it("should handle setLogoDirection and normalize it", () => {
    // Using x and y for the input to match Vector2D, but slice expects dx, dy in payload
    const newDirectionInput = { dx: 3, dy: -4 };
    const expectedNormalizedDirection = normalize({ x: 3, y: -4 });
    const nextState = logoReducer(
      currentState,
      setLogoDirection(newDirectionInput), // Action payload uses dx, dy
    );
    expect(nextState.direction.x).toBeCloseTo(expectedNormalizedDirection.x);
    expect(nextState.direction.y).toBeCloseTo(expectedNormalizedDirection.y);
  });

  it("should handle setLogoDirection with zero vector (keep previous)", () => {
    const stateBeforeZeroDirection = { ...currentState };
    const zeroDirectionInput = { dx: 0, dy: 0 }; // Action payload uses dx, dy
    const nextState = logoReducer(
      stateBeforeZeroDirection,
      setLogoDirection(zeroDirectionInput),
    );
    expect(nextState.direction.x).toBeCloseTo(
      stateBeforeZeroDirection.direction.x,
    );
    expect(nextState.direction.y).toBeCloseTo(
      stateBeforeZeroDirection.direction.y,
    );
  });

  it("should handle setLogoSize", () => {
    const newSize: Size = { width: 100, height: 60 };
    const nextState = logoReducer(currentState, setLogoSize(newSize));
    expect(nextState.size).toEqual(newSize);
  });

  it("should handle setLogoImage", () => {
    const imageUrl = "http://example.com/logo.png";
    const nextState = logoReducer(currentState, setLogoImage(imageUrl));
    expect(nextState.imageUrl).toBe(imageUrl);
    const nextStateNull = logoReducer(nextState, setLogoImage(null));
    expect(nextStateNull.imageUrl).toBeNull();
  });

  it("should handle initializeLogoPosition only if position is 0,0", () => {
    const initialPos: Vector2D = { x: 200, y: 300 };
    const stateAtOrigin: LogoState = {
      ...actualInitialStateFromSlice,
      position: { x: 0, y: 0 },
    };
    const nextStateFromOrigin = logoReducer(
      stateAtOrigin,
      initializeLogoPosition(initialPos),
    );
    expect(nextStateFromOrigin.position).toEqual(initialPos);

    const stateAlreadyPositioned: LogoState = {
      ...actualInitialStateFromSlice,
      position: { x: 50, y: 50 },
    };
    const nextStateAlreadyPositioned = logoReducer(
      stateAlreadyPositioned,
      initializeLogoPosition(initialPos),
    );
    expect(nextStateAlreadyPositioned.position).toEqual({ x: 50, y: 50 });
  });

  it("should handle reverseVelocityX", () => {
    // Use a specific direction for this test for predictability, but base on actual initial state
    const specificDirectionInput = { x: 2, y: 3 }; // This is Vector2D
    const normalizedSpecificDirection = normalize(specificDirectionInput);
    const initialStateWithDirection: LogoState = {
      ...actualInitialStateFromSlice,
      direction: normalizedSpecificDirection, // state.direction is Vector2D {x,y}
    };
    const expectedNewDirectionX = -initialStateWithDirection.direction.x;
    const nextState = logoReducer(
      initialStateWithDirection,
      reverseVelocityX(),
    );
    expect(nextState.direction.x).toBeCloseTo(expectedNewDirectionX);
    expect(nextState.direction.y).toBeCloseTo(
      initialStateWithDirection.direction.y,
    );
  });

  it("should handle reverseVelocityY", () => {
    const specificDirectionInput = { x: 2, y: 3 }; // This is Vector2D
    const normalizedSpecificDirection = normalize(specificDirectionInput);
    const initialStateWithDirection: LogoState = {
      ...actualInitialStateFromSlice,
      direction: normalizedSpecificDirection, // state.direction is Vector2D {x,y}
    };
    const expectedNewDirectionY = -initialStateWithDirection.direction.y;
    const nextState = logoReducer(
      initialStateWithDirection,
      reverseVelocityY(),
    );
    expect(nextState.direction.y).toBeCloseTo(expectedNewDirectionY);
    expect(nextState.direction.x).toBeCloseTo(
      initialStateWithDirection.direction.x,
    );
  });

  it("should handle resetLogo", () => {
    const modifiedState: LogoState = {
      ...actualInitialStateFromSlice,
      position: { x: 500, y: 600 },
      direction: normalize({ x: -1, y: 1 }), // state.direction is Vector2D {x,y}
      size: { width: 10, height: 10 },
      imageUrl: "test.png",
      color: "#FF0000",
      defaultColor: actualInitialStateFromSlice.defaultColor, // Ensure this is part of modified state if it could change
    };
    const nextState = logoReducer(modifiedState, resetLogo());

    expect(nextState.position).toEqual(DEFAULT_INITIAL_POSITION_CONST);
    expect(nextState.direction.x).toBeCloseTo(
      actualInitialStateFromSlice.direction.x,
    );
    expect(nextState.direction.y).toBeCloseTo(
      actualInitialStateFromSlice.direction.y,
    );
    // Size and imageUrl should remain unchanged based on current resetLogo logic in the slice
    // If resetLogo is intended to reset these, the slice needs to be updated.
    expect(nextState.size).toEqual(modifiedState.size);
    expect(nextState.imageUrl).toEqual(modifiedState.imageUrl);
    expect(nextState.color).toEqual(actualInitialStateFromSlice.defaultColor);
    expect(nextState.defaultColor).toEqual(
      actualInitialStateFromSlice.defaultColor,
    );
  });

  it("should handle setLogoColor", () => {
    const newColor = "#FF0000";
    const action = setLogoColor(newColor);
    const nextState = logoReducer(currentState, action);
    expect(nextState.color).toBe(newColor);
  });

  it("should not change color if setLogoColor receives null or undefined", () => {
    const actionNull = setLogoColor(null);
    let nextState = logoReducer(currentState, actionNull);
    expect(nextState.color).toBe(actualInitialStateFromSlice.defaultColor);

    const actionUndefined = setLogoColor(undefined);
    nextState = logoReducer(currentState, actionUndefined);
    expect(nextState.color).toBe(actualInitialStateFromSlice.defaultColor);
  });
});
