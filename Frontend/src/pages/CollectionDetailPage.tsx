import { useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Layers,
  FolderMinus,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { MiniChessboard } from "../components/ui/MiniChessboard";
import { Modal } from "../components/ui/Modal";
import { CollectionDiscoveriesShowcase } from "../components/collections/CollectionDiscoveriesShowcase";
import {
  useFolder,
  useFolderGames,
  useFolderSummary,
  useUpdateFolder,
  useDeleteFolder,
} from "../hooks/useFolders";
import { useUpdateGame } from "../hooks/useGames";
import {
  getPlayerPerspective,
  parseOpeningDetails,
  getGameDate,
  getMoveCount,
} from "../utils/game";

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const folderId = id ?? "";

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSide, setSelectedSide] = useState<"all" | "white" | "black">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Queries
  const {
    data: folderData,
    isLoading: isFolderLoading,
    isError: isFolderError,
    error: folderError,
    refetch: refetchFolder,
  } = useFolder(folderId);

  const {
    data: summaryData,
  } = useFolderSummary(folderId);

  const {
    data: gamesData,
    isLoading: isGamesLoading,
    refetch: refetchGames,
  } = useFolderGames(folderId, {
    page: currentPage,
    limit: 12,
    search: searchQuery.trim() || undefined,
    userPlayedAs: selectedSide === "all" ? undefined : selectedSide,
  });

  const updateFolderMutation = useUpdateFolder();
  const deleteFolderMutation = useDeleteFolder();
  const updateGameMutation = useUpdateGame();

  const folder = folderData?.folder;
  const summary = summaryData?.summary;
  const games = gamesData?.games ?? [];
  const albumTotalGames = summary?.gameCount ?? gamesData?.total ?? 0;
  const matchingGamesCount = gamesData?.total ?? albumTotalGames;
  const totalPages = gamesData?.totalPages ?? 1;

  // Games already filtered server-side
  const filteredGames = games;

  // Remove game from this collection
  const handleRemoveGameFromFolder = async (gameId: string, currentFolderIds: string[] | null) => {
    try {
      const updated = (currentFolderIds ?? []).filter((fId) => fId !== folderId);
      await updateGameMutation.mutateAsync({
        id: gameId,
        data: {
          folderIds: updated.length > 0 ? updated : null,
        },
      });
      refetchGames();
    } catch {
      alert("Failed to remove game from album.");
    }
  };

  // Edit Collection Details
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    try {
      await updateFolderMutation.mutateAsync({
        id: folderId,
        data: {
          name: editName.trim(),
          description: editDesc.trim() || undefined,
        },
      });
      setIsEditModalOpen(false);
      refetchFolder();
    } catch {
      alert("Failed to update album. Please try again.");
    }
  };

  // Delete Collection
  const handleDeleteConfirm = async () => {
    try {
      await deleteFolderMutation.mutateAsync(folderId);
      navigate("/collections");
    } catch {
      alert("Failed to delete album. Please try again.");
    }
  };

  if (isFolderLoading) {
    return (
      <div className="mx-auto max-w-content px-6 py-10 font-body space-y-8 animate-pulse">
        <div className="h-6 w-32 rounded-xs bg-vault-surface-layer-1" />
        <div className="h-20 w-3/4 rounded-xs bg-vault-surface-layer-1" />
        <div className="h-64 rounded-vault bg-vault-surface-layer-1" />
      </div>
    );
  }

  if (isFolderError || !folder) {
    return (
      <div className="mx-auto max-w-content px-6 py-10 font-body space-y-6">
        <NavLink
          to="/collections"
          className="inline-flex items-center gap-2 font-mono text-xs text-vault-text-muted hover:text-vault-text-primary"
        >
          <ArrowLeft size={14} />
          <span>Back to Collections</span>
        </NavLink>
        <ErrorBanner
          message={folderError?.message || "Album not found."}
          onRetry={refetchFolder}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-6 py-10 font-body space-y-10">
      {/* TOP BREADCRUMB & BACK NAVIGATION */}
      <div className="flex items-center justify-between font-mono text-xs text-vault-text-muted">
        <NavLink
          to="/collections"
          className="inline-flex items-center gap-2 text-vault-text-muted hover:text-vault-bronze transition-colors"
        >
          <ArrowLeft size={14} />
          <span>All Collections</span>
        </NavLink>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditName(folder.name);
              setEditDesc(folder.description || "");
              setIsEditModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
          >
            <Edit2 size={12} />
            <span>Edit Album</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-1.5 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-loss/80 hover:border-vault-loss hover:text-vault-loss transition-colors cursor-pointer"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* ALBUM IDENTITY BANNER */}
      <section className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-vault-border-base pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs text-vault-bronze">
            <Layers size={14} />
            <span className="uppercase tracking-widest font-semibold">
              Personal Collection
            </span>
            <span>•</span>
            <span className="text-vault-text-muted">
              {albumTotalGames} {albumTotalGames === 1 ? "game" : "games"} preserved
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-normal text-vault-text-primary tracking-tight">
            {folder.name}
          </h1>

          <p className="max-w-2xl text-xs sm:text-sm text-vault-text-secondary leading-relaxed font-sans">
            {folder.description ||
              "A hand-curated anthology of your games and tournament moments."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NavLink to="/game-bank">
            <Button
              variant="secondary"
              className="flex items-center gap-1.5 px-4 py-2 font-mono text-xs uppercase"
            >
              <Plus size={13} />
              <span>Add From Game Bank</span>
            </Button>
          </NavLink>
        </div>
      </section>

      {/* PERSONAL STORY HIGHLIGHTS SHOWCASE (IF SUPPORTED) */}
      {summary?.discoveries && summary.discoveries.length > 0 && (
        <CollectionDiscoveriesShowcase discoveries={summary.discoveries} />
      )}

      {/* GAMES EXHIBITION HEADER & FILTERS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-vault-border-base pb-4">
          <div>
            <h2 className="font-display text-2xl font-normal text-vault-text-primary">
              Games in this Album
            </h2>
            <span className="font-mono text-xs text-vault-text-muted">
              {searchQuery.trim() || selectedSide !== "all"
                ? `Showing ${matchingGamesCount} matching of ${albumTotalGames} matches`
                : `Showing ${filteredGames.length} of ${albumTotalGames} matches`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Perspective Filter */}
            <div className="flex rounded-xs border border-vault-border-base bg-vault-surface-layer-1 p-0.5 font-mono text-xs">
              {(["all", "white", "black"] as const).map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => setSelectedSide(side)}
                  className={`rounded-xs px-2.5 py-1 uppercase transition-colors cursor-pointer ${
                    selectedSide === side
                      ? "bg-vault-bronze text-vault-surface font-semibold"
                      : "text-vault-text-muted hover:text-vault-text-primary"
                  }`}
                >
                  {side}
                </button>
              ))}
            </div>

            {/* In-Collection Search */}
            <div className="relative w-full sm:w-56">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-vault-text-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search opponent or opening..."
                className="w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-1 pl-8 pr-2.5 py-1.5 font-mono text-xs text-vault-text-primary outline-none focus:border-vault-bronze placeholder:text-vault-text-muted"
              />
            </div>
          </div>
        </div>

        {/* GAMES GRID */}
        {isGamesLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 animate-pulse"
              />
            ))}
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGames.map((game) => {
              const perspective = getPlayerPerspective(game);
              const opening = parseOpeningDetails(game);
              const gameDate = getGameDate(game);
              const moveCount = getMoveCount(game);

              return (
                <motion.article
                  key={game.id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.15 }}
                  className="group relative flex flex-col justify-between rounded-vault border border-vault-border-base hover:border-vault-border-interactive bg-vault-surface-layer-1 p-4 shadow-xs transition-colors"
                >
                  <div className="space-y-3">
                    {/* Top Row: Date, Result Badge & Remove Action */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded-xs px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            perspective.result === "win"
                              ? "bg-vault-win/15 text-vault-win border border-vault-win/30"
                              : perspective.result === "loss"
                                ? "bg-vault-loss/15 text-vault-loss border border-vault-loss/30"
                                : "bg-vault-draw/15 text-vault-draw border border-vault-draw/30"
                          }`}
                        >
                          {perspective.result}
                        </span>
                        <span className="text-vault-text-muted text-[11px]">{gameDate}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveGameFromFolder(game.id, game.folderIds)}
                        title="Remove from this album (keeps in Game Bank)"
                        className="rounded-xs p-1 text-vault-text-muted hover:bg-vault-surface-layer-2 hover:text-vault-loss transition-colors cursor-pointer"
                      >
                        <FolderMinus size={13} />
                      </button>
                    </div>

                    {/* Board preview */}
                    <div className="flex justify-center py-1">
                      <div className="w-full max-w-[200px]">
                        <MiniChessboard
                          fen={game.finalFen}
                          orientation={perspective.playerColor}
                          className="rounded-xs"
                        />
                      </div>
                    </div>

                    {/* Players */}
                    <div className="space-y-1 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="h-1.5 w-1.5 rounded-full bg-white border border-vault-border-base" />
                          <span
                            className={
                              game.userPlayedAs === "white"
                                ? "font-bold text-vault-text-primary"
                                : "text-vault-text-secondary"
                            }
                          >
                            {game.whitePlayer.username}
                          </span>
                        </span>
                        <span className="text-vault-text-muted text-[11px]">
                          {game.whitePlayer.rating}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-800 border border-vault-border-base" />
                          <span
                            className={
                              game.userPlayedAs === "black"
                                ? "font-bold text-vault-text-primary"
                                : "text-vault-text-secondary"
                            }
                          >
                            {game.blackPlayer.username}
                          </span>
                        </span>
                        <span className="text-vault-text-muted text-[11px]">
                          {game.blackPlayer.rating}
                        </span>
                      </div>
                    </div>

                    {/* Opening & Tag info */}
                    {opening.opening && (
                      <div className="text-[11px] text-vault-text-muted font-sans truncate">
                        {opening.eco ? `${opening.eco}: ` : ""}
                        {opening.opening}
                      </div>
                    )}
                  </div>

                  {/* Footer & Open Action */}
                  <div className="mt-4 flex items-center justify-between border-t border-vault-border-base/70 pt-2.5 font-mono text-[11px] text-vault-text-muted">
                    <span>{moveCount > 0 ? `${moveCount} moves` : ""}</span>
                    <NavLink
                      to={`/game/${game.id}`}
                      className="flex items-center gap-1 text-vault-bronze hover:underline font-semibold"
                    >
                      <span>Open</span>
                      <ExternalLink size={11} />
                    </NavLink>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-vault border border-dashed border-vault-border-base bg-vault-surface-layer-1/50 py-16 px-6 text-center">
            <h3 className="font-display text-xl font-normal text-vault-text-primary">
              No games in this album yet
            </h3>
            <p className="mt-1 max-w-sm text-xs text-vault-text-secondary leading-relaxed font-sans">
              Deposit matches into this album from your Game Bank to start building your personal record.
            </p>
            <NavLink to="/game-bank">
              <Button
                variant="solid-bronze"
                className="mt-4 flex items-center gap-1.5 px-4 py-2 font-mono text-xs uppercase"
              >
                <Plus size={13} />
                <span>Go to Game Bank</span>
              </Button>
            </NavLink>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4 font-mono text-xs">
            <Button
              variant="secondary"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1"
            >
              Previous
            </Button>
            <span className="text-vault-text-muted px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1"
            >
              Next
            </Button>
          </div>
        )}
      </section>

      {/* MODAL: EDIT COLLECTION */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Album"
        description="Update the title and personal notes for this album."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[10px] uppercase text-vault-text-muted mb-1">
              Album Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
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
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-2 text-vault-text-primary outline-none focus:border-vault-bronze font-sans text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="solid-bronze"
              disabled={updateFolderMutation.isPending || !editName.trim()}
            >
              {updateFolderMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Album"
        description="Are you sure you want to delete this album? Your games will remain safe in your Game Bank."
      >
        <div className="space-y-4 font-mono text-xs">
          <p className="text-vault-text-secondary leading-relaxed">
            Deleting <span className="font-bold text-vault-text-primary">"{folder.name}"</span> only
            removes this group. None of the underlying match records will be deleted from your vault.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Keep Album
            </Button>
            <Button
              type="button"
              variant="solid-bronze"
              className="bg-vault-loss hover:bg-vault-loss/90 border-vault-loss"
              disabled={deleteFolderMutation.isPending}
              onClick={handleDeleteConfirm}
            >
              {deleteFolderMutation.isPending ? "Deleting..." : "Delete Album"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
