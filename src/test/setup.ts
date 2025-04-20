import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Automatically run cleanup after each test
afterEach(() => {
  cleanup();
});
