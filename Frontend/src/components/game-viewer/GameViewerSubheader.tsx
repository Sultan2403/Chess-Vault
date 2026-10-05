import { ArrowLeft, Copy, Check, Printer, Share2, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";

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
        <button
          type="button"
          onClick={onCopyFen}
          className="flex items-center gap-1.5 rounded-xs border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
        >
          {copiedFen ? <Check size={12} className="text-vault-win" /> : <Copy size={12} />}
          <span>{copiedFen ? "Copied" : "Copy FEN"}</span>
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="flex items-center gap-1.5 rounded-xs border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
        >
          <Printer size={12} />
          <span>Print Scoresheet</span>
        </button>
        <button
          type="button"
          onClick={onShare}
          className="flex items-center gap-1.5 rounded-xs border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
        >
          {sharedCopied ? <Check size={12} className="text-vault-win" /> : <Share2 size={12} />}
          <span>{sharedCopied ? "Link Copied" : "Share Artifact"}</span>
        </button>
      </div>
    </div>
  );
}
