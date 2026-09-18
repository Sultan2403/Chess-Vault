import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  FolderPlus,
} from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Button } from "../components/ui/Button";
import { MiniChessboard } from "../components/ui/MiniChessboard";
import { useFolders, useCreateFolder } from "../hooks/useFolders";
import { useGames } from "../hooks/useGames";
import { useUser } from "@clerk/react";
import { getPlayerPerspective, parseOpeningDetails, getGameDate, getMoveCount } from "../utils/game";
import { usePlatformUsernames } from "../hooks/useAccount";

export default function CollectionsPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSide, setSelectedSide] = useState<"all" | "white" | "black">("all");
  const [sortBy, setSortBy] = useState<"chronological" | "elo">("chronological");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Queries
  const { data: foldersData, isLoading: isFoldersLoading } = useFolders();
  const createFolderMutation = useCreateFolder();
  const platformUsernames = usePlatformUsernames();

  const folders = foldersData?.folders ?? [];
  const activeFolder =
    folders.find((f) => f.id === selectedFolderId) ?? folders[0] ?? null;

  // Query games belonging to active folder
  const { data: gamesData, isLoading: isGamesLoading } = useGames({
    folderIds: activeFolder ? [activeFolder.id] : undefined,
    page: currentPage,
    limit: 10,
    search: searchQuery.trim() || undefined,
  });

  const games = gamesData?.games ?? [];
  const totalGames = gamesData?.pagination?.total ?? 0;
  const totalPages = gamesData?.pagination?.totalPages ?? 1;

  // Filter and sort games
  const filteredGames = useMemo(() => {
    return games
      .filter((g) => {
        const perspective = getPlayerPerspective(g, platformUsernames, user?.username ?? undefined);
        if (selectedSide === "white" && perspective.playerColor !== "white") return false;
        if (selectedSide === "black" && perspective.playerColor !== "black") return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "elo") {
          return b.whitePlayer.rating - a.whitePlayer.rating;
        }
        return new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime();
      });
  }, [games, selectedSide, sortBy, platformUsernames, user?.username]);

  // Folder Metrics
  const folderMetrics = useMemo(() => {
    if (games.length === 0) {
      return { wins: 0, draws: 0, losses: 0, avgRating: 0, annotated: 0 };
    }
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let totalRating = 0;
    let annotated = 0;

    games.forEach((g) => {
      const p = getPlayerPerspective(g, platformUsernames, user?.username ?? undefined);
      if (p.result === "win") wins++;
      else if (p.result === "draw") draws++;
      else losses++;

      totalRating += (g.whitePlayer.rating + g.blackPlayer.rating) / 2;
      if (g.notes || g.tags) annotated++;
    });

    return {
      wins,
      draws,
      losses,
      avgRating: Math.round(totalRating / games.length),
      annotated,
    };
  }, [games, platformUsernames, user?.username]);

  // Handle Create Folder
  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const result = await createFolderMutation.mutateAsync({
        name: newFolderName.trim(),
        description: newFolderDesc.trim() || undefined,
      });
      setSelectedFolderId(result.folder.id);
      setNewFolderName("");
      setNewFolderDesc("");
      setIsCreatingFolder(false);
    } catch {
      alert("Failed to create folder. Please try again.");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-content px-6 py-10 font-body space-y-8">
        {/* FOLDER / ANTHOLOGY HEADER */}
        <section className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-vault-border-base pb-8">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-vault-bronze">
              Curated Folder Registry • Repertoire &amp; Monograph Anthologies
            </span>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-normal text-vault-text-primary tracking-tight">
              {activeFolder ? activeFolder.name : "Folders & Collections"}
            </h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-vault-text-secondary leading-relaxed font-sans">
              {activeFolder?.description ||
                "Organize your competitive matches, training monographs, and repertoires into timeless curated folders."}
            </p>

            {/* Folder Switcher Pills */}
            {folders.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="text-vault-text-muted text-[10px] uppercase">Active Folder:</span>
                {folders.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setSelectedFolderId(f.id);
                      setCurrentPage(1);
                    }}
                    className={`rounded-xs px-2.5 py-1 text-[11px] transition-colors cursor-pointer ${
                      activeFolder?.id === f.id
                        ? "bg-vault-bronze text-vault-surface font-semibold"
                        : "border border-vault-border-base bg-vault-surface-layer-1 text-vault-text-secondary hover:text-vault-text-primary"
                    }`}
                  >
                    📁 {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              className="flex items-center gap-1.5 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-2 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
            >
              <Plus size={13} />
              <span>NEW FOLDER</span>
            </button>
            <Button
              variant="solid-bronze"
              onClick={() => navigate("/game-bank")}
              className="px-4 py-2 font-mono text-xs uppercase"
            >
              <Plus size={13} /> DEPOSIT GAME
            </Button>
          </div>
        </section>

        {/* Modal: Create Folder */}
        {isCreatingFolder && (
          <div className="rounded-vault border border-vault-border-interactive bg-vault-surface-layer-2 p-6 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-vault-border-base pb-3">
              <span className="font-bold text-vault-text-primary">Create New Folder</span>
              <button
                type="button"
                onClick={() => setIsCreatingFolder(false)}
                className="text-vault-text-muted hover:text-vault-text-primary"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateFolderSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-[10px] uppercase text-vault-text-muted block mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Tournament Matches 2025, Najdorf Defense Lab"
                  className="w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-2 text-vault-text-primary outline-none focus:border-vault-bronze"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-vault-text-muted block mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  placeholder="e.g. Classical FIDE tournament matches and post-mortem analysis"
                  className="w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-2 text-vault-text-primary outline-none focus:border-vault-bronze"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCreatingFolder(false)}
                  className="px-3 py-1.5 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="solid-bronze"
                  disabled={createFolderMutation.isPending}
                  className="px-4 py-1.5 text-xs"
                >
                  {createFolderMutation.isPending ? "Creating..." : "Save Folder"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 5-METRIC STRIP */}
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 font-mono">
          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4">
            <span className="text-[9px] uppercase tracking-wider text-vault-text-muted block">
              Preserved Matches
            </span>
            <span className="mt-1 font-display text-2xl font-bold text-vault-text-primary">
              {isGamesLoading ? "..." : totalGames} <span className="font-mono text-xs font-normal text-vault-text-muted">entries</span>
            </span>
          </div>

          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4">
            <span className="text-[9px] uppercase tracking-wider text-vault-text-muted block">
              Score Distribution
            </span>
            <span className="mt-1 font-display text-2xl font-bold text-vault-text-primary">
              {folderMetrics.wins} <span className="font-mono text-xs text-vault-win">W</span> / {folderMetrics.draws} <span className="font-mono text-xs text-vault-draw">D</span> / {folderMetrics.losses} <span className="font-mono text-xs text-vault-loss">L</span>
            </span>
          </div>

          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4">
            <span className="text-[9px] uppercase tracking-wider text-vault-text-muted block">
              Average Rating
            </span>
            <span className="mt-1 font-display text-2xl font-bold text-vault-text-primary">
              {folderMetrics.avgRating > 0 ? folderMetrics.avgRating : "---"}
            </span>
          </div>

          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4">
            <span className="text-[9px] uppercase tracking-wider text-vault-text-muted block">
              Annotated Studies
            </span>
            <span className="mt-1 font-display text-2xl font-bold text-vault-text-primary">
              {folderMetrics.annotated} <span className="font-mono text-xs text-vault-text-muted">with notes</span>
            </span>
          </div>

          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4">
            <span className="text-[9px] uppercase tracking-wider text-vault-text-muted block">
              Ledger Synchronized
            </span>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-vault-win">
              <span className="h-1.5 w-1.5 rounded-full bg-vault-win" />
              <span>Live Index</span>
            </div>
          </div>
        </section>

        {/* SEARCH & FILTER TOOLBAR */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-y border-vault-border-base py-3 font-mono text-xs">
          {/* Search */}
          <div className="relative flex-1 min-w-[280px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by opponent, opening, tournament or note..."
              className="w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-1 py-1.5 pl-8 pr-3 text-xs text-vault-text-primary outline-none focus:border-vault-bronze placeholder:text-vault-text-muted"
            />
          </div>

          {/* Sort & Side Tabs */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-vault-text-muted uppercase text-[10px]">SORT BY:</span>
              {(["chronological", "elo"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSortBy(s)}
                  className={`capitalize transition-colors cursor-pointer ${
                    sortBy === s
                      ? "text-vault-bronze font-semibold underline underline-offset-4"
                      : "text-vault-text-secondary hover:text-vault-text-primary"
                  }`}
                >
                  {s === "chronological" ? "Chronological" : "Elo Rating"}
                </button>
              ))}
            </div>

            {/* Side Tabs */}
            <div className="flex items-center rounded-xs border border-vault-border-base bg-vault-surface-layer-1 p-0.5">
              {(["all", "white", "black"] as const).map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => setSelectedSide(side)}
                  className={`rounded-xs px-2.5 py-1 text-[11px] capitalize transition-colors cursor-pointer ${
                    selectedSide === side
                      ? "bg-vault-surface-layer-2 text-vault-text-primary font-semibold shadow-xs"
                      : "text-vault-text-muted hover:text-vault-text-primary"
                  }`}
                >
                  {side === "all" ? "All Sides" : side === "white" ? "♙ White" : "♟ Black"}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* MATCH LEDGER ROWS */}
        {isFoldersLoading || isGamesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 h-48 animate-pulse"
              />
            ))}
          </div>
        ) : folders.length === 0 ? (
          <div className="rounded-vault border border-dashed border-vault-border-interactive bg-vault-surface-layer-1 p-12 text-center space-y-4">
            <FolderKanban size={32} className="text-vault-bronze mx-auto" />
            <h3 className="font-display text-lg font-bold text-vault-text-primary">
              No Folders Created Yet
            </h3>
            <p className="text-xs text-vault-text-secondary max-w-md mx-auto">
              Curate your personal opening repertoires, tournament histories, and classical games into custom folders.
            </p>
            <Button
              variant="solid-bronze"
              onClick={() => setIsCreatingFolder(true)}
              className="text-xs font-mono uppercase px-4 py-2"
            >
              <FolderPlus size={13} className="mr-1.5" /> Create Your First Folder
            </Button>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="rounded-vault border border-dashed border-vault-border-interactive bg-vault-surface-layer-1 p-12 text-center space-y-4">
            <FolderKanban size={32} className="text-vault-bronze mx-auto" />
            <h3 className="font-display text-lg font-bold text-vault-text-primary">
              Folder is Empty
            </h3>
            <p className="text-xs text-vault-text-secondary max-w-md mx-auto">
              No games found in &ldquo;{activeFolder?.name}&rdquo;. Navigate to the Game Bank to add games to this folder.
            </p>
            <Button
              variant="solid-bronze"
              onClick={() => navigate("/game-bank")}
              className="text-xs font-mono uppercase px-4 py-2"
            >
              Browse Game Bank
            </Button>
          </div>
        ) : (
          <section className="space-y-6">
            {filteredGames.map((game) => {
              const perspective = getPlayerPerspective(game, platformUsernames, user?.username ?? undefined);
              const { opening, variation, eco } = parseOpeningDetails(game);
              const resultBadgeClasses =
                perspective.result === "win"
                  ? "bg-vault-win/15 text-vault-win border-vault-win/30"
                  : perspective.result === "loss"
                    ? "bg-vault-loss/15 text-vault-loss border-vault-loss/30"
                    : "bg-vault-draw/15 text-vault-draw border-vault-draw/30";

              const resultBadgeText =
                game.result === "draw"
                  ? "½ - ½"
                  : game.result === "white"
                    ? "1 - 0"
                    : "0 - 1";

              return (
                <article
                  key={game.id}
                  className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 grid gap-6 md:grid-cols-[130px_1fr_200px] items-start hover:border-vault-border-interactive transition-all font-mono text-xs"
                >
                  {/* LEFT: Mini Chessboard */}
                  <div>
                    <MiniChessboard
                      fen="r1b2rk1/1pq1bppp/p1n1pn2/3p4/2PN4/1PN1P3/PB2BPPP/R2Q1RK1 w - - 0 11"
                      orientation={perspective.playerColor}
                      badgeLabel={resultBadgeText}
                    />
                    <div className="mt-2 text-center text-[10px] text-vault-text-muted uppercase">
                      <span>Side: {perspective.playerColor}</span>
                    </div>
                  </div>

                  {/* CENTER: Match Info, Notes, Tags */}
                  <div className="space-y-3 min-w-0">
                    <div className="flex items-center justify-between border-b border-vault-border-base pb-2 text-vault-text-muted text-[11px]">
                      <span>{game.platform.toUpperCase()} ENCOUNTER</span>
                      <span className="text-vault-bronze">★</span>
                    </div>

                    {/* Players */}
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="h-2 w-2 rounded-full bg-vault-text-primary" />
                        <span className="text-sm font-bold text-vault-text-primary">{game.whitePlayer.username}</span>
                        <span className="ml-auto font-semibold text-vault-text-primary">{game.whitePlayer.rating}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="h-2 w-2 rounded-full bg-vault-border-interactive" />
                        <span className="text-sm font-bold text-vault-text-primary">{game.blackPlayer.username}</span>
                        <span className="ml-auto font-semibold text-vault-text-primary">{game.blackPlayer.rating}</span>
                      </div>
                    </div>

                    {/* Match Details */}
                    <p className="text-[11px] text-vault-text-muted">
                      {opening || game.title || "Archived Game"} {eco ? `• ECO ${eco}` : ""} • {getMoveCount(game)} Moves • {game.timeClass} • {getGameDate(game, "MMM dd, yyyy")}
                    </p>

                    {/* Monograph Note Callout Box */}
                    {game.notes && (
                      <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-2 p-3 text-xs">
                        <div className="text-[10px] uppercase text-vault-bronze tracking-wider font-semibold mb-1">
                          Monograph Note
                        </div>
                        <p className="font-sans text-xs italic text-vault-text-secondary leading-relaxed">
                          &ldquo;{game.notes}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Result Badge & Variation */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className={`rounded-xs border px-2 py-0.5 font-bold ${resultBadgeClasses}`}>
                        {resultBadgeText}
                      </span>
                      {variation && (
                        <span className="rounded-xs border border-vault-border-base bg-vault-surface-layer-2 px-2 py-0.5 text-[10px] text-vault-text-muted uppercase">
                          {variation}
                        </span>
                      )}
                      {game.tags && (
                        <span className="rounded-xs border border-vault-border-base bg-vault-surface-layer-2 px-2 py-0.5 text-[10px] text-vault-text-muted uppercase">
                          {game.tags}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: Actions */}
                  <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-2 p-3 space-y-3">
                    <span className="text-[10px] uppercase tracking-wider text-vault-text-muted block border-b border-vault-border-base pb-1.5">
                      Archival Tools
                    </span>

                    <div className="pt-2 space-y-1.5">
                      <Link to={`/game/${game.id}`} className="block">
                        <Button variant="secondary" className="w-full text-[10px] py-1.5">
                          Launch Replay Suite <ExternalLink size={10} className="ml-1" />
                        </Button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(game.pgn);
                          alert("PGN copied!");
                        }}
                        className="w-full rounded-xs border border-vault-border-base py-1 text-[10px] text-vault-text-muted hover:text-vault-text-primary text-center cursor-pointer"
                      >
                        Copy PGN
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* FOLDER PAGINATION */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-t border-vault-border-base pt-6 font-mono text-xs text-vault-text-muted">
          <span>Displaying entries in &ldquo;{activeFolder?.name ?? "Folder"}&rdquo;</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 rounded-xs border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-secondary hover:text-vault-text-primary disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={13} /> Prev
            </button>
            <span className="px-2 font-bold text-vault-text-primary">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 rounded-xs border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-secondary hover:text-vault-text-primary disabled:opacity-30 cursor-pointer"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
