import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, BookOpen, ChevronDown, ChevronUp, ShieldAlert, Swords, LayoutGrid, List as ListIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";
import type { AnalyticsOpenings, AnalyticsOpeningStat } from "@chess-vault/shared";

interface OpeningRepertoireSectionProps {
  openings: AnalyticsOpenings;
}

interface TreemapCustomContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  total?: number;
  winPct?: number;
  eco?: string;
  onSelect?: (name: string) => void;
}

function TreemapTile(props: TreemapCustomContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, name = "", total = 0, winPct = 0, eco, onSelect } = props;
  if (width < 28 || height < 20) return null;

  // Determine fill color based on win rate
  let bg = "#334155"; // neutral
  if (winPct >= 58) bg = "#059669"; // emerald
  else if (winPct >= 50) bg = "#0d9488"; // teal
  else if (winPct >= 42) bg = "#475569"; // slate
  else bg = "#e11d48"; // rose

  const maxChars = Math.max(4, Math.floor(width / 7.5));
  const displayName = name.length > maxChars ? `${name.slice(0, maxChars)}…` : name;

  return (
    <g
      onClick={() => onSelect?.(name)}
      className="cursor-pointer group"
    >
      <rect
        x={x + 1}
        y={y + 1}
        width={Math.max(0, width - 2)}
        height={Math.max(0, height - 2)}
        style={{
          fill: bg,
          stroke: "#18181b",
          strokeWidth: 1.5,
          rx: 4,
          ry: 4,
        }}
        className="transition-all duration-150 hover:brightness-125"
      />
      {width > 55 && height > 30 && (
        <text
          x={x + 7}
          y={y + 17}
          fill="#ffffff"
          fontSize={11}
          fontWeight={600}
          fontFamily="system-ui, sans-serif"
          className="pointer-events-none select-none"
        >
          {eco ? `[${eco}] ` : ""}{displayName}
        </text>
      )}
      {width > 55 && height > 44 && (
        <text
          x={x + 7}
          y={y + 32}
          fill="rgba(255, 255, 255, 0.85)"
          fontSize={10}
          fontFamily="monospace"
          className="pointer-events-none select-none font-semibold"
        >
          {winPct}% ({total}g)
        </text>
      )}
    </g>
  );
}

interface TreemapTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AnalyticsOpeningStat;
  }>;
}

function TreemapTooltip({ active, payload }: TreemapTooltipProps) {
  if (!active || !payload?.length) return null;
  const op = payload[0].payload;

  return (
    <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-2/95 p-3 shadow-xl backdrop-blur-sm text-xs font-mono">
      <div className="flex items-center gap-2 mb-1">
        {op.eco && (
          <span className="font-semibold text-vault-primary uppercase bg-vault-primary/10 px-1 py-0.5 rounded text-[10px]">
            {op.eco}
          </span>
        )}
        <span className="font-semibold text-vault-text-primary text-sm truncate max-w-[200px]">
          {op.name}
        </span>
      </div>
      <div className="flex flex-col gap-1 text-vault-text-secondary mt-1">
        <div className="flex items-center justify-between gap-4">
          <span>Games Volume:</span>
          <span className="font-bold text-vault-text-primary">
            {op.total.toLocaleString()} games
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Win Rate:</span>
          <span className="font-bold text-emerald-400">{op.winPct}%</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-[10px] text-vault-text-muted pt-1 border-t border-vault-border-base/40">
          <span>Record:</span>
          <span>{op.wins}W · {op.draws}D · {op.losses}L</span>
        </div>
      </div>
    </div>
  );
}

export function OpeningRepertoireSection({ openings }: OpeningRepertoireSectionProps) {
  const [activeTab, setActiveTab] = useState<"white" | "black">("white");
  const [viewMode, setViewMode] = useState<"list" | "treemap">("list");
  const [showAll, setShowAll] = useState(false);
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

  const list = activeTab === "white" ? openings.asWhite : openings.asBlack;
  const displayedList = showAll ? list : list.slice(0, 8);

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

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-vault-text-muted">
            THEORY & REPERTOIRE
          </span>
          <h2 className="font-display text-xl md:text-2xl font-medium text-vault-text-primary mt-0.5">
            Opening Repertoire Distribution
          </h2>
        </div>

        {/* Controls: Color Tabs & View Mode Switcher */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Tab Switcher */}
          <div className="inline-flex items-center rounded border border-vault-border-base bg-vault-surface-container-lowest p-0.5 text-xs font-mono">
            <button
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

          {/* View Mode Switcher */}
          <div className="inline-flex items-center rounded border border-vault-border-base bg-vault-surface-container-lowest p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewMode("treemap")}
              title="Visual Treemap Distribution"
              className={`p-1.5 rounded transition-colors ${
                viewMode === "treemap"
                  ? "bg-vault-surface-layer-2 text-vault-primary shadow-xs"
                  : "text-vault-text-muted hover:text-vault-text-secondary"
              }`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="Detailed List Breakdown"
              className={`p-1.5 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-vault-surface-layer-2 text-vault-primary shadow-xs"
                  : "text-vault-text-muted hover:text-vault-text-secondary"
              }`}
            >
              <ListIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "treemap" ? (
        <div className="flex flex-col gap-3">
          {/* Treemap Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-vault-text-muted px-1">
            <span>Tile size represents game volume. Click any tile to inspect in Bank.</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600" />
                ≥58% (Strong)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-teal-600" />
                50–57% (Solid)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-slate-600" />
                42–49% (Balanced)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-rose-600" />
                &lt;42% (Vulnerable)
              </span>
            </div>
          </div>

          <div className="h-80 w-full rounded-md bg-vault-surface-container-lowest/60 border border-vault-border-base/40 p-2">
            {list.length === 0 ? (
              <div className="h-full grid place-items-center font-mono text-xs text-vault-text-muted">
                No opening theory logged for this color yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={list}
                  dataKey="total"
                  nameKey="name"
                  aspectRatio={4 / 3}
                  stroke="#18181b"
                  content={
                    <TreemapTile
                      onSelect={(name) =>
                        navigate(`/game-bank?search=${encodeURIComponent(name)}`)
                      }
                    />
                  }
                >
                  <Tooltip content={<TreemapTooltip />} />
                </Treemap>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Openings Table / List */}
          <div className="flex flex-col divide-y divide-vault-border-base/40">
            {list.length === 0 ? (
              <p className="font-mono text-xs text-vault-text-muted py-6 text-center">
                No opening theory logged for this color yet.
              </p>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col divide-y divide-vault-border-base/40"
                >
                  {displayedList.map((op) => {
                    const drawPct = safePct(op.draws, op.total);
                    const lossPct = safePct(op.losses, op.total);

                    return (
                      <div
                        key={`${op.color}-${op.name}`}
                        className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-vault-surface-container-lowest/40 px-2 rounded transition-colors"
                      >
                        {/* Left: Mini board icon + ECO + Name */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="grid h-9 w-9 place-items-center rounded border border-vault-border-base bg-vault-surface-layer-2 text-vault-primary shrink-0">
                            <BookOpen size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {op.eco && (
                                <span className="font-mono text-[11px] font-semibold text-vault-primary uppercase bg-vault-primary/10 px-1.5 py-0.5 rounded">
                                  {op.eco}
                                </span>
                              )}
                              <h4 className="font-display text-base font-medium text-vault-text-primary truncate">
                                {op.name}
                              </h4>
                            </div>
                            <div className="font-mono text-xs text-vault-text-muted mt-0.5">
                              {op.total.toLocaleString()} games recorded
                            </div>
                          </div>
                        </div>

                        {/* Right: Record & W/D/L Bar + Inspect Button */}
                        <div className="flex items-center gap-4 sm:gap-6 self-end md:self-auto shrink-0 w-full md:w-auto justify-between md:justify-end">
                          {/* Win Rate badge */}
                          <div className="text-right">
                            <span className="font-mono text-xs font-bold text-emerald-400">
                              {op.winPct}% Win Rate
                            </span>
                            <div className="font-mono text-[10px] text-vault-text-muted">
                              {op.wins} W · {op.draws} D · {op.losses} L
                            </div>
                          </div>

                          {/* Mini segmented bar */}
                          <div className="hidden sm:flex h-2 w-32 overflow-hidden rounded bg-vault-surface-layer-2">
                            <div style={{ width: `${op.winPct}%` }} className="bg-emerald-500 h-full" />
                            <div style={{ width: `${drawPct}%` }} className="bg-neutral-500 h-full" />
                            <div style={{ width: `${lossPct}%` }} className="bg-rose-500 h-full" />
                          </div>

                          {/* Inspect in Bank Link */}
                          <Link
                            to={`/game-bank?search=${encodeURIComponent(op.name)}`}
                            className="inline-flex items-center gap-1 font-mono text-xs text-vault-text-secondary hover:text-vault-primary transition-colors py-1 px-2 rounded hover:bg-vault-surface-layer-2 border border-transparent hover:border-vault-border-base"
                          >
                            <span>Inspect in Bank</span>
                            <ArrowUpRight size={13} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {list.length > 8 && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-vault-text-secondary hover:text-vault-text-primary px-3 py-1.5 rounded border border-vault-border-base bg-vault-surface-layer-2/60 hover:bg-vault-surface-layer-2 transition-colors cursor-pointer"
              >
                <span>{showAll ? "Show Top 8" : `See All ${list.length} Openings`}</span>
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
