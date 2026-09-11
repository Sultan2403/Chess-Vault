import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Chess, type Move } from "chess.js";
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
  RotateCw,
  Gauge,
  Keyboard,
} from "lucide-react";

import { AppShell } from "../components/layout/AppShell";
import { useGame } from "../hooks/useGames";
import { usePlatformUsernames } from "../hooks/useAccount";
import { Spinner } from "../components/ui/Spinner";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { EmptyState } from "../components/ui/EmptyState";
import { getGameDate, getPlayerPerspective } from "../utils/game";

const PLAYBACK_SPEEDS = [
  { label: "0.5x", ms: 1500 },
  { label: "1x", ms: 800 },
  { label: "1.5x", ms: 500 },
  { label: "2x", ms: 300 },
];

export default function GameViewer() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error } = useGame(id || "");
  const currentGame = data?.game;
  const platformUsernames = usePlatformUsernames();

  // Extract the PGN
  const rawPgn = currentGame?.pgn ?? "";

  // Build FEN history, move ledger, and error state
  const { fens, parsedMoves, parseError } = useMemo(() => {
    const chess = new Chess();
    let moveHistory: Move[] = [];
    let failedToParse = false;

    if (rawPgn) {
      // 1. Normalize line endings and trim
      const cleanPgn = rawPgn.replace(/\r\n/g, "\n").trim();

      try {
        chess.loadPgn(cleanPgn);
        moveHistory = chess.history({ verbose: true });
      } catch {
        // 2. Try stripping comments/annotations if standard load fails
        try {
          const stripped = cleanPgn.replace(/\{[^}]*\}/g, "").trim();
          chess.loadPgn(stripped);
          moveHistory = chess.history({ verbose: true });
        } catch {
          failedToParse = true;
        }
      }
    }

    // Determine initial FEN (support custom starting positions if set in headers)
    const initialFen = new Chess().fen();
    const fenList: string[] = [initialFen];

    if (!failedToParse && moveHistory.length > 0) {
      const steppingChess = new Chess();
      try {
        const headerFen = chess.getHeaders()?.FEN;
        if (headerFen) {
          steppingChess.load(headerFen);
          fenList[0] = steppingChess.fen();
        }
      } catch {
        // Fall back to default start position
      }

      moveHistory.forEach((move) => {
        try {
          steppingChess.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion,
          });
          fenList.push(steppingChess.fen());
        } catch {
          // If verbose move fails, try san
          try {
            steppingChess.move(move.san);
            fenList.push(steppingChess.fen());
          } catch {
            // Keep current position if move cannot be replayed
          }
        }
      });
    }

    // Group moves into pairs (1. e4 c6, 2. d4 d5, ...)
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
      parseError: failedToParse,
    };
  }, [rawPgn]);

  // Current move index:
  // 0 = starting position, 1 = after first move, etc.
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1); // Default to 1x (800ms)
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Active move ref for scrolling move ledger
  const activeMoveButtonRef = useRef<HTMLButtonElement | null>(null);

  // Auto-detect player orientation from connected platform usernames
  useEffect(() => {
    if (currentGame) {
      const perspective = getPlayerPerspective(currentGame, platformUsernames);
      setBoardOrientation(perspective.playerColor);
    }
  }, [currentGame, platformUsernames]);

  // Reset viewer to final position whenever a game is loaded
  useEffect(() => {
    setCurrentMoveIdx(fens.length > 1 ? fens.length - 1 : 0);
    setIsPlaying(false);
  }, [rawPgn, fens.length]);

  // Scroll active move in Move Ledger into view
  useEffect(() => {
    if (activeMoveButtonRef.current) {
      activeMoveButtonRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [currentMoveIdx]);

  // Navigate to specific move
  const goToMove = useCallback((idx: number) => {
    const target = Math.max(0, Math.min(idx, fens.length - 1));
    setCurrentMoveIdx(target);
    setIsPlaying(false);
  }, [fens.length]);

  // Handle Play/Pause
  const handlePlayPause = useCallback(() => {
    if (currentMoveIdx >= fens.length - 1) {
      setCurrentMoveIdx(0);
    }
    setIsPlaying((prev) => !prev);
  }, [currentMoveIdx, fens.length]);

  // Toggle board orientation
  const handleFlipBoard = useCallback(() => {
    setBoardOrientation((prev) => (prev === "white" ? "black" : "white"));
  }, []);

  // Cycle playback speed
  const handleCycleSpeed = useCallback(() => {
    setSpeedIndex((prev) => (prev + 1) % PLAYBACK_SPEEDS.length);
  }, []);

  // Autoplay loop
  useEffect(() => {
    if (!isPlaying) return;

    if (currentMoveIdx >= fens.length - 1) {
      setIsPlaying(false);
      return;
    }

    const interval = PLAYBACK_SPEEDS[speedIndex].ms;
    const timer = window.setTimeout(() => {
      setCurrentMoveIdx((prev) => {
        if (prev >= fens.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, interval);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isPlaying, currentMoveIdx, fens.length, speedIndex]);

  // Keyboard navigation support (Arrow keys, Spacebar, Flip)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA" ||
          e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
        case "h":
          e.preventDefault();
          goToMove(currentMoveIdx - 1);
          break;
        case "ArrowRight":
        case "l":
          e.preventDefault();
          goToMove(currentMoveIdx + 1);
          break;
        case "ArrowUp":
        case "Home":
          e.preventDefault();
          goToMove(0);
          break;
        case "ArrowDown":
        case "End":
          e.preventDefault();
          goToMove(fens.length - 1);
          break;
        case " ":
          e.preventDefault();
          handlePlayPause();
          break;
        case "f":
        case "F":
          e.preventDefault();
          handleFlipBoard();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentMoveIdx, fens.length, goToMove, handlePlayPause, handleFlipBoard]);

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
              <Link to="/library" className="inline-flex items-center gap-2 rounded-vault bg-vault-ochre px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-vault-ochre-hover">
                Back to Library
              </Link>
            }
          />
        ) : (
          <div>
            {/* Back navigation & Quick Actions */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <Link
                to="/library"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-vault-text-secondary hover:text-vault-primary transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Library
              </Link>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowShortcuts((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-vault border border-vault-outline-variant/60 bg-[#f7f3ea] px-2.5 py-1 text-xs font-medium text-vault-text-secondary hover:text-vault-primary transition-colors cursor-pointer"
                  title="Keyboard shortcuts"
                >
                  <Keyboard size={13} />
                  <span className="text-[11px]">Shortcuts</span>
                </button>
              </div>
            </div>

            {/* Keyboard shortcuts popup banner */}
            {showShortcuts && (
              <div className="mb-6 rounded-vault border border-vault-outline-variant/80 bg-[#f5efe4] p-4 text-xs shadow-xs transition-all">
                <div className="flex items-center justify-between pb-2 border-b border-vault-outline-variant/60">
                  <span className="font-bold text-vault-primary flex items-center gap-2">
                    <Keyboard size={14} /> Keyboard Navigation Controls
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowShortcuts(false)}
                    className="text-vault-text-secondary hover:text-vault-primary font-bold text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-vault-primary">
                  <div><kbd className="rounded border bg-white px-1.5 py-0.5 text-xs shadow-xs">←</kbd> Previous Move</div>
                  <div><kbd className="rounded border bg-white px-1.5 py-0.5 text-xs shadow-xs">→</kbd> Next Move</div>
                  <div><kbd className="rounded border bg-white px-1.5 py-0.5 text-xs shadow-xs">↑</kbd> First Move</div>
                  <div><kbd className="rounded border bg-white px-1.5 py-0.5 text-xs shadow-xs">↓</kbd> Last Move</div>
                  <div><kbd className="rounded border bg-white px-1.5 py-0.5 text-xs shadow-xs">Space</kbd> Play / Pause</div>
                  <div><kbd className="rounded border bg-white px-1.5 py-0.5 text-xs shadow-xs">F</kbd> Flip Board</div>
                </div>
              </div>
            )}

            {/* Parse Warning Banner if PGN was corrupted */}
            {parseError && (
              <div className="mb-6 rounded-vault border border-amber-300 bg-amber-50 p-4 text-xs text-amber-800 shadow-xs">
                <strong>Notice:</strong> This game&apos;s PGN data could not be fully parsed into move notation. The starting position is displayed.
              </div>
            )}

            {/* Main 2-column layout */}
            <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">

              {/* LEFT COLUMN: Chessboard and Controls */}
              <div>
                {/* Chessboard Container */}
                <div className="rounded-vault border border-vault-outline-variant/80 bg-[#f7f3ea] p-4 shadow-sm">
                  <div className="aspect-square w-full overflow-hidden rounded-xs border border-[#5c3e21]/40 shadow-inner">
                    <Chessboard
                      options={{
                        position: fens[currentMoveIdx] || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
                        boardOrientation: boardOrientation,
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

                {/* Move Progress Scrubber */}
                <div className="mt-4 px-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-vault-text-secondary mb-1">
                    <span>Move {Math.floor(currentMoveIdx / 2)} / {Math.floor((fens.length - 1) / 2)}</span>
                    <span className="capitalize">{boardOrientation} perspective</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, fens.length - 1)}
                    value={currentMoveIdx}
                    onChange={(e) => goToMove(Number(e.target.value))}
                    className="w-full cursor-pointer accent-vault-ochre"
                  />
                </div>

                {/* Navigation controls */}
                <div className="mx-auto mt-4 flex flex-wrap max-w-md items-center justify-between gap-2 rounded-vault border border-vault-outline-variant/60 bg-[#f5efe4] p-3 shadow-xs">
                  {/* Move Stepping Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* First */}
                    <button
                      type="button"
                      onClick={() => goToMove(0)}
                      disabled={currentMoveIdx === 0}
                      className="grid h-9 w-9 place-items-center rounded-vault text-vault-primary transition-colors hover:bg-black/5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="First move (↑ or Home)"
                      aria-label="First move"
                    >
                      <ChevronsLeft size={18} />
                    </button>

                    {/* Previous */}
                    <button
                      type="button"
                      onClick={() => goToMove(currentMoveIdx - 1)}
                      disabled={currentMoveIdx === 0}
                      className="grid h-9 w-9 place-items-center rounded-vault text-vault-primary transition-colors hover:bg-black/5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Previous move (←)"
                      aria-label="Previous move"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Play / Pause */}
                    <button
                      type="button"
                      onClick={handlePlayPause}
                      className="grid h-10 w-10 place-items-center rounded-vault bg-vault-ochre text-white shadow-xs transition-colors hover:bg-vault-ochre-hover cursor-pointer"
                      title="Play / Pause (Space)"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause size={18} />
                      ) : (
                        <Play size={18} className="translate-x-0.5" />
                      )}
                    </button>

                    {/* Next */}
                    <button
                      type="button"
                      onClick={() => goToMove(currentMoveIdx + 1)}
                      disabled={currentMoveIdx >= fens.length - 1}
                      className="grid h-9 w-9 place-items-center rounded-vault text-vault-primary transition-colors hover:bg-black/5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Next move (→)"
                      aria-label="Next move"
                    >
                      <ChevronRight size={18} />
                    </button>

                    {/* Last */}
                    <button
                      type="button"
                      onClick={() => goToMove(fens.length - 1)}
                      disabled={currentMoveIdx >= fens.length - 1}
                      className="grid h-9 w-9 place-items-center rounded-vault text-vault-primary transition-colors hover:bg-black/5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Last move (↓ or End)"
                      aria-label="Last move"
                    >
                      <ChevronsRight size={18} />
                    </button>
                  </div>

                  {/* Secondary Controls: Speed & Flip */}
                  <div className="flex items-center gap-2 border-l border-vault-outline-variant/60 pl-2">
                    {/* Playback Speed */}
                    <button
                      type="button"
                      onClick={handleCycleSpeed}
                      className="flex h-9 items-center gap-1 rounded-vault px-2.5 text-xs font-mono font-bold text-vault-primary hover:bg-black/5 transition-colors cursor-pointer"
                      title="Cycle playback speed"
                    >
                      <Gauge size={14} className="text-vault-text-secondary" />
                      <span>{PLAYBACK_SPEEDS[speedIndex].label}</span>
                    </button>

                    {/* Flip Board */}
                    <button
                      type="button"
                      onClick={handleFlipBoard}
                      className="grid h-9 w-9 place-items-center rounded-vault text-vault-primary transition-colors hover:bg-black/5 cursor-pointer"
                      title="Flip board orientation (F)"
                      aria-label="Flip board"
                    >
                      <RotateCw size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Metadata, Move Ledger, Notes */}
              <div className="space-y-6">

                {/* Game metadata */}
                <article className="rounded-vault border border-vault-outline-variant/60 bg-[#f7f3ea] p-6 shadow-xs">
                  <p className="text-[11px] font-medium tracking-wide text-vault-text-secondary">
                    {getGameDate(currentGame)} •{" "}
                    <span className="capitalize">{currentGame.platform}</span>
                  </p>

                  <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-vault-primary">
                    {currentGame.title || "Chess Vault Recorded Game"}
                  </h1>

                  <div className="mt-6 space-y-3">
                    {/* White player */}
                    <div className="flex items-center justify-between border-b border-vault-outline-variant/40 pb-2.5">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-xs border border-vault-primary bg-white shadow-xs" />
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
                        <span className="h-3 w-3 rounded-xs bg-vault-primary shadow-xs" />
                        <span className="text-sm font-bold text-vault-primary">
                          {currentGame.blackPlayer.username}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-medium text-vault-text-secondary">
                        {currentGame.blackPlayer.rating}
                      </span>
                    </div>
                  </div>

                  {/* Result & Format */}
                  <div className="mt-6 flex items-center justify-between pt-2">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-vault-text-secondary block">
                        Format
                      </span>
                      <span className="text-xs font-bold capitalize text-vault-primary">
                        {currentGame.timeClass} {currentGame.isRated ? "• Rated" : "• Casual"}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-vault-text-secondary block">
                        Result
                      </span>
                      <span className="font-display text-sm font-bold text-[#8c6b2d]">
                        {currentGame.result === "draw"
                          ? "½-½ (Draw)"
                          : currentGame.result === "white"
                          ? "1-0 (White won)"
                          : "0-1 (Black won)"}
                      </span>
                    </div>
                  </div>
                </article>

                {/* Move ledger */}
                <article className="rounded-vault border border-vault-outline-variant/60 bg-white/80 p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-vault-outline-variant/60 pb-3">
                    <h2 className="font-display text-base font-bold text-vault-primary">
                      Move Ledger
                    </h2>
                    <span className="font-mono text-xs text-vault-text-secondary">
                      {parsedMoves.length} moves
                    </span>
                  </div>

                  <div className="mt-4 max-h-56 space-y-1 overflow-y-auto pr-2 font-mono text-xs">
                    {parsedMoves.length === 0 ? (
                      <p className="py-4 text-center text-xs text-vault-text-secondary italic">
                        No moves recorded for this game.
                      </p>
                    ) : (
                      parsedMoves.map((row) => {
                        const isWhiteActive = currentMoveIdx === row.whiteIdx;
                        const isBlackActive = currentMoveIdx === row.blackIdx;

                        return (
                          <div
                            key={row.number}
                            className="grid grid-cols-[36px_1fr_1fr] items-center rounded-xs px-2 py-0.5"
                          >
                            <span className="text-vault-text-secondary">
                              {row.number}.
                            </span>

                            {/* White move */}
                            <button
                              type="button"
                              ref={isWhiteActive ? activeMoveButtonRef : null}
                              onClick={() => goToMove(row.whiteIdx)}
                              className={`rounded-xs px-2 py-1 text-left font-medium transition-colors cursor-pointer ${
                                isWhiteActive
                                  ? "bg-[#f5efe4] font-bold text-[#8c6b2d] shadow-xs"
                                  : "text-vault-primary hover:bg-black/5"
                              }`}
                            >
                              {row.white}
                            </button>

                            {/* Black move */}
                            {row.black ? (
                              <button
                                type="button"
                                ref={isBlackActive ? activeMoveButtonRef : null}
                                onClick={() => goToMove(row.blackIdx!)}
                                className={`rounded-xs px-2 py-1 text-left font-medium transition-colors cursor-pointer ${
                                  isBlackActive
                                    ? "bg-[#f5efe4] font-bold text-[#8c6b2d] shadow-xs"
                                    : "text-vault-primary hover:bg-black/5"
                                }`}
                              >
                                {row.black}
                              </button>
                            ) : (
                              <span />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </article>

                {/* Archival notes */}
                <article className="rounded-vault border border-vault-outline-variant/60 bg-white/80 p-6 shadow-xs">
                  <h2 className="mb-3 font-display text-base font-bold text-vault-primary">
                    Archival Notes
                  </h2>

                  <p className="border-b border-vault-outline-variant/60 pb-5 font-display text-xs italic leading-5 text-vault-text-secondary">
                    {currentGame.notes || "No notes attached to this game."}
                  </p>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="w-full rounded-vault border border-vault-outline-variant/70 bg-[#f7f3ea] py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-vault-primary transition-colors hover:bg-[#eae4d5] cursor-pointer"
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

