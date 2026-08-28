export type QrMatrixData = {
  size: number;
  modules: boolean[][];
};

export type QrVisualRole = "protected" | "canopy" | "train" | "landscape";
export type QrFinderId = "north-west" | "north-east" | "south-west";

export function getQrFinderId(row: number, column: number, size: number): QrFinderId | null {
  if (row <= 6 && column <= 6) return "north-west";
  if (row <= 6 && column >= size - 7) return "north-east";
  if (row >= size - 7 && column <= 6) return "south-west";
  return null;
}

export function isProtectedQrModule(row: number, column: number, size: number) {
  const inTopLeftFinder = row <= 8 && column <= 8;
  const inTopRightFinder = row <= 8 && column >= size - 8;
  const inBottomLeftFinder = row >= size - 8 && column <= 8;
  const onTimingPattern = row === 6 || column === 6;
  const alignmentCentre = size - 7;
  const inBottomRightAlignment = Math.abs(row - alignmentCentre) <= 2 && Math.abs(column - alignmentCentre) <= 2;
  const fixedDarkModule = row === size - 8 && column === 8;
  return inTopLeftFinder || inTopRightFinder || inBottomLeftFinder || onTimingPattern || inBottomRightAlignment || fixedDarkModule;
}

export function isTrainArtworkZone(row: number, column: number, size: number) {
  const centre = (size - 1) / 2;
  const x = column - centre;
  const z = row - centre;
  return Math.abs(x) < 9 && z > 5 && z < 10.5;
}

export function isCanopyArtworkZone(row: number, column: number, size: number) {
  const centre = (size - 1) / 2;
  const x = column - centre;
  const z = row - centre;
  return Math.hypot(x, z) <= 8.8;
}

export function classifyQrDarkModule(row: number, column: number, size: number): QrVisualRole {
  if (isProtectedQrModule(row, column, size)) return "protected";
  if (isTrainArtworkZone(row, column, size)) return "train";
  if (isCanopyArtworkZone(row, column, size)) return "canopy";
  return "landscape";
}

/**
 * The 41 × 41 module grid sampled from public/thanks-diorama/bank-qr.png.
 * Keeping the grid as data lets the 3D scene use the real bank QR structure
 * instead of placing a decorative QR image underneath the artwork.
 */
export const BANK_QR_ROWS = [
  "11111110010110110000000110011101101111111",
  "10000010100101011100110100010010001000001",
  "10111010100000110111001000010110001011101",
  "10111010011111011111001111111001001011101",
  "10111010101010110000110001001001001011101",
  "10000010110100011111110010110001101000001",
  "11111110101010101010101010101010101111111",
  "00000000101010110101110000000111100000000",
  "11010011001101100101111101010010101110110",
  "10000000101110101110001001100110001101000",
  "10101010101010000011000010100101110001110",
  "11001100111010111011110001010001101001111",
  "00100110100100010000110001101110001101011",
  "10011101000100001111111000110110100101000",
  "00111110110100000110110101100110001000001",
  "01111000001101000111011101101100000100010",
  "10101011111000000001010000101001000100100",
  "10011101010011101010111101000000101001110",
  "11101010011000101110001011001110001010011",
  "01101101010100101100010100011101111100010",
  "10011110011110001010010101000010101001101",
  "00100100011110111110110001100110001100001",
  "10000111110110000111000011100011100011100",
  "00001001111111000000010001110011100000110",
  "00100010011101100001011101100110001100101",
  "00001100000111101111000001101111000100011",
  "00001111000111101000010110001010111010011",
  "11000000001100010101010101010101110101000",
  "11111111111101000111111000101111000100001",
  "01111100000001111010010101000010101001101",
  "10011111110000101010100010100010101101101",
  "00010100000100010110111100111100000100010",
  "10101010001101000010111101000011111111110",
  "00000000111001100110001001100010100011010",
  "11111110111011100111100000000010101010110",
  "10000010001001010010110111110001100011111",
  "10111010000010100110011001100110111111001",
  "10111010111110101111111000101110011011000",
  "10111010000011001110011101001110110111011",
  "10000010111011010101010101010100100101010",
  "11111110111100101111010100101111110010010",
] as const;

export const BANK_QR_MATRIX: QrMatrixData = {
  size: BANK_QR_ROWS.length,
  modules: BANK_QR_ROWS.map((row) => [...row].map((module) => module === "1")),
};
