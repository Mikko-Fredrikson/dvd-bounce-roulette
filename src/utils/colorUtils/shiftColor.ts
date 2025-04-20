/**
 * Shifts a hex color by adjusting its hue
 * @param hexColor Original color in hex format
 * @param shiftFactor Number of positions to shift the hue
 * @returns Modified color in hex format
 */
export function shiftColor(hexColor: string, shiftFactor: number): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Simple shift algorithm - rotate the RGB values
  const shift = 30 * shiftFactor;
  const newR = (r + shift) % 256;
  const newG = (g + shift) % 256;
  const newB = (b + shift) % 256;

  // Convert back to hex
  const rHex = newR.toString(16).padStart(2, "0");
  const gHex = newG.toString(16).padStart(2, "0");
  const bHex = newB.toString(16).padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
}
