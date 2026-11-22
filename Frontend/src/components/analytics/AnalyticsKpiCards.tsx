import { Trophy, Clock, History } from "lucide-react";
import type { AnalyticsData } from "@chess-vault/shared";

export function AnalyticsKpiCards({ data }: { data: AnalyticsData }) {
  const { overview, archiveSpan, byTimeClass, streaks } = data;

  // Primary Cadence: highest total games
  const primaryCadence = byTimeClass.length > 0 ? byTimeClass[0] : null;

  // Format first log date
  const firstLogFormatted = archiveSpan.firstGameAt
    ? new Date(archiveSpan.firstGameAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. OVERALL RECORD */}
      <div className="flex flex-col justify-between rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-5">
        <div>
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-vault-text-muted">
            <span>Overall Record</span>
            <span className="text-[10px] bg-vault-surface-layer-2 px-1.5 py-0.5 rounded text-vault-text-secondary border border-vault-border-base">
              W-D-L
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display text-3xl md:text-4xl font-medium text-vault-text-primary">
              {overview.winPct}%
            </span>
            <span className="font-mono text-xs text-vault-text-muted">
              (W {overview.winPct} · D {overview.drawPct} · L {overview.lossPct})
            </span>
          </div>

          {/* Segmented W/D/L Bar */}
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-vault-surface-layer-2 mt-3">
            <div
              style={{ width: `${overview.winPct}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Wins: ${overview.wins} (${overview.winPct}%)`}
            />
            <div
              style={{ width: `${overview.drawPct}%` }}
              className="bg-neutral-500 h-full transition-all"
              title={`Draws: ${overview.draws} (${overview.drawPct}%)`}
            />
            <div
              style={{ width: `${overview.lossPct}%` }}
              className="bg-rose-500 h-full transition-all"
              title={`Losses: ${overview.losses} (${overview.lossPct}%)`}
            />
          </div>

          {/* Counts */}
          <div className="flex items-center justify-between font-mono text-xs mt-2 text-vault-text-secondary">
            <span className="text-emerald-400">{overview.wins.toLocaleString()} W</span>
            <span className="text-neutral-400">{overview.draws.toLocaleString()} D</span>
            <span className="text-rose-400">{overview.losses.toLocaleString()} L</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-vault-border-base/40 pt-3 mt-4 font-mono text-[11px] text-vault-text-muted">
          <span>PRACTICAL OUTCOME INDEX: <strong className="text-vault-text-primary">{overview.practicalOutcomeIndex}%</strong></span>
          <span>STREAK: <strong className="text-vault-text-primary">{streaks.longestWinStreak}</strong></span>
        </div>
      </div>

      {/* 2. PRIMARY CADENCE */}
      <div className="flex flex-col justify-between rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-5">
        <div>
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-vault-text-muted">
            <span>Primary Cadence</span>
            <Clock size={14} className="text-vault-text-muted" />
          </div>

          <div className="mt-2">
            <span className="font-display text-3xl md:text-4xl font-medium text-vault-text-primary capitalize">
              {primaryCadence ? primaryCadence.timeClass : "Standard"}
            </span>
          </div>

          <p className="font-mono text-xs text-vault-text-secondary mt-1">
            {primaryCadence
              ? `${primaryCadence.total.toLocaleString()} archived games (${primaryCadence.volumePct}% volume)`
              : "No games recorded"}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-vault-border-base/40 pt-3 mt-4 font-mono text-[11px] text-vault-text-muted">
          <span>AVG PERFORMANCE:</span>
          <span className="text-emerald-400 font-semibold">
            {primaryCadence ? `${primaryCadence.winPct}% WR` : "—"}
          </span>
        </div>
      </div>

      {/* 3. BEST STREAK */}
      <div className="flex flex-col justify-between rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-5">
        <div>
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-vault-text-muted">
            <span>Best Streak</span>
            <Trophy size={14} className="text-vault-primary" />
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display text-3xl md:text-4xl font-medium text-vault-text-primary">
              {streaks.longestWinStreak}
            </span>
            <span className="font-mono text-xs text-vault-text-muted">Wins in a row</span>
          </div>

          <p className="font-mono text-xs text-vault-text-secondary mt-1">
            Peak consecutive mainline victories
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-vault-border-base/40 pt-3 mt-4 font-mono text-[11px] text-vault-text-muted">
          <span>CURRENT STREAK:</span>
          <span
            className={`font-semibold ${
              streaks.currentStreak.type === "win"
                ? "text-emerald-400"
                : streaks.currentStreak.type === "loss"
                  ? "text-rose-400"
                  : "text-vault-text-primary"
            }`}
          >
            {streaks.currentStreak.type === "win" ? `+${streaks.currentStreak.count} Wins` : `${streaks.currentStreak.count} ${streaks.currentStreak.type}`}
          </span>
        </div>
      </div>

      {/* 4. ARCHIVE SPAN */}
      <div className="flex flex-col justify-between rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-5">
        <div>
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-vault-text-muted">
            <span>Archive Span</span>
            <History size={14} className="text-vault-text-muted" />
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display text-3xl md:text-4xl font-medium text-vault-text-primary">
              {archiveSpan.formattedSpan}
            </span>
          </div>

          <p className="font-mono text-xs text-vault-text-secondary mt-1">
            Continuous archival records
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-vault-border-base/40 pt-3 mt-4 font-mono text-[11px] text-vault-text-muted">
          <span>FIRST LOG:</span>
          <span className="text-vault-text-primary font-medium">{firstLogFormatted}</span>
        </div>
      </div>
    </div>
  );
}
