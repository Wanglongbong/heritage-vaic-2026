export type QrMatrixData = {
  size: number;
  modules: boolean[][];
};

export type QrVisualRole = "protected" | "canopy" | "train" | "landscape";
export type QrFinderId = "north-west" | "north-east" | "south-west";
export type QrGardenId = QrFinderId | "alignment";

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
  const inBottomRightAlignment = isBottomRightAlignmentModule(row, column, size);
  const fixedDarkModule = row === size - 8 && column === 8;
  return inTopLeftFinder || inTopRightFinder || inBottomLeftFinder || onTimingPattern || inBottomRightAlignment || fixedDarkModule;
}

export function isBottomRightAlignmentModule(row: number, column: number, size: number) {
  const alignmentCentre = size - 7;
  return Math.abs(row - alignmentCentre) <= 2 && Math.abs(column - alignmentCentre) <= 2;
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

export const BANK_QR_ACCOUNT = "513244";
export const BANK_QR_PAYLOAD = "00020101021138500010A0000007270120000697042201065132440208QRIBFTTA53037045802VN630447FB";

/**
 * VietQR for MB Bank account 513244, generated at error-correction level Q.
 * The deterministic 37 × 37 grid lets the 3D scene remain decorative while
 * every visible module still represents the real payment payload.
 */
export const BANK_QR_ROWS = [
  "1111111010010100101000100001001111111",
  "1000001010000001000111000101101000001",
  "1011101011111110001011110011101011101",
  "1011101010100000101011001101001011101",
  "1011101010001111100000000110101011101",
  "1000001000100010011111010011001000001",
  "1111111010101010101010101010101111111",
  "0000000011101001011101000001000000000",
  "0110101101001011100110001000001011111",
  "0011000110000101110000111101000101011",
  "1110011101100001100001100010000110101",
  "1111110101111010010011001101011000101",
  "0010111101010100110110110000001010000",
  "1011010010101110010001010111001011011",
  "0001111000001001000010101011001000101",
  "0000110000000100100001100100010111010",
  "0011101010101001110100110100101010101",
  "1011010000110000111111110101000100110",
  "0100111111111100000110000010101011101",
  "0001010000010100010101010011110100000",
  "1000111010011010100010100011000011011",
  "1010000110101110101111001111011101100",
  "1001101100000001011111100010111011001",
  "1000110111001010100011010111011000000",
  "1111101011100111000010101011101001101",
  "0110000000100001001011011111110111001",
  "1001111001011000111111101011111010001",
  "0110100111010110001000110110110100110",
  "1011011110110000101000001011111110000",
  "0000000011010001111110011001100011010",
  "1111111011101100100111001111101011001",
  "1000001001111101010010010000100011010",
  "1011101010010010110000001010111110001",
  "1011101000110011010100011101001111010",
  "1011101010101111110000011111111000101",
  "1000001011100110010101001011110001000",
  "1111111001111001110000110111111001001",
] as const;

export const BANK_QR_MATRIX: QrMatrixData = {
  size: BANK_QR_ROWS.length,
  modules: BANK_QR_ROWS.map((row) => [...row].map((module) => module === "1")),
};
