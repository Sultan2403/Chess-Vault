import { ArrowLeft, Copy, Check, Printer, Share2, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

type GameViewerSubheaderProps = {
  gameId: string;
  copiedFen: boolean;
  sharedCopied: boolean;
  onCopyFen: () => void;
  onPrint: () => void;
  onShare: () => void;
};

export function GameViewerSubheader({
  gameId,
  copiedFen,
  sharedCopied,
  onCopyFen,
  onPrint,
  onShare,
}: GameViewerSubheaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-vault-border-base pb-4 mb-6 font-mono text-xs">
      <div className="flex items-center gap-3">
        <NavLink
          to="/game-bank"
          className="flex items-center gap-1.5 text-vault-text-secondary hover:text-vault-text-primary transition-colors"
        >
          <ArrowLeft size={13} />
          <span>VAULT INDEX</span>
        </NavLink>

        <span className="text-vault-text-muted">•</span>
        <span className="text-vault-text-muted">
          FOLIO #{gameId.slice(-8).toUpperCase()}
        </span>
        <span className="text-vault-text-muted">•</span>
        <span className="inline-flex items-center gap-1.5 rounded-xs border border-vault-win/30 bg-vault-win/10 px-2 py-0.5 text-[11px] text-vault-win font-semibold">
          <Shield size={11} /> Archived &amp; Verified
        </span>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={onCopyFen}
          className="flex items-center gap-1.5 rounded-xs border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copiedFen ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 text-vault-win font-semibold"
              >
                <Check size={12} className="text-vault-win" />
                <span>Copied</span>
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <Copy size={12} />
                <span>Copy FEN</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={onPrint}
          className="flex items-center gap-1.5 rounded-xs border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
        >
          <Printer size={12} />
          <span>Print Scoresheet</span>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={onShare}
          className="flex items-center gap-1.5 rounded-xs border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
        >
          <AnimatePresence mode="wait" initial={false}>
            {sharedCopied ? (
              <motion.span
                key="shared-copied"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 text-vault-win font-semibold"
              >
                <Check size={12} className="text-vault-win" />
                <span>Link Copied</span>
              </motion.span>
            ) : (
              <motion.span
                key="share"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <Share2 size={12} />
                <span>Share Artifact</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
