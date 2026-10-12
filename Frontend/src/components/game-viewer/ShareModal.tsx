import { useState } from "react";
import { Share2, Copy, Check, FileText, Globe, Code } from "lucide-react";
import { Modal } from "../ui/Modal";

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  pgn: string;
  currentFen: string;
};

export function ShareModal({
  isOpen,
  onClose,
  gameId: _gameId,
  pgn,
  currentFen,
}: ShareModalProps) {
  const [copiedField, setCopiedField] = useState<"link" | "pgn" | "fen" | null>(null);

  const matchUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = (text: string, field: "link" | "pgn" | "fen") => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-vault-text-primary">
          <Share2 size={15} className="text-vault-bronze" />
          <span>Share Match Ledger</span>
        </div>
      }
      description="Export or share this match record, position FEN, or complete PGN notation."
      maxWidth="md"
    >
      <div className="font-mono text-xs space-y-4">
        {/* Match URL */}
        <div>
          <span className="text-[10px] uppercase text-vault-text-muted block mb-1">
            Match Link
          </span>
          <div className="flex items-center gap-2 rounded-vault border border-vault-border-base bg-vault-surface-layer-2 px-3 py-2">
            <Globe size={13} className="text-vault-text-muted shrink-0" />
            <input
              type="text"
              readOnly
              value={matchUrl}
              className="w-full bg-transparent text-vault-text-primary outline-none truncate"
            />
            <button
              type="button"
              onClick={() => handleCopy(matchUrl, "link")}
              className="flex items-center gap-1 rounded-xs bg-vault-surface-layer-1 border border-vault-border-base px-2 py-1 text-vault-text-secondary hover:text-vault-text-primary transition-colors shrink-0 cursor-pointer"
            >
              {copiedField === "link" ? (
                <>
                  <Check size={12} className="text-vault-win" />
                  <span className="text-vault-win">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Current FEN */}
        <div>
          <span className="text-[10px] uppercase text-vault-text-muted block mb-1">
            Current Position (FEN)
          </span>
          <div className="flex items-center gap-2 rounded-vault border border-vault-border-base bg-vault-surface-layer-2 px-3 py-2">
            <Code size={13} className="text-vault-text-muted shrink-0" />
            <input
              type="text"
              readOnly
              value={currentFen}
              className="w-full bg-transparent text-vault-text-primary outline-none truncate text-[11px]"
            />
            <button
              type="button"
              onClick={() => handleCopy(currentFen, "fen")}
              className="flex items-center gap-1 rounded-xs bg-vault-surface-layer-1 border border-vault-border-base px-2 py-1 text-vault-text-secondary hover:text-vault-text-primary transition-colors shrink-0 cursor-pointer"
            >
              {copiedField === "fen" ? (
                <>
                  <Check size={12} className="text-vault-win" />
                  <span className="text-vault-win">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Full PGN */}
        <div>
          <span className="text-[10px] uppercase text-vault-text-muted block mb-1">
            Portable Game Notation (PGN)
          </span>
          <div className="flex items-center justify-between rounded-vault border border-vault-border-base bg-vault-surface-layer-2 px-3 py-2">
            <div className="flex items-center gap-2 text-vault-text-secondary">
              <FileText size={13} className="text-vault-text-muted" />
              <span>Complete game transcript & headers</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(pgn, "pgn")}
              className="flex items-center gap-1 rounded-xs bg-vault-surface-layer-1 border border-vault-border-base px-2 py-1 text-vault-text-secondary hover:text-vault-text-primary transition-colors cursor-pointer"
            >
              {copiedField === "pgn" ? (
                <>
                  <Check size={12} className="text-vault-win" />
                  <span className="text-vault-win">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy PGN</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-vault-border-base pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-vault bg-vault-surface-layer-2 border border-vault-border-base px-4 py-2 text-vault-text-primary hover:border-vault-border-interactive transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
