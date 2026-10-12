import { useState } from "react";
import { Folder, Check, Loader2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { useFolders } from "../../hooks/useFolders";
import { useUpdateGame } from "../../hooks/useGames";
import type { Game } from "@chess-vault/shared";

type MoveToCollectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
};

export function MoveToCollectionModal({
  isOpen,
  onClose,
  game,
}: MoveToCollectionModalProps) {
  const { data: foldersData, isLoading: isFoldersLoading } = useFolders();
  const updateGameMutation = useUpdateGame();

  const initialFolderIds = game.folderIds ?? [];
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>(initialFolderIds);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const folders = foldersData?.folders ?? [];

  const handleToggleFolder = (folderId: string) => {
    setSelectedFolderIds((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId],
    );
  };

  const handleSave = async () => {
    setErrorMsg(null);
    try {
      await updateGameMutation.mutateAsync({
        id: game.id,
        data: {
          folderIds: selectedFolderIds.length > 0 ? selectedFolderIds : null,
        },
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message ?? "Failed to update collections.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-vault-text-primary">
          <Folder size={15} className="text-vault-bronze" />
          <span>Assign to Collection</span>
        </div>
      }
      description="Choose which folios and study collections should contain this match ledger."
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
                  <div>
                    <p className="font-semibold text-vault-text-primary">{folder.name}</p>
                    {folder.description && (
                      <p className="text-[11px] text-vault-text-secondary line-clamp-1">
                        {folder.description}
                      </p>
                    )}
                  </div>
                  <div
                    className={`h-4 w-4 rounded-xs border flex items-center justify-center transition-colors ${
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
            disabled={updateGameMutation.isPending}
            className="flex items-center gap-1.5 rounded-vault bg-vault-bronze px-4 py-2 font-semibold text-vault-surface hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
          >
            {updateGameMutation.isPending && (
              <Loader2 size={13} className="animate-spin" />
            )}
            <span>Save</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
