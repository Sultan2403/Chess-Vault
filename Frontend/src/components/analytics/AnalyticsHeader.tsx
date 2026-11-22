import { ChevronDown } from "lucide-react";
import type { PlatformType, TimeClassType } from "@chess-vault/shared";

interface AnalyticsHeaderProps {
  totalGames: number;
  formattedSpan: string;
  chessComGames: number;
  lichessGames: number;
  selectedPlatform: PlatformType | "all";
  onSelectPlatform: (platform: PlatformType | "all") => void;
  selectedTimeClass: TimeClassType | "all";
  onSelectTimeClass: (timeClass: TimeClassType | "all") => void;
  selectedRange: string;
  onSelectRange: (range: string) => void;
}

export function AnalyticsHeader({
  totalGames,
  formattedSpan,
  chessComGames,
  lichessGames,
  selectedPlatform,
  onSelectPlatform,
  selectedTimeClass,
  onSelectTimeClass,
  selectedRange,
  onSelectRange,
}: AnalyticsHeaderProps) {
  const chessComPct = totalGames > 0 ? Math.round((chessComGames / totalGames) * 100) : 0;
  const lichessPct = totalGames > 0 ? Math.round((lichessGames / totalGames) * 100) : 0;

  const ranges = [
    { id: "all", label: "ALL TIME" },
    { id: "12m", label: "LAST 12 MO" },
    { id: "90d", label: "LAST 90 D" },
    { id: "30d", label: "LAST 30 D" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Kicker & Top Meta Banner */}
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
        <div className="flex flex-col items-start md:items-end justify-center self-start md:self-auto rounded-lg border border-vault-border-base bg-vault-surface-layer-1 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold tracking-wider text-vault-text-primary">
              {totalGames.toLocaleString()} TOTAL ARCHIVED
            </span>
          </div>
          <div className="font-mono text-[11px] text-vault-text-muted mt-0.5">
            From {formattedSpan} ago · Chess.com ({chessComPct}%) · Lichess ({lichessPct}%)
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-vault-border-base/60 py-3">
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
    </div>
  );
}
