import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Custom hook to track window dimensions.
 * @returns {WindowSize} An object containing the current window width and height.
 */
const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>(() => {
    // Initialize state with current window size or default values if window is undefined (SSR)
    return {
      width: typeof window !== "undefined" ? window.innerWidth : 0,
      height: typeof window !== "undefined" ? window.innerHeight : 0,
    };
  });

  useEffect(() => {
    // Handler to call on window resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener only if window is defined
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);

      // Call handler right away so state gets updated with initial window size
      // This is redundant if initialized above, but safe in case window was undefined initially
      handleResize();

      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []); // Empty array ensures effect is only run on mount and unmount

  return windowSize;
};

export default useWindowSize;
