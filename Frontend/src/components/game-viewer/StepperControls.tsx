import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Pause,
  RotateCw,
  Volume2,
  VolumeX,
  Keyboard,
} from "lucide-react";
import { motion } from "motion/react";

type StepperControlsProps = {
  currentMoveIdx: number;
  totalPlies: number;
  isPlaying: boolean;
  isAudioMuted: boolean;
  showShortcuts: boolean;
  onGoTo: (idx: number) => void;
  onPlayPause: () => void;
  onFlipBoard: () => void;
  onToggleAudio: () => void;
  onToggleShortcuts: () => void;
};

export function StepperControls({
  currentMoveIdx,
  totalPlies,
  isPlaying,
  isAudioMuted,
  showShortcuts,
  onGoTo,
  onPlayPause,
  onFlipBoard,
  onToggleAudio,
  onToggleShortcuts,
}: StepperControlsProps) {
  const atStart = currentMoveIdx === 0;
  const atEnd = currentMoveIdx >= totalPlies;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-3 font-mono text-xs">
      {/* Stepper Buttons */}
      <div className="flex items-center gap-1">
        <motion.button
          type="button"
          whileTap={!atStart ? { scale: 0.92 } : undefined}
          onClick={() => onGoTo(0)}
          disabled={atStart}
          className="grid h-8 w-8 place-items-center rounded-xs text-vault-text-secondary hover:bg-vault-surface-layer-2 hover:text-vault-text-primary disabled:opacity-30 cursor-pointer"
          title="First Move (Home / ↑)"
        >
          <ChevronsLeft size={16} />
        </motion.button>
        <motion.button
          type="button"
          whileTap={!atStart ? { scale: 0.92 } : undefined}
          onClick={() => onGoTo(currentMoveIdx - 1)}
          disabled={atStart}
          className="grid h-8 w-8 place-items-center rounded-xs text-vault-text-secondary hover:bg-vault-surface-layer-2 hover:text-vault-text-primary disabled:opacity-30 cursor-pointer"
          title="Previous Move (←)"
        >
          <ChevronLeft size={16} />
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={onPlayPause}
          className="grid h-8 w-8 place-items-center rounded-xs bg-vault-primary text-vault-on-primary hover:bg-vault-primary-container cursor-pointer transition-colors"
          title="Play / Pause (Space)"
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} className="translate-x-0.5" />}
        </motion.button>
        <motion.button
          type="button"
          whileTap={!atEnd ? { scale: 0.92 } : undefined}
          onClick={() => onGoTo(currentMoveIdx + 1)}
          disabled={atEnd}
          className="grid h-8 w-8 place-items-center rounded-xs text-vault-text-secondary hover:bg-vault-surface-layer-2 hover:text-vault-text-primary disabled:opacity-30 cursor-pointer"
          title="Next Move (→)"
        >
          <ChevronRight size={16} />
        </motion.button>
        <motion.button
          type="button"
          whileTap={!atEnd ? { scale: 0.92 } : undefined}
          onClick={() => onGoTo(totalPlies)}
          disabled={atEnd}
          className="grid h-8 w-8 place-items-center rounded-xs text-vault-text-secondary hover:bg-vault-surface-layer-2 hover:text-vault-text-primary disabled:opacity-30 cursor-pointer"
          title="Last Move (End / ↓)"
        >
          <ChevronsRight size={16} />
        </motion.button>
      </div>

      {/* Move counter */}
      <span className="text-vault-text-muted text-[11px]">
        Move:{" "}
        <strong className="text-vault-text-primary">{Math.floor(currentMoveIdx / 2)}</strong>{" "}
        of {Math.floor(totalPlies / 2)} •{" "}
        {currentMoveIdx % 2 === 0 ? "White" : "Black"} to move
      </span>

      {/* Secondary controls */}
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={onFlipBoard}
          className="flex items-center gap-1 rounded-xs border border-vault-border-base px-2 py-1 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
          title="Flip Board Orientation (F)"
        >
          <RotateCw size={12} />
          <span>Flip</span>
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={onToggleAudio}
          className="grid h-7 w-7 place-items-center rounded-xs border border-vault-border-base text-vault-text-secondary hover:text-vault-text-primary cursor-pointer"
          title={isAudioMuted ? "Unmute commentary" : "Mute commentary"}
        >
          {isAudioMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={onToggleShortcuts}
          className={`grid h-7 w-7 place-items-center rounded-xs border text-vault-text-secondary hover:text-vault-text-primary cursor-pointer ${
            showShortcuts
              ? "border-vault-border-interactive text-vault-text-primary"
              : "border-vault-border-base"
          }`}
          title="Keyboard shortcuts"
        >
          <Keyboard size={13} />
        </motion.button>
      </div>
    </div>
  );
}
