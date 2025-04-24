import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import useWindowSize from "../useWindowSize"; // Adjust the import path as needed

// Helper to mock window resize
const fireResize = (width: number, height: number) => {
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event("resize"));
};

describe("useWindowSize Hook", () => {
  let originalInnerWidth: number;
  let originalInnerHeight: number;

  beforeEach(() => {
    // Store original window dimensions
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
    // Mock addEventListener and removeEventListener
    vi.spyOn(window, "addEventListener");
    vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    // Restore original window dimensions
    window.innerWidth = originalInnerWidth;
    window.innerHeight = originalInnerHeight;
    // Restore mocks
    vi.restoreAllMocks();
  });

  it("should return initial window dimensions", () => {
    const initialWidth = 1024;
    const initialHeight = 768;
    window.innerWidth = initialWidth;
    window.innerHeight = initialHeight;

    const { result } = renderHook(() => useWindowSize());

    expect(result.current.width).toBe(initialWidth);
    expect(result.current.height).toBe(initialHeight);
  });

  it("should update dimensions on window resize", () => {
    const initialWidth = 1024;
    const initialHeight = 768;
    window.innerWidth = initialWidth;
    window.innerHeight = initialHeight;

    const { result } = renderHook(() => useWindowSize());

    // Initial check
    expect(result.current.width).toBe(initialWidth);
    expect(result.current.height).toBe(initialHeight);

    // Simulate resize
    const newWidth = 800;
    const newHeight = 600;
    act(() => {
      fireResize(newWidth, newHeight);
    });

    // Check updated dimensions
    expect(result.current.width).toBe(newWidth);
    expect(result.current.height).toBe(newHeight);
  });

  it("should add resize event listener on mount", () => {
    renderHook(() => useWindowSize());
    expect(window.addEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });

  it("should remove resize event listener on unmount", () => {
    const { unmount } = renderHook(() => useWindowSize());
    const handler = (window.addEventListener as vi.Mock).mock.calls[0][1]; // Get the handler function

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith("resize", handler);
  });
});
