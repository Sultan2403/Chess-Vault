import { useState, useEffect } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useBulkDeleteGames } from "../../hooks/useGames";
import { getApiErrorMessage } from "../../utils/apiError";

type PurgeGamesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  gameIds: string[];
  onSuccess?: () => void;
};

export function PurgeGamesModal({
  isOpen,
  onClose,
  gameIds,
  onSuccess,
}: PurgeGamesModalProps) {
  const bulkDeleteMutation = useBulkDeleteGames();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const count = gameIds.length;
  const isOverLimit = count > 100;

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
    }
  }, [isOpen]);

  const handleConfirmPurge = async () => {
    setErrorMsg(null);
    if (count === 0) return;
    if (isOverLimit) {
      setErrorMsg("Cannot purge more than 100 matches at once. Please reduce your selection.");
      return;
    }

    try {
      await bulkDeleteMutation.mutateAsync({
        gameIds,
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-vault-loss">
          <Trash2 size={16} />
          <span>Purge {count} {count === 1 ? "Match" : "Matches"}</span>
        </div>
      }
      description="This action is permanent and cannot be undone."
      maxWidth="md"
    >
      <div className="font-mono text-xs space-y-4">
        {errorMsg && (
          <div className="rounded-xs border border-vault-loss/40 bg-vault-loss/10 p-3 text-vault-loss">
            {errorMsg}
          </div>
        )}

        <div className="rounded-vault border border-vault-loss/20 bg-vault-loss/5 p-4 text-vault-text-secondary leading-relaxed font-sans text-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-vault-loss shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-vault-text-primary">
                Permanent Vault Purge
              </p>
              <p className="mt-1">
                You are about to permanently remove{" "}
                <strong className="text-vault-text-primary font-mono">{count}</strong>{" "}
                match record{count === 1 ? "" : "s"} from your private archive. Associated
                PGNs, move ledgers, terminal positions, and notes will be expunged.
              </p>
            </div>
          </div>
        </div>

        {isOverLimit && (
          <div className="rounded-xs border border-vault-draw/40 bg-vault-draw/10 p-2.5 text-vault-draw text-[11px]">
            Notice: The vault supports purging up to 100 matches per operation. Please deselect{" "}
            {count - 100} match{count - 100 === 1 ? "" : "es"} to proceed.
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-vault-border-base">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={bulkDeleteMutation.isPending}
            className="px-3 py-1.5 font-mono text-xs text-vault-text-muted hover:text-vault-text-primary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmPurge}
            disabled={bulkDeleteMutation.isPending || isOverLimit || count === 0}
            className="px-4 py-1.5 font-mono text-xs uppercase"
          >
            {bulkDeleteMutation.isPending ? (
              <>
                <Loader2 size={13} className="animate-spin mr-1.5" />
                <span>Purging...</span>
              </>
            ) : (
              <span>Confirm Purge</span>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
