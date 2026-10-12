import { Download, ExternalLink, FolderPlus, Share2 } from "lucide-react";
import type { Game } from "@chess-vault/shared";

type GameActionsPanelProps = {
  onDownloadPgn: () => void;
  sourceUrl: Game["sourceUrl"];
  platform: Game["platform"];
  onOpenMoveToCollection?: () => void;
  onOpenShare?: () => void;
};

export function GameActionsPanel({
  onDownloadPgn,
  sourceUrl,
  platform,
  onOpenMoveToCollection,
  onOpenShare,
}: GameActionsPanelProps) {
  const platformLabel = platform === "chess.com" ? "CHESS.COM" : "LICHESS";

  return (
    <div className="grid grid-cols-2 gap-3 font-mono text-xs">
      <button
        type="button"
        onClick={onDownloadPgn}
        className="flex items-center justify-center gap-2 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 py-2.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
      >
        <Download size={13} />
        <span>DOWNLOAD PGN</span>
      </button>

      <a
        href={sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 py-2.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors"
      >
        <ExternalLink size={13} />
        <span>OPEN IN {platformLabel}</span>
      </a>

      <button
        type="button"
        onClick={onOpenMoveToCollection}
        className="flex items-center justify-center gap-2 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 py-2.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
      >
        <FolderPlus size={13} />
        <span>MOVE TO COLLECTION</span>
      </button>

      <button
        type="button"
        onClick={onOpenShare}
        className="flex items-center justify-center gap-2 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 py-2.5 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
      >
        <Share2 size={13} />
        <span>SHARE MATCH</span>
      </button>
    </div>
  );
}
