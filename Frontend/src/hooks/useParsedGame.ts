import { useMemo } from "react";
import { Chess, type Move } from "chess.js";

export type MovePair = {
  number: number;
  white: string;
  whiteIdx: number;
  black?: string;
  blackIdx?: number;
};

export type ParsedGame = {
  fens: string[];
  parsedMoves: MovePair[];
  parseError: boolean;
  moveHistory: Move[];
};

/**
 * Parses a PGN string into FEN history, move pairs, and verbose move history.
 * Handles PGN comments/annotations via a fallback strip pass if the first parse fails.
 */
export function useParsedGame(pgn: string): ParsedGame {
  return useMemo(() => {
    const chess = new Chess();
    let moves: Move[] = [];
    let failedToParse = false;

    if (pgn) {
      const cleanPgn = pgn.replace(/\r\n/g, "\n").trim();
      try {
        chess.loadPgn(cleanPgn);
        moves = chess.history({ verbose: true });
      } catch {
        try {
          const stripped = cleanPgn.replace(/\{[^}]*\}/g, "").trim();
          chess.loadPgn(stripped);
          moves = chess.history({ verbose: true });
        } catch {
          failedToParse = true;
        }
      }
    }

    const initialFen = new Chess().fen();
    const fenList: string[] = [initialFen];

    if (!failedToParse && moves.length > 0) {
      const steppingChess = new Chess();
      try {
        const headerFen = chess.getHeaders()?.FEN;
        if (headerFen) {
          steppingChess.load(headerFen);
          fenList[0] = steppingChess.fen();
        }
      } catch {
        // Default start position
      }

      moves.forEach((move) => {
        try {
          steppingChess.move({ from: move.from, to: move.to, promotion: move.promotion });
          fenList.push(steppingChess.fen());
        } catch {
          try {
            steppingChess.move(move.san);
            fenList.push(steppingChess.fen());
          } catch {
            // Keep previous position if replay fails
          }
        }
      });
    }

    // Group moves into pairs (1. e4 e5, 2. Nf3 Nc6, etc.)
    const pairs: MovePair[] = [];
    for (let i = 0; i < moves.length; i += 2) {
      pairs.push({
        number: Math.floor(i / 2) + 1,
        white: moves[i].san,
        whiteIdx: i + 1,
        black: moves[i + 1]?.san,
        blackIdx: moves[i + 1] ? i + 2 : undefined,
      });
    }

    return {
      fens: fenList,
      parsedMoves: pairs,
      parseError: failedToParse,
      moveHistory: moves,
    };
  }, [pgn]);
}
