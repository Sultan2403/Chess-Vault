import { useMemo, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Pause,
  ArrowLeft,
} from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { mockGames } from "../data/mock-games";
import { useGame } from "../hooks/useGames";

export default function GameViewer() {
  const { id } = useParams<{ id: string }>();

  // 1. Fetch from TanStack Query (with instant fallback to mock / cache)
  const { data } = useGame(id || "game-1");
  const fallbackGame = mockGames.find((g) => g.id === id) || mockGames[0];
  const currentGame = data?.game || fallbackGame;

  // 2. Load chess moves & positions history
  const { fens, parsedMoves } = useMemo(() => {
    const chess = new Chess();

    try {
      if (currentGame.pgn) {
        chess.loadPgn(currentGame.pgn);
      }
    } catch {
      // Fallback standard sample moves
      chess.loadPgn("1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6");
    }

    const moveHistory = chess.history({ verbose: true });
    const fenList: string[] = ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"];

    const steppingChess = new Chess();
    moveHistory.forEach((move) => {
      steppingChess.move(move.san);
      fenList.push(steppingChess.fen());
    });

    // Group into paired moves for the ledger (1. e4 c6)
    const pairs: Array<{ number: number; white: string; black?: string; whiteIdx: number; blackIdx?: number }> = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      pairs.push({
        number: Math.floor(i / 2) + 1,
        white: moveHistory[i].san,
        whiteIdx: i + 1,
        black: moveHistory[i + 1]?.san,
        blackIdx: moveHistory[i + 1] ? i + 2 : undefined,
      });
    }

    return { history: moveHistory, fens: fenList, parsedMoves: pairs };
  }, [currentGame.pgn]);

  // Current move index (0 = starting position, 1 = after 1st move, etc.)
  const [currentMoveIdx, setCurrentMoveIdx] = useState(fens.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);

  const goToMove = (idx: number) => {
    const target = Math.max(0, Math.min(idx, fens.length - 1));
    setCurrentMoveIdx(target);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-content px-6 py-10">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-vault-text-secondary hover:text-vault-primary transition-colors"
          >
            <ArrowLeft size={14} /> Back to Library
          </Link>
        </div>

        {/* 2-Column Editorial Study Grid matching Screenshot 3 */}
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          {/* Left Column: Tactile Chessboard & Navigation Controls */}
          <div>
            <div className="rounded-vault border border-vault-outline-variant/80 bg-[#f7f3ea] p-4 shadow-sm">
              <div className="aspect-square w-full overflow-hidden border border-[#5c3e21]/40 rounded-xs shadow-inner">
                <Chessboard
                  position={fens[currentMoveIdx] || "start"}
                  arePiecesDraggable={false}
                  customBoardStyle={{
                    borderRadius: "2px",
                  }}
                  customDarkSquareStyle={{ backgroundColor: "#8c5a2b" }}
                  customLightSquareStyle={{ backgroundColor: "#f0d9b5" }}
                />
              </div>
            </div>

            {/* Media Player Controls (Screenshot 3) */}
            <div className="mt-6 flex items-center justify-center gap-3 rounded-vault border border-vault-outline-variant/60 bg-[#f5efe4] p-3 shadow-xs max-w-sm mx-auto">
              <button
                onClick={() => goToMove(0)}
                disabled={currentMoveIdx === 0}
                className="grid h-9 w-9 place-items-center rounded-vault text-vault-primary hover:bg-black/5 disabled:opacity-30 transition-colors"
                aria-label="First move"
              >
                <ChevronsLeft size={18} />
              </button>
              <button
                onClick={() => goToMove(currentMoveIdx - 1)}
                disabled={currentMoveIdx === 0}
                className="grid h-9 w-9 place-items-center rounded-vault text-vault-primary hover:bg-black/5 disabled:opacity-30 transition-colors"
                aria-label="Previous move"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="grid h-10 w-10 place-items-center rounded-vault bg-vault-ochre text-white shadow-xs hover:bg-vault-ochre-hover transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
              </button>
              <button
                onClick={() => goToMove(currentMoveIdx + 1)}
                disabled={currentMoveIdx === fens.length - 1}
                className="grid h-9 w-9 place-items-center rounded-vault text-vault-primary hover:bg-black/5 disabled:opacity-30 transition-colors"
                aria-label="Next move"
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => goToMove(fens.length - 1)}
                disabled={currentMoveIdx === fens.length - 1}
                className="grid h-9 w-9 place-items-center rounded-vault text-vault-primary hover:bg-black/5 disabled:opacity-30 transition-colors"
                aria-label="Last move"
              >
                <ChevronsRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Column: Game Metadata Card, Move Ledger, and Archival Notes (Screenshot 3) */}
          <div className="space-y-6">
            {/* 1. Header & Player Card */}
            <article className="rounded-vault border border-vault-outline-variant/60 bg-[#f7f3ea] p-6 shadow-xs">
              <p className="text-[11px] font-medium tracking-wide text-vault-text-secondary">
                October 24, 2023 • <span className="capitalize">{currentGame.platform}</span>
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-vault-primary">
                {currentGame.title || "Caro-Kann Defense: Advance Variation"}
              </h1>

              <div className="mt-6 space-y-3">
                {/* White Player */}
                <div className="flex items-center justify-between border-b border-vault-outline-variant/40 pb-2.5">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 border border-vault-primary bg-white rounded-xs" />
                    <span className="text-sm font-bold text-vault-primary">
                      {currentGame.whitePlayer.username}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-vault-text-secondary font-medium">
                    {currentGame.whitePlayer.rating}
                  </span>
                </div>

                {/* Black Player */}
                <div className="flex items-center justify-between border-b border-vault-outline-variant/40 pb-2.5">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 bg-vault-primary rounded-xs" />
                    <span className="text-sm font-bold text-vault-primary">
                      {currentGame.blackPlayer.username}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-vault-text-secondary font-medium">
                    {currentGame.blackPlayer.rating}
                  </span>
                </div>
              </div>

              {/* Result Summary */}
              <div className="mt-6 flex items-center justify-between pt-2">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-vault-text-secondary">
                  Result
                </span>
                <span className="font-display text-sm font-bold text-[#8c6b2d]">
                  1-0 (Resignation)
                </span>
              </div>
            </article>

            {/* 2. Move Ledger Card */}
            <article className="rounded-vault border border-vault-outline-variant/60 bg-white/80 p-6 shadow-xs">
              <h2 className="font-display text-base font-bold text-vault-primary border-b border-vault-outline-variant/60 pb-3">
                Move Ledger
              </h2>
              <div className="mt-4 max-h-52 overflow-y-auto space-y-1 pr-2 font-mono text-xs">
                {parsedMoves.map((row) => (
                  <div key={row.number} className="grid grid-cols-[36px_1fr_1fr] items-center py-1 px-2 rounded-xs">
                    <span className="text-vault-text-secondary">{row.number}.</span>
                    <button
                      onClick={() => goToMove(row.whiteIdx)}
                      className={`text-left font-medium px-2 py-0.5 rounded-xs transition-colors ${
                        currentMoveIdx === row.whiteIdx
                          ? "bg-[#f5efe4] text-[#8c6b2d] font-bold"
                          : "text-vault-primary hover:bg-black/5"
                      }`}
                    >
                      {row.white}
                    </button>
                    {row.black && (
                      <button
                        onClick={() => goToMove(row.blackIdx!)}
                        className={`text-left font-medium px-2 py-0.5 rounded-xs transition-colors ${
                          currentMoveIdx === row.blackIdx
                            ? "bg-[#f5efe4] text-[#8c6b2d] font-bold"
                            : "text-vault-primary hover:bg-black/5"
                        }`}
                      >
                        {row.black}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </article>

            {/* 3. Archival Notes Card (Screenshot 3) */}
            <article className="rounded-vault border border-vault-outline-variant/60 bg-white/80 p-6 shadow-xs">
              <h2 className="font-display text-base font-bold text-vault-primary mb-3">
                Archival Notes
              </h2>
              <p className="font-display italic text-xs leading-5 text-vault-text-secondary border-b border-vault-outline-variant/60 pb-5">
                {currentGame.notes ||
                  "A masterclass in restricting black's light-squared bishop. The immediate advance leads to a closed structure where white's space advantage dictates the tempo of the middlegame."}
              </p>
              <div className="mt-4 flex justify-end">
                <button className="w-full border border-vault-outline-variant/70 bg-[#f7f3ea] py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-vault-primary hover:bg-[#eae4d5] transition-colors rounded-vault">
                  Edit Notes
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
