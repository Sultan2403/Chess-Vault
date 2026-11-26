import { Archive, ChevronDown, Loader2 } from "lucide-react";
import type { PlatformType, TimeClassType } from "@chess-vault/shared";

interface AnalyticsHeaderProps {
  totalGames: number;
  formattedSpan: string;
  chessComGames: number;
  lichessGames: number;
}

export function AnalyticsHeader({
  totalGames,
  formattedSpan,
  chessComGames,
  lichessGames,
}: AnalyticsHeaderProps) {
  const chessComPct = totalGames > 0 ? Math.round((chessComGames / totalGames) * 100) : 0;
  const lichessPct = totalGames > 0 ? Math.round((lichessGames / totalGames) * 100) : 0;

  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-vault-primary">
          <span>ARCHIVE</span>
          <span className="text-vault-text-muted">//</span>
          <span>METRICS</span>
          <span className="text-vault-text-muted">//</span>
          <span className="text-vault-text-secondary">Retrospective Telemetry</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-vault-text-primary mt-1">
          Analytics
        </h1>
        <p className="text-sm md:text-base text-vault-text-secondary mt-1.5 max-w-2xl">
          Explore your playing habits, search patterns, and historical milestones across your entire personal archive.
        </p>
      </div>

      {/* Total Archived Pill */}
      <div className="flex items-center gap-3.5 self-start md:self-auto rounded-lg border border-vault-primary/25 bg-vault-surface-layer-1 px-4 py-3 shadow-xs">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-vault-primary/15 text-vault-primary border border-vault-primary/25 shrink-0">
          <Archive size={17} />
        </div>
        <div className="flex flex-col items-start">
          <div className="flex items-baseline gap-1.5 font-mono text-xs tracking-wider">
            <span className="text-base font-bold text-vault-primary">
              {totalGames.toLocaleString()}
            </span>
            <span className="font-semibold text-vault-text-primary">
              TOTAL ARCHIVED
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-vault-text-muted mt-0.5">
            <span>From {formattedSpan} ago</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-vault-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Chess.com {chessComPct}%
            </span>
            <span className="inline-flex items-center gap-1 text-vault-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Lichess {lichessPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AnalyticsFilterBarProps {
  totalGames: number;
  chessComGames: number;
  lichessGames: number;
  selectedPlatform: PlatformType | "all";
  onSelectPlatform: (platform: PlatformType | "all") => void;
  selectedTimeClass: TimeClassType | "all";
  onSelectTimeClass: (timeClass: TimeClassType | "all") => void;
  selectedRange: string;
  onSelectRange: (range: string) => void;
  isFetching?: boolean;
}

export function AnalyticsFilterBar({
  totalGames,
  chessComGames,
  lichessGames,
  selectedPlatform,
  onSelectPlatform,
  selectedTimeClass,
  onSelectTimeClass,
  selectedRange,
  onSelectRange,
  isFetching = false,
}: AnalyticsFilterBarProps) {
  const ranges = [
    { id: "all", label: "ALL TIME" },
    { id: "12m", label: "LAST 12 MO" },
    { id: "90d", label: "LAST 90 D" },
    { id: "30d", label: "LAST 30 D" },
  ];

  return (
    <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 border-y border-vault-border-base/70 bg-vault-background/85 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Time Range Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {ranges.map((r) => {
            const active = selectedRange === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onSelectRange(r.id)}
                className={`px-3 py-1.5 text-xs font-mono font-medium tracking-wider rounded transition-colors ${
                  active
                    ? "bg-vault-primary/20 text-vault-primary border border-vault-primary/40 font-semibold"
                    : "text-vault-text-secondary hover:text-vault-text-primary hover:bg-vault-surface-layer-1 border border-transparent"
                }`}
              >
                {r.label}
              </button>
            );
          })}
          {isFetching && (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-vault-primary ml-2">
              <Loader2 size={13} className="animate-spin" />
              <span className="hidden sm:inline">Updating</span>
            </span>
          )}
        </div>

        {/* Platform & Cadence Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Platform Switcher */}
          <div className="inline-flex items-center rounded border border-vault-border-base bg-vault-surface-container-lowest p-0.5 text-xs font-mono">
            <button
              onClick={() => onSelectPlatform("all")}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedPlatform === "all"
                  ? "bg-vault-surface-layer-2 text-vault-text-primary font-semibold shadow-xs"
                  : "text-vault-text-muted hover:text-vault-text-secondary"
              }`}
            >
              ALL ({totalGames.toLocaleString()})
            </button>
            <button
              onClick={() => onSelectPlatform("chess.com")}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedPlatform === "chess.com"
                  ? "bg-vault-surface-layer-2 text-vault-text-primary font-semibold shadow-xs"
                  : "text-vault-text-muted hover:text-vault-text-secondary"
              }`}
            >
              Chess.com ({chessComGames.toLocaleString()})
            </button>
            <button
              onClick={() => onSelectPlatform("lichess")}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedPlatform === "lichess"
                  ? "bg-vault-surface-layer-2 text-vault-text-primary font-semibold shadow-xs"
                  : "text-vault-text-muted hover:text-vault-text-secondary"
              }`}
            >
              Lichess ({lichessGames.toLocaleString()})
            </button>
          </div>

          {/* Cadence Dropdown */}
          <div className="relative">
            <select
              value={selectedTimeClass}
              onChange={(e) => onSelectTimeClass(e.target.value as TimeClassType | "all")}
              className="appearance-none rounded border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 pr-8 text-xs font-mono text-vault-text-primary hover:border-vault-border-interactive focus:outline-hidden focus:border-vault-primary cursor-pointer"
            >
              <option value="all">ALL CADENCES</option>
              <option value="rapid">Rapid</option>
              <option value="blitz">Blitz</option>
              <option value="bullet">Bullet</option>
              <option value="classical">Classical</option>
              <option value="daily">Daily</option>
            </select>
            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-vault-text-muted"
            />
          </div>
        </div>
      </div>

      <p className="font-mono text-[11px] text-vault-text-muted mt-2">
        All metrics below are influenced by your active time range, platform, and cadence filters.
      </p>
    </div>
  );
}
