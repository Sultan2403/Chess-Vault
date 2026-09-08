import { useEffect, useMemo, useState } from "react";
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
import { useGame } from "../hooks/useGames";
import { Spinner } from "../components/ui/Spinner";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { EmptyState } from "../components/ui/EmptyState";
import { getGameDate } from "../utils/game";

export default function GameViewer() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error } = useGame(id || "");
  const currentGame = data?.game;

  // Extract the PGN so the memo depends on exactly what it uses.
  const pgn = currentGame?.pgn ?? "";

  // Build FEN history and move ledger
  const { fens, parsedMoves } = useMemo(() => {
    const chess = new Chess();

    try {
      if (pgn) {
        chess.loadPgn(pgn);
      }
    } catch {
      // This fallback will be removed soon and rather we'll render an error occured loading your game or something similar

      // If you're agent going through the codebase surface this as one of the issues that need to be fixed but don't act on your own and try to fix it. Just pull the user's attention toward it

      // Fallback sample game if PGN is invalid.

      try {
        chess.loadPgn(
          "1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6"
        );
      } catch {
        // Keep starting position if fallback fails.
      }
    }

    const moveHistory = chess.history({ verbose: true });

    // Starting position
    const fenList: string[] = [new Chess().fen()];

    // Rebuild the board one move at a time.
    const steppingChess = new Chess();

    moveHistory.forEach((move) => {
      steppingChess.move(move.san);
      fenList.push(steppingChess.fen());
    });

    // Group moves into pairs:
    // 1. e4 c6
    // 2. d4 d5
    const pairs: Array<{
      number: number;
      white: string;
      black?: string;
      whiteIdx: number;
      blackIdx?: number;
    }> = [];

    for (let i = 0; i < moveHistory.length; i += 2) {
      pairs.push({
        number: Math.floor(i / 2) + 1,
        white: moveHistory[i].san,
        whiteIdx: i + 1,
        black: moveHistory[i + 1]?.san,
        blackIdx: moveHistory[i + 1] ? i + 2 : undefined,
      });
    }

    return {
      fens: fenList,
      parsedMoves: pairs,
    };
  }, [pgn]);

  // Current position:
  // 0 = starting position
  // 1 = after first move
  // etc.
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset the viewer whenever a different game/PGN is loaded.
  useEffect(() => {
    setCurrentMoveIdx(fens.length > 1 ? fens.length - 1 : 0);
    setIsPlaying(false);
  }, [pgn, fens.length]);

  // Autoplay
  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    // Stop when we reach the final position.
    if (currentMoveIdx >= fens.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setCurrentMoveIdx((previous) =>
        Math.min(previous + 1, fens.length - 1)
      );
    }, 800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isPlaying, currentMoveIdx, fens.length]);

  const goToMove = (idx: number) => {
    const target = Math.max(
      0,
      Math.min(idx, fens.length - 1)
    );

    setCurrentMoveIdx(target);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    // If we're already at the end, start from the beginning.
    if (currentMoveIdx >= fens.length - 1) {
      setCurrentMoveIdx(0);
    }

    setIsPlaying((previous) => !previous);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-content px-6 py-10">
        {isLoading ? (
          <div className="py-20">
            <Spinner />
          </div>
        ) : isError ? (
          <ErrorBanner
            message={
              (error as Error)?.message ??
              "Unable to load game."
            }
          />
        ) : !currentGame ? (
          <EmptyState
            title="Game not found"
            description="We couldn't find that game. It may have been deleted or never imported."
            action={
              <Link to="/library">
                Back to Library
              </Link>
            }
          />
        ) : (
          <div>
            {/* Back navigation */}
            <div className="mb-6">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-vault-text-secondary hover:text-vault-primary transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Library
              </Link>
            </div>

            {/* Main 2-column layout */}
            <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">

              {/* LEFT COLUMN */}
              <div>
                {/* Chessboard */}
                <div className="rounded-vault border border-vault-outline-variant/80 bg-[#f7f3ea] p-4 shadow-sm">
                  <div className="aspect-square w-full overflow-hidden rounded-xs border border-[#5c3e21]/40 shadow-inner">
                    <Chessboard
                      options={{
                        position: fens[currentMoveIdx] ?? "start",
                        allowDragging: false,
                        animationDurationInMs: 220,
                        boardStyle: {
                          borderRadius: "2px",
                        },
                        darkSquareStyle: {
                          backgroundColor: "#8c5a2b",
                        },
                        lightSquareStyle: {
                          backgroundColor: "#f0d9b5",
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Navigation controls */}
                <div className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-3 rounded-vault border border-vault-outline-variant/60 bg-[#f5efe4] p-3 shadow-xs">
                  {/* First */}
                  <button
                    type="button"
                    onClick={() => goToMove(0)}
                    disabled={currentMoveIdx === 0}
                    className="grid h-9 w-9 place-items-center rounded-vault text-vault-primary transition-colors hover:bg-black/5 disabled:opacity-30"
                    aria-label="First move"
                  >
                    <ChevronsLeft size={18} />
                  </button>

                  {/* Previous */}
                  <button
                    type="button"
                    onClick={() =>
                      goToMove(currentMoveIdx - 1)
                    }
                    disabled={currentMoveIdx === 0}
                    className="grid h-9 w-9 place-items-center rounded-vault text-vault-primary transition-colors hover:bg-black/5 disabled:opacity-30"
                    aria-label="Previous move"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {/* Play / Pause */}
                  <button
                    type="button"
                    onClick={handlePlayPause}
                    className="grid h-10 w-10 place-items-center rounded-vault bg-vault-ochre text-white shadow-xs transition-colors hover:bg-vault-ochre-hover"
                    aria-label={
                      isPlaying ? "Pause" : "Play"
                    }
                  >
                    {isPlaying ? (
                      <Pause size={18} />
                    ) : (
                      <Play
                        size={18}
                        className="translate-x-0.5"
                      />
                    )}
                  </button>

                  {/* Next */}
                  <button
                    type="button"
                    onClick={() =>
                      goToMove(currentMoveIdx + 1)
                    }
                    disabled={
                      currentMoveIdx >=
                      fens.length - 1
                    }
                    className="grid h-9 w-9 place-items-center rounded-vault text-vault-primary transition-colors hover:bg-black/5 disabled:opacity-30"
                    aria-label="Next move"
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Last */}
                  <button
                    type="button"
                    onClick={() =>
                      goToMove(fens.length - 1)
                    }
                    disabled={
                      currentMoveIdx >=
                      fens.length - 1
                    }
                    className="grid h-9 w-9 place-items-center rounded-vault text-vault-primary transition-colors hover:bg-black/5 disabled:opacity-30"
                    aria-label="Last move"
                  >
                    <ChevronsRight size={18} />
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">

                {/* Game metadata */}
                <article className="rounded-vault border border-vault-outline-variant/60 bg-[#f7f3ea] p-6 shadow-xs">
                  <p className="text-[11px] font-medium tracking-wide text-vault-text-secondary">
                    {getGameDate(currentGame)} •{" "}
                    <span className="capitalize">
                      {currentGame.platform}
                    </span>
                  </p>

                  <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-vault-primary">
                    {currentGame.title ||
                      "Caro-Kann Defense: Advance Variation"}
                  </h1>

                  <div className="mt-6 space-y-3">

                    {/* White player */}
                    <div className="flex items-center justify-between border-b border-vault-outline-variant/40 pb-2.5">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-xs border border-vault-primary bg-white" />

                        <span className="text-sm font-bold text-vault-primary">
                          {currentGame.whitePlayer.username}
                        </span>
                      </div>

                      <span className="font-mono text-xs font-medium text-vault-text-secondary">
                        {currentGame.whitePlayer.rating}
                      </span>
                    </div>

                    {/* Black player */}
                    <div className="flex items-center justify-between border-b border-vault-outline-variant/40 pb-2.5">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-xs bg-vault-primary" />

                        <span className="text-sm font-bold text-vault-primary">
                          {currentGame.blackPlayer.username}
                        </span>
                      </div>

                      <span className="font-mono text-xs font-medium text-vault-text-secondary">
                        {currentGame.blackPlayer.rating}
                      </span>
                    </div>
                  </div>

                  {/* Result */}
                  <div className="mt-6 flex items-center justify-between pt-2">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-vault-text-secondary">
                      Result
                    </span>

                    <span className="font-display text-sm font-bold text-[#8c6b2d]">
                      {currentGame.result ||
                        "1-0 (Resignation)"}
                    </span>
                  </div>
                </article>

                {/* Move ledger */}
                <article className="rounded-vault border border-vault-outline-variant/60 bg-white/80 p-6 shadow-xs">
                  <h2 className="border-b border-vault-outline-variant/60 pb-3 font-display text-base font-bold text-vault-primary">
                    Move Ledger
                  </h2>

                  <div className="mt-4 max-h-52 space-y-1 overflow-y-auto pr-2 font-mono text-xs">
                    {parsedMoves.map((row) => (
                      <div
                        key={row.number}
                        className="grid grid-cols-[36px_1fr_1fr] items-center rounded-xs px-2 py-1"
                      >
                        <span className="text-vault-text-secondary">
                          {row.number}.
                        </span>

                        {/* White move */}
                        <button
                          type="button"
                          onClick={() =>
                            goToMove(row.whiteIdx)
                          }
                          className={`rounded-xs px-2 py-0.5 text-left font-medium transition-colors ${
                            currentMoveIdx ===
                            row.whiteIdx
                              ? "bg-[#f5efe4] font-bold text-[#8c6b2d]"
                              : "text-vault-primary hover:bg-black/5"
                          }`}
                        >
                          {row.white}
                        </button>

                        {/* Black move */}
                        {row.black && (
                          <button
                            type="button"
                            onClick={() =>
                              goToMove(row.blackIdx!)
                            }
                            className={`rounded-xs px-2 py-0.5 text-left font-medium transition-colors ${
                              currentMoveIdx ===
                              row.blackIdx
                                ? "bg-[#f5efe4] font-bold text-[#8c6b2d]"
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

                {/* Archival notes */}
                <article className="rounded-vault border border-vault-outline-variant/60 bg-white/80 p-6 shadow-xs">
                  <h2 className="mb-3 font-display text-base font-bold text-vault-primary">
                    Archival Notes
                  </h2>

                  <p className="border-b border-vault-outline-variant/60 pb-5 font-display text-xs italic leading-5 text-vault-text-secondary">
                    {currentGame.notes ||
                      "A masterclass in restricting black's light-squared bishop. The immediate advance leads to a closed structure where white's space advantage dictates the tempo of the middlegame."}
                  </p>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="w-full rounded-vault border border-vault-outline-variant/70 bg-[#f7f3ea] py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-vault-primary transition-colors hover:bg-[#eae4d5]"
                    >
                      Edit Notes
                    </button>
                  </div>
                </article>

              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
