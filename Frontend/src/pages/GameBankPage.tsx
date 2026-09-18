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
} from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { MiniChessboard } from "../components/ui/MiniChessboard";
import { useGames } from "../hooks/useGames";
import { useFolders } from "../hooks/useFolders";
import { parseOpeningDetails, getGameDate } from "../utils/game";
import type { Game } from "@chess-vault/shared";

/**
 * This type is redundant fr. It has fields that cant even be derived from the core Game model. This is basically another issue in the codebase that should be dealt with
 */
type BankGameItem = {
  id: string;
  title?: string;
  subline?: string;
  eco?: string;
  timeClass: Game["timeClass"];
  timeControl?: string;
  platform: Game["platform"];
  platformLabel?: string;
  result: Game["result"];
  resultBadge?: string;
  whitePlayer: { username: string; rating: number };
  blackPlayer: { username: string; rating: number };
  quote?: string;
  date?: string;
  moves?: number;
  fen?: string;
  badge?: string;
  notes?: string;
  playedAt?: Date;
  pgn?: string;
};

export default function GameBankPage() {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [platformTab, setPlatformTab] = useState<
    "ALL" | "CHESS.COM" | "LICHESS" | "OTB FIDE"
  >("ALL");
  const [outcomeFilter, setOutcomeFilter] = useState<
    "all" | "win" | "draw" | "loss"
  >("all");
  const [cadenceFilter, setCadenceFilter] = useState("all");
  const [selectedGameIds, setSelectedGameIds] = useState<Set<string>>(
    new Set(),
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Queries
  const { data: gamesData } = useGames({ page: currentPage, limit: 12 });
  const { data: foldersData } = useFolders();

  // Combine real games with rich screenshot mock games
  const combinedGames = useMemo<BankGameItem[]>(() => {
    const real: BankGameItem[] = (gamesData?.games ?? []).map((g) => ({
      ...g,
      subline: parseOpeningDetails(g).variation,
      quote: g.notes,
      date: getGameDate(g, "MMM dd, yyyy"),
      timeControl: `${g.timeClass} • 10+0`,
      platformLabel: g.platform === "chess.com" ? "CHESS.COM" : "LICHESS",
      resultBadge:
        g.result === "draw"
          ? "½ - ½"
          : g.result === "white"
            ? "1 - 0"
            : "0 - 1",
    }));

    if (real.length >= 6) return real;

    // Use rich prototype catalog entries (from Screenshot 5)
    const prototypeGames: BankGameItem[] = [
      {
        id: "game-p1",
        title: "Sicilian Defense: Najdorf Variation",
        subline: "English Attack with 8.f3 b5 9.g4",
        eco: "ECO B90",
        timeClass: "blitz",
        timeControl: "10+0 • Blitz",
        platform: "chess.com",
        platformLabel: "CHESS.COM",
        result: "white",
        resultBadge: "1 - 0",
        whitePlayer: { username: "MagnusK_88", rating: 2348 },
        blackPlayer: { username: "V_Anand_Legacy", rating: 2312 },
        quote: "Sacrifice at d5 unlocked rook battery along the e-file.",
        date: "Oct 24, 2024",
        moves: 42,
        fen: "r1b2rk1/1pq1bppp/p1n1pn2/3p4/2PN4/1PN1P3/PB2BPPP/R2Q1RK1 w - - 0 11",
        badge: "42#",
      },
      {
        id: "game-p2",
        title: "King's Indian: Mar del Plata",
        subline: "Closed Center 9.Ne1 Nd7 10.Nd3 f5",
        eco: "ECO E97",
        timeClass: "classical",
        timeControl: "30+20 • Classical",
        platform: "lichess",
        platformLabel: "LICHESS",
        result: "draw",
        resultBadge: "½ - ½",
        whitePlayer: { username: "Tarrasch_Echo", rating: 2218 },
        blackPlayer: { username: "MagnusK_88", rating: 2341 },
        quote: "Perpetual check sealed after opposite-color bishop blockade.",
        date: "Oct 22, 2024",
        moves: 68,
        fen: "r2q1rk1/pp1b1ppp/2n1pn2/2pp4/2PP4/2N1PN2/PP1QBPPP/R4RK1 w - - 0 10",
        badge: "68p",
      },
      {
        id: "game-p3",
        title: "Queen's Gambit Declined: Vienna",
        subline: "Reykjavik Open 2024, Round 4",
        eco: "ECO D37",
        timeClass: "classical",
        timeControl: "90+30 • OTB Classical",
        platform: "chess.com",
        platformLabel: "FIDE OTB",
        result: "black",
        resultBadge: "0 - 1",
        whitePlayer: { username: "MagnusK_88", rating: 2345 },
        blackPlayer: { username: "GM_Sokolov_A", rating: 2480 },
        quote: "Overlooked subtle rook sacrifice on c3 in time pressure.",
        date: "Oct 19, 2024",
        moves: 37,
        fen: "r1bq1rk1/ppp2pbp/2np1np1/4p3/2PPP3/2N1BP2/PP2N1PP/R2QKB1R w KQ - 0 8",
        badge: "37b",
      },
      {
        id: "game-p4",
        title: "Caro-Kann: Tartakower System",
        subline: "Endgame Rook conversion with outside pawn",
        eco: "ECO B15",
        timeClass: "rapid",
        timeControl: "15+10 • Rapid",
        platform: "chess.com",
        platformLabel: "CHESS.COM",
        result: "white",
        resultBadge: "1 - 0",
        whitePlayer: { username: "MagnusK_88", rating: 2352 },
        blackPlayer: { username: "BoleslavskyFan", rating: 2290 },
        quote: "Clean technical execution in 4 vs 3 rook ending.",
        date: "Oct 14, 2024",
        moves: 54,
        fen: "r1b2rk1/pp1n1ppp/2p1pn2/q5B1/2PP4/2PB1N2/P4PPP/R2Q1RK1 w - - 0 11",
        badge: "54#",
      },
      {
        id: "game-p5",
        title: "Ruy Lopez: Berlin Defense",
        subline: "4.d3 Bc5 5.c3 O-O with f4 pawn break",
        eco: "ECO C65",
        timeClass: "blitz",
        timeControl: "3+2 • Blitz",
        platform: "lichess",
        platformLabel: "LICHESS",
        result: "white",
        resultBadge: "1 - 0",
        whitePlayer: { username: "MagnusK_88", rating: 2360 },
        blackPlayer: { username: "Pragg_Inspired", rating: 2375 },
        quote: "Knight fork trapped the queen on move 29.",
        date: "Oct 11, 2024",
        moves: 31,
        fen: "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
        badge: "31p",
      },
      {
        id: "game-p6",
        title: "English: Four Knights System",
        subline: "Symmetrical variation • King and pawn draw",
        eco: "ECO A29",
        timeClass: "blitz",
        timeControl: "5+3 • Blitz",
        platform: "chess.com",
        platformLabel: "CHESS.COM",
        result: "draw",
        resultBadge: "½ - ½",
        whitePlayer: { username: "Stockfish_Clone_9", rating: 2410 },
        blackPlayer: { username: "MagnusK_88", rating: 2355 },
        quote: "Exhaustive theoretical simplification to bare kings.",
        date: "Oct 08, 2024",
        moves: 72,
        fen: "r1bq1rk1/pp2ppbp/2np1np1/8/2PN4/2N3P1/PP2PPBP/R1BQ1RK1 w - - 0 9",
        badge: "72b",
      },
    ];

    return [...real, ...prototypeGames.slice(real.length)];
  }, [gamesData?.games]);

  // Filter games based on search and selected tabs
  const displayedGames = useMemo(() => {
    return combinedGames.filter((g) => {
      // Platform filter
      if (platformTab === "CHESS.COM" && g.platform !== "chess.com")
        return false;
      if (platformTab === "LICHESS" && g.platform !== "lichess") return false;

      // Outcome filter
      if (outcomeFilter === "win" && g.result !== "white") return false;
      if (outcomeFilter === "draw" && g.result !== "draw") return false;
      if (outcomeFilter === "loss" && g.result !== "black") return false;

      // Search Query
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        g.title?.toLowerCase().includes(q) ||
        g.whitePlayer.username.toLowerCase().includes(q) ||
        g.blackPlayer.username.toLowerCase().includes(q) ||
        g.eco?.toLowerCase().includes(q)
      );
    });
  }, [combinedGames, platformTab, outcomeFilter, searchQuery]);

  // Multi-select actions
  const isAllSelected =
    displayedGames.length > 0 &&
    displayedGames.every((g) => selectedGameIds.has(g.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedGameIds(new Set());
    } else {
      setSelectedGameIds(new Set(displayedGames.map((g) => g.id)));
    }
  };

  const handleToggleGame = (id: string) => {
    const next = new Set(selectedGameIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedGameIds(next);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-content px-6 py-10 font-body space-y-8">
        {/* HERO / CATALOG HEADER (Screenshot 5) */}
        <section className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-vault-border-base pb-8">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-vault-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-vault-win" />
              <span>PERMANENT MATCH LEDGER</span>
              <span>•</span>
              <span>SERIES VII</span>
              <span>•</span>
              <span className="text-vault-bronze uppercase">
                Indexed to Epoch 2020-2025
              </span>
            </div>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-normal text-vault-text-primary tracking-tight">
              Game Bank
            </h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-vault-text-secondary leading-relaxed font-sans">
              A cataloged repository of 4,218 competitive encounters, annotated
              studies, and cross-platform tournament bulletins.
            </p>
          </div>

          <div className="flex gap-4 font-mono">
            <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4 text-center min-w-[100px]">
              <span className="text-[9px] uppercase tracking-wider text-vault-text-muted block">
                Archived Total
              </span>
              <span className="font-display text-xl font-bold text-vault-text-primary block mt-1">
                4,218
              </span>
              <span className="text-[10px] text-vault-text-muted">games</span>
            </div>
            <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4 text-center min-w-[100px]">
              <span className="text-[9px] uppercase tracking-wider text-vault-text-muted block">
                Win Margin
              </span>
              <span className="font-display text-xl font-bold text-vault-win block mt-1">
                61.4%
              </span>
              <span className="text-[10px] text-vault-text-muted">perf</span>
            </div>
            <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4 text-center min-w-[100px]">
              <span className="text-[9px] uppercase tracking-wider text-vault-text-muted block">
                Unique ECOs
              </span>
              <span className="font-display text-xl font-bold text-vault-text-primary block mt-1">
                142
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by opponent, opening (e.g. 'Sicilian Dragon', 'B90'), event, PGN tag, or annotation note... ⌘K"
                className="w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-1 py-2 pl-9 pr-3 text-xs text-vault-text-primary outline-none focus:border-vault-bronze placeholder:text-vault-text-muted"
              />
            </div>

            {/* Platform Tabs */}
            <div className="flex items-center rounded-xs border border-vault-border-base bg-vault-surface-layer-1 p-0.5">
              {(["ALL", "CHESS.COM", "LICHESS", "OTB FIDE"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPlatformTab(tab)}
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
              <button
                type="button"
                onClick={() => alert("Custom archival parameters filter panel")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-vault-bronze hover:text-vault-bronze-hover cursor-pointer"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-vault-bronze" />
                <span>PARAMETERS</span>
              </button>
            </div>
          </div>

          {/* Filter Dropdowns Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
            {/* Folio dropdown */}
            <div>
              <span className="text-[10px] uppercase text-vault-text-muted block mb-1">
                Folio / Collection
              </span>
              <select className="w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-primary outline-none focus:border-vault-bronze cursor-pointer">
                <option>All Folios (Archived Total)</option>
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
                  onClick={() =>
                    setOutcomeFilter(outcomeFilter === "win" ? "all" : "win")
                  }
                  className={`flex-1 py-1 text-center rounded-xs text-[10px] font-bold ${
                    outcomeFilter === "win"
                      ? "bg-vault-win/20 text-vault-win"
                      : "text-vault-text-muted hover:text-vault-text-primary"
                  }`}
                >
                  1-0 (Win)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOutcomeFilter(outcomeFilter === "draw" ? "all" : "draw")
                  }
                  className={`flex-1 py-1 text-center rounded-xs text-[10px] font-bold ${
                    outcomeFilter === "draw"
                      ? "bg-vault-draw/20 text-vault-draw"
                      : "text-vault-text-muted hover:text-vault-text-primary"
                  }`}
                >
                  ½-½ (Draw)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOutcomeFilter(outcomeFilter === "loss" ? "all" : "loss")
                  }
                  className={`flex-1 py-1 text-center rounded-xs text-[10px] font-bold ${
                    outcomeFilter === "loss"
                      ? "bg-vault-loss/20 text-vault-loss"
                      : "text-vault-text-muted hover:text-vault-text-primary"
                  }`}
                >
                  0-1 (Loss)
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
                onChange={(e) => setCadenceFilter(e.target.value)}
                className="w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-primary outline-none focus:border-vault-bronze cursor-pointer"
              >
                <option value="all">Any Cadence</option>
                <option value="bullet">Bullet</option>
                <option value="blitz">Blitz</option>
                <option value="rapid">Rapid</option>
                <option value="classical">Classical</option>
              </select>
            </div>

            {/* Sanction & Side */}
            <div>
              <span className="text-[10px] uppercase text-vault-text-muted block mb-1">
                Sanction &amp; Side
              </span>
              <div className="flex gap-1.5">
                <select className="flex-1 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-2 py-1.5 text-vault-text-primary outline-none focus:border-vault-bronze cursor-pointer">
                  <option>Rated Only</option>
                  <option>All Matches</option>
                </select>
                <select className="flex-1 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-2 py-1.5 text-vault-text-primary outline-none focus:border-vault-bronze cursor-pointer">
                  <option>White &amp; Black</option>
                  <option>White Only</option>
                  <option>Black Only</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* MULTI-SELECT STAGING BAR (Screenshot 5) */}
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
                Select All {displayedGames.length} Visible
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
                else alert(`${selectedGameIds.size} games added to folio.`);
              }}
              className="flex items-center gap-1.5 text-vault-text-secondary hover:text-vault-text-primary transition-colors cursor-pointer"
            >
              <FolderPlus size={13} />
              <span>Add to Folio</span>
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

        {/* 6-CARD GAME GRID (Screenshot 5) */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedGames.map((game, idx) => {
            const isSelected = selectedGameIds.has(game.id);
            const opening = game.title
              ? game.title.split(": ")[0]
              : "Archived Encounter";
            const displayEco =
              game.eco ?? (idx % 2 === 0 ? "ECO B90" : "ECO E97");
            const displayCadence =
              game.timeControl ?? `${game.timeClass} • 10+0`;
            const displayPlatform =
              game.platformLabel ??
              (game.platform === "chess.com" ? "CHESS.COM" : "LICHESS");
            const displayResult =
              game.resultBadge ??
              (game.result === "draw"
                ? "½ - ½"
                : game.result === "white"
                  ? "1 - 0"
                  : "0 - 1");
            const displayQuote =
              game.quote ??
              game.notes ??
              "Positional bind retained throughout match sequence.";
            const displaySubline =
              game.subline ?? "Classical line and tactical squeeze";
            const displayDate = game.date ?? "Recently archived";
            const displayMoves = game.moves ?? 42;
            const displayBadge = game.badge ?? "42#";
            const displayFen =
              game.fen ??
              "r1b2rk1/1pq1bppp/p1n1pn2/3p4/2PN4/1PN1P3/PB2BPPP/R2Q1RK1 w - - 0 11";

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
                      <span className="text-vault-text-muted">
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
                      fen={displayFen}
                      badgeLabel={displayBadge}
                    />
                  </div>

                  {/* Players */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-vault-text-primary text-[11px]">
                          w
                        </span>
                        <span className="font-semibold text-vault-text-primary truncate max-w-[140px]">
                          {game.whitePlayer.username}
                        </span>
                      </div>
                      <span className="text-vault-text-muted text-[11px]">
                        {game.whitePlayer.rating}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-vault-text-muted text-[11px]">
                          b
                        </span>
                        <span className="font-semibold text-vault-text-primary truncate max-w-[140px]">
                          {game.blackPlayer.username}
                        </span>
                      </div>
                      <span className="text-vault-text-muted text-[11px]">
                        {game.blackPlayer.rating}
                      </span>
                    </div>
                  </div>

                  {/* Opening Title & Subline */}
                  <div className="mt-4">
                    <h3 className="font-display text-sm font-bold text-vault-text-primary truncate">
                      {opening}
                    </h3>
                    <p className="text-[11px] text-vault-text-muted truncate mt-0.5">
                      {displaySubline}
                    </p>
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
                      className="hover:text-vault-text-primary"
                    >
                      <Bookmark size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(displayFen);
                        alert("FEN copied!");
                      }}
                      className="hover:text-vault-text-primary"
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

        {/* FOOTER / PAGINATION (Screenshot 5) */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-t border-vault-border-base pt-6 font-mono text-xs text-vault-text-muted">
          <span>
            Displaying records 1 - {displayedGames.length} of 4,218 games
            cataloged
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                alert(
                  "Fetching earlier archival epochs from connected repositories...",
                )
              }
              className="rounded-xs border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-secondary hover:text-vault-text-primary"
            >
              FETCH EARLIER EPOCHS
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="grid h-7 w-7 place-items-center rounded-xs border border-vault-border-base text-vault-text-secondary hover:text-vault-text-primary disabled:opacity-30"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="px-1 text-vault-text-primary font-bold">
                Page {currentPage} of 703
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(currentPage + 1)}
                className="grid h-7 w-7 place-items-center rounded-xs border border-vault-border-base text-vault-text-secondary hover:text-vault-text-primary"
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
