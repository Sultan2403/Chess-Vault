import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, NavLink } from "react-router-dom";
import { useUser } from "@clerk/react";

import { useGame } from "../hooks/useGames";
import { useParsedGame } from "../hooks/useParsedGame";
import { getCapturedPieces, getPlayerPerspective } from "../utils/game";
import { useStockfish } from "../hooks/useStockfish";
import { Spinner } from "../components/ui/Spinner";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { EmptyState } from "../components/ui/EmptyState";
import { GameViewerSubheader } from "../components/game-viewer/GameViewerSubheader";
import { PlayerBar } from "../components/game-viewer/PlayerBar";
import { BoardPanel } from "../components/game-viewer/BoardPanel";
import { StepperControls } from "../components/game-viewer/StepperControls";
import { EvalBar } from "../components/game-viewer/EvalBar";
import { NotationLedger } from "../components/game-viewer/NotationLedger";
import { MatchFilePanel } from "../components/game-viewer/MatchFilePanel";
import { ReflectionPanel } from "../components/game-viewer/ReflectionPanel";
import { GameActionsPanel } from "../components/game-viewer/GameActionsPanel";
import { KeyboardShortcutsPanel } from "../components/game-viewer/KeyboardShortcutsPanel";

export default function GameViewer() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const userName = user?.firstName ?? user?.username ?? "Vault Keeper";

  const { data, isLoading, isError, error, refetch } = useGame(id ?? "");
  const currentGame = data?.game;

  const { fens, parsedMoves, parseError, moveHistory } = useParsedGame(
    currentGame?.pgn ?? "",
  );
  // Navigation state
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [copiedFen, setCopiedFen] = useState(false);
  const [sharedCopied, setSharedCopied] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const currentFen = fens[currentMoveIdx] ?? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const { evalCp, mate, depth, isAnalyzing } = useStockfish(currentFen);

  // Set board orientation from the game's persisted userPlayedAs once loaded
  useEffect(() => {
    if (currentGame) {
      setBoardOrientation(currentGame.userPlayedAs);
    }
  }, [currentGame?.id, currentGame?.userPlayedAs]);

  // Reset to final position when a new game loads
  useEffect(() => {
    setCurrentMoveIdx(fens.length > 1 ? fens.length - 1 : 0);
    setIsPlaying(false);
  }, [currentGame?.id, fens.length]);

  // Navigation handlers
  const goToMove = useCallback(
    (idx: number) => {
      setCurrentMoveIdx(Math.max(0, Math.min(idx, fens.length - 1)));
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

  const handleCopyFen = () => {
    const fen = fens[currentMoveIdx] ?? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
    navigator.clipboard.writeText(fen);
    setCopiedFen(true);
    setTimeout(() => setCopiedFen(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setSharedCopied(true);
    setTimeout(() => setSharedCopied(false), 2000);
  };

  const handleDownloadPgn = () => {
    if (!currentGame) return;
    const blob = new Blob([currentGame.pgn], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentGame.title?.replace(/[^a-z0-9]/gi, "_") ?? "chess_game"}.pgn`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Per-ply clock derivation from game.time.clocks
  // clocks[i] = remaining ms after ply i (0-indexed, alternating white/black)
  const plyIdx = currentMoveIdx - 1;
  const clocks = currentGame?.time.clocks;
  const lastWhitePlyIdx = plyIdx >= 0 ? (plyIdx % 2 === 0 ? plyIdx : plyIdx - 1) : -1;
  const lastBlackPlyIdx = plyIdx >= 1 ? (plyIdx % 2 === 1 ? plyIdx : plyIdx - 1) : -1;
  const whiteClockMs = clocks && lastWhitePlyIdx >= 0 ? clocks[lastWhitePlyIdx] : undefined;
  const blackClockMs = clocks && lastBlackPlyIdx >= 0 ? clocks[lastBlackPlyIdx] : undefined;
  const initialClockMs = currentGame?.time.initial;
  const perspective = currentGame ? getPlayerPerspective(currentGame) : null;
  const bottomPlayer = perspective?.player ?? currentGame?.whitePlayer;
  const topPlayer = perspective?.opponent ?? currentGame?.blackPlayer;
  const bottomColor = perspective?.playerColor ?? "white";
  const topColor = perspective?.opponentColor ?? "black";
  const bottomClockMs = bottomColor === "white" ? whiteClockMs : blackClockMs;
  const topClockMs = topColor === "white" ? whiteClockMs : blackClockMs;

  // Active move label for the board overlay
  const currentPlyMove = moveHistory[plyIdx];
  const activeMoveLabel = currentPlyMove
    ? `${Math.floor(plyIdx / 2) + 1}${plyIdx % 2 === 0 ? "." : "..."} ${currentPlyMove.san}`
    : null;

  // Captured pieces and material balance
  const captured = useMemo(() => {
    return getCapturedPieces(moveHistory, plyIdx);
  }, [moveHistory, plyIdx]);

  return (
    <div className="mx-auto max-w-content px-6 py-6 font-body">
      {isLoading ? (
        <div className="py-24">
          <Spinner />
        </div>
      ) : isError ? (
        <ErrorBanner error={error} onRetry={() => refetch()} />
      ) : !currentGame ? (
        <EmptyState
          title="Game Not Found"
          description="The requested match ledger does not exist in your archive."
          action={
            <NavLink
              to="/game-bank"
              className="rounded-vault bg-vault-bronze px-4 py-2 font-mono text-xs text-vault-surface"
            >
              Back to Game Bank
            </NavLink>
          }
        />
      ) : (
        <div>
          <GameViewerSubheader
            gameId={currentGame.id}
            copiedFen={copiedFen}
            sharedCopied={sharedCopied}
            onCopyFen={handleCopyFen}
            onPrint={() => window.print()}
            onShare={handleShare}
          />

          <KeyboardShortcutsPanel
            isOpen={showShortcuts}
            onClose={() => setShowShortcuts(false)}
          />

          {parseError && (
            <div className="mb-6 rounded-vault border border-vault-loss/40 bg-vault-loss/10 p-4 font-mono text-xs text-vault-loss">
              Notice: PGN notation required fallback parsing. Some comments or engine
              variants were simplified.
            </div>
          )}

          {/* Main 2-column layout */}
          <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left column: players, board, eval, stepper */}
            <div className="space-y-4">
              {/* Opponent (black) at top */}
              <PlayerBar
                player={topPlayer ?? currentGame.blackPlayer}
                color={topColor}
                gameResult={currentGame.result}
                clockMs={topClockMs}
                initialClockMs={initialClockMs}
                isAtStart={currentMoveIdx === 0}
                capturedPieces={topColor === "white" ? captured.white.pieces : captured.black.pieces}
                materialAdvantage={topColor === "white" ? captured.white.advantage : captured.black.advantage}
              />

              <div className="grid grid-cols-[minmax(0,1fr)_2rem] items-stretch gap-2">
                <BoardPanel
                  fen={currentFen}
                  boardOrientation={boardOrientation}
                  activeMoveLabel={activeMoveLabel}
                />
                <EvalBar evalCp={evalCp} mate={mate} depth={depth} isAnalyzing={isAnalyzing} />
              </div>

              {/* Player (white) at bottom — swapped if user played black */}
              <PlayerBar
                player={bottomPlayer ?? currentGame.whitePlayer}
                color={bottomColor}
                gameResult={currentGame.result}
                clockMs={bottomClockMs}
                initialClockMs={initialClockMs}
                isAtStart={currentMoveIdx === 0}
                capturedPieces={bottomColor === "white" ? captured.white.pieces : captured.black.pieces}
                materialAdvantage={bottomColor === "white" ? captured.white.advantage : captured.black.advantage}
              />

              <StepperControls
                currentMoveIdx={currentMoveIdx}
                totalPlies={fens.length - 1}
                isPlaying={isPlaying}
                isAudioMuted={isAudioMuted}
                showShortcuts={showShortcuts}
                onGoTo={goToMove}
                onPlayPause={handlePlayPause}
                onFlipBoard={handleFlipBoard}
                onToggleAudio={() => setIsAudioMuted((prev) => !prev)}
                onToggleShortcuts={() => setShowShortcuts((prev) => !prev)}
              />
            </div>

            {/* Right column: match file, notation, reflection, actions */}
            <div className="space-y-6">
              <MatchFilePanel game={currentGame} />

              <NotationLedger
                parsedMoves={parsedMoves}
                currentMoveIdx={currentMoveIdx}
                onGoTo={goToMove}
              />

              <ReflectionPanel game={currentGame} userName={userName} />

              <GameActionsPanel
                onDownloadPgn={handleDownloadPgn}
                sourceUrl={currentGame.sourceUrl}
                platform={currentGame.platform}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
