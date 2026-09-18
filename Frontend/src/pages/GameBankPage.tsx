import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Bookmark,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Download,
  Trash2,
  CheckSquare,
  Square,
  Database,
} from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Button } from "../components/ui/Button";
import { MiniChessboard } from "../components/ui/MiniChessboard";
import { useGames } from "../hooks/useGames";
import { useFolders } from "../hooks/useFolders";
import { parseOpeningDetails, getGameDate, getMoveCount } from "../utils/game";

import type { TimeClassType } from "@chess-vault/shared";

export default function GameBankPage() {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [platformTab, setPlatformTab] = useState<
    "ALL" | "CHESS.COM" | "LICHESS"
  >("ALL");
  const [outcomeFilter, setOutcomeFilter] = useState<
    "all" | "win" | "draw" | "loss"
  >("all");
  const [cadenceFilter, setCadenceFilter] = useState<"all" | TimeClassType>("all");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const [selectedGameIds, setSelectedGameIds] = useState<Set<string>>(
    new Set(),
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Queries
  const platformParam =
    platformTab === "CHESS.COM"
      ? "chess.com"
      : platformTab === "LICHESS"
        ? "lichess"
        : undefined;

  const resultParam =
    outcomeFilter === "win"
      ? "white"
      : outcomeFilter === "loss"
        ? "black"
        : outcomeFilter === "draw"
          ? "draw"
          : undefined;

  const timeClassParam: TimeClassType | undefined =
    cadenceFilter === "all" ? undefined : cadenceFilter;

  const folderIdsParam =
    selectedFolderId === "all" ? undefined : [selectedFolderId];

  const { data: gamesData, isLoading: isGamesLoading } = useGames({
    page: currentPage,
    limit: 12,
    search: searchQuery.trim() || undefined,
    platform: platformParam,
    result: resultParam,
    timeClass: timeClassParam,
    folderIds: folderIdsParam,
  });

  const { data: foldersData } = useFolders();

  const games = gamesData?.games ?? [];
  const pagination = gamesData?.pagination;
  const totalGames = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(totalGames / 12));

  // Multi-select actions
  const isAllSelected =
    games.length > 0 && games.every((g) => selectedGameIds.has(g.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedGameIds(new Set());
    } else {
      setSelectedGameIds(new Set(games.map((g) => g.id)));
    }
  };

  const handleToggleGame = (id: string) => {
    const next = new Set(selectedGameIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedGameIds(next);
  };

  // Metrics
  const calculatedStats = useMemo(() => {
    if (games.length === 0) {
      return { winPct: "0.0%", uniqueEcos: 0 };
    }
    const wins = games.filter((g) => g.result === "white").length;
    const winPct = ((wins / games.length) * 100).toFixed(1) + "%";
    const ecos = new Set(
      games.map((g) => parseOpeningDetails(g).eco).filter(Boolean),
    );
    return { winPct, uniqueEcos: ecos.size };
  }, [games]);

  return (
    <AppShell>
      <div className="mx-auto max-w-content px-6 py-10 font-body space-y-8">
        {/* HERO / CATALOG HEADER */}
        <section className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-vault-border-base pb-8">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-vault-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-vault-win" />
              <span>PERMANENT MATCH LEDGER</span>
              <span>•</span>
              <span className="text-vault-bronze uppercase">
                Active Registry
              </span>
            </div>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-normal text-vault-text-primary tracking-tight">
              Game Bank
            </h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-vault-text-secondary leading-relaxed font-sans">
              A cataloged repository of your competitive encounters, annotated
              studies, and cross-platform tournament bulletins.
            </p>
          </div>

          <div className="flex gap-4 font-mono">
            <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4 text-center min-w-[100px]">
              <span className="text-[9px] uppercase tracking-wider text-vault-text-muted block">
                Archived Total
              </span>
              <span className="font-display text-xl font-bold text-vault-text-primary block mt-1">
                {isGamesLoading ? "..." : totalGames.toLocaleString()}
              </span>
              <span className="text-[10px] text-vault-text-muted">games</span>
            </div>
            <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4 text-center min-w-[100px]">
              <span className="text-[9px] uppercase tracking-wider text-vault-text-muted block">
                Win Margin
              </span>
              <span className="font-display text-xl font-bold text-vault-win block mt-1">
                {calculatedStats.winPct}
              </span>
              <span className="text-[10px] text-vault-text-muted">page avg</span>
            </div>
            <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4 text-center min-w-[100px]">
              <span className="text-[9px] uppercase tracking-wider text-vault-text-muted block">
                Unique ECOs
              </span>
              <span className="font-display text-xl font-bold text-vault-text-primary block mt-1">
                {calculatedStats.uniqueEcos}
              </span>
              <span className="text-[10px] text-vault-text-muted">lines</span>
            </div>
          </div>
        </section>

        {/* SEARCH AND PLATFORM FILTER CONTROLS */}
        <section className="space-y-4 font-mono text-xs">
          {/* Search bar + platform selector tabs */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-text-muted"
              />
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter by opponent, opening (e.g. 'Sicilian', 'B90'), event, or note..."
                className="w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-1 py-2 pl-9 pr-3 text-xs text-vault-text-primary outline-none focus:border-vault-bronze placeholder:text-vault-text-muted"
              />
            </div>

            {/* Platform Tabs */}
            <div className="flex items-center rounded-xs border border-vault-border-base bg-vault-surface-layer-1 p-0.5">
              {(["ALL", "CHESS.COM", "LICHESS"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setPlatformTab(tab);
                      setCurrentPage(1);
                    }}
                    className={`rounded-xs px-3 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                      platformTab === tab
                        ? "bg-vault-surface-layer-2 text-vault-text-primary shadow-xs"
                        : "text-vault-text-muted hover:text-vault-text-primary"
                    }`}
                  >
                    {tab}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Filter Dropdowns Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
            {/* Folder dropdown */}
            <div>
              <span className="text-[10px] uppercase text-vault-text-muted block mb-1">
                Folder / Collection
              </span>
              <select
                value={selectedFolderId}
                onChange={(e) => {
                  setSelectedFolderId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-primary outline-none focus:border-vault-bronze cursor-pointer"
              >
                <option value="all">All Folders (Archived Total)</option>
                {foldersData?.folders?.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Outcome Result buttons */}
            <div>
              <span className="text-[10px] uppercase text-vault-text-muted block mb-1">
                Outcome Result
              </span>
              <div className="flex rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setOutcomeFilter(outcomeFilter === "win" ? "all" : "win");
                    setCurrentPage(1);
                  }}
                  className={`flex-1 py-1 text-center rounded-xs text-[10px] font-bold cursor-pointer ${
                    outcomeFilter === "win"
                      ? "bg-vault-win/20 text-vault-win"
                      : "text-vault-text-muted hover:text-vault-text-primary"
                  }`}
                >
                  1-0
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOutcomeFilter(outcomeFilter === "draw" ? "all" : "draw");
                    setCurrentPage(1);
                  }}
                  className={`flex-1 py-1 text-center rounded-xs text-[10px] font-bold cursor-pointer ${
                    outcomeFilter === "draw"
                      ? "bg-vault-draw/20 text-vault-draw"
                      : "text-vault-text-muted hover:text-vault-text-primary"
                  }`}
                >
                  ½-½
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOutcomeFilter(outcomeFilter === "loss" ? "all" : "loss");
                    setCurrentPage(1);
                  }}
                  className={`flex-1 py-1 text-center rounded-xs text-[10px] font-bold cursor-pointer ${
                    outcomeFilter === "loss"
                      ? "bg-vault-loss/20 text-vault-loss"
                      : "text-vault-text-muted hover:text-vault-text-primary"
                  }`}
                >
                  0-1
                </button>
              </div>
            </div>

            {/* Cadence / Control */}
            <div>
              <span className="text-[10px] uppercase text-vault-text-muted block mb-1">
                Cadence / Control
              </span>
              <select
                value={cadenceFilter}
                onChange={(e) => {
                  setCadenceFilter(e.target.value as "all" | TimeClassType);
                  setCurrentPage(1);
                }}
                className="w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-primary outline-none focus:border-vault-bronze cursor-pointer"
              >
                <option value="all">Any Cadence</option>
                <option value="bullet">Bullet</option>
                <option value="blitz">Blitz</option>
                <option value="rapid">Rapid</option>
                <option value="classical">Classical</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            {/* Multi-Select Status Indicator */}
            <div>
              <span className="text-[10px] uppercase text-vault-text-muted block mb-1">
                Selected Staging
              </span>
              <div className="flex items-center justify-between rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-secondary">
                <span>{selectedGameIds.size} staged</span>
                {selectedGameIds.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedGameIds(new Set())}
                    className="text-[10px] text-vault-bronze hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MULTI-SELECT STAGING BAR */}
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-4 py-2.5 font-mono text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 text-vault-text-secondary hover:text-vault-text-primary cursor-pointer"
            >
              {isAllSelected ? (
                <CheckSquare size={14} className="text-vault-bronze" />
              ) : (
                <Square size={14} className="text-vault-text-muted" />
              )}
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Select All {games.length} Visible
              </span>
            </button>
            <span className="text-vault-text-muted">•</span>
            <span className="text-vault-text-muted text-[11px]">
              {selectedGameIds.size} games staged
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (selectedGameIds.size === 0) alert("Select games first.");
                else alert(`${selectedGameIds.size} games added to folder.`);
              }}
              className="flex items-center gap-1.5 text-vault-text-secondary hover:text-vault-text-primary transition-colors cursor-pointer"
            >
              <FolderPlus size={13} />
              <span>Add to Folder</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedGameIds.size === 0) alert("Select games first.");
                else
                  alert(
                    `Exporting ${selectedGameIds.size} games in PGN archive.`,
                  );
              }}
              className="flex items-center gap-1.5 text-vault-text-secondary hover:text-vault-text-primary transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>Export PGN</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedGameIds.size === 0) alert("Select games first.");
                else {
                  if (
                    confirm(
                      `Remove ${selectedGameIds.size} staged games from active view?`,
                    )
                  ) {
                    setSelectedGameIds(new Set());
                  }
                }
              }}
              className="flex items-center gap-1.5 text-vault-loss hover:text-vault-loss/80 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Purge</span>
            </button>
          </div>
        </section>

        {/* 6-CARD GAME GRID */}
        {isGamesLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-5 h-96 animate-pulse flex flex-col justify-between"
              >
                <div className="h-4 bg-vault-surface-layer-2 rounded-xs w-1/3" />
                <div className="h-44 bg-vault-surface-layer-2 rounded-xs my-3" />
                <div className="space-y-2">
                  <div className="h-3 bg-vault-surface-layer-2 rounded-xs w-3/4" />
                  <div className="h-3 bg-vault-surface-layer-2 rounded-xs w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="rounded-vault border border-dashed border-vault-border-interactive bg-vault-surface-layer-1 p-12 text-center space-y-4">
            <div className="grid h-12 w-12 place-items-center rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 text-vault-bronze mx-auto">
              <Database size={24} />
            </div>
            <h3 className="font-display text-lg font-bold text-vault-text-primary">
              No Games Found
            </h3>
            <p className="text-xs text-vault-text-secondary max-w-md mx-auto">
              {searchQuery || platformTab !== "ALL" || outcomeFilter !== "all" || cadenceFilter !== "all" || selectedFolderId !== "all"
                ? "No archived encounters match the specified query filters. Try resetting the filters."
                : "No games currently indexed in your Game Bank. Import your PGNs or connect your account to begin."}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              {(searchQuery || platformTab !== "ALL" || outcomeFilter !== "all" || cadenceFilter !== "all" || selectedFolderId !== "all") && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery("");
                    setPlatformTab("ALL");
                    setOutcomeFilter("all");
                    setCadenceFilter("all");
                    setSelectedFolderId("all");
                  }}
                  className="text-xs font-mono uppercase px-4 py-2"
                >
                  Reset Filters
                </Button>
              )}
              <Link to="/dashboard">
                <Button variant="solid-bronze" className="text-xs font-mono uppercase px-4 py-2">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => {
              const isSelected = selectedGameIds.has(game.id);
              const { opening, variation, eco } = parseOpeningDetails(game);
              const displayTitle = opening || game.title || "Archived Encounter";
              const displayEco = eco ? `ECO ${eco}` : "ECO ---";
              const displayCadence = `${game.timeClass}`;
              const displayPlatform = game.platform.toUpperCase();
              const displayResult =
                game.result === "draw"
                  ? "½ - ½"
                  : game.result === "white"
                    ? "1 - 0"
                    : "0 - 1";
              const displayQuote =
                game.notes || "Match sequence verified in permanent registry.";
              const displayDate = getGameDate(game, "MMM dd, yyyy");
              const displayMoves = getMoveCount(game);

              const resultColorClass =
                displayResult === "1 - 0"
                  ? "bg-vault-win/15 text-vault-win border-vault-win/30"
                  : displayResult === "0 - 1"
                    ? "bg-vault-loss/15 text-vault-loss border-vault-loss/30"
                    : "bg-vault-draw/15 text-vault-draw border-vault-draw/30";

              return (
                <article
                  key={game.id}
                  className={`rounded-vault border bg-vault-surface-layer-1 p-5 flex flex-col justify-between transition-all font-mono text-xs ${
                    isSelected
                      ? "border-vault-bronze bg-vault-surface-layer-2 shadow-md"
                      : "border-vault-border-base hover:border-vault-border-interactive"
                  }`}
                >
                  <div>
                    {/* Top Bar: Checkbox, ECO, Cadence, Platform, Result */}
                    <div className="flex items-center justify-between gap-2 border-b border-vault-border-base pb-3 text-[10px]">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleGame(game.id)}
                          className="text-vault-text-muted hover:text-vault-text-primary cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare
                              size={13}
                              className="text-vault-bronze"
                            />
                          ) : (
                            <Square size={13} />
                          )}
                        </button>
                        <span className="font-semibold text-vault-text-primary">
                          {displayEco}
                        </span>
                        <span className="text-vault-text-muted capitalize">
                          • {displayCadence}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="rounded-xs border border-vault-border-base bg-vault-surface-layer-2 px-1.5 py-0.5 text-[9px] text-vault-text-muted uppercase">
                          {displayPlatform}
                        </span>
                        <span
                          className={`rounded-xs border px-1.5 py-0.5 text-[9px] font-bold ${resultColorClass}`}
                        >
                          {displayResult}
                        </span>
                      </div>
                    </div>

                    {/* Mini Board Diagram */}
                    <div className="my-4">
                      <MiniChessboard
                        fen="r1b2rk1/1pq1bppp/p1n1pn2/3p4/2PN4/1PN1P3/PB2BPPP/R2Q1RK1 w - - 0 11"
                        badgeLabel={displayResult}
                      />
                    </div>

                    {/* Players */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-vault-text-primary text-[11px]">
                            w
                          </span>
                          <span className="font-semibold text-vault-text-primary truncate max-w-[140px]">
                            {game.whitePlayer.username}
                          </span>
                        </div>
                        <span className="text-vault-text-muted text-[11px] ml-2">
                          {game.whitePlayer.rating}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-vault-text-muted text-[11px]">
                            b
                          </span>
                          <span className="font-semibold text-vault-text-primary truncate max-w-[140px]">
                            {game.blackPlayer.username}
                          </span>
                        </div>
                        <span className="text-vault-text-muted text-[11px] ml-2">
                          {game.blackPlayer.rating}
                        </span>
                      </div>
                    </div>

                    {/* Opening Title & Subline */}
                    <div className="mt-4">
                      <h3 className="font-display text-sm font-bold text-vault-text-primary truncate">
                        {displayTitle}
                      </h3>
                      {variation && (
                        <p className="text-[11px] text-vault-text-muted truncate mt-0.5">
                          {variation}
                        </p>
                      )}
                    </div>

                    {/* Quote / Annotation Note */}
                    <blockquote className="mt-3 rounded-xs border-l border-vault-border-interactive bg-vault-surface-layer-2/70 px-2.5 py-1 font-sans text-[11px] italic text-vault-text-secondary leading-snug line-clamp-2">
                      &ldquo;{displayQuote}&rdquo;
                    </blockquote>
                  </div>

                  {/* Footer: Date, Moves, Bookmark, Inspect */}
                  <div className="mt-5 border-t border-vault-border-base pt-3 flex items-center justify-between text-[10px] text-vault-text-muted">
                    <span>
                      {displayDate} • {displayMoves} moves
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => alert("Bookmarked match.")}
                        className="hover:text-vault-text-primary cursor-pointer"
                        title="Bookmark"
                      >
                        <Bookmark size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(game.pgn);
                          alert("PGN copied to clipboard!");
                        }}
                        className="hover:text-vault-text-primary cursor-pointer"
                        title="Copy PGN"
                      >
                        <Copy size={12} />
                      </button>
                      <Link
                        to={`/game/${game.id}`}
                        className="flex items-center gap-0.5 text-vault-bronze hover:text-vault-bronze-hover font-semibold uppercase tracking-wider ml-1"
                      >
                        <span>INSPECT</span>
                        <ExternalLink size={10} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* FOOTER / PAGINATION */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-t border-vault-border-base pt-6 font-mono text-xs text-vault-text-muted">
          <span>
            Displaying records {games.length > 0 ? (currentPage - 1) * 12 + 1 : 0} -{" "}
            {(currentPage - 1) * 12 + games.length} of {totalGames} games cataloged
          </span>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="grid h-7 w-7 place-items-center rounded-xs border border-vault-border-base text-vault-text-secondary hover:text-vault-text-primary disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="px-1 text-vault-text-primary font-bold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="grid h-7 w-7 place-items-center rounded-xs border border-vault-border-base text-vault-text-secondary hover:text-vault-text-primary disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
