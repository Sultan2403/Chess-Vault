import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Swords,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { InfoTooltip } from "../ui/InfoTooltip";
import type { AnalyticsOpenings, AnalyticsOpeningStat } from "@chess-vault/shared";

interface OpeningRepertoireSectionProps {
  openings: AnalyticsOpenings;
}

type SortKey = "total" | "winPct" | "losses";
type SortDir = "desc" | "asc";

interface OpeningSlice {
  name: string;
  eco?: string;
  value: number;
  wins: number;
  draws: number;
  losses: number;
  winPct: number;
  sharePct: number;
  color: string;
  isOther?: boolean;
  lineCount?: number;
}

interface OpeningPieTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: OpeningSlice;
  }>;
}

// Palette drawn strictly from tailwind.config.js vault color tokens
const OPENING_SLICE_COLORS = [
  "rgb(var(--color-vault-primary))",
  "rgb(var(--color-vault-secondary))",
  "rgb(var(--color-vault-primary-container))",
  "rgb(var(--color-vault-secondary-fixed-dim))",
  "rgb(var(--color-vault-outline))",
  "rgb(var(--color-vault-tertiary))",
];

const OTHER_SLICE_COLOR = "rgb(var(--color-vault-draw))";

function OpeningPieTooltip({ active, payload }: OpeningPieTooltipProps) {
  if (!active || !payload?.length) return null;
  const slice = payload[0].payload;

  return (
    <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-2/95 p-3 shadow-xl backdrop-blur-sm text-xs font-mono">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="h-2.5 w-2.5 rounded-xs shrink-0"
          style={{ backgroundColor: slice.color }}
        />
        {slice.eco && (
          <span className="font-semibold text-vault-primary uppercase bg-vault-primary/10 px-1 py-0.5 rounded text-[10px]">
            {slice.eco}
          </span>
        )}
        <span className="font-semibold text-vault-text-primary text-sm truncate max-w-[210px]">
          {slice.name}
        </span>
      </div>
      {slice.isOther && slice.lineCount ? (
        <div className="text-[10px] text-vault-text-muted mb-1.5">
          Aggregated across {slice.lineCount} additional openings
        </div>
      ) : null}
      <div className="flex flex-col gap-1 text-vault-text-secondary">
        <div className="flex items-center justify-between gap-4">
          <span>Volume:</span>
          <span className="font-bold text-vault-text-primary">
            {slice.value.toLocaleString()} games ({slice.sharePct}%)
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Win Rate:</span>
          <span className="font-bold text-emerald-400">{slice.winPct}%</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-[10px] text-vault-text-muted pt-1 border-t border-vault-border-base/40">
          <span>Record:</span>
          <span>
            {slice.wins}W · {slice.draws}D · {slice.losses}L
          </span>
        </div>
      </div>
    </div>
  );
}

export function OpeningRepertoireSection({ openings }: OpeningRepertoireSectionProps) {
  const [activeTab, setActiveTab] = useState<"white" | "black">("white");
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const donutRef = useRef<HTMLDivElement>(null);
  const isDonutInView = useInView(donutRef, { once: true, amount: 0.2 });
  const navigate = useNavigate();

  const signatureWeapons = openings.signatureWeapons?.length
    ? openings.signatureWeapons
    : openings.signatureWeapon
      ? [openings.signatureWeapon]
      : [];

  const vulnerableOpenings = openings.vulnerableOpenings?.length
    ? openings.vulnerableOpenings
    : openings.vulnerableOpening
      ? [openings.vulnerableOpening]
      : [];

  const list: AnalyticsOpeningStat[] = useMemo(
    () => (activeTab === "white" ? openings.asWhite : openings.asBlack),
    [activeTab, openings.asWhite, openings.asBlack],
  );

  const totalColorGames = useMemo(
    () => list.reduce((sum, op) => sum + op.total, 0),
    [list],
  );

  // Donut data: Top 6 openings + aggregated "Other Openings" slice when > 6
  const donutSlices: OpeningSlice[] = useMemo(() => {
    if (list.length === 0) return [];
    const byVolume = [...list].sort((a, b) => b.total - a.total);
    const top = byVolume.slice(0, 6);
    const rest = byVolume.slice(6);

    const slices: OpeningSlice[] = top.map((op, idx) => ({
      name: op.name,
      eco: op.eco,
      value: op.total,
      wins: op.wins,
      draws: op.draws,
      losses: op.losses,
      winPct: op.winPct,
      sharePct: safePct(op.total, totalColorGames),
      color: OPENING_SLICE_COLORS[idx % OPENING_SLICE_COLORS.length],
    }));

    if (rest.length > 0) {
      const otherTotals = rest.reduce(
        (acc, op) => {
          acc.total += op.total;
          acc.wins += op.wins;
          acc.draws += op.draws;
          acc.losses += op.losses;
          return acc;
        },
        { total: 0, wins: 0, draws: 0, losses: 0 },
      );

      slices.push({
        name: "Other Openings",
        value: otherTotals.total,
        wins: otherTotals.wins,
        draws: otherTotals.draws,
        losses: otherTotals.losses,
        winPct: safePct(otherTotals.wins, otherTotals.total),
        sharePct: safePct(otherTotals.total, totalColorGames),
        color: OTHER_SLICE_COLOR,
        isOther: true,
        lineCount: rest.length,
      });
    }

    return slices;
  }, [list, totalColorGames]);

  // Frontend-only sorting for the table
  const sortedList = useMemo(() => {
    const copy = [...list];
    copy.sort((a, b) => {
      const diff = a[sortBy] - b[sortBy];
      if (diff !== 0) return sortDir === "desc" ? -diff : diff;
      return b.total - a.total;
    });
    return copy;
  }, [list, sortBy, sortDir]);

  const displayedList = showAll ? sortedList : sortedList.slice(0, 8);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortBy !== key) {
      return <ArrowUpDown size={12} className="text-vault-text-muted/60" />;
    }
    return sortDir === "desc" ? (
      <ArrowDown size={12} className="text-vault-primary" />
    ) : (
      <ArrowUp size={12} className="text-vault-primary" />
    );
  };

  const handleSliceClick = (slice: OpeningSlice) => {
    if (slice.isOther) {
      setShowAll(true);
      return;
    }
    navigate(`/game-bank?search=${encodeURIComponent(slice.name)}`);
  };

  return (
    <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col gap-6">
      {/* Signature Weapons & Vulnerable Openings Grid */}
      {(signatureWeapons.length > 0 || vulnerableOpenings.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Signature Weapons */}
          <div className="rounded-lg border border-vault-border-base bg-vault-surface-container-lowest/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between font-mono text-[10px]">
                <div className="flex items-center gap-1.5 text-emerald-400 uppercase tracking-wider font-semibold">
                  <Swords size={13} />
                  <span>SIGNATURE WEAPONS // TOP PERFORMANCES</span>
                  <InfoTooltip
                    align="left"
                    text="Scans all matching games in your archive and ranks openings you have played at least 5–15 times so 1-game flukes don't skew the list."
                  />
                </div>
                <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  TOP {signatureWeapons.length}
                </span>
              </div>
              <p className="text-xs text-vault-text-secondary mt-1">
                Your highest-conversion openings across the entire vault with proven sample sizes.
              </p>

              <div className="mt-4 flex flex-col divide-y divide-vault-border-base/40">
                {signatureWeapons.map((weapon, idx) => (
                  <div
                    key={`weapon-${weapon.color}-${weapon.name}`}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-vault-text-muted font-bold">
                          #{idx + 1}
                        </span>
                        {weapon.eco && (
                          <span className="font-mono text-[10px] font-semibold text-vault-primary uppercase bg-vault-primary/10 px-1 py-0.5 rounded">
                            {weapon.eco}
                          </span>
                        )}
                        <span className="font-display text-sm font-medium text-vault-text-primary truncate">
                          {weapon.name}
                        </span>
                        <span className="font-mono text-[10px] text-vault-text-muted uppercase">
                          ({weapon.color})
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-vault-text-muted mt-0.5">
                        {weapon.wins}W · {weapon.draws}D · {weapon.losses}L ({weapon.total.toLocaleString()} games)
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        {weapon.winPct}%
                      </span>
                      <Link
                        to={`/game-bank?search=${encodeURIComponent(weapon.name)}`}
                        className="text-vault-text-muted hover:text-vault-primary transition-colors p-1 rounded hover:bg-vault-surface-layer-2"
                        title="Inspect in Bank"
                      >
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vulnerable Openings */}
          <div className="rounded-lg border border-vault-border-base bg-vault-surface-container-lowest/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between font-mono text-[10px]">
                <div className="flex items-center gap-1.5 text-rose-400 uppercase tracking-wider font-semibold">
                  <ShieldAlert size={13} />
                  <span>VULNERABLE OPENINGS // LEAK DETECTION</span>
                  <InfoTooltip
                    align="left"
                    text="Scans all matching games in your archive for openings played at least 5–15 times where your win rate is under 50%."
                  />
                </div>
                <span className="text-rose-400 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                  TOP {vulnerableOpenings.length}
                </span>
              </div>
              <p className="text-xs text-vault-text-secondary mt-1">
                Openings where win rate falls under 50% with significant frequency, signaling tactical leaks.
              </p>

              <div className="mt-4 flex flex-col divide-y divide-vault-border-base/40">
                {vulnerableOpenings.length === 0 ? (
                  <p className="font-mono text-xs text-vault-text-muted py-4 text-center">
                    No major vulnerabilities identified. All frequent lines meet or exceed 50% win rate.
                  </p>
                ) : (
                  vulnerableOpenings.map((vuln, idx) => (
                    <div
                      key={`vuln-${vuln.color}-${vuln.name}`}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-vault-text-muted font-bold">
                            #{idx + 1}
                          </span>
                          {vuln.eco && (
                            <span className="font-mono text-[10px] font-semibold text-vault-primary uppercase bg-vault-primary/10 px-1 py-0.5 rounded">
                              {vuln.eco}
                            </span>
                          )}
                          <span className="font-display text-sm font-medium text-vault-text-primary truncate">
                            {vuln.name}
                          </span>
                          <span className="font-mono text-[10px] text-vault-text-muted uppercase">
                            ({vuln.color})
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-vault-text-muted mt-0.5">
                          {vuln.wins}W · {vuln.draws}D · {vuln.losses}L ({vuln.total.toLocaleString()} games)
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-sm font-bold text-rose-400">
                          {vuln.winPct}%
                        </span>
                        <Link
                          to={`/game-bank?search=${encodeURIComponent(vuln.name)}`}
                          className="text-vault-text-muted hover:text-vault-primary transition-colors p-1 rounded hover:bg-vault-surface-layer-2"
                          title="Inspect in Bank"
                        >
                          <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header & Color Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-vault-text-muted">
            THEORY & REPERTOIRE
          </span>
          <h2 className="font-display text-xl md:text-2xl font-medium text-vault-text-primary mt-0.5">
            Opening Repertoire Distribution
          </h2>
        </div>

        <div className="inline-flex items-center rounded border border-vault-border-base bg-vault-surface-container-lowest p-0.5 text-xs font-mono self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("white")}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === "white"
                ? "bg-vault-surface-layer-2 text-vault-text-primary font-semibold shadow-xs"
                : "text-vault-text-muted hover:text-vault-text-secondary"
            }`}
          >
            AS WHITE
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("black")}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === "black"
                ? "bg-vault-surface-layer-2 text-vault-text-primary font-semibold shadow-xs"
                : "text-vault-text-muted hover:text-vault-text-secondary"
            }`}
          >
            AS BLACK
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="font-mono text-xs text-vault-text-muted py-6 text-center">
          No opening theory logged for this color yet.
        </p>
      ) : (
        <>
          {/* 1. Repertoire Share Donut + Top 6 & Other Legend */}
          <div
            ref={donutRef}
            className="grid grid-cols-1 lg:grid-cols-[220px_1fr] items-center gap-6 rounded-lg border border-vault-border-base/60 bg-vault-surface-container-lowest/60 p-5"
          >
            {/* Donut Chart */}
            <div className="relative h-48 w-48 mx-auto shrink-0">
              <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                <span className="font-mono text-sm font-bold text-vault-text-primary">
                  {totalColorGames.toLocaleString()}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-vault-text-muted">
                  {activeTab === "white" ? "WHITE GAMES" : "BLACK GAMES"}
                </span>
              </div>
              {isDonutInView && (
                <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                  <PieChart>
                    <Tooltip
                      content={<OpeningPieTooltip />}
                      wrapperStyle={{ zIndex: 50 }}
                    />
                    <Pie
                      data={donutSlices}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={56}
                      outerRadius={82}
                      stroke="transparent"
                      paddingAngle={3}
                      className="cursor-pointer focus:outline-hidden"
                      onClick={(_, idx) => {
                        const target = donutSlices[idx];
                        if (target) handleSliceClick(target);
                      }}
                    >
                      {donutSlices.map((slice) => (
                        <Cell key={slice.name} fill={slice.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Interactive Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              {donutSlices.map((slice) => (
                <button
                  key={slice.name}
                  type="button"
                  onClick={() => handleSliceClick(slice)}
                  className="flex items-center justify-between gap-2 p-2.5 rounded border border-vault-border-base/50 bg-vault-surface-layer-1/70 hover:border-vault-border-interactive hover:bg-vault-surface-layer-2/60 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="font-semibold text-vault-text-primary truncate">
                      {slice.name}
                    </span>
                    <span className="text-[10px] text-vault-text-muted shrink-0">
                      ({slice.sharePct}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-vault-text-secondary">
                      {slice.value.toLocaleString()}g
                    </span>
                    <span
                      className={`font-bold text-xs ${
                        slice.winPct >= 50 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {slice.winPct}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Redesigned Sortable Openings Table */}
          <div className="overflow-x-auto rounded-lg border border-vault-border-base/60 bg-vault-surface-container-lowest/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-vault-border-base/70 bg-vault-surface-layer-2/40 font-mono text-[10px] uppercase tracking-wider text-vault-text-muted">
                  <th className="py-2.5 px-3">Opening</th>
                  <th className="py-2.5 px-3">
                    <button
                      type="button"
                      onClick={() => handleSort("total")}
                      className="inline-flex items-center gap-1 hover:text-vault-text-primary transition-colors cursor-pointer"
                    >
                      <span>Games</span>
                      {renderSortIcon("total")}
                    </button>
                  </th>
                  <th className="py-2.5 px-3 hidden sm:table-cell">Share</th>
                  <th className="py-2.5 px-3">
                    <button
                      type="button"
                      onClick={() => handleSort("winPct")}
                      className="inline-flex items-center gap-1 hover:text-vault-text-primary transition-colors cursor-pointer"
                    >
                      <span>Win Rate</span>
                      {renderSortIcon("winPct")}
                    </button>
                  </th>
                  <th className="py-2.5 px-3 hidden md:table-cell">
                    <button
                      type="button"
                      onClick={() => handleSort("losses")}
                      className="inline-flex items-center gap-1 hover:text-vault-text-primary transition-colors cursor-pointer"
                    >
                      <span>W / D / L</span>
                      {renderSortIcon("losses")}
                    </button>
                  </th>
                  <th className="py-2.5 px-3 text-right">Bank</th>
                </tr>
              </thead>
              <AnimatePresence mode="wait">
                <motion.tbody
                  key={`${activeTab}-${sortBy}-${sortDir}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="divide-y divide-vault-border-base/40"
                >
                  {displayedList.map((op) => {
                    const sharePct = safePct(op.total, totalColorGames);
                    const drawPct = safePct(op.draws, op.total);
                    const lossPct = safePct(op.losses, op.total);

                    return (
                      <tr
                        key={`${op.color}-${op.name}`}
                        className="hover:bg-vault-surface-layer-2/30 transition-colors"
                      >
                        <td className="py-2.5 px-3 max-w-[260px]">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="grid h-7 w-7 place-items-center rounded border border-vault-border-base bg-vault-surface-layer-2 text-vault-primary shrink-0">
                              <BookOpen size={13} />
                            </span>
                            <div className="flex items-center gap-1.5 min-w-0">
                              {op.eco && (
                                <span className="font-mono text-[10px] font-semibold text-vault-primary uppercase bg-vault-primary/10 px-1.5 py-0.5 rounded shrink-0">
                                  {op.eco}
                                </span>
                              )}
                              <span className="font-display text-sm font-medium text-vault-text-primary truncate">
                                {op.name}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 font-mono text-xs font-semibold text-vault-text-primary whitespace-nowrap">
                          {op.total.toLocaleString()}
                        </td>

                        <td className="py-2.5 px-3 font-mono text-xs text-vault-text-muted whitespace-nowrap hidden sm:table-cell">
                          {sharePct}%
                        </td>

                        <td className="py-2.5 px-3 font-mono text-xs font-bold whitespace-nowrap">
                          <span
                            className={
                              op.winPct >= 50 ? "text-emerald-400" : "text-rose-400"
                            }
                          >
                            {op.winPct}%
                          </span>
                        </td>

                        <td className="py-2.5 px-3 hidden md:table-cell">
                          <div className="flex items-center gap-3">
                            <div className="flex h-1.5 w-24 overflow-hidden rounded bg-vault-surface-layer-2 shrink-0">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${op.winPct}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="bg-emerald-500 h-full"
                              />
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${drawPct}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
                                className="bg-neutral-500 h-full"
                              />
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${lossPct}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                                className="bg-rose-500 h-full"
                              />
                            </div>
                            <span className="font-mono text-[11px] text-vault-text-muted whitespace-nowrap">
                              {op.wins}W · {op.draws}D · {op.losses}L
                            </span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <Link
                            to={`/game-bank?search=${encodeURIComponent(op.name)}`}
                            className="inline-flex items-center gap-1 font-mono text-xs text-vault-text-secondary hover:text-vault-primary transition-colors py-1 px-2 rounded hover:bg-vault-surface-layer-2"
                          >
                            <span>Inspect</span>
                            <ArrowUpRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </motion.tbody>
              </AnimatePresence>
            </table>
          </div>

          {sortedList.length > 8 && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-vault-text-secondary hover:text-vault-text-primary px-3 py-1.5 rounded border border-vault-border-base bg-vault-surface-layer-2/60 hover:bg-vault-surface-layer-2 transition-colors cursor-pointer"
              >
                <span>{showAll ? "Show Top 8" : `See All ${sortedList.length} Openings`}</span>
                {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function safePct(value: number, total: number) {
  if (!total || total <= 0) return 0;
  return Number(((value / total) * 100).toFixed(1));
}
