export const PlayerColors = ["white", "black"] as const;
export type PlayerColorType = (typeof PlayerColors)[number];

export const Results = ["white", "black", "draw"] as const;
export type ResultType = (typeof Results)[number];

export const TerminationValuesMap = {
  resignation: "resignation",
  abandonment: "abandonment",
  insufficient_material: "insufficient-material",
  fifty_move_rule: "50-move-rule",
  timeout: "timeout",
  agreement: "agreement",
  aborted: "aborted",
  repetition: "repetition",
  stalemate: "stalemate",
  checkmate: "checkmate",
  unknown: "unknown",
  timeout_vs_insufficient_material: "timeout-vs-insufficient-material",
} as const;

export const TerminationValues = Object.values(TerminationValuesMap);

export type TerminationValuesType = (typeof TerminationValues)[number];

export const TimeClasses = [
  "ultra-bullet",
  "bullet",
  "blitz",
  "rapid",
  "classical",
  "daily",
] as const;

export type TimeClassType = (typeof TimeClasses)[number];

export const MAX_GAMES_PER_USER = 1000;

export const LichessTerminationValuesMap = {
  checkmate: "mate",
  resignation: "resign",
  timeout: "outoftime",
  stalemate: "stalemate",
  repetition: "threefoldRepetition",
  fifty_move_rule: "fiftyMoves",
  insufficient_material: "insufficientMaterial",
  draw: "draw",
  aborted: "aborted",
  no_start: "noStart",
} as const;

export const LichessTerminationValues = Object.values(
  LichessTerminationValuesMap,
);

export type LichessTerminationValuesType =
  (typeof LichessTerminationValues)[number];

export const ChessComTerminationValuesMap = {
  checkmate: "checkmated",
  agreement: "agreed",
  repetiton: "repetition",
  timeout: "timeout",
  resignation: "resigned",
  stalemate: "stalemate",
  insufficient_material: "insufficient",
  fifty_move_rule: "50move",
  abandonment: "abandoned",
  timeout_vs_insufficient_material: "timevsinsufficient",
} as const;

export const ChessComTerminationValues = Object.values(
  ChessComTerminationValuesMap,
);

export type ChessComTerminationValuesType =
  (typeof ChessComTerminationValues)[number];
