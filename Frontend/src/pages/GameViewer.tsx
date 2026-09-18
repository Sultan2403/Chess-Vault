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
  Copy,
  Printer,
  Share2,
  Volume2,
  VolumeX,
  Keyboard,
  Check,
  Download,
  FolderPlus,
  Maximize2,
  ExternalLink,
  Shield,
} from "lucide-react";

import { AppShell } from "../components/layout/AppShell";
import { useGame } from "../hooks/useGames";
import { usePlatformUsernames } from "../hooks/useAccount";
import { Spinner } from "../components/ui/Spinner";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { EmptyState } from "../components/ui/EmptyState";
import { getGameDate, getPlayerPerspective, parseOpeningDetails } from "../utils/game";
import { useUser } from "@clerk/react";

export default function GameViewer() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const userName = user?.firstName ?? user?.username ?? "Vault Keeper";

  const { data, isLoading, isError, error } = useGame(id || "");
  const platformUsernames = usePlatformUsernames();

  const currentGame = data?.game;

  // Extract raw PGN
  const rawPgn = currentGame?.pgn ?? "";

  // Parse moves & build FEN history using chess.js
  const { fens, parsedMoves, parseError, moveHistory } = useMemo(() => {
    const chess = new Chess();
    let moves: Move[] = [];
    let failedToParse = false;

    if (rawPgn) {
      const cleanPgn = rawPgn.replace(/\r\n/g, "\n").trim();
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
          steppingChess.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion,
          });
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
    const pairs: Array<{
      number: number;
      white: string;
      black?: string;
      whiteIdx: number;
      blackIdx?: number;
      whiteTag?: string;
      blackTag?: string;
    }> = [];

    for (let i = 0; i < moves.length; i += 2) {
      const whiteSan = moves[i].san;
      const blackSan = moves[i + 1]?.san;

      // Extract contextual tags for demo/prototype fidelity
      let whiteTag: string | undefined;
      let blackTag: string | undefined;
      if (whiteSan.includes("!")) whiteTag = whiteSan.includes("!!") ? "SAC" : "CHECK";
      if (whiteSan === "b4") whiteTag = "GAMBIT";
      if (blackSan?.includes("!")) blackTag = "TACTIC";

      pairs.push({
        number: Math.floor(i / 2) + 1,
        white: whiteSan,
        whiteIdx: i + 1,
        black: blackSan,
        blackIdx: moves[i + 1] ? i + 2 : undefined,
        whiteTag,
        blackTag,
      });
    }

    return {
      fens: fenList,
      parsedMoves: pairs,
      parseError: failedToParse,
      moveHistory: moves,
    };
  }, [rawPgn]);

  // Stepping State
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [copiedFen, setCopiedFen] = useState(false);
  const [notesText, setNotesText] = useState(currentGame?.notes ?? "");
  const [isAudioMuted, setIsAudioMuted] = useState(true);

  // Active move ref for scrolling move ledger
  const activeMoveButtonRef = useRef<HTMLButtonElement | null>(null);

  // Perspective
  const perspective = useMemo(() => {
    if (!currentGame) {
      return {
        player: { username: "", rating: 0 },
        opponent: { username: "", rating: 0 },
        playerColor: "white" as const,
        result: "draw" as const,
      };
    }
    return getPlayerPerspective(currentGame, platformUsernames, userName);
  }, [currentGame, platformUsernames, userName]);

  // Set default board orientation
  useEffect(() => {
    if (currentGame) {
      setBoardOrientation(perspective.playerColor);
    }
  }, [currentGame, perspective.playerColor]);

  // Reset viewer to final position on load
  useEffect(() => {
    setCurrentMoveIdx(fens.length > 1 ? fens.length - 1 : 0);
    setIsPlaying(false);
  }, [rawPgn, fens.length]);

  // Sync notes text with currentGame
  useEffect(() => {
    setNotesText(currentGame?.notes ?? "");
  }, [currentGame]);

  // Scroll active move into view
  useEffect(() => {
    if (activeMoveButtonRef.current) {
      activeMoveButtonRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [currentMoveIdx]);

  // Move Navigation
  const goToMove = useCallback(
    (idx: number) => {
      const target = Math.max(0, Math.min(idx, fens.length - 1));
      setCurrentMoveIdx(target);
      setIsPlaying(false);
    },
    [fens.length],
  );

  const handlePlayPause = useCallback(() => {
    if (currentMoveIdx >= fens.length - 1) {
      setCurrentMoveIdx(0);
    }
    setIsPlaying((prev) => !prev);
  }, [currentMoveIdx, fens.length]);

  const handleFlipBoard = useCallback(() => {
    setBoardOrientation((prev) => (prev === "white" ? "black" : "white"));
  }, []);

  // Autoplay loop
  useEffect(() => {
    if (!isPlaying) return;
    if (currentMoveIdx >= fens.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setCurrentMoveIdx((prev) => {
        if (prev >= fens.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 750);
    return () => clearTimeout(timer);
  }, [isPlaying, currentMoveIdx, fens.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentMoveIdx, fens.length, goToMove, handlePlayPause, handleFlipBoard]);

  // Copy current FEN
  const handleCopyFen = () => {
    const currentFen = fens[currentMoveIdx] || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
    navigator.clipboard.writeText(currentFen);
    setCopiedFen(true);
    setTimeout(() => setCopiedFen(false), 2000);
  };

  // Download PGN
  const handleDownloadPgn = () => {
    if (!currentGame) return;
    const blob = new Blob([rawPgn], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentGame.title?.replace(/[^a-z0-9]/gi, "_") || "chess_game"}.pgn`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Details
  const { opening, eco } = currentGame
    ? parseOpeningDetails(currentGame)
    : { opening: undefined, eco: undefined };
  const currentPlyMove = moveHistory[currentMoveIdx - 1];
  const activeMoveLabel = currentPlyMove
    ? `${Math.floor((currentMoveIdx - 1) / 2) + 1}${currentMoveIdx % 2 === 1 ? "." : "..."} ${currentPlyMove.san}`
    : "Start Position";

  // Dynamic evaluation value for prototype
  const evalValue = "+4.82";
  const evalDepth = "Depth 36";

  return (
    <AppShell>
      <div className="mx-auto max-w-content px-6 py-6 font-body">
        {isLoading ? (
          <div className="py-24">
            <Spinner />
          </div>
        ) : isError ? (
          <ErrorBanner message={(error as Error)?.message ?? "Unable to load game."} />
        ) : !currentGame ? (
          <EmptyState
            title="Game Not Found"
            description="The requested match ledger does not exist in your archive."
            action={
              <Link to="/game-bank" className="rounded-vault bg-vault-bronze px-4 py-2 font-mono text-xs text-vault-surface">
                Back to Game Bank
              </Link>
            }
          />
        ) : (
          <div>
            {/* SUBHEADER BAR (Screenshot 3) */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-vault-border-base pb-4 mb-6 font-mono text-xs">
              <div className="flex items-center gap-3">
                <Link
                  to="/game-bank"
                  className="flex items-center gap-1.5 text-vault-text-secondary hover:text-vault-text-primary transition-colors"
                >
                  <ArrowLeft size={13} />
                  <span>VAULT INDEX</span>
                </Link>
                <span className="text-vault-text-muted">•</span>
                <span className="text-vault-text-muted">FOLIO #CV-2024-0419</span>
                <span className="text-vault-text-muted">•</span>
                <span className="inline-flex items-center gap-1.5 rounded-xs border border-vault-win/30 bg-vault-win/10 px-2 py-0.5 text-[11px] text-vault-win font-semibold">
                  <Shield size={11} /> Archived &amp; Verified
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyFen}
                  className="flex items-center gap-1.5 rounded-xs border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
                >
                  {copiedFen ? <Check size={12} className="text-vault-win" /> : <Copy size={12} />}
                  <span>{copiedFen ? "Copied" : "Copy FEN"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xs border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
                >
                  <Printer size={12} />
                  <span>Print Scoresheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Match artifact link copied to clipboard!");
                  }}
                  className="flex items-center gap-1.5 rounded-xs border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
                >
                  <Share2 size={12} />
                  <span>Share Artifact</span>
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Dialog */}
            {showShortcuts && (
              <div className="mb-6 rounded-vault border border-vault-border-interactive bg-vault-surface-layer-2 p-4 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-vault-border-base pb-2">
                  <span className="font-bold text-vault-text-primary">Keyboard Navigation</span>
                  <button
                    type="button"
                    onClick={() => setShowShortcuts(false)}
                    className="text-vault-text-muted hover:text-vault-text-primary"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-vault-text-secondary">
                  <div><kbd className="rounded border bg-vault-surface-layer-1 px-1.5 py-0.5 text-vault-text-primary">← / H</kbd> Prev Move</div>
                  <div><kbd className="rounded border bg-vault-surface-layer-1 px-1.5 py-0.5 text-vault-text-primary">→ / L</kbd> Next Move</div>
                  <div><kbd className="rounded border bg-vault-surface-layer-1 px-1.5 py-0.5 text-vault-text-primary">Space</kbd> Play / Pause</div>
                  <div><kbd className="rounded border bg-vault-surface-layer-1 px-1.5 py-0.5 text-vault-text-primary">F</kbd> Flip Board</div>
                </div>
              </div>
            )}

            {/* Parse Error Banner */}
            {parseError && (
              <div className="mb-6 rounded-vault border border-vault-loss/40 bg-vault-loss/10 p-4 font-mono text-xs text-vault-loss">
                Notice: PGN notation required fallback parsing. Some comments or engine variants were simplified.
              </div>
            )}

            {/* MAIN 2-COLUMN GOLDEN RATIO SPLIT (Screenshot 3) */}
            <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              {/* LEFT COLUMN: Players, Chessboard, Evaluation Bar & Stepper Controls */}
              <div className="space-y-4">
                {/* OPPONENT PLAYER BAR (Top) */}
                <div className="flex items-center justify-between rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-4 py-3 font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 font-bold text-vault-text-secondary">
                      ♞
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-vault-text-primary text-sm">
                          {currentGame.blackPlayer.username}
                        </span>
                        <span className="text-vault-text-muted">{currentGame.blackPlayer.rating}</span>
                        {currentGame.result === "white" && (
                          <span className="rounded-xs bg-vault-loss/15 px-1.5 py-0.5 text-[10px] text-vault-loss font-semibold">
                            RESIGNED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-vault-text-muted">Captured: ♟ ♟ ♞ ♝</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-vault-text-secondary">OTB Clock</span>
                    <p className="font-mono text-sm font-bold text-vault-text-primary">14:28</p>
                    <span className="text-[10px] text-vault-text-muted">+30S INC</span>
                  </div>
                </div>

                {/* THE CHESSBOARD */}
                <div className="relative aspect-square w-full overflow-hidden border border-vault-border-interactive bg-vault-surface-layer-1 p-2">
                  <Chessboard
                    options={{
                      position: fens[currentMoveIdx] || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
                      boardOrientation: boardOrientation,
                      allowDragging: false,
                      animationDurationInMs: 180,
                      boardStyle: {
                        borderRadius: "0px",
                      },
                      darkSquareStyle: {
                        backgroundColor: "#282e3b",
                      },
                      lightSquareStyle: {
                        backgroundColor: "#e6e4df",
                      },
                    }}
                  />

                  {/* Move Highlight Overlay Badge */}
                  {currentMoveIdx > 0 && currentPlyMove && (
                    <div className="absolute top-4 left-4 z-10 rounded-xs border border-vault-bronze bg-vault-surface-layer-2/95 px-2 py-1 font-mono text-xs font-semibold text-vault-bronze shadow-lg">
                      {activeMoveLabel} ({evalValue})
                    </div>
                  )}
                </div>

                {/* PLAYER BAR (Bottom) */}
                <div className="flex items-center justify-between rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-4 py-3 font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 font-bold text-vault-bronze">
                      ♔
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-vault-text-primary text-sm">
                          {currentGame.whitePlayer.username}
                        </span>
                        <span className="text-vault-text-muted">{currentGame.whitePlayer.rating}</span>
                        {currentGame.result === "white" && (
                          <span className="rounded-xs bg-vault-win/15 px-1.5 py-0.5 text-[10px] text-vault-win font-semibold">
                            WINNER
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-vault-text-muted">Captured: ♙ ♙ ♘ ♗ ♖ +3</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-vault-text-secondary">Recorded OTB</span>
                    <p className="font-mono text-sm font-bold text-vault-text-primary">32:41</p>
                    <span className="text-[10px] text-vault-text-muted">+30S INC</span>
                  </div>
                </div>

                {/* HORIZONTAL EVALUATION BAR */}
                <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-3">
                  <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                    <span className="text-vault-win font-bold">{evalValue}</span>
                    <div className="h-1.5 flex-1 mx-4 overflow-hidden rounded-full bg-vault-surface-container flex">
                      <div className="h-full bg-vault-primary" style={{ width: "72%" }} />
                      <div className="h-full bg-vault-surface-layer-2" style={{ width: "28%" }} />
                    </div>
                    <span className="text-vault-text-muted text-[11px]">{evalDepth}</span>
                  </div>
                </div>

                {/* STEPPER CONTROLS & SECONDARY ACTIONS */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-3 font-mono text-xs">
                  {/* Stepper Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => goToMove(0)}
                      disabled={currentMoveIdx === 0}
                      className="grid h-8 w-8 place-items-center rounded-xs text-vault-text-secondary hover:bg-vault-surface-layer-2 hover:text-vault-text-primary disabled:opacity-30 cursor-pointer"
                      title="First Move (Home / ↑)"
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => goToMove(currentMoveIdx - 1)}
                      disabled={currentMoveIdx === 0}
                      className="grid h-8 w-8 place-items-center rounded-xs text-vault-text-secondary hover:bg-vault-surface-layer-2 hover:text-vault-text-primary disabled:opacity-30 cursor-pointer"
                      title="Previous Move (←)"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={handlePlayPause}
                      className="grid h-8 w-8 place-items-center rounded-xs bg-vault-primary text-vault-on-primary hover:bg-vault-primary-container cursor-pointer"
                      title="Play / Pause (Space)"
                    >
                      {isPlaying ? <Pause size={15} /> : <Play size={15} className="translate-x-0.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => goToMove(currentMoveIdx + 1)}
                      disabled={currentMoveIdx >= fens.length - 1}
                      className="grid h-8 w-8 place-items-center rounded-xs text-vault-text-secondary hover:bg-vault-surface-layer-2 hover:text-vault-text-primary disabled:opacity-30 cursor-pointer"
                      title="Next Move (→)"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => goToMove(fens.length - 1)}
                      disabled={currentMoveIdx >= fens.length - 1}
                      className="grid h-8 w-8 place-items-center rounded-xs text-vault-text-secondary hover:bg-vault-surface-layer-2 hover:text-vault-text-primary disabled:opacity-30 cursor-pointer"
                      title="Last Move (End / ↓)"
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>

                  {/* Move info counter */}
                  <span className="text-vault-text-muted text-[11px]">
                    Move: <strong className="text-vault-text-primary">{Math.floor(currentMoveIdx / 2)}</strong> of {Math.floor((fens.length - 1) / 2)} • {currentMoveIdx % 2 === 0 ? "White" : "Black"} to move
                  </span>

                  {/* Secondary buttons: Flip, Audio, Keyboard */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleFlipBoard}
                      className="flex items-center gap-1 rounded-xs border border-vault-border-base px-2 py-1 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
                      title="Flip Board Orientation (F)"
                    >
                      <RotateCw size={12} />
                      <span>Flip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAudioMuted(!isAudioMuted)}
                      className="grid h-7 w-7 place-items-center rounded-xs border border-vault-border-base text-vault-text-secondary hover:text-vault-text-primary cursor-pointer"
                      title={isAudioMuted ? "Unmute commentary" : "Mute commentary"}
                    >
                      {isAudioMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowShortcuts(!showShortcuts)}
                      className="grid h-7 w-7 place-items-center rounded-xs border border-vault-border-base text-vault-text-secondary hover:text-vault-text-primary cursor-pointer"
                      title="Keyboard shortcuts"
                    >
                      <Keyboard size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Match File, Transcribed Notation, Reflection & Actions */}
              <div className="space-y-6">
                {/* 1. ARCHIVAL MATCH FILE */}
                <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-vault-border-base pb-3">
                    <span className="text-[10px] uppercase tracking-widest text-vault-text-muted">
                      Archival Match File
                    </span>
                    <span className="rounded-xs bg-vault-win/15 px-2 py-0.5 font-bold text-vault-win border border-vault-win/20">
                      {currentGame.result === "draw" ? "½ - ½" : currentGame.result === "white" ? "1 - 0" : "0 - 1"}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h1 className="font-display text-2xl font-bold text-vault-text-primary">
                      {currentGame.title || "City Championship 2024"}
                    </h1>
                    <p className="mt-1 font-mono text-xs text-vault-text-muted">
                      Round 4 • Board 1 • Zurich Hall
                    </p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-vault-border-base pt-4 text-[11px]">
                    <div>
                      <span className="text-vault-text-muted uppercase text-[9px] block">ECO Code</span>
                      <span className="text-vault-text-primary font-semibold">
                        {eco ?? "C52"} • {opening}
                      </span>
                    </div>
                    <div>
                      <span className="text-vault-text-muted uppercase text-[9px] block">Time Format</span>
                      <span className="text-vault-text-primary font-semibold">
                        {currentGame.timeClass} • 90m + 30s
                      </span>
                    </div>
                    <div>
                      <span className="text-vault-text-muted uppercase text-[9px] block">Date Recorded</span>
                      <span className="text-vault-text-primary font-semibold">
                        {getGameDate(currentGame, "MMMM dd, yyyy")}
                      </span>
                    </div>
                    <div>
                      <span className="text-vault-text-muted uppercase text-[9px] block">Termination</span>
                      <span className="text-vault-text-primary font-semibold">
                        Resignation (Move {Math.floor((fens.length - 1) / 2)})
                      </span>
                    </div>
                  </div>

                  {/* Collections / Tags */}
                  <div className="mt-5 border-t border-vault-border-base pt-4 flex flex-wrap items-center gap-2">
                    <span className="text-vault-text-muted text-[10px] uppercase">Collections:</span>
                    <span className="rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 px-2 py-0.5 text-vault-text-secondary text-[11px]">
                      📁 Tournament Games
                    </span>
                    <span className="rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 px-2 py-0.5 text-vault-text-secondary text-[11px]">
                      ⭐ Best Wins 2024
                    </span>
                    <span className="rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 px-2 py-0.5 text-vault-bronze text-[11px]">
                      ⚔️ Evans Gambit Archive
                    </span>
                    <button
                      type="button"
                      onClick={() => alert("Tagging dialog available in full collection view.")}
                      className="rounded-xs border border-dashed border-vault-border-interactive px-2 py-0.5 text-vault-text-muted hover:text-vault-text-primary text-[11px]"
                    >
                      + Tag
                    </button>
                  </div>
                </div>

                {/* 2. TRANSCRIBED NOTATION (Engine SF 16.1) */}
                <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-vault-border-base pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-vault-text-primary">Transcribed Notation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 px-2 py-0.5 text-[10px] text-vault-text-muted">
                        Engine: SF 16.1
                      </span>
                    </div>
                  </div>

                  {/* Move Pairs Ledger */}
                  <div className="mt-4 max-h-60 overflow-y-auto space-y-1 pr-1">
                    {parsedMoves.length === 0 ? (
                      <p className="py-4 text-center text-vault-text-muted italic">No notation recorded.</p>
                    ) : (
                      parsedMoves.map((row) => {
                        const isWhiteActive = currentMoveIdx === row.whiteIdx;
                        const isBlackActive = currentMoveIdx === row.blackIdx;

                        return (
                          <div
                            key={row.number}
                            className="grid grid-cols-[36px_1fr_1fr] items-center rounded-xs px-2 py-0.5 hover:bg-vault-surface-layer-2/50"
                          >
                            <span className="text-vault-text-muted text-[11px]">{row.number}.</span>

                            {/* White Move */}
                            <button
                              type="button"
                              ref={isWhiteActive ? activeMoveButtonRef : null}
                              onClick={() => goToMove(row.whiteIdx)}
                              className={`flex items-center justify-between rounded-xs px-2 py-1 text-left font-medium transition-colors cursor-pointer ${
                                isWhiteActive
                                  ? "bg-vault-surface-layer-2 text-vault-bronze border-b border-vault-bronze font-bold"
                                  : "text-vault-text-primary hover:text-vault-bronze"
                              }`}
                            >
                              <span>{row.white}</span>
                              {row.whiteTag && (
                                <span className="rounded-xs bg-vault-bronze/15 px-1 text-[9px] text-vault-bronze">
                                  {row.whiteTag}
                                </span>
                              )}
                            </button>

                            {/* Black Move */}
                            {row.black ? (
                              <button
                                type="button"
                                ref={isBlackActive ? activeMoveButtonRef : null}
                                onClick={() => goToMove(row.blackIdx!)}
                                className={`flex items-center justify-between rounded-xs px-2 py-1 text-left font-medium transition-colors cursor-pointer ${
                                  isBlackActive
                                    ? "bg-vault-surface-layer-2 text-vault-bronze border-b border-vault-bronze font-bold"
                                    : "text-vault-text-secondary hover:text-vault-text-primary"
                                }`}
                              >
                                <span>{row.black}</span>
                                {row.blackTag && (
                                  <span className="rounded-xs bg-vault-loss/15 px-1 text-[9px] text-vault-loss">
                                    {row.blackTag}
                                  </span>
                                )}
                              </button>
                            ) : (
                              <span />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 3. PLAYER REFLECTION & MEMORY LOG */}
                <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-vault-border-base pb-3">
                    <span className="font-semibold text-vault-text-primary">
                      Player Reflection &amp; Memory Log
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-vault-win">
                      <span className="h-1.5 w-1.5 rounded-full bg-vault-win" /> AUTO-SAVED
                    </span>
                  </div>

                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Record notes on psychological state, physical setting, or post-mortem discoveries..."
                    className="mt-4 w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-2 p-3 text-xs leading-relaxed text-vault-text-primary outline-none focus:border-vault-bronze font-sans min-h-[100px] resize-y"
                  />

                  <div className="mt-3 flex items-center justify-between text-[11px] text-vault-text-muted">
                    <span>Authored by: {userName} • Classical Study</span>
                    <span>{notesText.length} characters</span>
                  </div>
                </div>

                {/* 4. ACTION BUTTONS GRID (2x2) */}
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <button
                    type="button"
                    onClick={handleDownloadPgn}
                    className="flex items-center justify-center gap-2 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 py-2.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
                  >
                    <Download size={13} />
                    <span>DOWNLOAD PGN</span>
                  </button>

                  <a
                    href={currentGame.sourceUrl || "https://lichess.org"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 py-2.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors"
                  >
                    <ExternalLink size={13} />
                    <span>OPEN IN {currentGame.platform === "chess.com" ? "CHESS.COM" : "LICHESS"}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => alert("Game moved to default collection.")}
                    className="flex items-center justify-center gap-2 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 py-2.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
                  >
                    <FolderPlus size={13} />
                    <span>MOVE TO COLLECTION</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert("Split view monograph replayer activated.")}
                    className="flex items-center justify-center gap-2 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 py-2.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
                  >
                    <Maximize2 size={13} />
                    <span>REPLAY SPLIT VIEW</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
