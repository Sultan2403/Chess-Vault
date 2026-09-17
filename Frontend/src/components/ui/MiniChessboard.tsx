import { Chessboard } from "react-chessboard";

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
  return (
    <div
      className={`relative aspect-square w-full overflow-hidden border border-vault-border-interactive bg-vault-surface-layer-1 ${className}`}
    >
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          allowDragging: false,
          animationDurationInMs: 0,
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
