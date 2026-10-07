import { Chessboard } from "react-chessboard";
import { motion, AnimatePresence } from "motion/react";

type BoardPanelProps = {
  fen: string;
  boardOrientation: "white" | "black";
  /** Label for the active move overlay (e.g. "12. Nf3"). Null at start position. */
  activeMoveLabel: string | null;
};

export function BoardPanel({ fen, boardOrientation, activeMoveLabel }: BoardPanelProps) {
  return (
    <div className="relative aspect-square w-full overflow-hidden border border-vault-border-interactive bg-vault-surface-layer-1 p-2">
      <Chessboard
        options={{
          position: fen,
          boardOrientation,
          allowDragging: false,
          animationDurationInMs: 250,
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

      <AnimatePresence>
        {activeMoveLabel && (
          <motion.div
            key={activeMoveLabel}
            initial={{ opacity: 0, scale: 0.92, y: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.12 }}
            className="absolute top-4 left-4 z-10 rounded-xs border border-vault-bronze bg-vault-surface-layer-2/95 px-2 py-1 font-mono text-xs font-semibold text-vault-bronze shadow-lg"
          >
            {activeMoveLabel}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
