import { useState, useMemo } from "react";
import { Plus, Search, FolderPlus, Compass } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Modal } from "../components/ui/Modal";
import { CollectionCard } from "../components/collections/CollectionCard";
import { useFolders, useCreateFolder } from "../hooks/useFolders";

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");

  const {
    data: foldersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useFolders({ limit: 50 });

  const createFolderMutation = useCreateFolder();
  const folders = foldersData?.folders ?? [];

  const filteredFolders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return folders;
    return folders.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q)),
    );
  }, [folders, searchQuery]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await createFolderMutation.mutateAsync({
        name: newFolderName.trim(),
        description: newFolderDesc.trim() || undefined,
      });
      setNewFolderName("");
      setNewFolderDesc("");
      setIsCreateModalOpen(false);
    } catch {
      // Error state is rendered inline via createFolderMutation.isError
    }
  };

  return (
    <div className="mx-auto max-w-content px-6 py-10 font-body space-y-8">
      {/* HEADER SECTION */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-vault-border-base pb-8">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-vault-bronze uppercase tracking-widest">
            <Compass size={14} />
            <span>Personal Chess History • Anthologies</span>
          </div>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-normal text-vault-text-primary tracking-tight">
            Collections
          </h1>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm text-vault-text-secondary leading-relaxed font-sans">
            Personal albums of your chess journey. Each collection brings together matches
            you have chosen to keep together, ready to be revisited.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="solid-bronze"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase"
          >
            <Plus size={14} />
            <span>New Album</span>
          </Button>
        </div>
      </section>

      {/* SEARCH AND FILTERS */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-text-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search albums by title or note..."
            className="w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-1 pl-9 pr-3 py-2 font-mono text-xs text-vault-text-primary placeholder:text-vault-text-muted outline-none focus:border-vault-bronze transition-colors"
          />
        </div>

        <div className="font-mono text-xs text-vault-text-muted">
          Showing {filteredFolders.length} {filteredFolders.length === 1 ? "album" : "albums"}
        </div>
      </section>

      {/* ERROR STATE */}
      {isError && (
        <ErrorBanner
          message={error?.message || "Failed to load collections"}
          onRetry={refetch}
        />
      )}

      {/* ALBUMS GRID */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 animate-pulse"
            />
          ))}
        </div>
      ) : filteredFolders.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFolders.map((folder) => (
            <CollectionCard key={folder.id} folder={folder} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-vault border border-dashed border-vault-border-base bg-vault-surface-layer-1/50 py-16 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-vault-surface-layer-2 text-vault-bronze mb-4">
            <FolderPlus size={24} />
          </div>
          <h3 className="font-display text-xl font-normal text-vault-text-primary">
            {searchQuery ? "No matching albums" : "No collections yet"}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-vault-text-secondary leading-relaxed font-sans">
            {searchQuery
              ? "Try adjusting your search query to find your collection."
              : "Begin grouping matches into meaningful albums—tournament runs, opening laboratories, or memorable battles."}
          </p>
          {!searchQuery && (
            <Button
              variant="solid-bronze"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-5 flex items-center gap-1.5 px-4 py-2 font-mono text-xs uppercase"
            >
              <Plus size={13} />
              <span>Create First Album</span>
            </Button>
          )}
        </div>
      )}

      {/* MODAL: CREATE COLLECTION */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          createFolderMutation.reset();
        }}
        title="Create New Album"
        description="Organize your competitive matches and training studies into a personal collection."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 font-mono text-xs">
          {createFolderMutation.isError && (
            <ErrorBanner
              compact
              error={createFolderMutation.error}
              message="Failed to create collection. Please try again."
              onDismiss={() => createFolderMutation.reset()}
            />
          )}
          <div>
            <label className="block text-[10px] uppercase text-vault-text-muted mb-1">
              Album Name
            </label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. 2025 Classical Championships, Sicilian Lab"
              required
              className="w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-2 text-vault-text-primary outline-none focus:border-vault-bronze"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-vault-text-muted mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={newFolderDesc}
              onChange={(e) => setNewFolderDesc(e.target.value)}
              placeholder="Add personal notes or context about this group of games..."
              className="w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-2 text-vault-text-primary outline-none focus:border-vault-bronze font-sans text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="solid-bronze"
              disabled={createFolderMutation.isPending || !newFolderName.trim()}
            >
              {createFolderMutation.isPending ? "Creating..." : "Create Album"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
