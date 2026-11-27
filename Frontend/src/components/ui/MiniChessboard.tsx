import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useTheme } from "../../contexts";

const MemoizedChessboard = memo(Chessboard);

type MiniChessboardProps = {
  fen?: string;
  orientation?: "white" | "black";
  highlightSquare?: string;
  badgeLabel?: string;
  className?: string;
};

export function MiniChessboard({
  fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
  orientation = "white",
  highlightSquare,
  badgeLabel,
  className = "",
}: MiniChessboardProps) {
  const { boardColors } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    // Keep ~2-3 rows above and below the viewport mounted; unmount far off-screen boards
    // to bound DOM node count without triggering any API refetches.
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry) {
          setIsNearViewport(entry.isIntersecting);
        }
      },
      { rootMargin: "900px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const boardOptions = useMemo(
    () => ({
      position: fen,
      boardOrientation: orientation,
      allowDragging: false,
      animationDurationInMs: 0,
      boardStyle: {
        borderRadius: "0px",
      },
      darkSquareStyle: {
        backgroundColor: boardColors.boardDark,
      },
      lightSquareStyle: {
        backgroundColor: boardColors.boardLight,
      },
    }),
    [fen, orientation, boardColors.boardDark, boardColors.boardLight],
  );

  return (
    <div
      ref={containerRef}
      className={`relative aspect-square w-full overflow-hidden border border-vault-border-interactive bg-vault-surface-layer-1 ${className}`}
    >
      {isNearViewport ? (
        <MemoizedChessboard options={boardOptions} />
      ) : (
        <div className="h-full w-full bg-vault-surface-layer-1" aria-hidden="true" />
      )}

      {/* Coordinate / Move Highlight Badge overlay if provided */}
      {badgeLabel && (
        <div className="absolute bottom-1.5 right-1.5 z-10 rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2/95 px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-tight text-vault-text-primary shadow-xs">
          {badgeLabel}
        </div>
      )}

      {/* From / Highlight indicator */}
      {highlightSquare && (
        <div className="pointer-events-none absolute inset-0 z-5">
          {/* Subtle translucent gold wash over active square if needed */}
        </div>
      )}
    </div>
  );
}
