import { shiftColor } from "./shiftColor";

export interface ColorMap {
  [key: string]: string;
}

export function generateUniqueColors(names: string[]): ColorMap {
  const colorMap: ColorMap = {};

  // If no names, return empty object
  if (names.length === 0) {
    return colorMap;
  }

  // Pre-defined visually distinguishable colors for better UX
  const colorPalette = [
    "#FF5733", // Red-Orange
    "#33FF57", // Green
    "#3357FF", // Blue
    "#FF33F5", // Pink
    "#F5FF33", // Yellow
    "#33FFF5", // Cyan
    "#8833FF", // Purple
    "#FF8833", // Orange
    "#33FF88", // Mint
    "#FF3388", // Magenta
    "#885533", // Brown
    "#5533FF", // Indigo
    "#FF5588", // Salmon
    "#55FF33", // Lime
    "#3388FF", // Sky Blue
  ];

  // For deterministic color assignment, assign colors from the palette
  // If more names than colors, start reusing colors with slight variations
  names.forEach((name, index) => {
    if (index < colorPalette.length) {
      colorMap[name] = colorPalette[index];
    } else {
      // For additional names, create variations by shifting the hue
      const baseColorIndex = index % colorPalette.length;
      const baseColor = colorPalette[baseColorIndex];
      colorMap[name] = shiftColor(
        baseColor,
        Math.floor(index / colorPalette.length),
      );
    }
  });

  return colorMap;
}
