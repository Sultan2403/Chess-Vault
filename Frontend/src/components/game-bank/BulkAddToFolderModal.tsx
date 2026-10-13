import { useState, useEffect } from "react";
import { Folder, Check, Loader2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { useFolders } from "../../hooks/useFolders";
import { useBulkAddFolderIds } from "../../hooks/useGames";
import { getApiErrorMessage } from "../../utils/apiError";

type BulkAddToFolderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  gameIds: string[];
  onSuccess?: () => void;
};

export function BulkAddToFolderModal({
  isOpen,
  onClose,
  gameIds,
  onSuccess,
}: BulkAddToFolderModalProps) {
  const { data: foldersData, isLoading: isFoldersLoading } = useFolders();
  const bulkAddMutation = useBulkAddFolderIds();

  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const folders = foldersData?.folders ?? [];
  const totalGames = gameIds.length;

  useEffect(() => {
    if (isOpen) {
      setSelectedFolderIds([]);
      setErrorMsg(null);
    }
  }, [isOpen]);

  const handleToggleFolder = (folderId: string) => {
    setSelectedFolderIds((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId],
    );
  };

  const handleSave = async () => {
    setErrorMsg(null);
    if (selectedFolderIds.length === 0) {
      setErrorMsg("Please select at least one collection to add to.");
      return;
    }
    try {
      await bulkAddMutation.mutateAsync({
        gameIds,
        folderIds: selectedFolderIds,
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
        <div className="flex items-center gap-2 text-vault-text-primary">
          <Folder size={15} className="text-vault-bronze" />
          <span>Add {totalGames} {totalGames === 1 ? "Match" : "Matches"} to Collection</span>
        </div>
      }
      description="Select the destination collections. Matches will be added and any existing collections will be preserved without duplicates."
      maxWidth="md"
    >
      <div className="font-mono text-xs">
        {errorMsg && (
          <div className="mb-3 rounded-xs border border-vault-loss/40 bg-vault-loss/10 p-2 text-vault-loss">
            {errorMsg}
          </div>
        )}

        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {isFoldersLoading ? (
            <div className="flex items-center justify-center py-8 text-vault-text-muted">
              <Loader2 size={16} className="animate-spin mr-2" />
              <span>Loading collections...</span>
            </div>
          ) : folders.length === 0 ? (
            <p className="py-6 text-center text-vault-text-muted italic">
              No collections found. Create a collection from the Collections page first.
            </p>
          ) : (
            folders.map((folder) => {
              const isChecked = selectedFolderIds.includes(folder.id);
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => handleToggleFolder(folder.id)}
                  className={`w-full flex items-center justify-between rounded-vault border p-3 text-left transition-colors cursor-pointer ${
                    isChecked
                      ? "border-vault-bronze/60 bg-vault-surface-layer-2"
                      : "border-vault-border-base bg-vault-surface-layer-1 hover:border-vault-border-interactive"
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-semibold text-vault-text-primary truncate">{folder.name}</p>
                    {folder.description && (
                      <p className="text-[11px] text-vault-text-secondary line-clamp-1 mt-0.5">
                        {folder.description}
                      </p>
                    )}
                  </div>
                  <div
                    className={`h-4 w-4 shrink-0 rounded-xs border flex items-center justify-center transition-colors ${
                      isChecked
                        ? "border-vault-bronze bg-vault-bronze text-vault-surface"
                        : "border-vault-border-base"
                    }`}
                  >
                    {isChecked && <Check size={12} strokeWidth={3} />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-vault-border-base pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-vault border border-vault-border-base px-4 py-2 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={bulkAddMutation.isPending}
            className="flex items-center gap-1.5 rounded-vault bg-vault-bronze px-4 py-2 font-semibold text-vault-surface hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
          >
            {bulkAddMutation.isPending && (
              <Loader2 size={13} className="animate-spin" />
            )}
            <span>Add to Collections</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
