import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  Share2,
  Plus,
  Edit3,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Button } from "../components/ui/Button";
import { MiniChessboard } from "../components/ui/MiniChessboard";
import { useFolders } from "../hooks/useFolders";
import { useUser } from "@clerk/react";

export default function CollectionsPage() {
  const { user } = useUser();
  const userName = user?.username || user?.firstName 
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSide, setSelectedSide] = useState<"all" | "white" | "black">("all");
  const [sortBy, setSortBy] = useState<"chronological" | "result" | "elo" | "complexity">("chronological");

  // Queries
  const { data: foldersData } = useFolders();

  // Use selected collection or default
  const activeCollectionName = foldersData?.folders?.[0]?.name ?? "Tournament Games";

  // Detailed Matches (from Screenshot 4)
  const detailedMatches = [
    {
      id: "game-1",
      event: "CITY MASTERS OPEN • ROUND 4 • Board 02",
      white: `${userName}, K.`,
      whiteTitle: "Candidate Master",
      whiteElo: 2140,
      black: "Chigorin, M.",
      blackTitle: "FIDE Master",
      blackElo: 2185,
      opening: "Evans Gambit Accepted",
      eco: "ECO C52",
      moves: 34,
      timeControl: "90m + 30s",
      date: "14 Oct 2024",
      result: "1 - 0",
      resultType: "win",
      scoresheet: "Scoresheet #CV-2024-009",
      tags: ["CLASSICAL BRACKET", "TACTICAL BRILLIANCY"],
      monographNote:
        "Found 28. Rxd7 sacrifice after 14 mins calculation. Chigorin anticipated 28. Qe3. The d-file infiltration breaks defensive king safety completely; refutes the delayed castling motif.",
      eval: "+M4",
      accuracy: "94.8%",
      prep: "Match 100%",
      fen: "r1b2rk1/1pq1bppp/p1n1pn2/3p4/2PN4/1PN1P3/PB2BPPP/R2Q1RK1 w - - 0 11",
      badge: "34. Rxd7#",
      orientation: "white" as const,
      keyPlies: [
        { num: 28, white: "Rxd7!", black: "Qxd7" },
        { num: 29, white: "Bxf7+", black: "Kf8" },
        { num: 30, white: "Be6+", black: "Ke7" },
        { num: 31, white: "Qf7+", black: "Kd8" },
        { num: 32, white: "Qf8+", black: "Qe8" },
        { num: 34, white: "Rxd7#", black: "1-0" },
      ],
    },
    {
      id: "game-3",
      event: "STATE CHAMPIONSHIP SEMIFINALS • Table 01",
      white: "Rubinstein, A.",
      whiteTitle: "International Master",
      whiteElo: 2290,
      black: `${userName}, K.`,
      blackTitle: "Candidate Master",
      blackElo: 2140,
      opening: "Nimzo-Indian Defense: Rubinstein System",
      eco: "ECO E48",
      moves: 58,
      timeControl: "120m + 30s",
      date: "19 Nov 2023",
      result: "½ - ½",
      resultType: "draw",
      scoresheet: "Scoresheet #CV-2023-142",
      tags: ["ENDGAME CLINIC", "NORM FOUND"],
      monographNote:
        "Held the notorious 3 vs 2 rook endgame against IM Rubinstein across a 4-hour technical struggle. Passive defense avoids the Philidor cut-off via 52... h5! creating a fortress on the second rank.",
      eval: "0.00",
      accuracy: "97.1%",
      prep: "Tablebase hit: 5-man EGTB verified",
      fen: "r2q1rk1/pp1b1ppp/2n1pn2/2pp4/2PP4/2N1PN2/PP1QBPPP/R4RK1 w - - 0 10",
      badge: "58... Re3+ ½-½",
      orientation: "black" as const,
      keyPlies: [
        { num: 54, white: "Rc7", black: "Rc5" },
        { num: 55, white: "Kd4", black: "Re1" },
        { num: 56, white: "Rc6+", black: "Kf7" },
        { num: 57, white: "f5", black: "gxf5" },
        { num: 58, white: "Kd5", black: "Re3+" },
      ],
    },
    {
      id: "game-4",
      event: "REGIONAL PREMIER INVITATIONAL • R1 • Board 01",
      white: `${userName}, K.`,
      whiteTitle: "Candidate Master",
      whiteElo: 2140,
      black: "Capablanca, J.",
      blackTitle: "Grandmaster",
      blackElo: 2410,
      opening: "Queen's Gambit Declined: Tartakower Defense",
      eco: "ECO D58",
      moves: 42,
      timeControl: "90m + 30s",
      date: "02 Feb 2025",
      result: "0 - 1",
      resultType: "loss",
      scoresheet: "Scoresheet #CV-2025-004",
      tags: ["TIME TROUBLE", "INSTRUCTIONAL DEFEAT"],
      monographNote:
        "Overextended with 37. g4? in severe time pressure (under 45 seconds). Black demonstrated the quiet 39... h5! weakness extractor. Critical lesson in patient queenside restraint against classical GMs.",
      eval: "-4.20",
      accuracy: "81.4%",
      prep: "Blunder at Ply 73",
      fen: "r1bq1rk1/ppp2pbp/2np1np1/4p3/2PPP3/2N1BP2/PP2N1PP/R2QKB1R w KQ - 0 8",
      badge: "42... Ba3! (0-1)",
      orientation: "white" as const,
      keyPlies: [
        { num: 38, white: "gxh5", black: "Rxh5" },
        { num: 39, white: "Kg2", black: "Be7!" },
        { num: 40, white: "Rh1", black: "Rxh1" },
        { num: 41, white: "Kxh1", black: "Bb4" },
        { num: 42, white: "Rd1", black: "Ba3! (0-1)" },
      ],
    },
  ];

  // Filter matches
  const filteredMatches = detailedMatches.filter((m) => {
    if (selectedSide === "white" && m.orientation !== "white") return false;
    if (selectedSide === "black" && m.orientation !== "black") return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.white.toLowerCase().includes(q) ||
      m.black.toLowerCase().includes(q) ||
      m.opening.toLowerCase().includes(q) ||
      m.event.toLowerCase().includes(q) ||
      m.eco.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-content px-6 py-10 font-body space-y-8">
        {/* FOLIO HEADER (Screenshot 4) */}
        <section className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-vault-border-base pb-8">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-vault-bronze">
              Archive Folio No. 04 • Competitive History • Classical Standard
            </span>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-normal text-vault-text-primary tracking-tight">
              {activeCollectionName}
            </h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-vault-text-secondary leading-relaxed font-sans">
              Over-the-board classical and regional league games recorded between 2022 and 2025. Preserved alongside verified scoresheets, pre-game opening prep, and post-mortem evaluation branches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => alert("Monograph notes editor")}
              className="flex items-center gap-1.5 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-2 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
            >
              <Edit3 size={13} />
              <span>EDIT NOTES</span>
            </button>
            <button
              type="button"
              onClick={() => alert("Batch PGN downloaded for active folio.")}
              className="flex items-center gap-1.5 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-2 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>EXPORT PGN</span>
            </button>
            <button
              type="button"
              onClick={() => alert("Archive share link copied.")}
              className="flex items-center gap-1.5 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-2 text-vault-text-secondary hover:border-vault-border-interactive hover:text-vault-text-primary transition-colors cursor-pointer"
            >
              <Share2 size={13} />
              <span>SHARE ARCHIVE</span>
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

        {/* 5-METRIC STRIP */}
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 font-mono">
          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4">
            <span className="text-[9px] uppercase tracking-wider text-vault-text-muted block">
              Preserved Matches
            </span>
            <span className="mt-1 font-display text-2xl font-bold text-vault-text-primary">
              24 <span className="font-mono text-xs font-normal text-vault-text-muted">entries</span>
            </span>
          </div>

          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4">
            <span className="text-[9px] uppercase tracking-wider text-vault-text-muted block">
              Score Distribution
            </span>
            <span className="mt-1 font-display text-2xl font-bold text-vault-text-primary">
              16 <span className="font-mono text-xs text-vault-win">W</span> / 5 <span className="font-mono text-xs text-vault-draw">D</span> / 3 <span className="font-mono text-xs text-vault-loss">L</span>
            </span>
          </div>

          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4">
            <span className="text-[9px] uppercase tracking-wider text-vault-text-muted block">
              Calculated Performance
            </span>
            <span className="mt-1 font-display text-2xl font-bold text-vault-text-primary">
              2241 <span className="font-mono text-xs text-vault-win font-semibold">+38 FIDE</span>
            </span>
          </div>

          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4">
            <span className="text-[9px] uppercase tracking-wider text-vault-text-muted block">
              Deep Annotations
            </span>
            <span className="mt-1 font-display text-2xl font-bold text-vault-text-primary">
              19 <span className="font-mono text-xs text-vault-text-muted">with engine nodes</span>
            </span>
          </div>

          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4">
            <span className="text-[9px] uppercase tracking-wider text-vault-text-muted block">
              Ledger Synchronized
            </span>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-vault-win">
              <span className="h-1.5 w-1.5 rounded-full bg-vault-win" />
              <span>4 days ago</span>
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
              placeholder="Filter by opponent, opening, tournament or annotated tag... (⌘K)"
              className="w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-1 py-1.5 pl-8 pr-3 text-xs text-vault-text-primary outline-none focus:border-vault-bronze placeholder:text-vault-text-muted"
            />
          </div>

          {/* Sort & Side Tabs */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-vault-text-muted uppercase text-[10px]">SORT BY:</span>
              {(["chronological", "result", "elo", "complexity"] as const).map((s) => (
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
                  {s === "chronological" ? "Chronological" : s === "elo" ? "Elo Rating" : s}
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

        {/* MATCH LEDGER ROWS (Screenshot 4) */}
        <section className="space-y-6">
          {filteredMatches.map((match) => (
            <article
              key={match.id}
              className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 grid gap-6 md:grid-cols-[130px_1fr_200px] items-start hover:border-vault-border-interactive transition-all font-mono text-xs"
            >
              {/* LEFT: Mini Chessboard */}
              <div>
                <MiniChessboard
                  fen={match.fen}
                  orientation={match.orientation}
                  badgeLabel={match.badge}
                />
                <div className="mt-2 text-center text-[10px] text-vault-text-muted uppercase">
                  <span>Orientation: {match.orientation}</span>
                </div>
              </div>

              {/* CENTER: Match Info, Post-Mortem Monograph Note, Tags */}
              <div className="space-y-3 min-w-0">
                <div className="flex items-center justify-between border-b border-vault-border-base pb-2 text-vault-text-muted text-[11px]">
                  <span>{match.event}</span>
                  <span className="text-vault-bronze">★</span>
                </div>

                {/* Players */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="h-2 w-2 rounded-full bg-vault-text-primary" />
                    <span className="text-sm font-bold text-vault-text-primary">{match.white}</span>
                    <span className="text-[11px] text-vault-text-muted">({match.whiteTitle})</span>
                    <span className="ml-auto font-semibold text-vault-text-primary">{match.whiteElo}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="h-2 w-2 rounded-full bg-vault-border-interactive" />
                    <span className="text-sm font-bold text-vault-text-primary">{match.black}</span>
                    <span className="text-[11px] text-vault-text-muted">({match.blackTitle})</span>
                    <span className="ml-auto font-semibold text-vault-text-primary">{match.blackElo}</span>
                  </div>
                </div>

                {/* Match Details */}
                <p className="text-[11px] text-vault-text-muted">
                  {match.opening} • {match.eco} • {match.moves} Moves • {match.timeControl} • {match.date}
                </p>

                {/* Post-Mortem Monograph Note Callout Box */}
                <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-2 p-3 text-xs">
                  <div className="text-[10px] uppercase text-vault-bronze tracking-wider font-semibold mb-1">
                    Post-Mortem Monograph Note
                  </div>
                  <p className="font-sans text-xs italic text-vault-text-secondary leading-relaxed">
                    &ldquo;{match.monographNote}&rdquo;
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[10px] text-vault-text-muted border-t border-vault-border-base pt-2">
                    <span>Engine eval: <strong className="text-vault-win">{match.eval}</strong></span>
                    <span>Accuracy: <strong className="text-vault-text-primary">{match.accuracy}</strong></span>
                    <span>{match.prep}</span>
                  </div>
                </div>

                {/* Result Badge & Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span
                    className={`rounded-xs border px-2 py-0.5 font-bold ${
                      match.resultType === "win"
                        ? "bg-vault-win/15 text-vault-win border-vault-win/30"
                        : match.resultType === "loss"
                        ? "bg-vault-loss/15 text-vault-loss border-vault-loss/30"
                        : "bg-vault-draw/15 text-vault-draw border-vault-draw/30"
                    }`}
                  >
                    {match.result}
                  </span>
                  {match.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded-xs border border-vault-border-base bg-vault-surface-layer-2 px-2 py-0.5 text-[10px] text-vault-text-muted uppercase"
                    >
                      {t}
                    </span>
                  ))}
                  <span className="text-vault-text-muted text-[10px] ml-auto">{match.scoresheet}</span>
                </div>
              </div>

              {/* RIGHT: Key Ply Transcript & Actions */}
              <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-2 p-3 space-y-3">
                <span className="text-[10px] uppercase tracking-wider text-vault-text-muted block border-b border-vault-border-base pb-1.5">
                  Key Ply Transcript
                </span>

                <div className="space-y-1 text-[11px]">
                  {match.keyPlies.map((ply, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-vault-text-muted">{ply.num}.</span>
                      <span className="font-semibold text-vault-bronze">{ply.white}</span>
                      <span className="text-vault-text-secondary">{ply.black}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-vault-border-base space-y-1.5">
                  <Link to={`/game/${match.id}`} className="block">
                    <Button variant="secondary" className="w-full text-[10px] py-1.5">
                      Launch Replay Suite <ExternalLink size={10} className="ml-1" />
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => alert("Scoresheet PDF downloading...")}
                      className="flex-1 rounded-xs border border-vault-border-base py-1 text-[10px] text-vault-text-muted hover:text-vault-text-primary text-center"
                    >
                      PDF Sheet
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(match.fen);
                        alert("FEN copied!");
                      }}
                      className="flex-1 rounded-xs border border-vault-border-base py-1 text-[10px] text-vault-text-muted hover:text-vault-text-primary text-center"
                    >
                      FEN
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* FOLIO PAGINATION */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-t border-vault-border-base pt-6 font-mono text-xs text-vault-text-muted">
          <span>Displaying entries 1-3 of 24 archived classical matches in Volume 04</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1 rounded-xs border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-secondary hover:text-vault-text-primary"
            >
              <ChevronLeft size={13} /> Earlier Seasons
            </button>
            <span className="px-2 font-bold text-vault-text-primary">Folio 1 of 8</span>
            <button
              type="button"
              className="flex items-center gap-1 rounded-xs border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 text-vault-text-secondary hover:text-vault-text-primary"
            >
              Older Matches <ChevronRight size={13} />
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
