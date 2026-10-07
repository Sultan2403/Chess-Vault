/**
 * Stockfish UCI protocol parser and winning chance utilities.
 */

export type StockfishParsedEval = {
  depth: number;
  cp: number | null;
  mate: number | null;
  displayScore: string;
};

/**
 * Standard winning chances formula (used by Lichess and modern engines).
 * Maps centipawns or mate to a winning percentage from White's perspective (0% - 100%).
 * 50% = equal position.
 */
export function getWhiteWinPercentage(cp: number | null, mate: number | null): number {
  if (mate !== null) {
    if (mate > 0) return 100;
    if (mate < 0) return 0;
    return 50;
  }
  if (cp === null) return 50;

  // Clamped logistic curve
  const clampedCp = Math.max(-1000, Math.min(1000, cp));
  const winPct = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * clampedCp)) - 1);
  return Math.max(0, Math.min(100, winPct));
}

/**
 * Parses a single UCI output line from Stockfish.
 *
 * In UCI, the engine reports scores from the perspective of the side to move.
 * For the evaluation bar, we normalize everything relative to White:
 * - If side to move is Black, we invert the sign.
 */
export function parseUciInfoLine(line: string, sideToMove: "w" | "b"): StockfishParsedEval | null {
  if (!line.startsWith("info") || !line.includes("score")) {
    return null;
  }

  const depthMatch = line.match(/\bdepth (\d+)\b/);
  const cpMatch = line.match(/\bscore cp (-?\d+)\b/);
  const mateMatch = line.match(/\bscore mate (-?\d+)\b/);

  if (!cpMatch && !mateMatch) {
    return null;
  }

  const depth = depthMatch ? parseInt(depthMatch[1], 10) : 0;
  const multiplier = sideToMove === "b" ? -1 : 1;

  let cp: number | null = null;
  let mate: number | null = null;
  let displayScore = "0.0";

  if (mateMatch) {
    const rawMate = parseInt(mateMatch[1], 10);
    mate = rawMate * multiplier;
    displayScore = mate > 0 ? `+M${mate}` : `-M${Math.abs(mate)}`;
  } else if (cpMatch) {
    const rawCp = parseInt(cpMatch[1], 10);
    cp = rawCp * multiplier;
    const val = (cp / 100).toFixed(1);
    displayScore = cp > 0 ? `+${val}` : `${val}`;
  }

  return {
    depth,
    cp,
    mate,
    displayScore,
  };
}
